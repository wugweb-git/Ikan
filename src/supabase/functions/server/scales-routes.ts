import * as kv from "./kv_dual_write.ts";

// ── KV Keys ─────────────────────────────────────────────────────────
const KV_KEY_ENERGY = "checkin_scale:energy";
const KV_KEY_STRESS = "checkin_scale:stress";
const KV_KEY_TAGS   = "checkin_scale:context_tags";
const KV_KEY_SLEEP  = "checkin_scale:sleep";
const KV_KEY_PAIN   = "checkin_scale:pain";

// All scale data is 100% KV-backed. No hardcoded defaults.
// If KV is empty, return empty. Admin creates content via the backend.

export function registerScalesRoutes(app: Hono, middleware: any) {

  // ── GET routes are PUBLIC (no auth required) ──────────────────────
  // Scale definitions are configuration data needed by user-facing
  // check-in flow, same pattern as GET /assessments and GET /equip/programs.
  // PUT/DELETE routes remain protected with requireAuth.

  // ── GET /scales/energy ────────────────────────────────────────
  app.get("/scales/energy", async (c) => {
    try {
      const saved = await kv.get(KV_KEY_ENERGY);
      return c.json({ items: saved || [] });
    } catch (e) {
      console.log("Error loading energy scale:", e);
      return c.json({ items: [], error: "Failed to load energy scale" }, 500);
    }
  });

  // ── PUT /scales/energy ────────────────────────────────────────
  app.put("/scales/energy", middleware, async (c) => {
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
  app.get("/scales/stress", async (c) => {
    try {
      const saved = await kv.get(KV_KEY_STRESS);
      return c.json({ items: saved || [] });
    } catch (e) {
      console.log("Error loading stress scale:", e);
      return c.json({ items: [], error: "Failed to load stress scale" }, 500);
    }
  });

  // ── PUT /scales/stress ────────────────────────────────────────
  app.put("/scales/stress", middleware, async (c) => {
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
  app.get("/scales/context-tags", async (c) => {
    try {
      const saved = await kv.get(KV_KEY_TAGS);
      return c.json({ items: saved || [] });
    } catch (e) {
      console.log("Error loading context tags:", e);
      return c.json({ items: [], error: "Failed to load context tags" }, 500);
    }
  });

  // ── PUT /scales/context-tags ──────────────────────────────────
  app.put("/scales/context-tags", middleware, async (c) => {
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
  app.get("/scales/sleep", async (c) => {
    try {
      const saved = await kv.get(KV_KEY_SLEEP);
      return c.json({ items: saved || [] });
    } catch (e) {
      console.log("Error loading sleep scale:", e);
      return c.json({ items: [], error: "Failed to load sleep scale" }, 500);
    }
  });

  // ── PUT /scales/sleep ──────────────────────────────────────────
  app.put("/scales/sleep", middleware, async (c) => {
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
  app.get("/scales/pain", async (c) => {
    try {
      const saved = await kv.get(KV_KEY_PAIN);
      return c.json({ items: saved || [] });
    } catch (e) {
      console.log("Error loading pain scale:", e);
      return c.json({ items: [], error: "Failed to load pain scale" }, 500);
    }
  });

  // ── PUT /scales/pain ───────────────────────────────────────────
  app.put("/scales/pain", middleware, async (c) => {
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

  // ── DELETE /scales/:type ──────────────────────────────────────
  // Deletes a scale from KV. After this, GET returns empty [].
  app.delete("/scales/:type", middleware, async (c) => {
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
      if (!key) {
        return c.json({ error: "Unknown type. Use energy, stress, context-tags, sleep, or pain." }, 400);
      }
      await kv.del(key);
      return c.json({ success: true, message: `Scale "${type}" deleted from KV` });
    } catch (e) {
      console.log("Error deleting scale:", e);
      return c.json({ error: "Failed to delete scale" }, 500);
    }
  });
}
