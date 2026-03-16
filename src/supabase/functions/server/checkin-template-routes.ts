import * as kv from "./kv_dual_write.ts";

// ═══════════════════════════════════════════════════════════════════
// Check-in Template Routes
//
// 100% KV-backed. No hardcoded defaults. No seed functions.
// Admin creates templates via the backend. If KV is empty, return empty.
// ═══════════════════════════════════════════════════════════════════

export interface CheckinStep {
  id: string;
  order: number;
  type: "emoji_scale" | "free_text" | "multi_select" | "single_choice" | "slider" | "yes_no";
  question: string;
  subtitle?: string;
  hero_emoji?: string;
  scale_key?: string;
  options?: string[];
  slider_min?: number;
  slider_max?: number;
  slider_labels?: string[];
  required: boolean;
  ema_category?: string;
  save_as?: string;
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
      const active = allTemplates.find((t: any) => t && typeof t === "object" && t.is_active === true);
      if (active) {
        return c.json({ template: active });
      }

      // No active template — return null. Admin must create one.
      return c.json({ template: null, _message: "No active check-in template. Create one in admin." });
    } catch (err) {
      console.log(`Get active template error: ${err}`);
      return c.json({ template: null, error: `Failed to get active template: ${err}` }, 500);
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
      const filtered = templates.filter((t: any) => t && typeof t === "object" && t.id);

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

      if (!body.steps || !Array.isArray(body.steps) || body.steps.length === 0) {
        return c.json({ error: "At least one step is required" }, 400);
      }

      const id = body.id || crypto.randomUUID();

      const template: CheckinTemplate = {
        id,
        name: body.name || "New Check-in Template",
        description: body.description || "",
        steps: body.steps.map((s: any, i: number) => ({
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
      if (!existing) {
        return c.json({ error: "Template not found" }, 404);
      }

      const template: CheckinTemplate = {
        ...existing,
        ...body,
        id,
        steps: (body.steps || existing.steps || []).map((s: any, i: number) => ({
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

      // If this is the active template, clear the active pointer
      const activeId = await kv.get(KV_ACTIVE_KEY);
      if (activeId === id) {
        await kv.del(KV_ACTIVE_KEY);
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
      if (!template) {
        return c.json({ error: "Template not found. Create it first." }, 404);
      }

      // Deactivate all
      const all = await kv.getByPrefix("checkin_template:");
      for (const t of all) {
        if (t && t.id && t.is_active) {
          await kv.set(`checkin_template:${t.id}`, { ...t, is_active: false });
        }
      }

      // Activate target
      await kv.set(`checkin_template:${id}`, { ...template, is_active: true, updated_at: new Date().toISOString() });
      await kv.set(KV_ACTIVE_KEY, id);

      console.log(`Activated check-in template: ${id}`);
      return c.json({ success: true, activeTemplateId: id });
    } catch (err) {
      console.log(`Activate template error: ${err}`);
      return c.json({ error: `Failed to activate template: ${err}` }, 500);
    }
  });
}
