import { Hono } from "npm:hono";
import * as kv from "./kv_dual_write.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { mirrorJournalEntryToTable } from "./journal-mirror.ts";

const supabase = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

export function registerMoodRoutes(app: Hono, middleware: any) {
  // /moods (GET/POST/PUT/DELETE) used to live here, backed by `mood_type:`.
  // Removed 2026-08-06: AdminMoodManager.tsx (the only caller) always got 0
  // records back (mood_type: was never actually populated) and silently fell
  // through to a hardcoded default list baked into this file — a different
  // mood set than the real one. The real, live mood scale is `mood:{id}`,
  // served by `GET/PUT /scales/moods` in scales-routes.ts, which is what
  // MoodJournal.tsx and every check-in flow actually read via
  // emoji-utils.ts's loadCustomScales(). Mood editing now lives as a "Mood"
  // tab in AdminCheckinScalesManager.tsx, pointed at /scales/moods directly.

  // GET /user/journal
  app.get("/user/journal", middleware, async (c) => {
    try {
        const userId = c.get('userId');
        const limit = Number(c.req.query('limit')) || 50;
        const startDate = c.req.query('start_date');
        const endDate = c.req.query('end_date');
        
        // Migration phase 3: read from BOTH stores and merge on id.
        //
        // A straight cutover to the table would lose any entry the mirror
        // failed to write (the mirror is best-effort by design). Merging means
        // an entry surviving in either store is still returned, so reads are
        // correct no matter the mirror's health. The table row wins when both
        // exist, since it is written last.
        const kvEntries: any[] = await kv.getByPrefix(`journal_by_user:${userId}:`);

        let tableEntries: any[] = [];
        try {
          const { data, error } = await supabase()
            .from("user_journal_entries")
            .select("data")
            .eq("user_id", userId);
          if (error) {
            console.log(`journal table read failed, serving KV only: ${error.message}`);
          } else {
            tableEntries = (data ?? []).map((r: any) => r.data).filter(Boolean);
          }
        } catch (err) {
          console.log(`journal table read threw, serving KV only: ${err}`);
        }

        const byId = new Map<string, any>();
        for (const e of kvEntries)    if (e) byId.set(e.id ?? e.journal_entry_id, e);
        for (const e of tableEntries) if (e) byId.set(e.id ?? e.journal_entry_id, e);
        let entries: any[] = [...byId.values()];

        // Self-heal: any entry present only in KV means the mirror missed it.
        // Backfill it now so the two stores converge ahead of the full cutover.
        const tableIds = new Set(tableEntries.map((e: any) => e.id ?? e.journal_entry_id));
        for (const e of kvEntries) {
          const id = e?.id ?? e?.journal_entry_id;
          if (id && !tableIds.has(id)) {
            await mirrorJournalEntryToTable(e, `journal:${id}`);
          }
        }

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