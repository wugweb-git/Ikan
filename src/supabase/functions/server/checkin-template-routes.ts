import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

// ═══════════════════════════════════════════════════════════════════
// Check-in Template Routes
//
// Allows admins to define the step sequence of the Mood Journal
// check-in flow via a block-builder interface. Each template is
// an ordered list of "steps" with configurable types, questions,
// and scale references.
// ═══════════════════════════════════════════════════════════════════

export interface CheckinStep {
  id: string;
  order: number;
  type: "emoji_scale" | "free_text" | "multi_select" | "single_choice" | "slider" | "yes_no";
  question: string;
  subtitle?: string;
  hero_emoji?: string;
  scale_key?: string;          // references checkin_scale:{key} or mood_type:
  options?: string[];           // for single_choice type
  slider_min?: number;          // for slider type
  slider_max?: number;
  slider_labels?: string[];     // e.g. ["Not at all", "Extremely"]
  required: boolean;
  ema_category?: string;        // EMA category tag for analytics
  save_as?: string;             // field name in journal entry (e.g. "mood_rating", "sleep_quality")
}

export interface CheckinTemplate {
  id: string;
  name: string;
  description?: string;
  steps: CheckinStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// ── Default Template ────────────────────────────────────────────
const DEFAULT_TEMPLATE: CheckinTemplate = {
  id: "default",
  name: "Daily Check-in",
  description: "Standard daily mood and wellness check-in",
  is_active: true,
  steps: [
    {
      id: "mood",
      order: 0,
      type: "emoji_scale",
      question: "How are you feeling now?",
      subtitle: "Tap the emoji that matches your vibe",
      hero_emoji: "🤔",
      scale_key: "mood",
      required: true,
      ema_category: "Mood",
      save_as: "mood_rating",
    },
    {
      id: "energy",
      order: 1,
      type: "emoji_scale",
      question: "What's your energy like?",
      subtitle: "From drained to fully charged",
      hero_emoji: "⚡",
      scale_key: "energy",
      required: false,
      ema_category: "Energy",
      save_as: "energy",
    },
    {
      id: "stress",
      order: 2,
      type: "emoji_scale",
      question: "How stressed do you feel today?",
      subtitle: "Be honest — there's no wrong answer",
      hero_emoji: "😌",
      scale_key: "stress",
      required: false,
      ema_category: "Stress",
      save_as: "stress_level",
    },
    {
      id: "sleep",
      order: 3,
      type: "emoji_scale",
      question: "How would you rate your sleep?",
      subtitle: "Think about last night's sleep quality",
      hero_emoji: "🌙",
      scale_key: "sleep",
      required: false,
      ema_category: "Sleep",
      save_as: "sleep_quality",
    },
    {
      id: "pain_experience",
      order: 4,
      type: "emoji_scale",
      question: "How would you describe your pain?",
      subtitle: "Rate your overall pain level right now",
      hero_emoji: "💊",
      scale_key: "pain",
      required: false,
      ema_category: "Pain Experience",
      save_as: "pain_level",
    },
    {
      id: "pain_impact",
      order: 5,
      type: "single_choice",
      question: "Has pain interfered with your usual activity?",
      subtitle: "Think about the last 24 hours",
      hero_emoji: "🏃",
      options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
      required: false,
      ema_category: "Pain Impact",
      save_as: "pain_impact",
    },
    {
      id: "note",
      order: 6,
      type: "free_text",
      question: "Anything on your mind?",
      subtitle: "A quick note to capture this moment",
      hero_emoji: "✏️",
      required: false,
      save_as: "freehand_text_content",
    },
    {
      id: "tags",
      order: 7,
      type: "multi_select",
      question: "What shaped your day?",
      subtitle: "Pick whatever applies — or skip to save",
      hero_emoji: "🏷️",
      scale_key: "context_tags",
      required: false,
      save_as: "context_tags",
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const KV_ACTIVE_KEY = "checkin_template_active";

export function registerCheckinTemplateRoutes(app: Hono, requireAuth: any) {

  // ── GET /checkin-template/active — Get the active template ───
  app.get("/checkin-template/active", requireAuth, async (c) => {
    try {
      // Check if there's a custom active template
      const activeId = await kv.get(KV_ACTIVE_KEY);
      if (activeId) {
        const template = await kv.get(`checkin_template:${activeId}`);
        if (template && template.is_active !== false) {
          return c.json({ template });
        }
      }

      // Check for any template marked active
      const allTemplates = await kv.getByPrefix("checkin_template:");
      const active = allTemplates.find((t: any) => t.is_active === true);
      if (active) {
        return c.json({ template: active });
      }

      // Return default template
      return c.json({ template: DEFAULT_TEMPLATE, _isDefault: true });
    } catch (err) {
      console.log(`Get active template error: ${err}`);
      return c.json({ template: DEFAULT_TEMPLATE, _isDefault: true });
    }
  });

  // ── GET /checkin-templates — List all templates ──────────────
  app.get("/checkin-templates", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const templates = await kv.getByPrefix("checkin_template:");
      // Filter out the active pointer key
      const filtered = templates.filter((t: any) => t && typeof t === "object" && t.id);

      // If no templates exist, seed the default
      if (filtered.length === 0) {
        await kv.set(`checkin_template:${DEFAULT_TEMPLATE.id}`, DEFAULT_TEMPLATE);
        await kv.set(KV_ACTIVE_KEY, DEFAULT_TEMPLATE.id);
        return c.json({ templates: [DEFAULT_TEMPLATE] });
      }

      return c.json({ templates: filtered });
    } catch (err) {
      console.log(`List templates error: ${err}`);
      return c.json({ error: `Failed to list templates: ${err}` }, 500);
    }
  });

  // ── GET /checkin-template/:id — Get a specific template ─────
  app.get("/checkin-template/:id", requireAuth, async (c) => {
    try {
      const id = c.req.param("id");
      const template = await kv.get(`checkin_template:${id}`);
      if (!template) {
        if (id === "default") {
          return c.json({ template: DEFAULT_TEMPLATE });
        }
        return c.json({ error: "Template not found" }, 404);
      }
      return c.json({ template });
    } catch (err) {
      console.log(`Get template error: ${err}`);
      return c.json({ error: `Failed to get template: ${err}` }, 500);
    }
  });

  // ── POST /checkin-template — Create a new template ──────────
  app.post("/checkin-template", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const body = await c.req.json();
      const id = body.id || crypto.randomUUID();

      const template: CheckinTemplate = {
        id,
        name: body.name || "New Check-in Template",
        description: body.description || "",
        steps: (body.steps || DEFAULT_TEMPLATE.steps).map((s: any, i: number) => ({
          ...s,
          id: s.id || crypto.randomUUID(),
          order: s.order ?? i,
        })),
        is_active: body.is_active ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: userId,
      };

      await kv.set(`checkin_template:${id}`, template);

      // If this is set as active, update the pointer
      if (template.is_active) {
        // Deactivate all others
        const all = await kv.getByPrefix("checkin_template:");
        for (const t of all) {
          if (t && t.id && t.id !== id && t.is_active) {
            await kv.set(`checkin_template:${t.id}`, { ...t, is_active: false });
          }
        }
        await kv.set(KV_ACTIVE_KEY, id);
      }

      console.log(`Created check-in template: ${id} (${template.name})`);
      return c.json({ template });
    } catch (err) {
      console.log(`Create template error: ${err}`);
      return c.json({ error: `Failed to create template: ${err}` }, 500);
    }
  });

  // ── PUT /checkin-template/:id — Update a template ───────────
  app.put("/checkin-template/:id", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const id = c.req.param("id");
      const body = await c.req.json();

      const existing = await kv.get(`checkin_template:${id}`);
      const template: CheckinTemplate = {
        ...(existing || {}),
        ...body,
        id,
        steps: (body.steps || existing?.steps || []).map((s: any, i: number) => ({
          ...s,
          id: s.id || crypto.randomUUID(),
          order: s.order ?? i,
        })),
        updated_at: new Date().toISOString(),
      };

      await kv.set(`checkin_template:${id}`, template);

      // Handle active state
      if (body.is_active === true) {
        const all = await kv.getByPrefix("checkin_template:");
        for (const t of all) {
          if (t && t.id && t.id !== id && t.is_active) {
            await kv.set(`checkin_template:${t.id}`, { ...t, is_active: false });
          }
        }
        await kv.set(KV_ACTIVE_KEY, id);
      }

      console.log(`Updated check-in template: ${id}`);
      return c.json({ template });
    } catch (err) {
      console.log(`Update template error: ${err}`);
      return c.json({ error: `Failed to update template: ${err}` }, 500);
    }
  });

  // ── DELETE /checkin-template/:id — Delete a template ─────────
  app.delete("/checkin-template/:id", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const id = c.req.param("id");
      if (id === "default") {
        return c.json({ error: "Cannot delete the default template" }, 400);
      }

      // Check if this is the active template
      const activeId = await kv.get(KV_ACTIVE_KEY);
      if (activeId === id) {
        // Revert to default
        await kv.set(KV_ACTIVE_KEY, "default");
        // Ensure default exists
        const defaultExists = await kv.get("checkin_template:default");
        if (!defaultExists) {
          await kv.set("checkin_template:default", { ...DEFAULT_TEMPLATE, is_active: true });
        } else {
          await kv.set("checkin_template:default", { ...defaultExists, is_active: true });
        }
      }

      await kv.del(`checkin_template:${id}`);
      console.log(`Deleted check-in template: ${id}`);
      return c.json({ success: true });
    } catch (err) {
      console.log(`Delete template error: ${err}`);
      return c.json({ error: `Failed to delete template: ${err}` }, 500);
    }
  });

  // ── POST /checkin-template/:id/activate — Set as active ─────
  app.post("/checkin-template/:id/activate", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const id = c.req.param("id");
      const template = await kv.get(`checkin_template:${id}`);
      if (!template && id !== "default") {
        return c.json({ error: "Template not found" }, 404);
      }

      // Deactivate all
      const all = await kv.getByPrefix("checkin_template:");
      for (const t of all) {
        if (t && t.id && t.is_active) {
          await kv.set(`checkin_template:${t.id}`, { ...t, is_active: false });
        }
      }

      // Activate target
      if (id === "default" && !template) {
        await kv.set("checkin_template:default", { ...DEFAULT_TEMPLATE, is_active: true });
      } else {
        await kv.set(`checkin_template:${id}`, { ...template, is_active: true, updated_at: new Date().toISOString() });
      }
      await kv.set(KV_ACTIVE_KEY, id);

      console.log(`Activated check-in template: ${id}`);
      return c.json({ success: true, activeTemplateId: id });
    } catch (err) {
      console.log(`Activate template error: ${err}`);
      return c.json({ error: `Failed to activate template: ${err}` }, 500);
    }
  });

  // ── POST /checkin-template/seed-default — Seed the default ──
  app.post("/checkin-template/seed-default", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      await kv.set(`checkin_template:${DEFAULT_TEMPLATE.id}`, { ...DEFAULT_TEMPLATE, is_active: true });
      await kv.set(KV_ACTIVE_KEY, DEFAULT_TEMPLATE.id);

      console.log("Seeded default check-in template");
      return c.json({ success: true, template: DEFAULT_TEMPLATE });
    } catch (err) {
      console.log(`Seed default error: ${err}`);
      return c.json({ error: `Failed to seed default: ${err}` }, 500);
    }
  });
}
