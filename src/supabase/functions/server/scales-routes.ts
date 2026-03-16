import * as kv from "./kv_dual_write.ts";

// ── KV Keys ─────────────────────────────────────────────────────────
const KV_KEY_ENERGY = "checkin_scale:energy";
const KV_KEY_STRESS = "checkin_scale:stress";
const KV_KEY_TAGS   = "checkin_scale:context_tags";
const KV_KEY_SLEEP  = "checkin_scale:sleep";
const KV_KEY_PAIN   = "checkin_scale:pain";
// Moods use individual KV keys "mood:{id}" (same as AdminMoodManager)
// No separate KV_KEY_MOODS — we read from mood:* prefix for consistency.

// ═══════════════════════════════════════════════════════════════════
// DEFAULT SCALE DATA — Written to KV on first GET if KV is empty.
// Once in KV, admin can edit/delete freely. KV remains sole source of truth.
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_ENERGY = [
  { id: "exhausted", label: "Exhausted", emoji: "\u{1FAAB}", char: "\u{1FAAB}", value: 1, order: 1, severity: "danger",  is_active: true },
  { id: "tired",     label: "Tired",     emoji: "\u{1F634}", char: "\u{1F634}", value: 2, order: 2, severity: "warning", is_active: true },
  { id: "moderate",  label: "Moderate",  emoji: "\u26A1",     char: "\u26A1",     value: 3, order: 3, severity: "neutral", is_active: true },
  { id: "energetic", label: "Energetic", emoji: "\u{1F4AA}", char: "\u{1F4AA}", value: 4, order: 4, severity: "success", is_active: true },
  { id: "charged",   label: "Charged!",  emoji: "\u{1F525}", char: "\u{1F525}", value: 5, order: 5, severity: "success", is_active: true },
];

const DEFAULT_STRESS = [
  { id: "chill",   label: "Chill",   emoji: "\u{1F60C}", char: "\u{1F60C}", value: 1, order: 1, severity: "success", is_active: true },
  { id: "mild",    label: "Mild",    emoji: "\u{1F914}", char: "\u{1F914}", value: 2, order: 2, severity: "info",    is_active: true },
  { id: "medium",  label: "Medium",  emoji: "\u{1F624}", char: "\u{1F624}", value: 3, order: 3, severity: "warning", is_active: true },
  { id: "high",    label: "High",    emoji: "\u{1F630}", char: "\u{1F630}", value: 4, order: 4, severity: "warning", is_active: true },
  { id: "extreme", label: "Yikes!",  emoji: "\u{1F92F}", char: "\u{1F92F}", value: 5, order: 5, severity: "danger",  is_active: true },
];

const DEFAULT_CONTEXT_TAGS = [
  { id: "work",          label: "Work",          emoji: "\u{1F4BC}", char: "\u{1F4BC}", order: 1, is_active: true },
  { id: "sleep",         label: "Sleep",         emoji: "\u{1F634}", char: "\u{1F634}", order: 2, is_active: true },
  { id: "health",        label: "Health",        emoji: "\u{1F3C3}", char: "\u{1F3C3}", order: 3, is_active: true },
  { id: "relationships", label: "Relationships", emoji: "\u2764\uFE0F",  char: "\u2764\uFE0F",  order: 4, is_active: true },
  { id: "studies",       label: "Studies",       emoji: "\u{1F4DA}", char: "\u{1F4DA}", order: 5, is_active: true },
  { id: "finances",      label: "Finances",      emoji: "\u{1F4B0}", char: "\u{1F4B0}", order: 6, is_active: true },
  { id: "fun",           label: "Fun",           emoji: "\u{1F389}", char: "\u{1F389}", order: 7, is_active: true },
  { id: "other",         label: "Other",         emoji: "\u2728",     char: "\u2728",     order: 8, is_active: true },
];

const DEFAULT_SLEEP = [
  { id: "terrible",  label: "Terrible",  emoji: "\u{1F629}", char: "\u{1F629}", value: 1, order: 1, severity: "danger",  is_active: true },
  { id: "poor",      label: "Poor",      emoji: "\u{1F634}", char: "\u{1F634}", value: 2, order: 2, severity: "warning", is_active: true },
  { id: "fair",      label: "Fair",      emoji: "\u{1F636}\u200D\u{1F32B}\uFE0F", char: "\u{1F636}\u200D\u{1F32B}\uFE0F", value: 3, order: 3, severity: "neutral", is_active: true },
  { id: "good",      label: "Good",      emoji: "\u{1F60C}", char: "\u{1F60C}", value: 4, order: 4, severity: "success", is_active: true },
  { id: "excellent", label: "Excellent", emoji: "\u{1F31F}", char: "\u{1F31F}", value: 5, order: 5, severity: "success", is_active: true },
];

const DEFAULT_PAIN = [
  { id: "none",     label: "None",     emoji: "\u{1F60A}", char: "\u{1F60A}", value: 1, order: 1, severity: "success", is_active: true },
  { id: "mild",     label: "Mild",     emoji: "\u{1F610}", char: "\u{1F610}", value: 2, order: 2, severity: "info",    is_active: true },
  { id: "moderate", label: "Moderate", emoji: "\u{1F615}", char: "\u{1F615}", value: 3, order: 3, severity: "warning", is_active: true },
  { id: "severe",   label: "Severe",   emoji: "\u{1F627}", char: "\u{1F627}", value: 4, order: 4, severity: "danger",  is_active: true },
  { id: "extreme",  label: "Extreme",  emoji: "\u{1F62D}", char: "\u{1F62D}", value: 5, order: 5, severity: "danger",  is_active: true },
];

const DEFAULT_MOODS = [
  { id: "awful", label: "Awful", emoji: "\u{1F62B}", char: "\u{1F62B}", twemoji: "1f62b.svg", value: 1, order: 1, color: "var(--color-status-danger)",  is_active: true },
  { id: "bad",   label: "Bad",   emoji: "\u{1F615}", char: "\u{1F615}", twemoji: "1f615.svg", value: 2, order: 2, color: "var(--color-status-warning)", is_active: true },
  { id: "meh",   label: "Meh",   emoji: "\u{1F610}", char: "\u{1F610}", twemoji: "1f610.svg", value: 3, order: 3, color: "var(--color-neutral-500)",    is_active: true },
  { id: "good",  label: "Good",  emoji: "\u{1F642}", char: "\u{1F642}", twemoji: "1f642.svg", value: 4, order: 4, color: "var(--color-status-success)", is_active: true },
  { id: "great", label: "Great", emoji: "\u{1F604}", char: "\u{1F604}", twemoji: "1f604.svg", value: 5, order: 5, color: "var(--color-status-success)", is_active: true },
];

// ── Helper: idempotent lazy-init for array-based scales ──────────
// On GET, if KV is empty, seed defaults and return them.
// Once admin edits/saves, KV has their data and defaults are never used again.
async function getOrInit(key: string, defaults: any[]): Promise<any[]> {
  const saved = await kv.get(key);
  if (saved && Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  // KV empty — seed defaults
  await kv.set(key, defaults);
  console.log(`Lazy-initialized default data for KV key "${key}" (${defaults.length} items)`);
  return defaults;
}

// ── Helper: lazy-init moods using individual mood:{id} KV keys ───
// Reads from kv.getByPrefix("mood:") — same keys AdminMoodManager uses.
// If empty, seeds individual mood:{id} entries so AdminMoodManager can edit them.
async function getOrInitMoods(): Promise<any[]> {
  const existing = await kv.getByPrefix("mood:");
  const validMoods = (existing || []).filter((m: any) => m && m.id);
  if (validMoods.length > 0) {
    return validMoods;
  }
  // Seed individual mood:{id} keys
  for (const mood of DEFAULT_MOODS) {
    const now = new Date().toISOString();
    await kv.set(`mood:${mood.id}`, { ...mood, created_at: now, updated_at: now });
  }
  console.log(`Lazy-initialized default mood types (${DEFAULT_MOODS.length} items as mood:* KV entries)`);
  return DEFAULT_MOODS;
}

export function registerScalesRoutes(app: any, middleware: any) {

  // ── GET routes are PUBLIC (no auth required) ──────────────────────

  // ── GET /scales/energy ────────────────────────────────────────
  app.get("/scales/energy", async (c: any) => {
    try {
      const items = await getOrInit(KV_KEY_ENERGY, DEFAULT_ENERGY);
      return c.json({ items });
    } catch (e) {
      console.log("Error loading energy scale:", e);
      return c.json({ items: [], error: "Failed to load energy scale" }, 500);
    }
  });

  // ── PUT /scales/energy ────────────────────────────────────────
  app.put("/scales/energy", middleware, async (c: any) => {
    try {
      const { items } = await c.req.json();
      if (!Array.isArray(items) || items.length === 0) {
        return c.json({ error: "Items array is required" }, 400);
      }
      await kv.set(KV_KEY_ENERGY, items);
      return c.json({ success: true, items });
    } catch (e) {
      console.log("Error saving energy scale:", e);
      return c.json({ error: "Failed to save energy scale" }, 500);
    }
  });

  // ── GET /scales/stress ────────────────────────────────────────
  app.get("/scales/stress", async (c: any) => {
    try {
      const items = await getOrInit(KV_KEY_STRESS, DEFAULT_STRESS);
      return c.json({ items });
    } catch (e) {
      console.log("Error loading stress scale:", e);
      return c.json({ items: [], error: "Failed to load stress scale" }, 500);
    }
  });

  // ── PUT /scales/stress ────────────────────────────────────────
  app.put("/scales/stress", middleware, async (c: any) => {
    try {
      const { items } = await c.req.json();
      if (!Array.isArray(items) || items.length === 0) {
        return c.json({ error: "Items array is required" }, 400);
      }
      await kv.set(KV_KEY_STRESS, items);
      return c.json({ success: true, items });
    } catch (e) {
      console.log("Error saving stress scale:", e);
      return c.json({ error: "Failed to save stress scale" }, 500);
    }
  });

  // ── GET /scales/context-tags ──────────────────────────────────
  app.get("/scales/context-tags", async (c: any) => {
    try {
      const items = await getOrInit(KV_KEY_TAGS, DEFAULT_CONTEXT_TAGS);
      return c.json({ items });
    } catch (e) {
      console.log("Error loading context tags:", e);
      return c.json({ items: [], error: "Failed to load context tags" }, 500);
    }
  });

  // ── PUT /scales/context-tags ──────────────────────────────────
  app.put("/scales/context-tags", middleware, async (c: any) => {
    try {
      const { items } = await c.req.json();
      if (!Array.isArray(items) || items.length === 0) {
        return c.json({ error: "Items array is required" }, 400);
      }
      await kv.set(KV_KEY_TAGS, items);
      return c.json({ success: true, items });
    } catch (e) {
      console.log("Error saving context tags:", e);
      return c.json({ error: "Failed to save context tags" }, 500);
    }
  });

  // ── GET /scales/sleep ──────────────────────────────────────────
  app.get("/scales/sleep", async (c: any) => {
    try {
      const items = await getOrInit(KV_KEY_SLEEP, DEFAULT_SLEEP);
      return c.json({ items });
    } catch (e) {
      console.log("Error loading sleep scale:", e);
      return c.json({ items: [], error: "Failed to load sleep scale" }, 500);
    }
  });

  // ── PUT /scales/sleep ──────────────────────────────────────────
  app.put("/scales/sleep", middleware, async (c: any) => {
    try {
      const { items } = await c.req.json();
      if (!Array.isArray(items) || items.length === 0) {
        return c.json({ error: "Items array is required" }, 400);
      }
      await kv.set(KV_KEY_SLEEP, items);
      return c.json({ success: true, items });
    } catch (e) {
      console.log("Error saving sleep scale:", e);
      return c.json({ error: "Failed to save sleep scale" }, 500);
    }
  });

  // ── GET /scales/pain ───────────────────────────────────────────
  app.get("/scales/pain", async (c: any) => {
    try {
      const items = await getOrInit(KV_KEY_PAIN, DEFAULT_PAIN);
      return c.json({ items });
    } catch (e) {
      console.log("Error loading pain scale:", e);
      return c.json({ items: [], error: "Failed to load pain scale" }, 500);
    }
  });

  // ── PUT /scales/pain ───────────────────────────────────────────
  app.put("/scales/pain", middleware, async (c: any) => {
    try {
      const { items } = await c.req.json();
      if (!Array.isArray(items) || items.length === 0) {
        return c.json({ error: "Items array is required" }, 400);
      }
      await kv.set(KV_KEY_PAIN, items);
      return c.json({ success: true, items });
    } catch (e) {
      console.log("Error saving pain scale:", e);
      return c.json({ error: "Failed to save pain scale" }, 500);
    }
  });

  // ── GET /scales/moods ──────────────────────────────────────────
  // Reads from mood:* KV prefix (same keys as AdminMoodManager).
  // Lazy-inits defaults if empty. Admin edits via AdminMoodManager are
  // automatically reflected here.
  app.get("/scales/moods", async (c: any) => {
    try {
      const items = await getOrInitMoods();
      return c.json({ moods: items, items });
    } catch (e) {
      console.log("Error loading moods:", e);
      return c.json({ items: [], error: "Failed to load moods" }, 500);
    }
  });

  // ── PUT /scales/moods ──────────────────────────────────────────
  // Bulk-replace all mood types — writes individual mood:{id} KV keys.
  app.put("/scales/moods", middleware, async (c: any) => {
    try {
      const { items } = await c.req.json();
      if (!Array.isArray(items) || items.length === 0) {
        return c.json({ error: "Items array is required" }, 400);
      }
      // Delete existing mood:* keys first
      const existing = await kv.getByPrefix("mood:");
      for (const m of (existing || [])) {
        if (m?.id) await kv.del(`mood:${m.id}`);
      }
      // Write new ones
      const now = new Date().toISOString();
      for (const mood of items) {
        await kv.set(`mood:${mood.id}`, { ...mood, updated_at: now });
      }
      return c.json({ success: true, items });
    } catch (e) {
      console.log("Error saving moods:", e);
      return c.json({ error: "Failed to save moods" }, 500);
    }
  });

  // ── DELETE /scales/:type ──────────────────────────────────────
  // Deletes a scale from KV. Next GET will lazy-init defaults again.
  app.delete("/scales/:type", middleware, async (c: any) => {
    try {
      const type = c.req.param("type");
      const keyMap: Record<string, string> = {
        energy: KV_KEY_ENERGY,
        stress: KV_KEY_STRESS,
        "context-tags": KV_KEY_TAGS,
        sleep: KV_KEY_SLEEP,
        pain: KV_KEY_PAIN,
      };
      const key = keyMap[type];
      if (type === "moods") {
        // Delete all mood:* keys
        const existing = await kv.getByPrefix("mood:");
        for (const m of (existing || [])) {
          if (m?.id) await kv.del(`mood:${m.id}`);
        }
        return c.json({ success: true, message: 'All mood types deleted from KV' });
      }
      if (!key) {
        return c.json({ error: "Unknown type. Use energy, stress, context-tags, sleep, pain, or moods." }, 400);
      }
      await kv.del(key);
      return c.json({ success: true, message: `Scale "${type}" deleted from KV` });
    } catch (e) {
      console.log("Error deleting scale:", e);
      return c.json({ error: "Failed to delete scale" }, 500);
    }
  });
}