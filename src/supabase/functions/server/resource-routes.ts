import * as kv from "./kv_dual_write.ts";

export function registerResourceRoutes(app: Hono, middleware: any) {
  // NOTE: index.tsx now passes requireAdmin. Every route below using `middleware`
  // is an /admin/* route, so admin-level is the correct guard.
  
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

      // ✅ Compute view counts from resource_view:* entries
      const allViews = await kv.getByPrefix("resource_view:");
      const viewCountMap: Record<string, number> = {};
      for (const view of allViews) {
        if (!view || !view.resource_id) continue;
        viewCountMap[view.resource_id] = (viewCountMap[view.resource_id] || 0) + 1;
      }

      const resourcesWithCounts = resources.map((r: any) => ({
        ...r,
        viewCount: viewCountMap[r.id] || viewCountMap[r.resource_id] || r.viewCount || 0,
      }));

      return c.json({ resources: resourcesWithCounts });
    } catch (error) {
      return c.json({ error: "Failed to fetch resources" }, 500);
    }
  });

  // Track resource view
  app.post("/library/resources/:id/view", async (c) => {
    try {
      const id = c.req.param("id");
      // Use a unique key per session/visitor to avoid double-counting refreshes
      // For simplicity, use a time-bucketed approach
      const viewId = `${id}-${Date.now()}`;
      await kv.set(`resource_view:${viewId}`, {
        resource_id: id,
        viewed_at: new Date().toISOString(),
      });
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: "Failed to track view" }, 500);
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