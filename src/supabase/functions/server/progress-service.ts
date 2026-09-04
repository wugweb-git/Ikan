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
    // Look for an existing enrollment in EITHER shape. The old check only
    // looked under `enrollment:{userId}:{equipId}`, so a user who already had
    // an enrollment from POST /equip/purchase (shape A) was not found here and
    // got a second, duplicate record.
    const found = await this.findEnrollmentAnyStatus(userId, equipId);
    if (found) {
      const existing = found.record;
      // If previously withdrawn, re-activate (preserving progress)
      if (existing.status === 'withdrawn') {
        const reactivated = { ...existing, status: 'active', last_activity_at: new Date().toISOString() };
        delete reactivated.withdrawn_at;
        await kv.set(found.key, reactivated);
        return reactivated as UserEnrollment;
      }
      return existing as UserEnrollment;
    }

    const key = `enrollment:${userId}:${equipId}`;
    const enrollment: UserEnrollment = {
      user_id: userId,
      equip_id: equipId,
      status: 'active',
      current_day_number: 1, // Start at Day 1
      started_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    };

    await kv.set(key, enrollment);
    return enrollment;
  },

  async getUserEnrollments(userId: string): Promise<UserEnrollment[]> {
    // Two enrollment shapes exist, both created on 2025-12-30:
    //   A. index.tsx POST /equip/purchase writes `enrollment:{enrollmentId}`
    //      as { enrollmentId, userId, programId, currentDay, status }.
    //   B. this service writes `enrollment:{userId}:{equipId}`
    //      as { user_id, equip_id, current_day_number }.
    // Only shape A has ever been written (52 records vs 0), so the previous
    // `enrollment:${userId}:` prefix scan matched nothing and this returned []
    // for every user — which is why the dashboard's "continue your program"
    // card never appeared and it always offered to start a new one.
    //
    // Scan the whole prefix and match on either field, then normalise to the
    // shape callers expect (equip_id / current_day_number).
    const all = await kv.getByPrefix('enrollment:');

    const mine = (all || []).filter((e: any) =>
      e && (e.userId === userId || e.user_id === userId) && e.status !== 'withdrawn'
    );

    const normalised = mine.map((e: any) => ({
      ...e,
      user_id: e.user_id ?? e.userId,
      equip_id: e.equip_id ?? e.programId,
      current_day_number: e.current_day_number ?? e.currentDay ?? 1,
    }));

    // The same user+program can hold several enrollment records (52 records
    // across only 10 distinct user+program pairs), which would render the same
    // programme repeatedly. Keep the most recently touched one per programme.
    const latest = new Map<string, any>();
    for (const e of normalised) {
      if (!e.equip_id) continue;
      const prev = latest.get(e.equip_id);
      const stamp = (x: any) => x?.updated_at ?? x?.created_at ?? x?.startDate ?? '';
      if (!prev || stamp(e) >= stamp(prev)) latest.set(e.equip_id, e);
    }

    return [...latest.values()];
  },

  /**
   * Locate the real enrollment record for a user+programme, together with the
   * key it must be written back to.
   *
   * See getUserEnrollments for why two shapes exist. getByPrefix returns values
   * only, not keys, so the key is reconstructed: shape A records carry
   * enrollmentId, shape B records are addressed by user+programme.
   */
  async findEnrollmentAnyStatus(
    userId: string,
    equipId: string,
  ): Promise<{ key: string; record: any } | null> {
    const all = await kv.getByPrefix('enrollment:');

    const matches = (all || []).filter((e: any) =>
      e &&
      (e.userId === userId || e.user_id === userId) &&
      (e.programId === equipId || e.equip_id === equipId)
    );
    if (matches.length === 0) return null;

    // A user can accumulate several enrollment records for the same
    // programme (re-enrollment, double-submits, the old vs. new key-shape
    // migration). Taking the first array match here — rather than the most
    // recently touched one, as getUserEnrollments already does for display —
    // meant completeDay's advancement could silently write to a stale
    // duplicate: current_day_number/completedDays on the record the user
    // actually sees would never move even though the underlying progress:
    // records were correct. Prefer active status, then most recent activity.
    const stamp = (e: any) => e.last_activity_at ?? e.updated_at ?? e.created_at ?? e.startDate ?? '';
    const record = matches.reduce((best: any, e: any) => {
      if (!best) return e;
      const bestActive = best.status !== 'withdrawn';
      const eActive = e.status !== 'withdrawn';
      if (eActive !== bestActive) return eActive ? e : best;
      return stamp(e) > stamp(best) ? e : best;
    }, null);

    return {
      key: record.enrollmentId
        ? `enrollment:${record.enrollmentId}`
        : `enrollment:${userId}:${equipId}`,
      record,
    };
  },

  /** As findEnrollmentAnyStatus, but ignores withdrawn enrollments. */
  async findEnrollment(
    userId: string,
    equipId: string,
  ): Promise<{ key: string; record: any } | null> {
    const found = await this.findEnrollmentAnyStatus(userId, equipId);
    return found && found.record.status !== 'withdrawn' ? found : null;
  },

  async getEnrollment(userId: string, equipId: string): Promise<UserEnrollment | null> {
    const found = await this.findEnrollment(userId, equipId);
    if (!found) return null;

    const e = found.record;
    // Normalise so callers can rely on equip_id / current_day_number
    // regardless of which shape the record was written in.
    return {
      ...e,
      user_id: e.user_id ?? e.userId,
      equip_id: e.equip_id ?? e.programId,
      current_day_number: e.current_day_number ?? e.currentDay ?? 1,
    } as UserEnrollment;
  },

  // UNENROLL — Soft-delete by setting status to 'withdrawn'
  // Preserves progress data so user can re-enroll later if desired
  async unenrollUser(userId: string, equipId: string): Promise<void> {
    // Same shape mismatch as getUserEnrollments: the real records live under
    // `enrollment:{enrollmentId}`, so the old `enrollment:{userId}:{equipId}`
    // lookup never found anything and unenrolling silently did nothing.
    // Locate every matching record and withdraw each under its own key —
    // a user+programme pair can legitimately have more than one.
    const all = await kv.getByPrefix('enrollment:');
    const now = new Date().toISOString();
    let found = false;

    for (const e of all || []) {
      if (!e) continue;
      const owner = e.userId ?? e.user_id;
      const prog  = e.equip_id ?? e.programId;
      if (owner !== userId || prog !== equipId) continue;

      // Write back to the key this record actually came from.
      const key = e.enrollmentId
        ? `enrollment:${e.enrollmentId}`
        : `enrollment:${userId}:${equipId}`;

      await kv.set(key, { ...e, status: 'withdrawn', withdrawn_at: now });
      found = true;
    }

    if (!found) {
      console.log(`unenrollUser: no enrollment found for ${userId} / ${equipId}`);
    }
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
    
    // Update enrollment last activity. Write back to the key the record
    // actually lives under — the old hardcoded `enrollment:{userId}:{equipId}`
    // never matched a real record, so this silently did nothing.
    const found = await this.findEnrollment(userId, equipId);
    if (found) {
      await kv.set(found.key, {
        ...found.record,
        last_activity_at: new Date().toISOString(),
      });
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

    // Advance Enrollment.
    // Previously read and wrote `enrollment:{userId}:{equipId}`, which never
    // matched a real record, so no enrollment ever advanced past day 1.
    const found = await this.findEnrollment(userId, equipId);
    if (!found) return;

    const rec = found.record;
    const currentDay = rec.current_day_number ?? rec.currentDay ?? 1;

    // Only advance if this was the current day
    if (Number(currentDay) !== Number(dayNumber)) return;

    const updated: any = { ...rec, last_activity_at: new Date().toISOString() };

    const equip = await EquipService.getEquip(equipId);
    if (equip) {
      // Determine total days: prefer blob daily_content length, then duration_days
      let totalDays = equip.duration_days || 0;
      if (Array.isArray(equip.daily_content) && equip.daily_content.length > 0) {
        // Count only regular days (exclude Day 0 onboarding)
        totalDays = equip.daily_content.filter((d: any) => (d.day ?? d.day_number) !== 0).length;
      }
      if (totalDays > 0 && dayNumber >= totalDays) {
        updated.status = 'completed';
        updated.completed_at = new Date().toISOString();
      } else {
        // Keep both field names in step: shape A records are read as
        // `currentDay` elsewhere (index.tsx, admin), shape B as
        // `current_day_number`. Writing only one would desync the record.
        updated.current_day_number = dayNumber + 1;
        updated.currentDay = dayNumber + 1;
      }
    }

    await kv.set(found.key, updated);
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
    // data: { currentDay/dayNumber, completedBlockIds, responses }
    // We update the current day's progress
    const dayNum = data.dayNumber || data.currentDay;
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
    
    // ── CRITICAL: Prefer blob daily_content over separate entities ──
    // The wizard PUT route stores content in equip:{id}.daily_content blob
    // but does NOT create/update separate day:/block: entities.
    // We must check the blob first.
    const equip = await EquipService.getEquip(equipId);
    if (!equip) return null;

    if (Array.isArray(equip.daily_content) && equip.daily_content.length > 0) {
      // Blob format — match by day number
      const day = equip.daily_content.find((d: any) => (d.day ?? d.day_number) === dayNum);
      if (!day) return null;

      // Map activities/blocks to a consistent shape
      const blocks = (day.activities || day.blocks || []).map((b: any) => ({
        id: b.id,
        title: b.title || 'Untitled Block',
        type: b.type || b.block_type || 'lesson',
        content: b.content || '',
        duration: b.duration || b.estimated_time_minutes || 5,
        required: b.required !== undefined ? b.required : true,
        // Both names during the rename — this reads raw KV and so does not go
        // through `normaliseBlock`. See `configOf` in lib/blocks/block-model.ts.
        activityConfig: b.activityConfig || b.exerciseConfig || b.exercise_config || {},
        exerciseConfig: b.activityConfig || b.exerciseConfig || b.exercise_config || {},
        stepGroup: b.stepGroup || b.step_group_id,
        autoAdvance: b.autoAdvance || b.auto_advance || false,
        image_url: b.image_url,
        order: b.order,
        interaction: b.interaction,
        subtitle: b.subtitle,
      }));

      return {
        enrollment,
        day: {
          day_number: day.day ?? day.day_number,
          title: day.title || `Day ${dayNum}`,
          description: day.description || '',
          dayType: day.dayType || day.day_type || 'learning',
          subtitle: day.subtitle || '',
        },
        blocks,
      };
    }

    // Fallback: separate entity system (legacy programs created via POST route)
    const days = await EquipDayService.listDaysForEquip(equipId);
    const day = days.find(d => d.day_number === dayNum);
    
    if (!day) return null;

    const rawBlocks = await EquipBlockService.listBlocksForDay(day.id);
    
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