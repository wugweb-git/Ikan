import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

export function registerResourceRoutes(app: Hono, middleware: any) {
  
  // Helper to check admin status
  const ensureAdmin = async (c: any) => {
    const user = c.get('user');
    // If we used requireAdmin middleware it would set isAdmin, but we use requireAuth here
    // so we verify against KV
    const profile = await kv.get(`user:${user.id}`);
    if (!profile?.is_admin) {
      throw new Error("Admin access required");
    }
  };

  // --- Public/User Routes ---

  app.get("/library/resources", async (c) => {
    try {
      const resources = await kv.getByPrefix("resource:");
      return c.json({ resources });
    } catch (error) {
      return c.json({ error: "Failed to fetch resources" }, 500);
    }
  });

  app.get("/library/resources/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const resource = await kv.get(`resource:${id}`);
      if (!resource) {
        return c.json({ error: "Resource not found" }, 404);
      }
      return c.json({ resource });
    } catch (error) {
      return c.json({ error: "Failed to fetch resource" }, 500);
    }
  });

  // --- Admin Routes ---

  app.get("/admin/resources", middleware, async (c) => {
    try {
      await ensureAdmin(c);
      const resources = await kv.getByPrefix("resource:");
      return c.json({ resources });
    } catch (error) {
      return c.json({ error: "Unauthorized" }, 403);
    }
  });

  app.post("/admin/resources", middleware, async (c) => {
    try {
      await ensureAdmin(c);
      const body = await c.req.json();
      const id = crypto.randomUUID();
      
      const resource = {
        ...body,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await kv.set(`resource:${id}`, resource);
      return c.json({ resource });
    } catch (error) {
      return c.json({ error: "Unauthorized or Invalid" }, 403);
    }
  });

  app.put("/admin/resources/:id", middleware, async (c) => {
    try {
      await ensureAdmin(c);
      const id = c.req.param("id");
      const body = await c.req.json();
      
      const existing = await kv.get(`resource:${id}`);
      if (!existing) return c.json({ error: "Not found" }, 404);
      
      const updated = {
        ...existing,
        ...body,
        updated_at: new Date().toISOString()
      };
      
      await kv.set(`resource:${id}`, updated);
      return c.json({ resource: updated });
    } catch (error) {
      return c.json({ error: "Unauthorized" }, 403);
    }
  });

  app.delete("/admin/resources/:id", middleware, async (c) => {
    try {
      await ensureAdmin(c);
      const id = c.req.param("id");
      await kv.del(`resource:${id}`);
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: "Unauthorized" }, 403);
    }
  });

  // Categories
  app.get("/admin/categories", middleware, async (c) => {
    try {
        await ensureAdmin(c);
        const categories = await kv.getByPrefix("category:");
        return c.json({ categories });
    } catch (e) {
        return c.json({ error: "Unauthorized" }, 403);
    }
  });
}
