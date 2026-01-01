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

import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;

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
      } else {
        // Fallback to Anon Key for public authenticated endpoints
        headers['Authorization'] = `Bearer ${publicAnonKey}`;
      }
    }

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = path.startsWith('http') ? path : `${API_BASE}${normalizedPath}`;

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
      if (retryCount < 2) {
        // Simple retry logic with linear backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.request(path, options, auth, retryCount + 1);
      }
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

  // CMS
  async getPage(slug: string) {
    return this.request(`/cms/pages/${slug}`, { method: 'GET' }, false);
  }

  async getAdminPage(id: string) {
    const res = await this.request(`/admin/pages/${id}`, { method: 'GET' }, true);
    return res.page;
  }

  async getPages() {
    try {
      const res = await this.request('/admin/pages', { method: 'GET' }, true);
      return res.pages || [];
    } catch (e) {
      console.warn('Failed to fetch pages', e);
      return [];
    }
  }

  async createPage(data: any) {
    const res = await this.request('/admin/pages', { 
      method: 'POST', 
      body: JSON.stringify(data)
    }, true);
    return res.page;
  }

  async updatePage(id: string, data: any) {
    const res = await this.request(`/admin/pages/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data)
    }, true);
    return res.page;
  }

  async deletePage(id: string) {
    return this.request(`/admin/pages/${id}`, { method: 'DELETE' }, true);
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
    return (res.programs || []).map((p: any) => ({
      ...p,
      title: p.title || p.name || 'Untitled Program'
    }));
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
    try {
      const res = await this.request('/admin/categories', { method: 'GET' }, true);
      return res.categories || [];
    } catch (e) {
      console.warn('Failed to fetch categories, returning empty list');
      return [];
    }
  }

  async createCategory(data: any) {
    const res = await this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }, true);
    return res.category;
  }

  async updateCategory(id: string, data: any) {
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
      const res = await this.request('/admin/media/files', { method: 'GET' }, true);
      return res.files || [];
    } catch (e) {
      console.error('Failed to get media files', e);
      // Return empty array to prevent UI crashes, but log error
      return []; 
    }
  }

  async deleteMediaFile(id: string) {
    return this.request(`/admin/media/files/${id}`, { method: 'DELETE' }, true);
  }

  async uploadMediaFile(file: File, bucket: string = 'make-cc205da9-media') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    const token = await this.getToken();
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/admin/media/upload`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    return await response.json();
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

  async createEquipEnrollment(data: { programId: string, onboardingData: any }) {
    // Determine the user's auth status
    const isAuthenticated = await this.isAuthenticated();
    
    // If not authenticated, we might need to store this locally or create a guest enrollment
    // For now, we assume the backend handles guest enrollments or the frontend forces login before this step
    // But based on the error "createEquipEnrollment is not a function", we just need this method to exist.
    
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

  async getAssessment(id: string) {
    const res = await this.request(`/assessments/${id}`, { method: 'GET' }, true);
    return res.assessment;
  }

  async createAssessment(data: any) {
    const res = await this.request('/admin/assessments', { 
      method: 'POST', 
      body: JSON.stringify(data)
    }, true);
    return res.assessment;
  }

  async updateAssessment(id: string, data: any) {
    const res = await this.request(`/admin/assessments/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data)
    }, true);
    return res.assessment;
  }

  async deleteAssessment(id: string) {
    return this.request(`/admin/assessments/${id}`, { method: 'DELETE' }, true);
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

  // Admin Users
  async getUsers() {
    return this.request('/admin/users', { method: 'GET' }, true);
  }

  async getUser(userId: string) {
    return this.request(`/admin/users/${userId}`, { method: 'GET' }, true);
  }

  async createUserAdmin(data: any) {
    return this.request('/admin/users', { 
      method: 'POST',
      body: JSON.stringify(data)
    }, true);
  }

  async updateUserAdmin(userId: string, data: any) {
    const res = await this.request(`/admin/users/${userId}`, { 
      method: 'PUT',
      body: JSON.stringify(data)
    }, true);
    return res.profile;
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, { method: 'DELETE' }, true);
  }

  async addDefaultOnboarding() {
    return this.request(`/admin/equip/add-default-onboarding`, { method: 'POST' }, true);
  }
}

export const apiClient = new ApiClient();