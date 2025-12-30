import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { RecommendationRuleService } from './recommendation-service.ts';

export function registerRecommendationRoutes(app: Hono, requireAuth: any) {

// ========================================
// RECOMMENDATION RULES ENDPOINTS
// ========================================

app.get("/admin/recommendations/rules", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const rules = await RecommendationRuleService.listRules();
    return c.json({ rules });
  } catch (error) {
    return c.json({ error: 'Failed to list rules' }, 500);
  }
});

app.post("/admin/recommendations/rules", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const data = await c.req.json();
    const rule = await RecommendationRuleService.createRule(data);
    return c.json({ rule });
  } catch (error) {
    return c.json({ error: 'Failed to create rule' }, 500);
  }
});

app.put("/admin/recommendations/rules/:id", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const id = c.req.param('id');
    const updates = await c.req.json();
    const rule = await RecommendationRuleService.updateRule(id, updates);
    return c.json({ rule });
  } catch (error) {
    return c.json({ error: 'Failed to update rule' }, 500);
  }
});

app.delete("/admin/recommendations/rules/:id", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const id = c.req.param('id');
    await RecommendationRuleService.deleteRule(id);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete rule' }, 500);
  }
});

} // End registerRecommendationRoutes
