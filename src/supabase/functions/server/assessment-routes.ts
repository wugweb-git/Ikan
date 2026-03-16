import { Hono } from 'npm:hono';
import * as kv from './kv_dual_write.ts';

export function registerAssessmentRoutes(app: Hono, requireAuth: any) {

    // Get available assessments — 100% KV-backed, no hardcoded fallbacks
    app.get("/assessments", async (c) => {
        try {
            const all = await kv.getByPrefix('assessment_def:');
            const assessments = all.filter((a: any) => a && a.id && !a.deleted && a.published !== false);

            // ✅ Compute completion counts from assessment_result:* entries
            // Results are stored as assessment_result:{userId}:{resultId}
            // Each result has an assessment_id field linking to the definition
            const allResults = await kv.getByPrefix('assessment_result:');
            const completionCountMap: Record<string, number> = {};
            const seenKeys = new Set<string>(); // Dedupe :latest aliases
            for (const result of allResults) {
                if (!result || !result.assessment_id || !result.id) continue;
                // Skip if we've already counted this result ID (handles :latest duplicates)
                if (seenKeys.has(result.id)) continue;
                seenKeys.add(result.id);
                completionCountMap[result.assessment_id] = (completionCountMap[result.assessment_id] || 0) + 1;
            }

            // Attach completion counts to each assessment
            const assessmentsWithCounts = assessments.map((a: any) => ({
                ...a,
                completionCount: completionCountMap[a.id] || completionCountMap[a.assessment_id] || 0,
            }));

            return c.json({ assessments: assessmentsWithCounts });
        } catch (error) {
            console.error('Failed to list assessments:', error);
            return c.json({ error: 'Failed to list assessments' }, 500);
        }
    });

    // Get single assessment — KV only
    app.get("/assessments/:id", async (c) => {
        try {
            const id = c.req.param("id");
            const assessment = await kv.get(`assessment_def:${id}`);

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