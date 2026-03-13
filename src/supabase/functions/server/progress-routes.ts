import { Hono } from 'npm:hono';
import * as kv from './kv_dual_write.ts';
import { ProgressService } from './progress-service.ts';

export function registerProgressRoutes(app: Hono, requireAuth: any) {

// ========================================
// PROGRESS & USER ENDPOINTS
// ========================================

app.get("/user/enrollments", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const enrollments = await ProgressService.getUserEnrollments(userId);
    return c.json({ enrollments });
  } catch (error) {
    return c.json({ error: 'Failed to fetch enrollments' }, 500);
  }
});

app.post("/user/enroll/:equipId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const equipId = c.req.param('equipId');
    const enrollment = await ProgressService.enrollUser(userId, equipId);
    return c.json({ enrollment });
  } catch (error) {
    return c.json({ error: 'Enrollment failed' }, 500);
  }
});

app.get("/user/equip/:equipId/today", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const equipId = c.req.param('equipId');
    
    // Get content for current position
    const content = await ProgressService.getTodayContent(userId, equipId);
    
    if (!content) {
        // If no enrollment, maybe auto-enroll or 404?
        // Prompt says "never auto-enroll". 
        // But if user clicks "Start" in catalog, they call enroll endpoint first.
        return c.json({ error: 'Not enrolled or content not found' }, 404);
    }
    
    // Also fetch progress for this day (completed blocks)
    const dayProgress = await ProgressService.getDayProgress(userId, equipId, content.enrollment.current_day_number);

    return c.json({ 
        day: content.day,
        blocks: content.blocks,
        progress: dayProgress
    });
  } catch (error) {
    console.log('Today view error', error);
    return c.json({ error: 'Failed to load today view' }, 500);
  }
});

app.post("/user/equip/:equipId/day/:dayNum/block/:blockId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { equipId, dayNum, blockId } = c.req.param();
    const { response } = await c.req.json();
    
    await ProgressService.saveBlockResponse(userId, equipId, parseInt(dayNum), blockId, response);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to save response' }, 500);
  }
});

app.post("/user/equip/:equipId/day/:dayNum/complete", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { equipId, dayNum } = c.req.param();
    
    await ProgressService.completeDay(userId, equipId, parseInt(dayNum));
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to complete day' }, 500);
  }
});

app.get("/user/equip/:equipId/progress", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const equipId = c.req.param('equipId');
    const progress = await ProgressService.getFullProgress(userId, equipId);
    return c.json({ progress });
  } catch (error) {
    return c.json({ error: 'Failed to fetch progress' }, 500);
  }
});

app.post("/user/equip/:equipId/sync", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const equipId = c.req.param('equipId');
    const data = await c.req.json();
    await ProgressService.syncProgress(userId, equipId, data);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Sync failed' }, 500);
  }
});

} // End registerProgressRoutes