import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { DEFAULT_ASSESSMENTS } from './default-assessments.ts';

export function registerAssessmentRoutes(app: Hono, requireAuth: any) {

    // Get available assessments
    app.get("/assessments", async (c) => {
        try {
            const dynamic = await kv.getByPrefix('assessment_def:');
            
            // Deduplicate by ID
            const map = new Map();
            DEFAULT_ASSESSMENTS.forEach(a => map.set(a.id, a));
            dynamic.forEach(a => map.set(a.id, a));
            
            const assessments = Array.from(map.values()).filter((a: any) => !a.deleted);
            
            return c.json({ assessments });
        } catch (error) {
            return c.json({ error: 'Failed to list assessments' }, 500);
        }
    });

    // Get single assessment
    app.get("/assessments/:id", async (c) => {
        try {
            const id = c.req.param("id");
            
            // Try DB first
            let assessment = await kv.get(`assessment_def:${id}`);
            
            // Fallback to defaults
            if (!assessment) {
                assessment = DEFAULT_ASSESSMENTS.find(a => a.id === id);
            }

            if (!assessment || assessment.deleted) {
                return c.json({ error: "Assessment not found" }, 404);
            }

            return c.json({ assessment });
        } catch (error) {
            return c.json({ error: 'Failed to get assessment' }, 500);
        }
    });


    // Submit assessment result
    app.post("/user/assessments", requireAuth, async (c) => {
        try {
            const userId = c.get('userId');
            const data = await c.req.json();
            
            const id = crypto.randomUUID();
            const result = {
                id,
                user_id: userId,
                assessment_id: data.assessmentId,
                score: data.score,
                max_score: data.maxScore || null,
                status: data.status,
                interpretation: data.interpretation,
                responses: data.responses,
                severity_hint: data.severityHint,
                completed_at: new Date().toISOString()
            };
            
            // Store individual result
            await kv.set(`assessment_result:${userId}:${id}`, result);
            
            // Store reference in user's index (optional, but good for listing)
            await kv.set(`assessment_response_by_user:${userId}:${id}`, {
                response_id: id,
                assessment_id: data.assessmentId,
                date: new Date().toISOString()
            });

            // Store latest for quick lookup
            await kv.set(`assessment_result:${userId}:${data.assessmentId}:latest`, result);
            
            return c.json({ success: true, result });
        } catch (error) {
            console.error('Save assessment error:', error);
            return c.json({ error: 'Failed to save assessment' }, 500);
        }
    });

    // Get user's assessment history
    app.get("/user/assessments/history", requireAuth, async (c) => {
        try {
            const userId = c.get('userId');
            const results = await kv.getByPrefix(`assessment_result:${userId}:`);
            // Deduplicate: the :latest keys store copies of results with the same id.
            // Use a Map keyed by result.id to keep only unique entries.
            const uniqueMap = new Map<string, any>();
            for (const r of results) {
              if (r && r.id && !uniqueMap.has(r.id)) {
                uniqueMap.set(r.id, r);
              }
            }
            const history = Array.from(uniqueMap.values());
            return c.json({ history });
        } catch (error) {
            return c.json({ error: 'Failed to get history' }, 500);
        }
    });
}