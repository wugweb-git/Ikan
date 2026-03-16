import { supabase } from './supabase-client';

import type {
  PageData,
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

import { projectId, publicAnonKey } from '../utils/supabase/info';
import { cacheForOffline, readOfflineCache, invalidateOfflineCache } from '../hooks/useOfflineSync';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;

class ApiClient {
  private token: string | null = null;
  // Track in-flight AbortControllers so components can cancel on unmount
  private inflightControllers = new Set<AbortController>();

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
          console.warn('Auth: Invalid refresh token detected in getToken, signing out');
          await supabase.auth.signOut().catch(() => {});
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

  async request(path: string, options: any = {}, auth = true, retryCount = 0): Promise<any> {
    // Skip Content-Type for FormData — the browser sets it automatically with the correct boundary
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: any = isFormData ? {} : {
      'Content-Type': 'application/json',
    };

    if (auth) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
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

    // Create an AbortController for this request (unless caller already provided a signal)
    const controller = options.signal ? null : new AbortController();
    if (controller) this.inflightControllers.add(controller);
    const signal = options.signal || controller?.signal;

    try {
      const response = await fetch(url, {
        ...options,
        signal,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      // If the request was aborted (component unmounted / navigation), do NOT retry
      if (error?.name === 'AbortError') {
        // Silently swallow — the caller no longer cares about this response
        throw error;
      }

      // Only retry on 5xx server errors and network errors (not 4xx client errors)
      const errorMsg = error?.message || '';
      const isNetworkError = error?.name === 'TypeError' && errorMsg.toLowerCase().includes('failed to fetch');
      const is5xxError = /API Error: 5\d\d/.test(errorMsg);
      const isRetryable = isNetworkError || is5xxError || !errorMsg;
      
      if (retryCount < 2 && isRetryable) {
        // Retry with linear backoff for transient errors
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.request(path, options, auth, retryCount + 1);
      }
      
      // Suppress 401 error logging to avoid console noise during auth checks
      // Also suppress 404 logging as it is often used for "check if exists" logic
      // Also suppress 409 logging as it is used for idempotent create-if-not-exists flows
      // Also suppress network errors (Failed to fetch) as they are transient
      const msg = error?.message?.toLowerCase() || '';
      const isNetworkErrorLog = error?.name === 'TypeError' && msg.includes('failed to fetch');
      if (!error.message || (!error.message.includes('401') && !error.message.includes('404') && !error.message.includes('409') && !isNetworkErrorLog)) {
        console.error('API Request failed', error);
      } else if (isNetworkErrorLog) {
        console.warn('API Request: network unreachable (will retry when online)');
      }
      
      throw error;
    } finally {
      // Clean up controller reference
      if (controller) this.inflightControllers.delete(controller);
    }
  }

  async requestWithFallback(path: string, key: string) {
    try {
      const res = await this.request(path, { method: 'GET' }, true, 0);
      return res[key] || res;
    } catch (e) {
      console.error(e);
      return [];
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

  // CMS
  async getPage(slug: string) {
    return this.request(`/cms/pages/${slug}`, { method: 'GET' }, true);
  }

  // CMS (public — no auth required, used by user-facing CMS page renderer)
  async getPagePublic(slug: string) {
    return this.request(`/cms/pages/${slug}`, { method: 'GET' }, false);
  }

  async getAdminPage(id: string) {
    const res = await this.request(`/cms/pages/${id}`, { method: 'GET' }, true);
    return res.page || res;
  }

  async getPages() {
    try {
      const res = await this.request('/cms/pages', { method: 'GET' }, true);
      return res.pages || [];
    } catch (e) {
      console.warn('Failed to fetch pages', e);
      return [];
    }
  }

  async createPage(data: PageData) {
    const res = await this.request('/cms/pages', { 
      method: 'POST', 
      body: JSON.stringify(data)
    }, true);
    return res.page || res;
  }

  async updatePage(id: string, data: PageData) {
    const res = await this.request(`/cms/pages/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data)
    }, true);
    return res.page || res;
  }

  async deletePage(id: string) {
    return this.request(`/cms/pages/${id}`, { method: 'DELETE' }, true);
  }

  // Auth
  async signUp(email: string, password: string, name: string, phone?: string) {
    return this.request('/auth/signup', { 
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone })
    }, false);
  }

  async signOut() {
    return supabase.auth.signOut();
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
      const res = await this.request('/equip/programs', { method: 'GET' }, true);
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

  async getEquipProgram(id: string) {
    const res = await this.request(`/equip/programs/${id}?t=${Date.now()}`, { method: 'GET' }, true);
    const raw = res.program;
    
    if (!raw) return null;

    // Transform backend format to frontend format
    return {
        ...raw,
        title: raw.title || raw.name, // Map name to title
        daily_content: (raw.days || []).map((day: EquipProgramDay) => ({
            day: day.day_number,
            title: day.title,
            description: day.description || '',
            image_url: day.image_url,
            dayType: day.day_type || day.dayType || 'learning',
            activities: (day.blocks || []).map((block: EquipProgramBlock) => {
                // Fix for legacy 'sleep_diary' block type
                if (block.block_type === 'sleep_diary' || block.type === 'sleep_diary') {
                    return {
                        id: block.id,
                        title: block.title || 'Sleep Log',
                        type: 'exercise',
                        content: block.content || '',
                        duration: block.estimated_time_minutes || 5,
                        required: block.is_required !== false, // Default to true
                        exerciseConfig: {
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
                return {
                    id: block.id,
                    title: block.title || 'Untitled Block',
                    type: block.block_type || block.type || 'lesson',
                    content: block.content || '',
                    duration: block.estimated_time_minutes || 5,
                    required: block.is_required,
                    exerciseConfig: block.exercise_config || block.exerciseConfig || {},
                    stepGroup: block.step_group_id || block.stepGroup,
                    autoAdvance: block.auto_advance || block.autoAdvance,
                    image_url: block.image_url
                };
            })
        }))
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
    // Try admin endpoint first if authenticated, else public
    if (await this.isAuthenticated()) {
      try {
        const res = await this.request('/admin/resources', { method: 'GET' }, true);
        const resources = res.resources || [];
        cacheForOffline('resources', resources);
        return resources;
      } catch (e) {
        // Fallback to library resources below
      }
    }
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

  async getCategories() {
    try {
      const res = await this.request('/admin/categories', { method: 'GET' }, true);
      return res.categories || [];
    } catch (e) {
      console.warn('Failed to fetch categories, returning empty list');
      return [];
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

  async saveProgramCheckIn(data: {
    programId: string;
    day: number;
    perceivedChange: 'better' | 'same' | 'worse';
    confidenceLevel: number;
    continuationIntent: 'continue' | 'pause' | 'stop';
    feedback: string;
  }) {
    // We use the assessments endpoint to store this data structure
    // ID Format: checkin_{programId}_day_{day}
    const checkInId = `checkin_${data.programId}_day_${data.day}`;
    
    return this.request('/user/assessments', { 
      method: 'POST',
      body: JSON.stringify({
        assessmentId: checkInId,
        responses: {
          type: 'program_checkin',
          ...data
        },
        status: 'completed',
        score: 0, // No scoring
        interpretation: {
          label: data.continuationIntent,
          description: `User feels ${data.perceivedChange} with ${data.confidenceLevel}/5 confidence.`
        }
      })
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
    maxScore?: number
  ) {
    return this.request('/user/assessments', { 
      method: 'POST',
      body: JSON.stringify({
        assessmentId,
        responses,
        status,
        score,
        maxScore,
        interpretation,
        severityHint
      })
    }, true);
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

  async getAssessment(id: string) {
    try {
      const res = await this.request(`/assessments/${id}?t=${Date.now()}`, { method: 'GET' }, true);
      cacheForOffline(`assessment-${id}`, res.assessment);
      return res.assessment;
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
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

  // ── Hero Banners ────────────────────────────────────────────
  async getHeroBanners() {
    return this.request('/hero-banners', { method: 'GET' }, true);
  }

  async getHeroBanner(pageKey: string) {
    try {
      const res = await this.request(`/hero-banners/${pageKey}`, { method: 'GET' }, true);
      cacheForOffline(`hero-banner-${pageKey}`, res);
      return res;
    } catch (_e) {
      const cached = readOfflineCache<any>(`hero-banner-${pageKey}`);
      if (cached) return cached;
      return { banner: null };
    }
  }

  async updateHeroBanner(pageKey: string, data: { title: string; subtitle: string; image_url: string; cta_text?: string; cta_link?: string }) {
    return this.request(`/hero-banners/${pageKey}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async resetHeroBanner(pageKey: string) {
    return this.request(`/hero-banners/reset/${pageKey}`, { method: 'POST' }, true);
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

  // Contact Form
  async submitContactForm(data: { name: string; email: string; subject: string; message: string }) {
    return this.request('/contact/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    }, false);
  }

  // Newsletter
  async subscribeNewsletter(email: string, name?: string) {
    return this.request('/newsletter/signup', {
      method: 'POST',
      body: JSON.stringify({ email, name })
    }, false);
  }

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
      method: 'POST'
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
    return this.request('/admin/kv-audit', { method: 'GET' }, true);
  }

  async cleanupKVKeys(keys: string[], dryRun = true) {
    return this.request('/admin/kv-audit/cleanup', {
      method: 'POST',
      body: JSON.stringify({ keys, dryRun })
    }, true);
  }

  async pruneAuditTrail(olderThanDays: number, dryRun = true) {
    return this.request('/admin/kv-audit/prune-audit-trail', {
      method: 'POST',
      body: JSON.stringify({ olderThanDays, dryRun })
    }, true);
  }

  async migrateNaming(fromPrefix: string, toPrefix: string, dryRun = true) {
    return this.request('/admin/kv-audit/migrate-naming', {
      method: 'POST',
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
      body: JSON.stringify({ dryRun })
    }, true);
  }

  async purgeKVPrefix(prefix: string, dryRun = true) {
    return this.request('/admin/kv-audit/purge-prefix', {
      method: 'POST',
      body: JSON.stringify({ prefix, dryRun })
    }, true);
  }

  async purgeActivityKeys(dryRun = true) {
    return this.request('/admin/purge-activity-keys', {
      method: 'POST',
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

  // Brevo Communication
  async testBrevoChannel(channel: string, recipient: string) {
    return this.request('/brevo/test', {
      method: 'POST',
      body: JSON.stringify({ channel, recipient })
    }, true);
  }
}

export const apiClient = new ApiClient();