import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

/**
 * Migration shim: mirror a journal entry into the real `user_journal_entries`
 * table alongside the KV write.
 *
 * There are two journal write paths and both must call this:
 *   - mood-routes.ts   POST /user/journal    (id = crypto.randomUUID())
 *   - index.tsx        POST /journal/entries (journal_entry_id = `${userId}-${date}`)
 * The two shapes differ, so resolve the id and timestamps from either.
 *
 * KV is still the source of truth, so a failure here is logged and swallowed —
 * it must never break saving a journal entry. GET /user/journal merges both
 * stores and self-heals anything this missed. When reads finally cut over to
 * the table alone, this has to become a strict, throwing write.
 */
export async function mirrorJournalEntryToTable(entry: any, kvKey: string) {
  try {
    const id = entry?.id ?? entry?.journal_entry_id;
    if (!id || !entry?.user_id) {
      console.log(`journal mirror skipped: missing id/user_id for ${kvKey}`);
      return;
    }

    const num = (v: unknown) =>
      v === null || v === undefined || v === "" ? null : Number(v);

    const { error } = await supabase()
      .from("user_journal_entries")
      .upsert({
        id,
        user_id: entry.user_id,
        entry_date: entry.date ?? entry.entry_date ?? null,
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
        // index.tsx writes `timestamp` rather than created_at/updated_at.
        created_at: entry.created_at ?? entry.timestamp ?? null,
        updated_at: entry.updated_at ?? entry.timestamp ?? null,
        data: entry,
        kv_key: kvKey,
      }, { onConflict: "id" });

    if (error) {
      console.log(`journal mirror failed for ${id}: ${error.message}`);
    }
  } catch (err) {
    console.log(`journal mirror threw for ${kvKey}: ${err}`);
  }
}
