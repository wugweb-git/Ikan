import { supabase } from './supabase-client';

export interface User {
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  corporate_user: boolean;
  avatar_url?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  preferences?: any;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  [key: string]: any;
}

import { projectId } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server/make-server-cc205da9`;

class ApiClient {
  private token: string | null = null;

  async getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  async request(path: string, options: any = {}, auth = true, retryCount = 0): Promise<any> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (auth) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

    try {
      const response = await fetch(url, {
        ...options,
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
    } catch (error) {
      console.error('API Request failed', error);
      throw error;
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
    // No-op for now as backend endpoint is not yet available
    console.log(`[Activity] ${action}`, metadata);
    return Promise.resolve({ success: true });
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

  async updateProfile(data: any) {
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

  // Equip Programs
  async getEquipPrograms() {
    const res = await this.request('/equip/programs', { method: 'GET' }, true);
    return res.programs || [];
  }

  async getEquipProgram(id: string) {
    const res = await this.request(`/equip/programs/${id}`, { method: 'GET' }, true);
    const raw = res.program;
    
    if (!raw) return null;

    // Transform backend format to frontend format
    return {
        ...raw,
        title: raw.title || raw.name, // Map name to title
        daily_content: (raw.days || []).map((day: any) => ({
            day: day.day_number,
            title: day.title,
            description: day.description || '',
            image_url: day.image_url,
            activities: (day.blocks || []).map((block: any) => ({
                id: block.id,
                title: block.title || 'Untitled Block',
                type: block.block_type,
                content: block.content || '',
                duration: block.estimated_time_minutes || 5,
                required: block.is_required,
                exerciseConfig: block.exercise_config || block.exerciseConfig
            }))
        }))
    };
  }

  async createEquipProgram(data: any) {
    const res = await this.request('/equip/programs', { 
      method: 'POST',
      body: JSON.stringify(data)
    }, true);
    return res.program;
  }

  async updateEquipProgram(id: string, data: any) {
    const res = await this.request(`/equip/programs/${id}`, { 
      method: 'PUT',
      body: JSON.stringify(data)
    }, true);
    return res.program;
  }
  
  async saveEquipProgram(program: any) {
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
      return res.enrollments || [];
    } catch (e) {
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

  async getTodayContent(equipId: string) {
    return this.request(`/user/equip/${equipId}/today`, { method: 'GET' }, true);
  }

  async saveBlockResponse(equipId: string, dayNum: number, blockId: string, response: any) {
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

  async syncEquipProgress(equipId: string, data: any) {
    // Syncs partial progress (blocks, responses)
    return this.request(`/user/equip/${equipId}/sync`, { 
      method: 'POST',
      body: JSON.stringify(data)
    }, true);
  }

  async updateEnrollmentProgress(equipId: string, data: any) {
    // If completed day, call completeDay
    if (data.completed && data.dayNumber) {
        return this.completeDay(equipId, data.dayNumber);
    }
    // Otherwise treat as sync
    return this.syncEquipProgress(equipId, data);
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
        return res.resources || [];
      } catch (e) {
        // Fallback to library resources
      }
    }
    const res = await this.request('/library/resources', { method: 'GET' }, true);
    return res.resources || [];
  }

  async getResource(id: string) {
    const res = await this.request(`/library/resources/${id}`, { method: 'GET' }, true);
    return res.resource;
  }

  async createResource(data: any) {
    const res = await this.request('/admin/resources', { 
      method: 'POST', 
      body: JSON.stringify(data)
    }, true);
    return res.resource;
  }

  async updateResource(id: string, data: any) {
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
    // Return empty array for now to trigger fallback to constants in UI
    // Or we could implement an endpoint for dynamic categories
    return { categories: [] };
  }


  // Legacy shims
  async purchaseEquipProgram(equipId: string, onboarding_data: any, payment_method: string) {
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

  // Assessments
  async saveAssessmentResponse(
    assessmentId: string, 
    responses: any, 
    status: string, 
    score: number, 
    interpretation: any, 
    severityHint?: string
  ) {
    return this.request('/user/assessments', { 
      method: 'POST',
      body: JSON.stringify({
        assessmentId,
        responses,
        status,
        score,
        interpretation,
        severityHint
      })
    }, true);
  }

  async getAssessments() {
     const res = await this.request('/assessments', { method: 'GET' }, true);
     return res.assessments || [];
  }

  // Mood Journal
  async listMoods() {
    try {
      const res = await this.request('/moods', { method: 'GET' }, true);
      return res.moods || [];
    } catch (e) {
      return [];
    }
  }

  async getJournalEntries(startDate?: string, endDate?: string, limit: number = 50) {
    let query = `?limit=${limit}`;
    if (startDate) query += `&start_date=${startDate}`;
    if (endDate) query += `&end_date=${endDate}`;
    
    try {
      return await this.request(`/user/journal${query}`, { method: 'GET' }, true);
    } catch (e) {
      return { entries: [] };
    }
  }

  async createJournalEntry(date: string, mood: number, note: string, emotions: string[], energy: number) {
    return this.request('/user/journal', { 
      method: 'POST',
      body: JSON.stringify({
        date,
        mood_rating: mood,
        freehand_text_content: note,
        emotions,
        energy
      })
    }, true);
  }
}

export const apiClient = new ApiClient();
