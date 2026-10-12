import { supabase, signOutLocal } from './supabase';

import type {
  UserProfile,
  ProfileUpdateData,
  PrivacySettings,
  AdminUserData,
  ProfessionalData,
  EquipProgramRaw,
  EquipProgramData,
  EquipProgramBlock,
  EquipProgramDay,
  BlockResponse,
  ProgressSyncData,
  ResourceData,
  CategoryData,
  AssessmentData,
  AssessmentResponses,
  AssessmentInterpretation,
} from './api-types';

export type { UserProfile as User };

import { normaliseBlock } from './block-normalise';
import { projectId, publicAnonKey } from './supabase-info';
import { cacheForOffline, readOfflineCache, invalidateOfflineCache } from './useOfflineSync';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;

/**
 * Error thrown for a non-2xx response. The message keeps the historical
 * `API Error: <status> <body>` form that callers match on; `status` is the
 * structured version. A 401 that survived one session refresh is flagged
 * `isAuthError` with a user-facing `userMessage`.
 */
export interface ApiHttpError extends Error {
  status: number;
  isAuthError?: boolean;
  userMessage?: string;
}

/**
 * The parsed JSON body of a non-2xx response thrown by `apiClient.request`
 * (its message is `API Error: <status> <body>`), or null when there is none.
 */
export function apiErrorBody(err: unknown): any | null {
  const msg = err instanceof Error ? err.message : '';
  const m = /^API Error: \d{3} ([\s\S]*)$/.exec(msg);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

/** The server's `error`/`message` from a thrown API error, else `fallback`. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const body = apiErrorBody(err);
  const fromBody = body && (body.error || body.message);
  return typeof fromBody === 'string' && fromBody ? fromBody : fallback;
}

/** Per-request timeout. Uploads (FormData bodies) get longer. Override with `options.timeoutMs`. */
const REQUEST_TIMEOUT_MS = 20_000;
const UPLOAD_TIMEOUT_MS = 120_000;
/** Server-side bulk jobs (data export, KV audit maintenance). */
const LONG_TIMEOUT_MS = 120_000;

class ApiClient {
  private token: string | null = null;
  // Track in-flight AbortControllers so components can cancel on unmount
  private inflightControllers = new Set<AbortController>();
  // When true, suppress auto-signout on refresh token errors (e.g. during saves)
  private _suppressSignOut = false;

  /** Temporarily suppress auto-signout (e.g. during critical save operations). */
  suppressSignOut(suppress: boolean) { this._suppressSignOut = suppress; }

  /** Create an AbortController tied to this client; auto-cleaned on completion. */
  createAbortController(): AbortController {
    const controller = new AbortController();
    this.inflightControllers.add(controller);
    return controller;
  }

  /** Abort all in-flight requests (e.g. on logout or major navigation). */
  abortAll() {
    this.inflightControllers.forEach(c => c.abort());
    this.inflightControllers.clear();
  }

  async getToken() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        // Handle invalid refresh token — clear the broken session
        if (
          error.message?.includes('Refresh Token') ||
          error.message?.includes('refresh_token') ||
          error.message?.includes('Invalid Refresh Token') ||
          error.message?.includes('not found')
        ) {
          if (this._suppressSignOut) {
            console.warn('Auth: Invalid refresh token detected in getToken, but sign-out suppressed (critical operation in progress)');
            return null;
          }
          console.warn('Auth: Invalid refresh token detected in getToken, signing out');
          await signOutLocal().catch(() => {});
          return null;
        }
        console.warn('Auth: getSession error:', error.message);
        return null;
      }
      return data.session?.access_token ?? null;
    } catch (err: any) {
      // Catch any unexpected errors (network, etc.)
      console.warn('Auth: getToken failed:', err?.message || err);
      return null;
    }
  }

  async healthCheck() {
    return this.request('/health', { method: 'GET' }, true);
  }

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Idempotency key for the next request started synchronously inside
   * `withIdempotencyKey`. Read (and cleared) at the very top of `request`,
   * before its first await, so it can only attach to the call the wrapper made.
   */
  private _pendingIdempotencyKey: string | null = null;

  /**
   * Run `fn` so the request it starts carries an `Idempotency-Key` header.
   * Used by the offline sync queue so a replayed write can be de-duplicated by
   * the server (harmless while the server ignores the header). `fn` must start
   * its request synchronously — every apiClient write method does.
   */
  withIdempotencyKey<T>(key: string, fn: () => Promise<T>): Promise<T> {
    this._pendingIdempotencyKey = key;
    try {
      return fn();
    } finally {
      this._pendingIdempotencyKey = null;
    }
  }

  async request(path: string, options: any = {}, auth = true, retryCount = 0, authRetried = false): Promise<any> {
    // Must stay above the first await — see withIdempotencyKey.
    const idempotencyKey = this._pendingIdempotencyKey;
    this._pendingIdempotencyKey = null;

    // Skip Content-Type for FormData — the browser sets it automatically with the correct boundary
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: any = isFormData ? {} : {
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

    const method = String(options.method || 'GET').toUpperCase();
    // Only idempotent reads are retried. Retrying a POST/PUT/DELETE after a
    // 5xx or a dropped connection can apply the write twice (the first attempt
    // may well have reached the server).
    const isIdempotent = method === 'GET' || method === 'HEAD';

    let usedUserToken = false;
    if (auth) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        usedUserToken = true;
      } else {
        // Fallback to Anon Key for public endpoints
        headers['Authorization'] = `Bearer ${publicAnonKey}`;
      }
    } else {
      // Even for non-auth requests, Supabase Edge Functions require the anon key
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = path.startsWith('http') ? path : `${API_BASE}${normalizedPath}`;

    // Every request gets its own controller so it can time out. A caller's
    // signal (component unmount etc.) is forwarded into it.
    const { timeoutMs: timeoutOverride, signal: callerSignal, ...fetchOptions } = options;
    const timeoutMs: number = typeof timeoutOverride === 'number'
      ? timeoutOverride
      : (isFormData ? UPLOAD_TIMEOUT_MS : REQUEST_TIMEOUT_MS);
    const controller = new AbortController();
    // Only self-owned requests are cancelled by abortAll(), as before.
    if (!callerSignal) this.inflightControllers.add(controller);
    const onCallerAbort = () => controller.abort();
    if (callerSignal) {
      if (callerSignal.aborted) controller.abort();
      else callerSignal.addEventListener('abort', onCallerAbort, { once: true });
    }
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);

    try {
      let response: Response;
      try {
        response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            ...headers,
            ...fetchOptions.headers,
          },
        });
      } catch (fetchError: unknown) {
        if (timedOut) {
          const timeoutError = new Error(`API Error: timeout after ${timeoutMs}ms (${method} ${normalizedPath})`);
          timeoutError.name = 'TimeoutError';
          throw timeoutError;
        }
        throw fetchError;
      }

      if (!response.ok) {
        const errorText = await response.text();

        // One silent session refresh on 401, then a single retry. Only when a
        // user token was sent — an anonymous 401 will not be fixed by a refresh.
        if (response.status === 401 && auth && usedUserToken && !authRetried) {
          let refreshed = false;
          try {
            const { data, error: refreshError } = await supabase.auth.refreshSession();
            refreshed = !refreshError && !!data?.session?.access_token;
          } catch { refreshed = false; }
          if (refreshed) {
            clearTimeout(timer);
            // Carry the idempotency key over: it is read from the ambient slot
            // only on the first call.
            const retryOptions = idempotencyKey
              ? { ...options, headers: { ...(options.headers || {}), 'Idempotency-Key': idempotencyKey } }
              : options;
            return this.request(path, retryOptions, auth, retryCount, true);
          }
        }

        const httpError: ApiHttpError = Object.assign(
          new Error(`API Error: ${response.status} ${errorText}`),
          { status: response.status },
        );
        if (response.status === 401) {
          httpError.isAuthError = true;
          httpError.userMessage = 'Your session has expired. Please sign in again.';
        }
        throw httpError;
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      // If the request was aborted (component unmounted / navigation), do NOT retry
      if (error?.name === 'AbortError') {
        // Timed out while reading the body — report it as a timeout.
        if (timedOut) {
          const timeoutError = new Error(`API Error: timeout after ${timeoutMs}ms (${method} ${normalizedPath})`);
          timeoutError.name = 'TimeoutError';
          throw timeoutError;
        }
        // Silently swallow — the caller no longer cares about this response
        throw error;
      }

      // Only retry idempotent reads, and only on 5xx server errors and network
      // errors (not 4xx client errors, not timeouts).
      const errorMsg = error?.message || '';
      const isNetworkError = error?.name === 'TypeError' && errorMsg.toLowerCase().includes('failed to fetch');
      const is5xxError = /API Error: 5\d\d/.test(errorMsg);
      const isRetryable = isIdempotent && (isNetworkError || is5xxError || !errorMsg);
      
      if (retryCount < 2 && isRetryable) {
        clearTimeout(timer);
        // Retry with linear backoff for transient errors
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.request(path, options, auth, retryCount + 1, authRetried);
      }
      
      // Suppress 401 error logging to avoid console noise during auth checks
      // Also suppress 404 logging as it is often used for "check if exists" logic
      // Also suppress 409 logging as it is used for idempotent create-if-not-exists flows
      // Also suppress network errors (Failed to fetch) as they are transient
      const msg = error?.message?.toLowerCase() || '';
      const isNetworkErrorLog = error?.name === 'TypeError' && msg.includes('failed to fetch');
      if (!error.message || (!error.message.includes('401') && !error.message.includes('403') && !error.message.includes('404') && !error.message.includes('409') && !isNetworkErrorLog)) {
        console.error('API Request failed', error);
      } else if (isNetworkErrorLog) {
        console.warn('API Request: network unreachable (will retry when online)');
      }
      
      throw error;
    } finally {
      clearTimeout(timer);
      if (callerSignal) callerSignal.removeEventListener('abort', onCallerAbort);
      this.inflightControllers.delete(controller);
    }
  }

  /**
   * GET `path` and return `res[key]`. A genuine "nothing here" — a 404, or a
   * response without the key — returns []. Every other failure (auth, 5xx,
   * network, timeout) is thrown: turning those into [] made an outage look
   * exactly like an empty list.
   */
  async requestWithFallback(path: string, key: string) {
    try {
      const res = await this.request(path, { method: 'GET' }, true, 0);
      if (res == null) return [];
      return res[key] ?? res;
    } catch (e: unknown) {
      const err = e as Partial<ApiHttpError> | null;
      if (err?.status === 404 || /API Error: 404/.test(err?.message || '')) return [];
      throw e;
    }
  }

  async get(path: string) {
    return this.request(path, { method: 'GET' }, true);
  }

  async post(path: string, body: any) {
    return this.request(path, { method: 'POST', body: JSON.stringify(body) }, true);
  }

  // Activity Logging
  async logActivity(action: string, metadata: any = {}) {
    try {
      await this.request('/activity-log', {
        method: 'POST',
        body: JSON.stringify({ action, metadata, timestamp: new Date().toISOString() }),
      }, true);
    } catch {
      // Activity logging is non-critical — fire and forget
      console.log(`[Activity] ${action}`, metadata);
    }
    return { success: true };
  }

  // Activity Feed (comprehensive — for dashboard)
  async getActivityFeed(limit: number = 10): Promise<{ feed: any[] }> {
    try {
      const res = await this.request(`/user-activity/feed?limit=${limit}`, { method: 'GET' }, true);
      return res || { feed: [] };
    } catch {
      return { feed: [] };
    }
  }

  // Auth
  async signUp(email: string, password: string, name: string, phone?: string) {
    return this.request('/auth/signup', { 
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone })
    }, false);
  }

  async signOut() {
    return signOutLocal();
  }

  // User Profile
  async getProfile() {
    const res = await this.request('/users/profile', { method: 'GET' }, true);
    return res.profile;
  }

  async updateProfile(data: ProfileUpdateData) {
    const res = await this.request('/users/profile', { 
      method: 'PUT',
      body: JSON.stringify(data)
    }, true);
    return res.profile;
  }

  // User Payments
  async getPaymentHistory() {
    const res = await this.request('/users/payments', { method: 'GET' }, true);
    return res.payments || [];
  }

  // Payment Gateway — Razorpay
  async createPaymentOrder(data: { program_id: string; amount: number; currency?: string; user_id?: string; receipt_email?: boolean; description?: string }) {
    return this.request('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({
        amount: data.amount,
        currency: data.currency || 'INR',
        description: data.description || `Program purchase: ${data.program_id}`,
        metadata: { program_id: data.program_id },
      }),
    }, true);
  }

  async verifyPayment(data: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; transaction_id?: string }) {
    return this.request('/payment/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async recordProgramPayment(data: { programId: string; programTitle: string; amount: number; currency?: string; transactionId: string; paymentMethod?: string }) {
    return this.request('/users/payments', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        currency: data.currency || 'INR',
        status: 'completed',
        paymentMethod: data.paymentMethod || 'razorpay',
      }),
    }, true);
  }

  async checkProgramPurchase(programId: string): Promise<{ purchased: boolean; payment?: any }> {
    try {
      const res = await this.request(`/payment/check-purchase/${programId}`, { method: 'GET' }, true);
      return res;
    } catch {
      return { purchased: false };
    }
  }

  async getTransactionHistory(userId?: string) {
    const res = await this.request('/users/payments', { method: 'GET' }, true);
    return { transactions: res.payments || [] };
  }

  // Social Accounts
  async connectSocialAccount(provider: string) {
    return this.request(`/user/connect-social/${provider}`, { method: 'POST' }, true);
  }

  async disconnectSocialAccount(provider: string) {
    return this.request(`/user/disconnect-social/${provider}`, { method: 'POST' }, true);
  }

  // Consultants
  async getProfessionals() {
    try {
      const res = await this.request('/consultants', { method: 'GET' }, true);
      // Map backend 'consultants' to 'professionals' for component compatibility
      return { professionals: res.consultants || [] };
    } catch (e) {
      console.error('Failed to get professionals', e);
      return { professionals: [] };
    }
  }

  async getProfessional(id: string) {
    const res = await this.request(`/consultants/${id}`, { method: 'GET' }, true);
    return res.consultant;
  }

  async createProfessional(data: ProfessionalData) {
    const res = await this.request('/consultants', { 
      method: 'POST', 
      body: JSON.stringify(data)
    }, true);
    return res.consultant;
  }

  async updateProfessional(id: string, data: ProfessionalData) {
    const res = await this.request(`/consultants/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data)
    }, true);
    return res.consultant;
  }

  async deleteProfessional(id: string) {
    return this.request(`/consultants/${id}`, { method: 'DELETE' }, true);
  }

  // Equip Programs
  async getEquipPrograms() {
    try {
      const res = await this.request('/equip/programs', { method: 'GET' }, false);
      const programs = (res.programs || []).map((p: EquipProgramRaw) => ({
        ...p,
        title: p.title || p.name || 'Untitled Program'
      }));
      cacheForOffline('equip-programs', programs);
      return programs;
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
      console.warn('Failed to fetch equip programs, attempting offline cache fallback:', e?.message);
      const cached = readOfflineCache<any[]>('equip-programs');
      if (cached) return cached;
      return [];
    }
  }

  // Admin: all programs (including unpublished) with enrollment counts
  async getAdminEquipPrograms() {
    const res = await this.request('/admin/equip/programs', { method: 'GET' }, true);
    return (res.programs || []).map((p: EquipProgramRaw) => ({
      ...p,
      title: p.title || p.name || 'Untitled Program'
    }));
  }

  async getEquipProgram(id: string) {
    const res = await this.request(`/equip/programs/${id}?t=${Date.now()}`, { method: 'GET' }, true);
    const raw = res.program;
    
    if (!raw) return null;

    // ── CRITICAL: Dual-format resolution ──
    // The PUT route stores daily_content as a blob field in equip:{id}.
    // The GET route (getFullEquip) loads separate equip_day: entries into `days`.
    // PRIORITY: Blob daily_content is ALWAYS more current than separate entities
    // because PUT updates the blob but NOT the separate equip_day:/equip_block: entities.
    const hasSeparateDays = Array.isArray(raw.days) && raw.days.length > 0;
    const hasBlobContent = Array.isArray(raw.daily_content) && raw.daily_content.length > 0;

    let dailyContent: any[];

    if (hasBlobContent) {
      // Blob format: daily_content was stored directly by PUT route — ALWAYS prefer this
      // Already in frontend format — just ensure field consistency
      /*
        SPREAD THE DAY, then normalise. Do not rebuild it from a field list.

        This listed seven fields and rebuilt each day from them, so anything the
        list did not name was DROPPED on every load — and since the editor saves
        what it loaded, a single open-and-save silently reverted it.

        That is how 134 days lost the `policy` and `layout` written by §19 step 2
        and regained a `dayType` this line invents (`|| 'learning'`) for a field
        that no longer exists. Nothing looked broken because every one of them
        was a learning day anyway, so the fallback produced the same rendering.

        Same defect shape as the catalog sync's field allow-list, fixed the same
        day: a new field can never reach a reader through a writer that only
        knows the old ones.
      */
      dailyContent = raw.daily_content.map((day: any) => {
        const { day_type: _legacyDayType, dayType: _dayType, blocks: _blocks, ...rest } = day;
        return {
          ...rest,
          day: day.day ?? day.day_number ?? 0,
          title: day.title || '',
          description: day.description || '',
          subtitle: day.subtitle || '',
          activities: (day.activities || day.blocks || []).map(normaliseBlock),
        };
      });
    } else if (hasSeparateDays) {
      // Fallback: Normalized format from legacy separate day/block entities
      dailyContent = raw.days.map((day: EquipProgramDay) => ({
        day: day.day_number,
        title: day.title,
        description: day.description || '',
        image_url: day.image_url,
        // No `dayType` — a day has no type since §19 step 3. This branch reads
        // the legacy separate `day:`/`block:` rows, which nothing has written
        // since 2026-08-06, so it carries no policy or layout to preserve.
        subtitle: day.subtitle || '',
        activities: (day.blocks || []).map((block: EquipProgramBlock) => {
          // Fix for legacy 'sleep_diary' block type
          if (block.block_type === 'sleep_diary' || block.type === 'sleep_diary') {
            return {
              id: block.id,
              title: block.title || 'Sleep Log',
              type: 'exercise',
              content: block.content || '',
              duration: block.estimated_time_minutes || 5,
              required: block.is_required !== false,
              activityConfig: {
                subtype: 'input-table',
                prompt: block.description || 'Please record your sleep details below.',
                columns: ['Bed Time', 'Wake Time', 'Quality (1-5)', 'Notes'],
                allow_add_rows: true,
                ...(block.exercise_config || block.exerciseConfig || {})
              },
              stepGroup: block.step_group_id || block.stepGroup,
              autoAdvance: block.auto_advance || block.autoAdvance,
              image_url: block.image_url
            };
          }

          // Standard mapping
          return normaliseBlock(block);
        })
      }));
    } else {
      dailyContent = [];
    }

    // Transform backend format to frontend format
    return {
        ...raw,
        title: raw.title || raw.name,
        daily_content: dailyContent,
    };
  }

  async createEquipProgram(data: EquipProgramData) {
    const res = await this.request('/equip/programs', { 
      method: 'POST',
      body: JSON.stringify(data)
    }, true);
    return res.program;
  }

  async updateEquipProgram(id: string, data: EquipProgramData) {
    const res = await this.request(`/equip/programs/${id}`, { 
      method: 'PUT',
      body: JSON.stringify(data)
    }, true);
    return res.program;
  }
  
  async saveEquipProgram(program: EquipProgramData & { id?: string }) {
    if (program.id && !program.id.startsWith('temp')) {
      return this.updateEquipProgram(program.id, program);
    } else {
      return this.createEquipProgram(program);
    }
  }

  async deleteEquipProgram(id: string) {
    return this.request(`/equip/programs/${id}`, { method: 'DELETE' }, true);
  }

  // User Enrollments
  async getUserEnrollments() {
    try {
      if (!(await this.isAuthenticated())) return [];
      const res = await this.request('/user/enrollments', { method: 'GET' }, true);
      const enrollments = res.enrollments || [];
      cacheForOffline('user-enrollments', enrollments);
      return enrollments;
    } catch (e) {
      const cached = readOfflineCache<any[]>('user-enrollments');
      if (cached) return cached;
      return [];
    }
  }

  async enrollUser(equipId: string) {
    const res = await this.request(`/equip/purchase/${equipId}`, { 
      method: 'POST',
      body: JSON.stringify({}) 
    }, true);
    return res.enrollment;
  }

  async leaveProgram(equipId: string) {
    return this.request(`/user/enrollments/${equipId}`, { method: 'DELETE' }, true);
  }

  async getTodayContent(equipId: string) {
    return this.request(`/user/equip/${equipId}/today`, { method: 'GET' }, true);
  }

  async saveBlockResponse(equipId: string, dayNum: number, blockId: string, response: BlockResponse) {
    return this.request(`/user/equip/${equipId}/day/${dayNum}/block/${blockId}`, {
      method: 'POST',
      body: JSON.stringify({ response })
    }, true);
  }

  async completeDay(equipId: string, dayNum: number) {
    return this.request(`/user/equip/${equipId}/day/${dayNum}/complete`, {
      method: 'POST'
    }, true);
  }

  // Progress Tracking (New)
  async getEnrollmentProgress(equipId: string) {
    // Returns full progress history for this enrollment
    const res = await this.request(`/user/equip/${equipId}/progress`, { method: 'GET' }, true);
    return res.progress;
  }

  async syncEquipProgress(equipId: string, data: ProgressSyncData) {
    // Syncs partial progress (blocks, responses)
    return this.request(`/user/equip/${equipId}/sync`, { 
      method: 'POST',
      body: JSON.stringify(data)
    }, true);
  }

  async updateEnrollmentProgress(equipId: string, data: ProgressSyncData) {
    // If completed day, call completeDay
    if (data.completed && data.dayNumber) {
        return this.completeDay(equipId, data.dayNumber);
    }
    // Otherwise treat as sync
    return this.syncEquipProgress(equipId, data);
  }

  // Reminders
  async checkReminders() {
    try {
      if (!(await this.isAuthenticated())) return null;
      return this.request('/reminders/check', { method: 'POST' }, true);
    } catch (e) {
      console.warn('Reminder check failed (non-critical):', e);
      return null;
    }
  }

  // File uploads for program blocks
  async uploadBlockFile(equipId: string, dayNum: number, blockId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('equipId', equipId);
    formData.append('dayNum', dayNum.toString());
    formData.append('blockId', blockId);
    return this.request('/user/equip/upload', {
      method: 'POST',
      body: formData,
      // Content-Type is auto-skipped for FormData in request()
    }, true);
  }

  // Recommendations
  async getRecommendations() {
    try {
      if (!(await this.isAuthenticated())) return [];
      const res = await this.request('/recommendations', { method: 'GET' }, true);
      return res.recommendations || [];
    } catch (e) {
      return [];
    }
  }

  // Resources
  async getResources() {
    // Always use the public library endpoint for fetching resources
    // Admin endpoint is only needed for admin CRUD operations
    try {
      const res = await this.request('/library/resources', { method: 'GET' }, true);
      const resources = res.resources || [];
      cacheForOffline('resources', resources);
      return resources;
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
      console.warn('Failed to fetch resources, attempting offline cache fallback:', e?.message);
      const cached = readOfflineCache<any[]>('resources');
      if (cached) return cached;
      return [];
    }
  }

  async getResource(id: string) {
    const res = await this.request(`/library/resources/${id}`, { method: 'GET' }, true);
    return res.resource;
  }

  async createResource(data: ResourceData) {
    const res = await this.request('/admin/resources', { 
      method: 'POST', 
      body: JSON.stringify(data)
    }, true);
    return res.resource;
  }

  async updateResource(id: string, data: ResourceData) {
    const res = await this.request(`/admin/resources/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data)
    }, true);
    return res.resource;
  }

  async deleteResource(id: string) {
    return this.request(`/admin/resources/${id}`, { method: 'DELETE' }, true);
  }

  async getPublicCategories() {
    try {
      const res = await this.request('/categories', { method: 'GET' }, false);
      return res.categories || [];
    } catch (e) {
      console.warn('Failed to fetch public categories, returning empty list');
      return [];
    }
  }

  /**
   * Live block usage, counted over `equip:` on the server.
   *
   * Returns null rather than an empty shape on failure: the Block Type Viewer
   * must be able to say "usage unavailable" instead of showing every declared
   * term with a confident zero, which is indistinguishable from genuinely
   * unused and is the exact mistake this feed exists to stop.
   */
  async getBlockUsage(): Promise<{
    source: string; generated_at: string;
    programmes: number; totalDays: number; totalBlocks: number;
    interactions: Record<string, number>;
    blockTypes: Record<string, number>;
    activities: Record<string, number>;
    dayTypes: Record<string, number>;
    responseIdentity?: {
      blocksWithKey: number;
      distinctKeys: number;
      sharedKeys: number;
      blocksInSharedKeys: number;
      blocksWithRepeat: number;
      repeatTypes: Record<string, number>;
    };
    /**
     * Field-presence facts for every live block, grouped by signature. Facts
     * only — the requirements table that interprets them is
     * `content-hierarchy.ts`, which the edge function cannot import.
     */
    blockProbes?: {
      /** Block type. */            t: string;
      /** Explicit interaction. */  i: string | null;
      /** activityConfig.subtype */ s: string | null;
      /** Config keys with a non-empty value. */ c: string[];
      /** Has non-empty content. */ ct: boolean;
      /** Has an image_url. */      im: boolean;
      /** Blocks sharing this signature. */ n: number;
    }[];
    /** The two day-level facts `validateDay` reasons about, counted live. */
    dayIntegrity?: { emptyDays: number; daysWithDuplicateBlockIds: number };
  } | null> {
    try {
      return await this.request('/blocks/usage', { method: 'GET' }, true);
    } catch (e) {
      console.warn('[blocks] usage feed unavailable:', e);
      return null;
    }
  }

  /**
   * The catalog, for Meta Manager. **Returns `null` on failure, never `[]`.**
   *
   * It used to swallow every error and return an empty array, which made a 401,
   * a 500 and a genuinely empty KV store indistinguishable to the caller. The
   * consequence was not cosmetic: Meta Manager rendered a failed load as a
   * SUCCESSFUL, EMPTY page — header "0 total items", every tab badge 0, and an
   * empty state reading "use Sync All Metadata to populate" — with Sync
   * enabled, offering a 200-row write against a store whose contents had never
   * been read.
   *
   * Same rule, same reason as `getBlockUsage` above: a page must be able to say
   * "I cannot tell you" instead of printing a confident zero.
   */
  async getAdminCategories(): Promise<unknown[] | null> {
    try {
      const res = await this.request('/admin/categories', { method: 'GET' }, true);
      return res.categories || [];
    } catch (e) {
      console.warn('[catalog] admin categories unavailable:', e);
      return null;
    }
  }

  async createCategory(data: CategoryData) {
    const res = await this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }, true);
    return res.category;
  }

  async updateCategory(id: string, data: CategoryData) {
    const res = await this.request(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, true);
    return res.category;
  }

  async deleteCategory(id: string) {
    return this.request(`/admin/categories/${id}`, { method: 'DELETE' }, true);
  }

  // Media Management
  async getMediaFiles() {
    try {
      const res = await this.request('/media', { method: 'GET' }, true);
      return res.files || [];
    } catch (e) {
      console.error('Failed to get media files', e);
      // Return empty array to prevent UI crashes, but log error
      return []; 
    }
  }

  async deleteMediaFile(id: string) {
    return this.request(`/media/${id}`, { method: 'DELETE' }, true);
  }

  async renameMediaFile(id: string, fileName: string) {
    return this.request(`/media/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName })
    }, true);
  }

  async uploadMediaFile(file: File, bucket: string = 'make-cc205da9-media') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    return this.request('/upload', {
      method: 'POST',
      body: formData
    }, true);
  }

  // Legacy shims
  async purchaseEquipProgram(equipId: string, onboarding_data: Record<string, unknown>, payment_method: string) {
    return this.enrollUser(equipId);
  }

  async getUserPurchasedPrograms(userId: string) {
    return this.getUserEnrollments();
  }

  async completeEquipDay(equipId: string, day: number) {
    return this.completeDay(equipId, day);
  }

  async getEquipEnrollments() {
    try {
      if (!(await this.isAuthenticated())) return [];
      const res = await this.request('/admin/equip/enrollments', { method: 'GET' }, true);
      return res.enrollments || [];
    } catch (e) {
      console.error('Failed to get equip enrollments', e);
      return [];
    }
  }

  async createEquipEnrollment(data: { programId: string, onboardingData: Record<string, unknown> }) {
    // We'll use the /equip/purchase endpoint which effectively enrolls the user
    // Backend expects "onboarding_data" (snake_case) not "onboardingData" (camelCase)
    return this.request(`/equip/purchase/${data.programId}`, {
      method: 'POST',
      body: JSON.stringify({ onboarding_data: data.onboardingData })
    }, true);
  }

  // Assessments
  async getUserAssessmentResponses(userId?: string) {
    // If userId is provided, we use the admin endpoint (if it exists) or fallback to user endpoint if self
    // But typically this is for the current user
    const path = userId ? `/admin/users/${userId}/assessments` : '/user/assessments/history';
    // If checking for another user, ensure we have admin privileges on backend
    return this.request(path, { method: 'GET' }, true);
  }

  async saveAssessmentResponse(
    assessmentId: string,
    responses: AssessmentResponses,
    status: string,
    score: number,
    interpretation: AssessmentInterpretation,
    severityHint?: string,
    maxScore?: number,
    sectionScores?: unknown,
    slug?: string,
    /**
     * The full EngineResult. Persisting it is what lets a result be re-read
     * later — without it only the flattened interpretation survives, and the
     * result page can never be rebuilt from the record.
     */
    engineResult?: unknown,
    /**
     * Time on task. An object rather than two more positional parameters —
     * this signature is already ten deep, and the offline-sync path forwards
     * it by position, which is exactly how `maxScore` and `sectionScores` were
     * silently dropped once before.
     *
     * Omitted entirely when the run was untimed. The route writes neither
     * field in that case; it never stores a zero.
     */
    timing?: { startedAt?: string; durationSeconds?: number }
  ) {
    return this.request('/user/assessments', {
      method: 'POST',
      body: JSON.stringify({
        assessmentId,
        // The engines key on slug or a clinical shortname; a result that stores
        // only the asm_… id can never match any of them. See ikan-score-routes
        // (KNOWN_MAX_SCORES, HIGHER_IS_BETTER) and recommendation-engine.
        slug,
        responses,
        status,
        score,
        maxScore,
        interpretation,
        severityHint,
        sectionScores,
        engineResult,
        startedAt: timing?.startedAt,
        durationSeconds: timing?.durationSeconds
      })
    }, true);
  }

  /**
   * One stored assessment result by id.
   *
   * Backs the linkable `/assessment-results?id=…` route. sessionStorage is only
   * an optimisation for the instant after submit; when an id resolves, the
   * stored record wins.
   */
  /** Save a partial run. Overwrites the single draft for this assessment. */
  async saveAssessmentDraft(assessmentId: string, data: {
    responses: Record<string, unknown>;
    currentBlockIndex: number;
    /** Foregrounded seconds banked so far. Omitted when the run is untimed. */
    activeSeconds?: number;
    /** ISO start of the first sitting, so a resume keeps the original. */
    startedAt?: string;
  }) {
    return this.request(`/user/assessments/drafts/${encodeURIComponent(assessmentId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true, 0);
  }

  /** Every in-progress run for the signed-in user. */
  async getAssessmentDrafts() {
    const res = await this.request('/user/assessments/drafts', { method: 'GET' }, true, 0).catch(() => null);
    return Array.isArray(res?.drafts) ? res.drafts : [];
  }

  /** Discard a draft. Called on completion so a finished run stops resuming. */
  async deleteAssessmentDraft(assessmentId: string) {
    return this.request(`/user/assessments/drafts/${encodeURIComponent(assessmentId)}`, { method: 'DELETE' }, true, 0)
      .catch(() => null);
  }

  async getAssessmentResult(resultId: string) {
    const res = await this.request(`/user/assessments/results/${encodeURIComponent(resultId)}`, { method: 'GET' }, true);
    return res?.result ?? null;
  }

  async getAssessments() {
    try {
      const res = await this.request('/assessments', { method: 'GET' }, true);
      cacheForOffline('assessments-list', res.assessments || []);
      return res.assessments || [];
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
      console.warn('Failed to fetch assessments, attempting offline cache fallback:', e?.message);
      const cached = readOfflineCache<any[]>('assessments-list');
      if (cached) return cached;
      return [];
    }
  }

  async getAdminAssessments() {
    const res = await this.request('/admin/assessments', { method: 'GET' }, true);
    return res.assessments || [];
  }

  /**
   * Fetch one assessment.
   *
   * `allowCache` defaults to true so user-facing screens keep working offline.
   * Callers that intend to WRITE the result back must pass false: the cache is
   * up to 24 hours old and returning it silently on any network error means an
   * admin can load a stale copy and PUT it over newer server state, reverting
   * everyone else's edits. That is a real path — handlePublishToggle spreads
   * this exact object back into its payload.
   */
  async getAssessment(id: string, opts?: { allowCache?: boolean }) {
    const allowCache = opts?.allowCache !== false;
    try {
      const res = await this.request(`/assessments/${id}?t=${Date.now()}`, { method: 'GET' }, true);
      cacheForOffline(`assessment-${id}`, res.assessment);
      return res.assessment;
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
      if (!allowCache) {
        console.warn(`Failed to fetch assessment ${id}; refusing stale cache because the caller intends to write it back.`);
        throw e;
      }
      console.warn(`Failed to fetch assessment ${id}, attempting offline cache fallback:`, e?.message);
      const cached = readOfflineCache<any>(`assessment-${id}`);
      if (cached) return cached;
      throw e; // Re-throw if no cache — caller should show error state
    }
  }

  async createAssessment(data: AssessmentData) {
    const res = await this.request('/admin/assessments', { 
      method: 'POST', 
      body: JSON.stringify(data)
    }, true);
    return res.assessment;
  }

  async updateAssessment(id: string, data: AssessmentData) {
    const res = await this.request(`/admin/assessments/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data)
    }, true);
    return res.assessment;
  }

  async deleteAssessment(id: string) {
    const res = await this.request(`/admin/assessments/${id}`, { method: 'DELETE' }, true);
    // Invalidate stale offline caches so deleted assessment doesn't reappear
    invalidateOfflineCache('assessments-list');
    invalidateOfflineCache(`assessment-${id}`);
    return res;
  }

  // Mood Journal
  async listMoods() {
    try {
      const res = await this.request('/moods', { method: 'GET' }, true);
      cacheForOffline('moods', res.moods || []);
      return res.moods || [];
    } catch (e) {
      const cached = readOfflineCache<any[]>('moods');
      if (cached) return cached;
      return [];
    }
  }

  async getJournalEntries(startDate?: string, endDate?: string, limit: number = 50) {
    let query = `?limit=${limit}`;
    if (startDate) query += `&start_date=${startDate}`;
    if (endDate) query += `&end_date=${endDate}`;
    
    try {
      const res = await this.request(`/user/journal${query}`, { method: 'GET' }, true);
      cacheForOffline('journal-entries', res);
      return res;
    } catch (e) {
      const cached = readOfflineCache<any>('journal-entries');
      if (cached) return cached;
      return { entries: [] };
    }
  }

  async createJournalEntry(date: string, mood: number, note: string, emotions: string[], energy: number, stress?: number, contextTags?: string[], extraFields?: Record<string, any>) {
    return this.request('/user/journal', { 
      method: 'POST',
      body: JSON.stringify({
        date,
        mood_rating: mood,
        freehand_text_content: note,
        emotions,
        energy,
        stress_level: stress,
        context_tags: contextTags,
        ...(extraFields || {}),
      })
    }, true);
  }

  // ── Check-in Template ─────────────────────────────────────────
  async getActiveCheckinTemplate() {
    try {
      const res = await this.request('/checkin-template/active', { method: 'GET' }, true);
      cacheForOffline('checkin-template-active', res);
      return res;
    } catch (e) {
      const cached = readOfflineCache<any>('checkin-template-active');
      if (cached) return cached;
      return { template: null, _isDefault: true };
    }
  }

  async getCheckinTemplates() {
    return this.request('/checkin-templates', { method: 'GET' }, true);
  }

  async getCheckinTemplate(id: string) {
    return this.request(`/checkin-template/${id}`, { method: 'GET' }, true);
  }

  async createCheckinTemplate(data: any) {
    return this.request('/checkin-template', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updateCheckinTemplate(id: string, data: any) {
    return this.request(`/checkin-template/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async deleteCheckinTemplate(id: string) {
    return this.request(`/checkin-template/${id}`, { method: 'DELETE' }, true);
  }

  async activateCheckinTemplate(id: string) {
    return this.request(`/checkin-template/${id}/activate`, { method: 'POST' }, true);
  }

  // ── iKAN Score ─────────────────────────────────────────────────
  async getIkanScore() {
    return this.request('/user/ikan-score', { method: 'GET' }, true);
  }

  async getIkanScoreHistory() {
    return this.request('/user/ikan-score/history', { method: 'GET' }, true);
  }

  // Admin Users
  async getUsers() {
    return this.request('/admin/users', { method: 'GET' }, true);
  }

  async getUser(userId: string) {
    return this.request(`/admin/users/${userId}`, { method: 'GET' }, true);
  }

  async createUserAdmin(data: AdminUserData) {
    return this.request('/admin/users', { 
      method: 'POST',
      body: JSON.stringify(data)
    }, true);
  }

  async updateUserAdmin(userId: string, data: AdminUserData) {
    const res = await this.request(`/admin/users/${userId}`, { 
      method: 'PUT',
      body: JSON.stringify(data)
    }, true);
    return res.profile;
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, { method: 'DELETE' }, true);
  }

  // Admin user data access
  async getUserMoodEntries(userId: string) {
    try {
      const res = await this.request(`/admin/users/${userId}/mood-entries`, { method: 'GET' }, true);
      return res.entries || [];
    } catch (e) {
      console.warn(`Failed to fetch mood entries for user ${userId}:`, e);
      return [];
    }
  }

  async getUserEquipEnrollments(userId: string) {
    try {
      const res = await this.request(`/admin/users/${userId}/enrollments`, { method: 'GET' }, true);
      return res.enrollments || [];
    } catch (e) {
      console.warn(`Failed to fetch enrollments for user ${userId}:`, e);
      return [];
    }
  }

  async getUserConsultations(userId: string) {
    try {
      const res = await this.request(`/admin/users/${userId}/consultations`, { method: 'GET' }, true);
      return res.consultations || [];
    } catch (e) {
      console.warn(`Failed to fetch consultations for user ${userId}:`, e);
      return [];
    }
  }

  // Analytics
  async getAggregatedAnalytics(period: string = 'week') {
    try {
      const res = await this.request(`/admin/analytics?period=${period}`, { method: 'GET' }, true);
      return res.analytics || {
        activeUsers: 0,
        newUsers: 0,
        retention: 0,
        engagement: 0,
        revenue: 0,
        userGrowth: [],
        programEngagement: [],
        moodTrends: []
      };
    } catch (e) {
      console.warn('Failed to fetch analytics', e);
      return {
        activeUsers: 0,
        newUsers: 0,
        retention: 0,
        engagement: 0,
        revenue: 0,
        userGrowth: [],
        programEngagement: [],
        moodTrends: []
      };
    }
  }

  async cleanupZombieEnrollments() {
    return this.request('/admin/equip/cleanup-zombies', { method: 'POST' }, true);
  }

  // Backup & Restore
  async createBackupCheckpoint() {
    return this.request('/admin/backup/create-checkpoint', { method: 'POST' }, true);
  }

  async listBackupCheckpoints() {
    try {
      const res = await this.request('/admin/backup/checkpoints', { method: 'GET' }, true);
      return res.backups || [];
    } catch (e) {
      return [];
    }
  }

  async restoreBackupCheckpoint(backupId: string) {
    return this.request('/admin/backup/restore-checkpoint', { 
      method: 'POST',
      body: JSON.stringify({ backupId })
    }, true);
  }

  /*
   * The public contact and newsletter writes used to live here
   * (`/contact/submit`, `/newsletter/signup`). iKAN 2 owns both inboxes as of
   * 2026-10-07 and the forms post straight to its tables — see
   * `shared/api/ikan2-forms`. Removed rather than left deprecated so a future
   * form cannot pick the dead path by autocomplete.
   *
   * The admin readers below stay: they read the KV records this site collected
   * before the handover, which the admin console still lists.
   */

  // Admin: Contact Submissions
  async getContactSubmissions() {
    return this.request('/admin/contact-submissions', { method: 'GET' }, true);
  }

  async updateContactSubmission(id: string, data: { status?: string; adminNotes?: string }) {
    return this.request(`/admin/contact-submissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }, true);
  }

  async deleteContactSubmission(id: string) {
    return this.request(`/admin/contact-submissions/${id}`, {
      method: 'DELETE'
    }, true);
  }

  // Admin: Newsletter Subscribers
  async getNewsletterSubscribers() {
    return this.request('/admin/newsletter-subscribers', { method: 'GET' }, true);
  }

  // Password Change
  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    }, true);
  }

  // Data Export
  async exportUserData() {
    return this.request('/users/export-data', {
      method: 'POST',
      timeoutMs: LONG_TIMEOUT_MS,
    }, true);
  }

  // Account Deletion
  async deleteAccount() {
    return this.request('/users/me', {
      method: 'DELETE'
    }, true);
  }

  // Privacy Settings
  async updatePrivacySettings(settings: PrivacySettings) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ privacy_settings: settings })
    }, true);
  }

  // Avatar Upload — uploads file to Supabase Storage via the backend, returns the new avatar URL
  async uploadAvatar(file: File): Promise<{ avatarUrl: string; profile: UserProfile }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/users/avatar/upload', {
      method: 'POST',
      body: formData
    }, true);
  }

  // Email Change
  async requestEmailChange(newEmail: string, password: string) {
    return this.request('/users/email/request-change', {
      method: 'POST',
      body: JSON.stringify({ newEmail, password })
    }, true);
  }

  async verifyEmailChange(token: string) {
    return this.request('/users/email/verify-change', {
      method: 'POST',
      body: JSON.stringify({ token })
    }, true);
  }

  // Social Account Linking (real OAuth via Supabase)
  async linkSocialAccount(provider: 'google' | 'linkedin_oidc') {
    const { data, error } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${window.location.origin}/account`
      }
    });
    if (error) throw error;
    return data;
  }

  async unlinkSocialAccount(identityId: string) {
    const { data, error } = await supabase.auth.unlinkIdentity({
      id: identityId
    } as any);
    if (error) throw error;
    return data;
  }

  // Get linked identities from Supabase auth
  async getLinkedIdentities() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return [];
    return user.identities || [];
  }

  // KV Audit
  async runKVAudit() {
    return this.request('/admin/kv-audit', { method: 'GET', timeoutMs: LONG_TIMEOUT_MS }, true);
  }

  async getKVSchema() {
    return this.request('/admin/kv-schema', { method: 'GET' }, true);
  }

  async cleanupKVKeys(keys: string[], dryRun = true) {
    return this.request('/admin/kv-audit/cleanup', {
      method: 'POST',
      timeoutMs: LONG_TIMEOUT_MS,
      body: JSON.stringify({ keys, dryRun })
    }, true);
  }

  async pruneAuditTrail(olderThanDays: number, dryRun = true) {
    return this.request('/admin/kv-audit/prune-audit-trail', {
      method: 'POST',
      timeoutMs: LONG_TIMEOUT_MS,
      body: JSON.stringify({ olderThanDays, dryRun })
    }, true);
  }

  async migrateNaming(fromPrefix: string, toPrefix: string, dryRun = true) {
    return this.request('/admin/kv-audit/migrate-naming', {
      method: 'POST',
      timeoutMs: LONG_TIMEOUT_MS,
      body: JSON.stringify({ fromPrefix, toPrefix, dryRun })
    }, true);
  }

  async saveAuditSnapshot(data: { score: number; totalKeys: number; orphanCount: number; inconsistencyCount: number; growthWarningCount: number; softDeletedCount: number; uncategorizedCount: number }) {
    return this.request('/admin/kv-audit/save-snapshot', {
      method: 'POST',
      body: JSON.stringify(data)
    }, true);
  }

  async getAuditTrends() {
    return this.request('/admin/kv-audit/trends', { method: 'GET' }, true);
  }

  async syncPrefixes(dryRun = true) {
    return this.request('/admin/kv-audit/sync-prefixes', {
      method: 'POST',
      timeoutMs: LONG_TIMEOUT_MS,
      body: JSON.stringify({ dryRun })
    }, true);
  }

  async purgeKVPrefix(prefix: string, dryRun = true) {
    return this.request('/admin/kv-audit/purge-prefix', {
      method: 'POST',
      timeoutMs: LONG_TIMEOUT_MS,
      body: JSON.stringify({ prefix, dryRun })
    }, true);
  }

  async purgeActivityKeys(dryRun = true) {
    return this.request('/admin/purge-activity-keys', {
      method: 'POST',
      timeoutMs: LONG_TIMEOUT_MS,
      body: JSON.stringify({ dryRun })
    }, true);
  }

  // Settings (admin)
  async getSettings() {
    return this.request('/admin/settings', { method: 'GET' }, true);
  }

  async updateSettings(settings: Record<string, any>) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }, true);
  }

  // Settings (public — no auth required, used by footer/header/SEO)
  async getPublicSettings() {
    return this.request('/settings', { method: 'GET' }, false);
  }

  // ── Check-in Scales (public GET, admin PUT) ──────────────────────
  async getScale(scaleKey: string) {
    return this.request(`/scales/${scaleKey}`, { method: 'GET' }, false);
  }

  async updateScale(scaleKey: string, items: any[]) {
    return this.request(`/scales/${scaleKey}`, {
      method: 'PUT',
      body: JSON.stringify({ items })
    }, true);
  }

  async createCustomScale(key: string, name: string, items: any[]) {
    return this.request('/scales/custom', {
      method: 'POST',
      body: JSON.stringify({ key, name, items })
    }, true);
  }

  async deleteCustomScale(key: string) {
    return this.request(`/scales/custom/${key}`, { method: 'DELETE' }, true);
  }

  // Brevo Communication
  async testBrevoChannel(channel: string, recipient: string) {
    return this.request('/brevo/test', {
      method: 'POST',
      body: JSON.stringify({ channel, recipient })
    }, true);
  }

  // ── Admin: communication (templates, queue, Brevo config/account/logs) ──
  // (admin-communication-methods)
  async getCommunicationTemplates(signal?: AbortSignal): Promise<{ templates?: any[] }> {
    return this.request('/admin/communication/templates', { method: 'GET', signal }, true);
  }

  async saveCommunicationTemplate(template: unknown): Promise<{ template?: any }> {
    return this.request('/admin/communication/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    }, true);
  }

  async deleteCommunicationTemplate(id: string) {
    return this.request(`/admin/communication/templates/${id}`, { method: 'DELETE' }, true);
  }

  async getCommunicationQueue(signal?: AbortSignal): Promise<{ queue?: any[] }> {
    return this.request('/admin/communication/queue', { method: 'GET', signal }, true);
  }

  async queueCommunicationBroadcast(item: { type: string; recipient: string; subject: string; body: string }): Promise<{ item?: any }> {
    return this.request('/admin/communication/queue', {
      method: 'POST',
      body: JSON.stringify(item),
    }, true);
  }

  async getBrevoConfig(signal?: AbortSignal): Promise<{ config?: any; apiKeyConfigured?: boolean }> {
    return this.request('/brevo/config', { method: 'GET', signal }, true);
  }

  async saveBrevoConfig(config: unknown) {
    return this.request('/brevo/config', {
      method: 'POST',
      body: JSON.stringify(config),
    }, true);
  }

  async getBrevoAccount(signal?: AbortSignal): Promise<{ connected?: boolean; account?: any }> {
    return this.request('/brevo/account', { method: 'GET', signal }, true);
  }

  async getBrevoLogs(limit = 20, signal?: AbortSignal): Promise<{ logs?: any[] }> {
    return this.request(`/brevo/logs?limit=${limit}`, { method: 'GET', signal }, true);
  }

  // ── Admin: payment gateway ──
  // (admin-payment-methods)
  async getAdminPaymentConfigs(): Promise<{ configs?: any[] }> {
    return this.request('/admin/payment/config', { method: 'GET' }, true);
  }

  async getAdminPaymentTransactions(): Promise<{ transactions?: any[] }> {
    return this.request('/admin/payment/transactions', { method: 'GET' }, true);
  }

  async saveAdminPaymentConfig(gateway: string, config: Record<string, unknown>) {
    return this.request('/admin/payment/config', {
      method: 'POST',
      body: JSON.stringify({ gateway, config }),
    }, true);
  }

  async testAdminPaymentGateway(gateway: string, amount: number) {
    return this.request('/admin/payment/test', {
      method: 'POST',
      body: JSON.stringify({ gateway, amount }),
    }, true);
  }

  // ── Admin: consultations ──
  // (admin-consultation-methods)
  async getProfessionalApplications() {
    return this.request('/admin/professional-applications', { method: 'GET' }, true);
  }

  async getProfessionalApplication(id: string) {
    return this.request(`/admin/professional-applications/${id}`, { method: 'GET' }, true);
  }

  async approveProfessionalApplication(id: string) {
    return this.request(`/admin/professional-applications/${id}/approve`, { method: 'POST' }, true);
  }

  /** A fresh 24h link to a file in the private uploads bucket (the one stored with an application expires). */
  async refreshUploadUrl(path: string): Promise<{ url?: string }> {
    return this.request('/upload/refresh-url', { method: 'POST', body: JSON.stringify({ path }) }, true);
  }

  async rejectProfessionalApplication(id: string, reason: string) {
    return this.request(`/admin/professional-applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }, true);
  }

  // ── Admin: check-in scales manager ──
  // (admin-scales-methods)

  // ── Admin: block editor ──
  // (admin-block-editor-methods)
  /** POST FormData { file, bucket } to /upload-image; resolves `{ url }`. */
  async uploadImage(file: File, bucket: string): Promise<{ url?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    return this.request('/upload-image', { method: 'POST', body: formData }, true);
  }

  // ── Admin: image upload fallback (ui/image-upload) ──
  /** POST FormData { file, category, professionalId } to /upload/professional-file. */
  async uploadProfessionalFile(file: Blob, category: string, professionalId: string): Promise<{ success?: boolean; url?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('professionalId', professionalId);
    return this.request('/upload/professional-file', { method: 'POST', body: formData }, true);
  }
}

export const apiClient = new ApiClient();
