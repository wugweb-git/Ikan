import * as kv from './kv_dual_write.ts';
import { EquipService, EquipDayService, EquipBlockService } from './program-service.ts';
import { ContentService } from './content-service.ts';

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------

export interface UserEnrollment {
  user_id: string;
  equip_id: string;
  status: 'active' | 'completed' | 'paused' | 'withdrawn';
  current_day_number: number;
  started_at: string;
  last_activity_at: string;
  withdrawn_at?: string;
}

export interface UserDayProgress {
  user_id: string;
  equip_id: string;
  day_number: number;
  completed: boolean;
  completed_at?: string;
  block_responses: Record<string, any>; // blockId -> response data
}

// ------------------------------------------------------------------
// PROGRESS SERVICE
// ------------------------------------------------------------------

export const ProgressService = {
  
  // ENROLLMENT
  async enrollUser(userId: string, equipId: string): Promise<UserEnrollment> {
    const key = `enrollment:${userId}:${equipId}`;
    const existing = await kv.get(key);
    if (existing) {
      // If previously withdrawn, re-activate the enrollment (preserving progress)
      if (existing.status === 'withdrawn') {
        existing.status = 'active';
        delete existing.withdrawn_at;
        existing.last_activity_at = new Date().toISOString();
        await kv.set(key, existing);
      }
      return existing;
    }

    const enrollment: UserEnrollment = {
      user_id: userId,
      equip_id: equipId,
      status: 'active',
      current_day_number: 1, // Start at Day 1
      started_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    };

    await kv.set(key, enrollment);
    
    // Add to user's enrollment list index if needed, or just scan prefix
    // Prefix scan `enrollment:{userId}:` works.
    
    return enrollment;
  },

  async getUserEnrollments(userId: string): Promise<UserEnrollment[]> {
    const all = await kv.getByPrefix(`enrollment:${userId}:`);
    // Filter out withdrawn enrollments so they don't show on the user's dashboard
    return (all || []).filter((e: any) => e.status !== 'withdrawn');
  },

  async getEnrollment(userId: string, equipId: string): Promise<UserEnrollment | null> {
    return await kv.get(`enrollment:${userId}:${equipId}`);
  },

  // UNENROLL — Soft-delete by setting status to 'withdrawn'
  // Preserves progress data so user can re-enroll later if desired
  async unenrollUser(userId: string, equipId: string): Promise<void> {
    const key = `enrollment:${userId}:${equipId}`;
    const existing = await kv.get(key);
    if (!existing) return;

    await kv.set(key, {
      ...existing,
      status: 'withdrawn',
      withdrawn_at: new Date().toISOString(),
    });
  },

  // DAY PROGRESS
  async getDayProgress(userId: string, equipId: string, dayNumber: number): Promise<UserDayProgress> {
    const key = `progress:${userId}:${equipId}:${dayNumber}`;
    const progress = await kv.get(key);
    
    if (progress) return progress;
    
    // Return empty default
    return {
      user_id: userId,
      equip_id: equipId,
      day_number: dayNumber,
      completed: false,
      block_responses: {}
    };
  },

  async saveBlockResponse(userId: string, equipId: string, dayNumber: number, blockId: string, response: any): Promise<void> {
    const key = `progress:${userId}:${equipId}:${dayNumber}`;
    let progress = await kv.get(key);

    if (!progress) {
      progress = {
        user_id: userId,
        equip_id: equipId,
        day_number: dayNumber,
        completed: false,
        block_responses: {}
      };
    }

    progress.block_responses[blockId] = response;
    progress.last_updated = new Date().toISOString();
    
    await kv.set(key, progress);
    
    // Update enrollment last activity
    const enrollment = await this.getEnrollment(userId, equipId);
    if (enrollment) {
      enrollment.last_activity_at = new Date().toISOString();
      await kv.set(`enrollment:${userId}:${equipId}`, enrollment);
    }
  },

  async completeDay(userId: string, equipId: string, dayNumber: number): Promise<void> {
    const key = `progress:${userId}:${equipId}:${dayNumber}`;
    let progress = await kv.get(key) || {
       user_id: userId,
       equip_id: equipId,
       day_number: dayNumber,
       block_responses: {}
    };

    progress.completed = true;
    progress.completed_at = new Date().toISOString();
    await kv.set(key, progress);

    // Advance Enrollment
    const enrollment = await this.getEnrollment(userId, equipId);
    if (enrollment) {
      // Only advance if this was the current day
      if (enrollment.current_day_number === dayNumber) {
        // Check if there is a next day
        // We need total days. We can check if day (N+1) exists in Equip schema?
        // Or just blindly increment. The UI handles "End of Program".
        // Let's verify max days to be safe.
        const equip = await EquipService.getEquip(equipId);
        if (equip && dayNumber < equip.duration_days) {
             enrollment.current_day_number = dayNumber + 1;
        } else {
             enrollment.status = 'completed';
        }
        enrollment.last_activity_at = new Date().toISOString();
        await kv.set(`enrollment:${userId}:${equipId}`, enrollment);
      }
    }
  },

  // FULL PROGRESS
  async getFullProgress(userId: string, equipId: string): Promise<any> {
    const enrollment = await this.getEnrollment(userId, equipId);
    if (!enrollment) return null;

    // Get all daily progress
    // We can scan progress:{userId}:{equipId}:*
    // Ideally we should have an index or just scan. 
    // Given the KV store limitations, scanning by prefix is best if keys are ordered.
    // Keys: progress:{userId}:{equipId}:{dayNum}
    const days = await kv.getByPrefix(`progress:${userId}:${equipId}:`);
    
    return {
      enrollment,
      days: days || []
    };
  },

  async syncProgress(userId: string, equipId: string, data: any): Promise<void> {
    // data: { currentDay, completedBlockIds, responses }
    // We update the current day's progress
    const dayNum = data.currentDay;
    if (!dayNum) return;

    const key = `progress:${userId}:${equipId}:${dayNum}`;
    let progress = await kv.get(key) || {
       user_id: userId,
       equip_id: equipId,
       day_number: dayNum,
       completed: false,
       block_responses: {}
    };

    // Merge responses
    if (data.responses) {
        progress.block_responses = { ...progress.block_responses, ...data.responses };
    }
    
    // We don't strictly track "completedBlockIds" in backend model if we have responses,
    // but for non-response blocks (like reading a lesson), we might need to.
    // Let's add it to the model.
    if (data.completedBlockIds) {
        progress.completed_blocks = data.completedBlockIds;
    }

    progress.last_updated = new Date().toISOString();
    await kv.set(key, progress);
  },

  // TODAY VIEW HELPER
  // Returns the content for the user's current day
  async getTodayContent(userId: string, equipId: string): Promise<any> {
    const enrollment = await this.getEnrollment(userId, equipId);
    if (!enrollment) return null;

    const dayNum = enrollment.current_day_number;
    
    // Fetch Day Schema
    // We need to find the day ID for this number.
    const days = await EquipDayService.listDaysForEquip(equipId);
    const day = days.find(d => d.day_number === dayNum);
    
    if (!day) return null; // Should not happen unless schema changed

    // Fetch Blocks
    const rawBlocks = await EquipBlockService.listBlocksForDay(day.id);
    
    // Hydrate Content
    const blocks = await Promise.all(rawBlocks.map(async (b: any) => {
        if (b.content_ref_id) {
            const content = await ContentService.getContentBySlug(b.content_ref_id) 
                         || await kv.get(`content:${b.content_ref_id}`);
            return { ...b, content };
        }
        return b;
    }));
    
    return {
      enrollment,
      day,
      blocks
    };
  }
};