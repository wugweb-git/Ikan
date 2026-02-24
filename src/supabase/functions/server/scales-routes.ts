import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

// ── Default Scales (mirrors design-tokens.ts) ──────────────────────────
const DEFAULT_ENERGY: ScaleItem[] = [
  { id: "exhausted", value: 1, label: "Exhausted", emoji: "\u{1FAAB}", severity: "danger", is_active: true, order: 0 },
  { id: "tired",     value: 2, label: "Tired",     emoji: "\u{1F634}", severity: "warning", is_active: true, order: 1 },
  { id: "moderate",  value: 3, label: "Moderate",  emoji: "\u{26A1}",  severity: "neutral", is_active: true, order: 2 },
  { id: "energetic", value: 4, label: "Energetic", emoji: "\u{1F4AA}", severity: "success", is_active: true, order: 3 },
  { id: "charged",   value: 5, label: "Charged!",  emoji: "\u{1F525}", severity: "success", is_active: true, order: 4 },
];

const DEFAULT_STRESS: ScaleItem[] = [
  { id: "chill",   value: 1, label: "Chill",   emoji: "\u{1F60C}", severity: "success", is_active: true, order: 0 },
  { id: "mild",    value: 2, label: "Mild",    emoji: "\u{1F914}", severity: "info",    is_active: true, order: 1 },
  { id: "medium",  value: 3, label: "Medium",  emoji: "\u{1F624}", severity: "warning", is_active: true, order: 2 },
  { id: "high",    value: 4, label: "High",    emoji: "\u{1F630}", severity: "warning", is_active: true, order: 3 },
  { id: "extreme", value: 5, label: "Yikes!",  emoji: "\u{1F92F}", severity: "danger",  is_active: true, order: 4 },
];

const DEFAULT_TAGS: TagItem[] = [
  { id: "work",          label: "Work",          emoji: "\u{1F4BC}", is_active: true, order: 0 },
  { id: "sleep",         label: "Sleep",         emoji: "\u{1F634}", is_active: true, order: 1 },
  { id: "health",        label: "Health",        emoji: "\u{1F3C3}", is_active: true, order: 2 },
  { id: "relationships", label: "Relationships", emoji: "\u{2764}\u{FE0F}", is_active: true, order: 3 },
  { id: "studies",       label: "Studies",       emoji: "\u{1F4DA}", is_active: true, order: 4 },
  { id: "finances",      label: "Finances",      emoji: "\u{1F4B0}", is_active: true, order: 5 },
  { id: "fun",           label: "Fun",           emoji: "\u{1F389}", is_active: true, order: 6 },
  { id: "other",         label: "Other",         emoji: "\u{2728}",  is_active: true, order: 7 },
];

interface ScaleItem {
  id: string;
  value: number;
  label: string;
  emoji: string;
  severity: string;
  is_active: boolean;
  order: number;
}

interface TagItem {
  id: string;
  label: string;
  emoji: string;
  is_active: boolean;
  order: number;
}

const KV_KEY_ENERGY = "checkin_scale:energy";
const KV_KEY_STRESS = "checkin_scale:stress";
const KV_KEY_TAGS   = "checkin_scale:context_tags";

export function registerScalesRoutes(app: Hono, middleware: any) {

  // ── GET /scales/energy ────────────────────────────────────────
  app.get("/scales/energy", middleware, async (c) => {
    try {
      const saved = await kv.get(KV_KEY_ENERGY);
      return c.json({ items: saved || DEFAULT_ENERGY });
    } catch (e) {
      console.log("Error loading energy scale:", e);
      return c.json({ items: DEFAULT_ENERGY });
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
  app.get("/scales/stress", middleware, async (c) => {
    try {
      const saved = await kv.get(KV_KEY_STRESS);
      return c.json({ items: saved || DEFAULT_STRESS });
    } catch (e) {
      console.log("Error loading stress scale:", e);
      return c.json({ items: DEFAULT_STRESS });
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
  app.get("/scales/context-tags", middleware, async (c) => {
    try {
      const saved = await kv.get(KV_KEY_TAGS);
      return c.json({ items: saved || DEFAULT_TAGS });
    } catch (e) {
      console.log("Error loading context tags:", e);
      return c.json({ items: DEFAULT_TAGS });
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

  // ── POST /scales/reset ────────────────────────────────────────
  // Resets all scales to design-token defaults
  app.post("/scales/reset", middleware, async (c) => {
    try {
      const { type } = await c.req.json();
      if (type === "energy") {
        await kv.del(KV_KEY_ENERGY);
        return c.json({ success: true, items: DEFAULT_ENERGY });
      } else if (type === "stress") {
        await kv.del(KV_KEY_STRESS);
        return c.json({ success: true, items: DEFAULT_STRESS });
      } else if (type === "context-tags") {
        await kv.del(KV_KEY_TAGS);
        return c.json({ success: true, items: DEFAULT_TAGS });
      } else if (type === "all") {
        await kv.del(KV_KEY_ENERGY);
        await kv.del(KV_KEY_STRESS);
        await kv.del(KV_KEY_TAGS);
        return c.json({ success: true, message: "All scales reset to defaults" });
      }
      return c.json({ error: "Unknown type. Use energy, stress, context-tags, or all." }, 400);
    } catch (e) {
      console.log("Error resetting scales:", e);
      return c.json({ error: "Failed to reset scales" }, 500);
    }
  });
}
