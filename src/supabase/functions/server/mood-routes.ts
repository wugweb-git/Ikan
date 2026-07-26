import { Hono } from "npm:hono";
import * as kv from "./kv_dual_write.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

/**
 * Phase-2 migration shim: mirror a journal entry into the real
 * `user_journal_entries` table alongside the KV write.
 *
 * KV is still the source of truth and reads still come from it, so a failure
 * here must never break saving a journal entry — it is logged and swallowed.
 * Once reads move to the table this becomes the primary write and the error
 * handling has to become strict.
 */
async function mirrorJournalEntryToTable(entry: any, kvKey: string) {
  try {
    const num = (v: unknown) =>
      v === null || v === undefined || v === "" ? null : Number(v);

    const { error } = await supabase()
      .from("user_journal_entries")
      .upsert({
        id: entry.id,
        user_id: entry.user_id,
        entry_date: entry.date ?? null,
        mood: entry.mood ?? null,
        mood_rating: num(entry.mood_rating),
        mood_score: num(entry.mood_score),
        energy: num(entry.energy),
        stress_level: num(entry.stress_level),
        sleep_quality: num(entry.sleep_quality),
        pain_level: num(entry.pain_level),
        content: entry.content ?? entry.freehand_text_content ?? null,
        emotions: entry.emotions ?? null,
        context_tags: entry.context_tags ?? null,
        created_at: entry.created_at ?? null,
        updated_at: entry.updated_at ?? null,
        data: entry,
        kv_key: kvKey,
      }, { onConflict: "id" });

    if (error) {
      console.log(`journal mirror failed for ${entry.id}: ${error.message}`);
    }
  } catch (err) {
    console.log(`journal mirror threw for ${entry?.id}: ${err}`);
  }
}

export function registerMoodRoutes(app: Hono, middleware: any) {
  // GET /moods - returns KV-stored moods or defaults
  app.get("/moods", middleware, async (c) => {
    try {
      const storedMoods = await kv.getByPrefix('mood_type:');
      if (storedMoods && storedMoods.length > 0) {
        return c.json({ moods: storedMoods });
      }
    } catch (_e) {
      // Fall through to defaults
    }
    // Return default moods
    const moods = [
        { id: '1', value: 1, label: 'Angry', emoji: '😡', color: '#F97316', order: 1, is_active: true },
        { id: '2', value: 2, label: 'Upset', emoji: '😢', color: '#3B82F6', order: 2, is_active: true },
        { id: '3', value: 3, label: 'Sad', emoji: '😔', color: '#6B7280', order: 3, is_active: true },
        { id: '4', value: 4, label: 'Good', emoji: '😊', color: '#EAB308', order: 4, is_active: true },
        { id: '5', value: 5, label: 'Great', emoji: '😄', color: '#22C55E', order: 5, is_active: true }
    ];
    return c.json({ moods });
  });

  // POST /moods - create a new mood type
  app.post("/moods", middleware, async (c) => {
    try {
      const body = await c.req.json();
      const id = crypto.randomUUID();
      const mood = {
        ...body,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await kv.set(`mood_type:${id}`, mood);
      return c.json({ mood });
    } catch (error) {
      console.error("Error creating mood type:", error);
      return c.json({ error: "Failed to create mood type" }, 500);
    }
  });

  // PUT /moods/:id - update a mood type
  app.put("/moods/:id", middleware, async (c) => {
    try {
      const id = c.req.param("id");
      const updates = await c.req.json();
      const existing = await kv.get(`mood_type:${id}`);
      const mood = {
        ...(existing || {}),
        ...updates,
        id,
        updated_at: new Date().toISOString()
      };
      await kv.set(`mood_type:${id}`, mood);
      return c.json({ mood });
    } catch (error) {
      console.error("Error updating mood type:", error);
      return c.json({ error: "Failed to update mood type" }, 500);
    }
  });

  // DELETE /moods/:id - delete a mood type
  app.delete("/moods/:id", middleware, async (c) => {
    try {
      const id = c.req.param("id");
      await kv.del(`mood_type:${id}`);
      return c.json({ success: true });
    } catch (error) {
      console.error("Error deleting mood type:", error);
      return c.json({ error: "Failed to delete mood type" }, 500);
    }
  });

  // GET /user/journal
  app.get("/user/journal", middleware, async (c) => {
    try {
        const userId = c.get('userId');
        const limit = Number(c.req.query('limit')) || 50;
        const startDate = c.req.query('start_date');
        const endDate = c.req.query('end_date');
        
        // Fetch entries
        let entries = await kv.getByPrefix(`journal_by_user:${userId}:`);
        
        // Filter by date range if provided
        if (startDate || endDate) {
          entries = entries.filter((entry: any) => {
            const entryDate = entry.date; // stored as YYYY-MM-DD
            if (startDate && entryDate < startDate) return false;
            if (endDate && entryDate > endDate) return false;
            return true;
          });
        }
        
        // Sort by created_at descending (newest first), falling back to date
        const sorted = entries.sort((a: any, b: any) => {
            const timeA = new Date(a.created_at || a.date).getTime();
            const timeB = new Date(b.created_at || b.date).getTime();
            return timeB - timeA;
        });
        
        return c.json({ entries: sorted.slice(0, limit) });
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        return c.json({ error: "Failed to fetch journal entries" }, 500);
    }
  });

  // POST /user/journal
  app.post("/user/journal", middleware, async (c) => {
    try {
        const userId = c.get('userId');
        const body = await c.req.json();
        const { date, mood_rating, freehand_text_content, emotions, energy, stress_level, context_tags,
                sleep_quality, pain_level, pain_impact, extra_responses, ...otherFields } = body;
        
        if (!date) {
            return c.json({ error: 'Date is required' }, 400);
        }

        const id = crypto.randomUUID();
        const entry = {
            id,
            journal_entry_id: id, // For compatibility
            user_id: userId,
            date,
            mood_rating: mood_rating ?? null,
            freehand_text_content: freehand_text_content || null,
            emotions: emotions || [],
            energy: energy || null,
            stress_level: stress_level || null,
            context_tags: context_tags || [],
            sleep_quality: sleep_quality ?? null,
            pain_level: pain_level ?? null,
            pain_impact: pain_impact ?? null,
            extra_responses: extra_responses || otherFields || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Store by ID for direct access
        await kv.set(`journal:${id}`, entry);
        
        // Store by User+Date+ID to allow multiple entries per day
        // Previously used `journal_by_user:${userId}:${date}` which overwrote on same date
        await kv.set(`journal_by_user:${userId}:${date}:${id}`, entry);

        // Migration phase 2: also mirror into user_journal_entries. Best-effort —
        // KV above remains the source of truth for reads.
        await mirrorJournalEntryToTable(entry, `journal:${id}`);

        return c.json({ entry });
    } catch (error) {
        console.error("Error creating journal entry:", error);
        return c.json({ error: "Failed to create journal entry" }, 500);
    }
  });
}