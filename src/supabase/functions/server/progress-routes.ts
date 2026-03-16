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

// Leave / withdraw from a program (soft-delete, preserves progress)
app.delete("/user/enrollments/:equipId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const equipId = c.req.param('equipId');
    await ProgressService.unenrollUser(userId, equipId);
    return c.json({ success: true });
  } catch (error) {
    console.log('Unenroll error:', error);
    return c.json({ error: 'Failed to leave program' }, 500);
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

// ── File upload for program blocks ────────────────────────────────
app.post("/user/equip/upload", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    const equipId = formData.get('equipId') as string;
    const dayNum = formData.get('dayNum') as string;
    const blockId = formData.get('blockId') as string;

    if (!file || !equipId || !blockId) {
      return c.json({ error: 'Missing file, equipId, or blockId' }, 400);
    }

    // Max 10MB for user uploads
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'File too large (max 10MB)' }, 413);
    }

    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const bucket = 'make-cc205da9-user-uploads';

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b: any) => b.name === bucket);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucket, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
    }

    // Upload
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'bin';
    const filePath = `${userId}/${equipId}/day${dayNum}/${blockId}-${timestamp}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.log(`Upload error for user ${userId}: ${uploadError.message}`);
      return c.json({ error: `Upload failed: ${uploadError.message}` }, 500);
    }

    // Generate signed URL (7 days)
    const { data: signedUrlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 604800);

    // Store reference in KV
    const uploadKey = `upload:${userId}:${equipId}:${dayNum}:${blockId}`;
    await kv.set(uploadKey, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      bucket,
      filePath,
      signedUrl: signedUrlData?.signedUrl,
      uploadedAt: new Date().toISOString(),
    });

    return c.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      signedUrl: signedUrlData?.signedUrl,
    });
  } catch (error) {
    console.log(`File upload error: ${error}`);
    return c.json({ error: `Upload failed: ${error}` }, 500);
  }
});

} // End registerProgressRoutes