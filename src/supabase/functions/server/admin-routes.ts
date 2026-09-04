import { EquipService } from './program-service.ts';
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_dual_write.ts";
import { validateScoringProfile, projectBandsToClosedRanges, validateQuestionIdImmutability, validateAssessmentScores, diffQuestionText, applyTextHistory } from "./scoring-validation.ts";

// REMOVED 2026-09-01 (S3): hardcoded SUPER_ADMIN_EMAIL. It was already unused
// in this file; admin status derives solely from the is_admin profile flag.

export function registerAdminRoutes(app: Hono, requireAuth: any, requireAdmin: any) {

// ========================================
// ADMIN - DEBUG & UTILS
// ========================================

// ========================================
// ADMIN - SETTINGS
// ========================================

app.get("/admin/settings", requireAdmin, async (c) => {
  try {
    const settings = await kv.get('settings:site') || {};
    return c.json({ settings });
  } catch (error) {
    console.error('Failed to load settings:', error);
    return c.json({ error: 'Failed to load settings' }, 500);
  }
});

app.put("/admin/settings", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const existing = await kv.get('settings:site') || {};
    const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
    await kv.set('settings:site', updated);
    return c.json({ settings: updated, success: true });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

app.get("/admin/debug/check-status", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    
    return c.json({ 
      success: true,
      email: user.email,
      id: user.id,
      isAdmin: !!userProfile?.is_admin,
      profile: userProfile || {}
    });
  } catch (error) {
    return c.json({ error: 'Failed to check status' }, 500);
  }
});

// REMOVED 2026-09-01 (S2): POST /admin/debug/make-admin promoted the *calling*
// user to admin behind `requireAuth` only — any authenticated user could grant
// themselves the admin flag in one request. A duplicate of this route also
// existed in index.tsx and has been removed with it. Do not reintroduce a
// self-promotion endpoint; use POST /admin/set-admin/:userId, which requires an
// existing admin.

// ========================================
// ADMIN - ADD DEFAULT ONBOARDING TO PROGRAMS
// ========================================

app.post("/admin/equip/add-default-onboarding", requireAdmin, async (c) => {
  try {
    const user = c.get('user');
    // Double check just in case middleware failed
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    // Get all programs
    const programs = await EquipService.listEquips();
    let updatedCount = 0;

    // Default onboarding questions
    const defaultOnboarding = {
      title: 'Program Setup',
      description: 'Please answer a few questions to personalize your experience.',
      is_required_before_start: true,
      version: '1.0.0',
      sections: [],
      questions: [
        {
          id: 'q-experience',
          text: 'How would you describe your current experience with this topic?',
          type: 'single-choice',
          required: true,
          options: [
            { id: 'opt-1', text: 'New to this', value: 'beginner' },
            { id: 'opt-2', text: 'Some experience', value: 'intermediate' },
            { id: 'opt-3', text: 'Experienced', value: 'advanced' }
          ]
        },
        {
          id: 'q-goals',
          text: 'What do you hope to achieve with this program?',
          type: 'long_text',
          required: false
        },
        {
          id: 'q-commitment',
          text: 'How committed are you to completing this program?',
          type: 'scale',
          required: true,
          scaleMin: 1,
          scaleMax: 10,
          scaleLabels: { min: 'Not very committed', max: 'Very committed' }
        }
      ]
    };

    for (const program of programs) {
      // Only add if onboarding doesn't exist
      if (!program.onboarding || !program.onboarding.questions || program.onboarding.questions.length === 0) {
        await EquipService.updateEquip(program.id, { onboarding: defaultOnboarding });
        updatedCount++;
      }
    }

    return c.json({ 
      success: true, 
      message: `Added default onboarding to ${updatedCount} programs`,
      updatedCount 
    });
  } catch (error) {
    console.error('Add default onboarding error:', error);
    return c.json({ error: 'Failed to add default onboarding' }, 500);
  }
});

// ========================================
// ADMIN - ASSESSMENT MANAGEMENT
// ========================================

// The player reads `scoring.ranges`; the admin wizard only ever writes
// `resultCategories`. That mismatch left scoring.ranges permanently null on
// every assessment ever saved through admin, so the player fell through to
// a generic "Assessment completed" message regardless of what the admin
// authored. Derive ranges from resultCategories on every save so new
// content and edits stay correct without relying on a code-side preset.
// Band order is assumed low-to-high severity (true for every assessment
// audited so far), so the first band maps to 'success' and the last to
// 'error'.
/**
 * Project the v2 spec's bands down into the legacy `scoring.ranges` the player
 * still reads.
 *
 * `scoring.ranges` is **generated, never maintained**. Sleep briefly carried
 * two hand-written band sets with different interval semantics — profile bands
 * half-open (8-25, 25-33, 33-40) and `scoring.ranges` closed (8-24, 25-32,
 * 33-40). Both were correct and they looked wrong beside each other, which is
 * exactly how someone "fixes" one and silently breaks it. Deriving one from the
 * other leaves a single authority, and the derivation deletes itself when the
 * player learns to read `scores[]`.
 *
 * The conversion is mechanical, and it is the same rule every legacy band set
 * in this product needs, because they were all authored closed:
 *
 *     [a, b)  ->  [a, b-1]   for every band except the last
 *     [a, b]  ->  [a, b]     the last band keeps its ceiling
 *
 * Only applied to integer band edges. A `mean` score has decimal edges, and a
 * closed reader cannot express a half-open boundary at a decimal — the legacy
 * lookup takes the first matching band, so a value sitting exactly on an edge
 * would resolve to the lower band, the opposite of what half-open asserts.
 * Rather than emit a set that is wrong at one point, no projection is made.
 */
/** Ids of every saved scoring profile, for the score reference check. */
async function knownProfileIds(): Promise<Set<string> | null> {
  try {
    const rows = await kv.getByPrefix("scoring-profile:");
    return new Set((Array.isArray(rows) ? rows : []).map((p: any) => p?.id).filter(Boolean));
  } catch {
    return null; // Skip the reference check rather than reject on a read failure.
  }
}

async function deriveScoringRanges(assessment: any): Promise<any> {
  const scores = Array.isArray(assessment.scores) ? assessment.scores : [];
  const primary = scores.find((sc: any) => sc?.profile_id) ?? null;

  if (primary) {
    let profile: any = null;
    try {
      profile = await kv.get(`scoring-profile:${primary.profile_id}`);
    } catch { /* fall through to the legacy path */ }

    const bands = Array.isArray(profile?.bands) ? profile.bands : null;
    if (bands && bands.length > 0) {
      const ranges = projectBandsToClosedRanges(bands);
      if (ranges) {
        return {
          ...assessment,
          scoring: {
            ...(assessment.scoring || {}),
            ranges,
            // Marks this list as output. Editing it by hand is pointless — the
            // next save overwrites it from the bands.
            derived_from: `scoring-profile:${primary.profile_id}`,
          },
        };
      }
      // Decimal edges: projectBandsToClosedRanges returned null. Leave
      // whatever is there rather than emit a set that misbands the boundary.
      return assessment;
    }
  }

  // Legacy path, for assessments with no v2 spec yet.
  const categories = assessment.resultCategories;
  if (!Array.isArray(categories) || categories.length === 0) return assessment;

  const ranges = categories.map((cat: any, i: number) => ({
    min: cat.min,
    max: cat.max,
    label: cat.label,
    interpretation: cat.description || cat.label,
    icon: i === 0 ? 'success' : i === categories.length - 1 ? 'error' : 'warning',
  }));

  return { ...assessment, scoring: { ...(assessment.scoring || {}), ranges } };
}

// Create Assessment
app.post("/admin/assessments", requireAdmin, async (c) => {
  try {
    const data = await c.req.json();
    
    // Generate ID if not present
    const id = data.id || crypto.randomUUID();

    // A POST carrying an existing id overwrites that record, so guardrail 11
    // applies here too — this path used never to read the existing row at all.
    const priorForCreate = data.id
      ? await kv.get(`assessment_def:${id}`)
      : null;
    const immutabilityCreate = validateQuestionIdImmutability(priorForCreate, data);
    if (!immutabilityCreate.ok) {
      return c.json({
        error: "Question ids referenced by a saved score cannot be renamed or deleted",
        issues: immutabilityCreate.errors,
      }, 409);
    }
    const scoreCheckCreate = validateAssessmentScores(data?.scores, await knownProfileIds());
    if (!scoreCheckCreate.ok) {
      return c.json({ error: "Invalid scores[]", issues: scoreCheckCreate.errors }, 400);
    }

    const textChangesCreate = diffQuestionText(priorForCreate, data);
    if (textChangesCreate.length > 0 && Array.isArray(data.questions)) {
      const actor = (c.get('admin') as any)?.email || (c.get('userId') as any) || 'admin';
      data.questions = applyTextHistory(data.questions, textChangesCreate, String(actor));
      console.log(`[assessment ${id}] ${textChangesCreate.length} question text change(s) on create-overwrite`);
    }

    const assessment = await deriveScoringRanges({
      ...data,
      id,
      assessment_id: id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Write to BOTH prefixes so admin edits are immediately visible to public endpoint
    await kv.set(`assessment_def:${id}`, assessment);

    // Maintain the slug->id reverse index that /assessments/:id falls back to.
    // Mirrors the equip pattern in program-service.ts.
    if (assessment.slug) {
      await kv.set(`assessment_slug:${assessment.slug}`, id);
    }

    return c.json({ assessment });
  } catch (error) {
    console.error('Create assessment error:', error);
    return c.json({ error: 'Failed to create assessment' }, 500);
  }
});

// Update Assessment
app.put("/admin/assessments/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    // Get existing from either prefix
    const existing = await kv.get(`assessment_def:${id}`);

    // Guardrail 11 — question-id immutability. Enforced here, at the assessment
    // save, because this is where an id can actually disappear. Content is
    // mutable; identity is not.
    const merged: any = { ...(existing || {}), ...updates };
    const immutability = validateQuestionIdImmutability(existing, merged);
    if (!immutability.ok) {
      return c.json({
        error: "Question ids referenced by a saved score cannot be renamed or deleted",
        issues: immutability.errors,
      }, 409);
    }
    const scoreCheck = validateAssessmentScores(merged?.scores, await knownProfileIds());
    if (!scoreCheck.ok) {
      return c.json({ error: "Invalid scores[]", issues: scoreCheck.errors }, 400);
    }

    // Record question-text changes. Guardrail 11 permits them — content is
    // mutable — but nothing used to write down what a question previously said,
    // which is why recovering burnout-q9's wording meant tracing six backups.
    const textChanges = diffQuestionText(existing, merged);
    if (textChanges.length > 0 && Array.isArray((updates as any).questions)) {
      const actor = (c.get('admin') as any)?.email || (c.get('userId') as any) || 'admin';
      (updates as any).questions = applyTextHistory((updates as any).questions, textChanges, String(actor));
      console.log(`[assessment ${id}] ${textChanges.length} question text change(s): ` +
        textChanges.map((t) => t.question_id).join(', '));
    }
    if (immutability.newlyRetired.length > 0) {
      const prior: string[] = Array.isArray((existing as any)?.retired_question_ids)
        ? (existing as any).retired_question_ids : [];
      // The ledger only grows. A retired id stays listed forever so it can
      // never be reused, keeping the stored responses keyed to it resolvable.
      (updates as any).retired_question_ids = [...new Set([...prior, ...immutability.newlyRetired])];
    }

    const assessment = await deriveScoringRanges({
      ...(existing || {}),
      ...updates,
      id,
      assessment_id: id,
      updated_at: new Date().toISOString()
    });

    // Write to BOTH prefixes
    await kv.set(`assessment_def:${id}`, assessment);

    // Keep the slug->id reverse index in sync: drop the stale alias when the
    // slug changed, then (re)write the current one.
    if (existing?.slug && existing.slug !== assessment.slug) {
      await kv.del(`assessment_slug:${existing.slug}`);
    }
    if (assessment.slug) {
      await kv.set(`assessment_slug:${assessment.slug}`, id);
    }

    return c.json({ assessment });
  } catch (error) {
    console.error('Update assessment error:', error);
    return c.json({ error: 'Failed to update assessment' }, 500);
  }
});

// Delete Assessment
app.delete("/admin/assessments/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`🗑️  DELETE assessment requested: "${id}"`);
    
    // Fetch data BEFORE deleting so we can clean up slug aliases
    const existing = await kv.get(`assessment_def:${id}`);
    
    // ── Aggressive cleanup: find ALL KV keys that reference this assessment ──
    const strayKeys = await kv.findKeysBySubstring(id);
    // Only target assessment-related prefixes (don't nuke user results)
    const assessmentKeyPrefixes = ['assessment:', 'assessment_def:'];
    const keysToClean = strayKeys.filter(k =>
      assessmentKeyPrefixes.some(prefix => k.startsWith(prefix))
    );
    
    console.log(`   Found ${keysToClean.length} KV key(s) to clean: ${JSON.stringify(keysToClean)}`);
    
    // Always hard-delete — no more tombstones needed since assessments are 100% KV-backed
    for (const key of keysToClean) {
      await kv.del(key);
    }
    // Ensure canonical keys are deleted even if not found by scan
    await kv.del(`assessment_def:${id}`);
    console.log(`✅ Assessment hard-deleted: ${id} (${keysToClean.length} keys removed)`);
    
    // Also clean up any slug-based alias not caught by substring search
    if (existing?.slug) {
      // The reverse index is keyed by slug — this is the one that matters.
      await kv.del(`assessment_slug:${existing.slug}`);
      if (existing.slug !== id) {
        await kv.del(`assessment_def:${existing.slug}`);
      }
      console.log(`   Also cleaned slug alias: ${existing.slug}`);
    }

    // Flag dependent results rather than deleting them. These are the user's
    // own assessment history and must survive the definition being removed —
    // but without a marker they read as orphans pointing at a missing parent.
    let flagged = 0;
    try {
      const results = await kv.getKeyValuesByPrefix('assessment_result:');
      for (const { key, value } of results) {
        if (value?.assessment_id === id && !value.assessment_deleted) {
          await kv.set(key, {
            ...value,
            assessment_deleted: true,
            assessment_deleted_at: new Date().toISOString(),
            assessment_title_snapshot: existing?.title ?? null,
          });
          flagged++;
        }
      }
    } catch (e) {
      console.error('Failed to flag dependent assessment results:', e);
    }
    if (flagged) console.log(`   Flagged ${flagged} dependent result(s) as assessment_deleted`);

    return c.json({ success: true, keysRemoved: keysToClean.length, resultsFlagged: flagged });
  } catch (error) {
    console.error('Delete assessment error:', error);
    return c.json({ error: 'Failed to delete assessment' }, 500);
  }
});

// ========================================
// ADMIN - RESOURCE MANAGEMENT
// ========================================

app.get("/admin/resources", requireAdmin, async (c) => {
  try {
    const resources = await kv.getByPrefix("resource:");
    return c.json({ resources });
  } catch (error) {
    return c.json({ error: "Failed to list resources" }, 500);
  }
});

app.post("/admin/resources", requireAdmin, async (c) => {
  try {
    const data = await c.req.json();
    const id = data.id || crypto.randomUUID();
    
    const resource = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`resource:${id}`, resource);
    return c.json({ resource });
  } catch (error) {
    return c.json({ error: "Failed to create resource" }, 500);
  }
});

app.put("/admin/resources/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`resource:${id}`);
    if (!existing) return c.json({ error: "Resource not found" }, 404);
    
    const resource = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`resource:${id}`, resource);
    return c.json({ resource });
  } catch (error) {
    return c.json({ error: "Failed to update resource" }, 500);
  }
});

app.delete("/admin/resources/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`resource:${id}`);
    console.log(`Resource deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete resource" }, 500);
  }
});

// ========================================
// ADMIN - CATEGORY MANAGEMENT
// ========================================

// Allow read access to authenticated users
app.get("/admin/categories", requireAuth, async (c) => {
  try {
    const categories = await kv.getByPrefix("category:");
    return c.json({ categories });
  } catch (error) {
    return c.json({ error: "Failed to list categories" }, 500);
  }
});

app.post("/admin/categories", requireAdmin, async (c) => {
  try {
    const data = await c.req.json();
    const id = data.id || crypto.randomUUID();
    
    const category = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`category:${id}`, category);
    return c.json({ category });
  } catch (error) {
    return c.json({ error: "Failed to create category" }, 500);
  }
});

app.put("/admin/categories/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`category:${id}`);
    if (!existing) return c.json({ error: "Category not found" }, 404);
    
    const category = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`category:${id}`, category);
    return c.json({ category });
  } catch (error) {
    return c.json({ error: "Failed to update category" }, 500);
  }
});

app.delete("/admin/categories/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`category:${id}`);
    if (!existing) return c.json({ error: "Category not found" }, 404);

    // Refuse if resources still reference this category. They store the
    // category's slug/name rather than its id, so match on those — deleting
    // anyway would leave those resources pointing at nothing.
    const refValues = [existing.slug, existing.name].filter(Boolean);
    if (refValues.length > 0) {
      const resources = await kv.getByPrefix('resource:');
      const referencing = resources.filter((r: any) => r && refValues.includes(r.category));
      if (referencing.length > 0) {
        return c.json({
          error: 'Category is in use',
          detail: `${referencing.length} resource(s) still reference "${existing.slug ?? existing.name}". Reassign them before deleting.`,
          resources: referencing.slice(0, 20).map((r: any) => ({ id: r.id, title: r.title })),
        }, 409);
      }
    }

    await kv.del(`category:${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete category" }, 500);
  }
});

// ========================================
// ADMIN - MEDIA MANAGEMENT
// ========================================

app.get("/admin/media/files", requireAdmin, async (c) => {
  try {
    const files = await kv.getByPrefix("media:");
    return c.json({ files });
  } catch (error) {
    return c.json({ error: "Failed to list media files" }, 500);
  }
});

app.delete("/admin/media/files/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    
    // Load metadata to get bucket and file path for storage deletion
    const fileMetadata = await kv.get(`media:${id}`);
    
    if (fileMetadata && fileMetadata.bucket && fileMetadata.filePath) {
      // Delete from Supabase Storage
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      const { error: storageError } = await supabase.storage
        .from(fileMetadata.bucket)
        .remove([fileMetadata.filePath]);
      if (storageError) {
        console.error(`Storage deletion warning for media:${id}:`, storageError);
        // Continue to delete KV even if storage delete fails
      }
    }
    
    // Delete metadata from KV
    await kv.del(`media:${id}`);
    console.log(`🗑️ Media deleted: ${fileMetadata?.fileName || id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete media error:", error);
    return c.json({ error: "Failed to delete media file" }, 500);
  }
});

app.post("/admin/media/upload", requireAdmin, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    const bucket = (body['bucket'] as string) || 'make-cc205da9-media';

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Create Supabase client for storage operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Ensure bucket exists (idempotent)
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b: any) => b.name === bucket);
    if (!bucketExists) {
      console.log(`📦 Creating media bucket: ${bucket}`);
      const { error: bucketError } = await supabase.storage.createBucket(bucket, {
        public: false,
        fileSizeLimit: 52428800 // 50MB
      });
      if (bucketError) {
        console.error('Bucket creation error:', bucketError);
        return c.json({ error: 'Failed to create storage bucket' }, 500);
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileExt = file.name.split('.').pop() || 'bin';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Convert File to Uint8Array for upload
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return c.json({ error: `Upload failed: ${uploadError.message}` }, 500);
    }

    // Generate signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 31536000); // 1 year

    if (!signedUrlData) {
      console.error('Failed to generate signed URL for uploaded file');
      return c.json({ error: 'File uploaded but failed to generate access URL' }, 500);
    }

    const id = `${timestamp}-${randomStr}`;
    const mediaFile = {
      id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath,
      bucket,
      url: signedUrlData.signedUrl,
      uploadedAt: new Date().toISOString()
    };

    await kv.set(`media:${id}`, mediaFile);

    console.log(`📤 Media uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB) → ${filePath}`);
    return c.json(mediaFile);
  } catch (error) {
    console.error("Media upload error:", error);
    return c.json({ error: `Failed to upload file: ${error}` }, 500);
  }
});

// ========================================
// ADMIN - BACKUP & RESTORE
// ========================================

// Create Backup (Internal Checkpoint)
app.post("/admin/backup/create-checkpoint", requireAdmin, async (c) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup_${timestamp}`;
    
    // Gather all entity data for backup
    const entities = {
      equips: await kv.getByPrefix('equip:'),
      days: await kv.getByPrefix('day:'),
      blocks: await kv.getByPrefix('block:'),
      datasets: await kv.getByPrefix('dataset:'),
      assessments: await kv.getByPrefix('assessment_def:'),
      resources: await kv.getByPrefix('resource:'),
      pages: await kv.getByPrefix('page:'), // caution: page_slug logic
      media: await kv.getByPrefix('media:'),
      categories: await kv.getByPrefix('category:'),
      recommendationRules: await kv.get('recommendation_rules')
    };
    
    await kv.set(backupId, {
      timestamp: new Date().toISOString(),
      data: entities,
      version: '1.0'
    });
    
    // Add to backup index
    const backups = await kv.get('sys_backups') || [];
    backups.unshift({ id: backupId, timestamp: new Date().toISOString() });
    await kv.set('sys_backups', backups.slice(0, 10)); // Keep last 10
    
    return c.json({ success: true, backupId, message: "Checkpoint created" });
    
  } catch (error) {
    console.error("Backup error:", error);
    return c.json({ error: "Failed to create checkpoint" }, 500);
  }
});

// List Checkpoints
app.get("/admin/backup/checkpoints", requireAdmin, async (c) => {
  try {
    const backups = await kv.get('sys_backups') || [];
    return c.json({ backups });
  } catch (error) {
    return c.json({ error: "Failed to list checkpoints" }, 500);
  }
});

// Restore Checkpoint
app.post("/admin/backup/restore-checkpoint", requireAdmin, async (c) => {
  try {
    const { backupId } = await c.req.json();
    const backup = await kv.get(backupId);
    
    if (!backup || !backup.data) {
      return c.json({ error: "Backup not found or invalid" }, 404);
    }
    
    const { 
      equips, days, blocks, datasets, 
      assessments, resources, pages, media, categories, 
      recommendationRules 
    } = backup.data;
    
    // 1. Restore Equips
    if (equips) {
        for (const item of equips) {
            if (item.id) {
                await kv.set(`equip:${item.id}`, item);
                // FIXED 2026-09-04. This wrote `equip:` only, leaving
                // `equip_program:` — the copy the PLAYER reads
                // (`index.tsx:1203`, `ikan-score-routes.ts:331`,
                // `reminder-routes.ts:149`) — pointing at pre-restore content.
                // `program-service.ts:87-88` dual-writes both on every normal
                // save; a restore is the path that bypassed it, so a restore
                // silently rolled back the admin's view and not the user's.
                await kv.set(`equip_program:${item.id}`, item);
                if (item.slug) await kv.set(`equip_slug:${item.slug}`, item.id);
                // Reset index
                await kv.set(`idx_equip_days:${item.id}`, []);
            }
        }
    }
    
    // 2. Restore Days & Rebuild Equip Index
    if (days) {
        for (const item of days) {
            if (item.id) {
                await kv.set(`day:${item.id}`, item);
                await kv.set(`idx_day_blocks:${item.id}`, []); // Reset block index
                
                if (item.equip_id) {
                    const idx = await kv.get(`idx_equip_days:${item.equip_id}`) || [];
                    if (!idx.includes(item.id)) {
                        idx.push(item.id);
                        await kv.set(`idx_equip_days:${item.equip_id}`, idx);
                    }
                }
            }
        }
    }
    
    // 3. Restore Blocks & Rebuild Day Index
    if (blocks) {
        for (const item of blocks) {
            if (item.id) {
                await kv.set(`block:${item.id}`, item);
                
                if (item.equip_day_id) {
                    const idx = await kv.get(`idx_day_blocks:${item.equip_day_id}`) || [];
                    if (!idx.includes(item.id)) {
                        idx.push(item.id);
                        await kv.set(`idx_day_blocks:${item.equip_day_id}`, idx);
                    }
                }
            }
        }
    }
    
    // 4. Other Entities
    if (datasets) {
        for (const item of datasets) {
             if (item.id) {
                 await kv.set(`dataset:${item.id}`, item);
                 if (item.dataset_key) await kv.set(`dataset_key:${item.dataset_key}`, item.id);
             }
        }
    }
    
    if (assessments) {
        for (const item of assessments) {
            if (item.id) await kv.set(`assessment_def:${item.id}`, item);
        }
    }
    
    if (resources) {
        for (const item of resources) {
            if (item.id) await kv.set(`resource:${item.id}`, item);
        }
    }
    
    if (pages) {
        for (const item of pages) {
            if (item.id) await kv.set(`page:${item.id}`, item);
            if (item.slug) await kv.set(`page_slug:${item.slug}`, item.id);
        }
    }
    
    if (media) {
        for (const item of media) {
            if (item.id) await kv.set(`media:${item.id}`, item);
        }
    }
    
    if (categories) {
        for (const item of categories) {
            if (item.id) await kv.set(`category:${item.id}`, item);
        }
    }
    
    if (recommendationRules) {
        await kv.set('recommendation_rules', recommendationRules);
    }
    
    return c.json({ success: true, message: "System restored successfully" });
    
  } catch (error) {
    console.error("Restore error:", error);
    return c.json({ error: "Failed to restore checkpoint" }, 500);
  }
});

// ========================================
// ADMIN - ANALYTICS
// ========================================

app.get("/admin/analytics", requireAdmin, async (c) => {
  try {
    const period = c.req.query("period") || "week";
    
    const users = await kv.getByPrefix("user:");
    const resources = await kv.getByPrefix("resource:");
    const libraryResources = await kv.getByPrefix("library:resource:");
    const assessments = await kv.getByPrefix("assessment_def:");
    const enrollments = await kv.getByPrefix("enrollment:");
    const journalEntries = await kv.getByPrefix("journal:");
    
    // Calculate active users (users updated recently)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const activeUsers7d = users.filter((u: any) => {
      if (!u.updated_at) return false;
      return new Date(u.updated_at) > sevenDaysAgo;
    }).length;

    const activeUsers30d = users.filter((u: any) => {
      if (!u.updated_at) return false;
      return new Date(u.updated_at) > thirtyDaysAgo;
    }).length;

    // Real activity chart — group journal entries by date for the last 30 days
    const activityMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      activityMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const entry of journalEntries) {
      const date = (entry.date || entry.created_at || '').slice(0, 10);
      if (date in activityMap) {
        activityMap[date]++;
      }
    }
    const activityChart = Object.entries(activityMap).map(([date, count]) => ({ date, count }));

    // Real top resources — pull real view counters from analytics:counter:{id} keys
    const allResources = [...resources, ...libraryResources];
    const uniqueResources = Array.from(new Map(allResources.filter((r: any) => r?.id).map((r: any) => [r.id, r])).values());

    // Fetch real view counters for all resources
    const counterKeys = uniqueResources.map((r: any) => `analytics:counter:${r.id}`);
    let counters: any[] = [];
    if (counterKeys.length > 0) {
      try {
        counters = await kv.mget(counterKeys);
      } catch (e) {
        console.error("Failed to fetch resource counters:", e);
        counters = counterKeys.map(() => null);
      }
    }

    const resourcesWithViews = uniqueResources.map((r: any, i: number) => ({
      id: r.id,
      title: r.title || 'Untitled',
      views: (counters[i] as any)?.views || 0
    }));

    // Sort by views descending, take top 5
    const topResources = resourcesWithViews
      .sort((a: any, b: any) => b.views - a.views)
      .slice(0, 5);

    return c.json({
      analytics: {
        summary: {
          activeUsers7d,
          activeUsers30d,
          totalUsers: users.length,
          totalResources: uniqueResources.length,
          totalAssessments: assessments.filter((a: any) => !a.deleted).length,
          totalEnrollments: enrollments.length,
          totalJournalEntries: journalEntries.length,
        },
        activityChart,
        topResources
      }
    });

  } catch (error) {
    console.error("Analytics error:", error);
    return c.json({ error: "Failed to generate analytics" }, 500);
  }
});

// ========================================
// ADMIN - KV AUDIT (Orphan Detection)
// ========================================

app.get("/admin/kv-audit", requireAdmin, async (c) => {
  try {
    const auditSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ─── 1. Fetch ALL keys from the KV table ─────────────────────
    // Paginate in batches of 1000 to handle large tables
    let allRows: { key: string; value: any }[] = [];
    let offset = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await auditSupabase
        .from('kv_store_cc205da9')
        .select('key, value')
        .range(offset, offset + batchSize - 1)
        .order('key');

      if (error) throw new Error(`KV scan error at offset ${offset}: ${error.message}`);
      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        allRows = allRows.concat(data);
        offset += batchSize;
        if (data.length < batchSize) hasMore = false;
      }
    }

    // ─── 2. Categorize keys by prefix ──────────────────────────
    const KNOWN_PREFIXES = [
      // System / content entities (admin-managed)
      'equip:', 'equip_slug:', 'idx_equip_days:', 'day:', 'idx_day_blocks:',
      'block:', 'dataset:', 'dataset_key:', 'assessment_def:', 'resource:',
      'category:', 'media:', 'page:', 'page_slug:', 'cms_page:', 'content:',
      'content_slug:', 'recommendation_rule:', 'newsletter:', 'contact_submission:',
      'contact_submissions:',
      // User-facing entity copies (multi-tenant sync)
      'equip_program:', 'equip_program_by_slug:', 'library:resource:',
      // Retired 2026-09-03: `assessment:` was a write-only mirror of
      // assessment_def:, read by nothing. Rows deleted, writers and syncs
      // removed. Listed so the prefix stays known if a row ever reappears.
      'assessment:',
      // User-scoped
      'user:', 'journal:', 'journal_by_user:', 'tracker:', 'enrollment:',
      'user_enrollment:', 'progress:', 'assessment_result:', 'assessment-result:',
      'assessment_response_by_user:', 'assessment_response:', 'program-progress:',
      'email-change:',
      // Professionals / consultants
      'professional:', 'professional:pending-', 'professional_application:', 'consultant:',
      // Activity tracking
      'activity:read:', 'activity:user:', 'user_activity:', 'ikan_score:',
      // Admin notifications
      'admin_notification:',
      // Payments
      'payment:',
      // Health Connect
      'hc_status:', 'hc_data:', 'hc_history:',
      // Communication / Brevo
      'comm-config:', 'email_queue:', 'brevo-config', 'brevo-logs',
      // Settings
      'settings:site',
      // Audit trail
      'audit:',
      // System
      'sys_backups', 'backup_', 'recommendation_rules', 'sys_audit_snapshots',
      // Monitoring
      'api-log:', 'metrics:',
      // Mood / scales
      'mood_type:', 'checkin_scale:', 'mood_config',
      // Sessions
      'active_sessions:',
      // General activity catch-all (MUST be after activity:read: and activity:user:)
      'activity:',
    ];

    const categorized: Record<string, { count: number; keys: string[]; sampleValues: any[] }> = {};
    const uncategorized: { key: string; value: any }[] = [];

    for (const row of allRows) {
      let matched = false;
      for (const prefix of KNOWN_PREFIXES) {
        if (row.key === prefix.replace(/:$/, '') || row.key.startsWith(prefix)) {
          if (!categorized[prefix]) {
            categorized[prefix] = { count: 0, keys: [], sampleValues: [] };
          }
          categorized[prefix].count++;
          categorized[prefix].keys.push(row.key);
          if (categorized[prefix].sampleValues.length < 2) {
            categorized[prefix].sampleValues.push({ key: row.key, valuePreview: summarizeValue(row.value) });
          }
          matched = true;
          break;
        }
      }
      if (!matched) {
        uncategorized.push({ key: row.key, value: summarizeValue(row.value) });
      }
    }

    // ─── 3. Orphan detection ────────────────────────────────────
    const orphans: { key: string; reason: string; category: string }[] = [];

    // Build lookup maps
    const keySet = new Set(allRows.map(r => r.key));
    const rowMap = new Map(allRows.map(r => [r.key, r.value]));

    // 3a. equip_slug → equip orphans
    for (const row of allRows.filter(r => r.key.startsWith('equip_slug:'))) {
      const equipId = row.value;
      if (typeof equipId === 'string' && !keySet.has(`equip:${equipId}`)) {
        orphans.push({ key: row.key, reason: `Points to equip:${equipId} which does not exist`, category: 'slug-dangling' });
      }
    }

    // 3b. idx_equip_days → equip orphans
    for (const row of allRows.filter(r => r.key.startsWith('idx_equip_days:'))) {
      const equipId = row.key.replace('idx_equip_days:', '');
      if (!keySet.has(`equip:${equipId}`)) {
        orphans.push({ key: row.key, reason: `Index references equip:${equipId} which does not exist`, category: 'index-dangling' });
      }
      // Check each day ID in the array
      if (Array.isArray(row.value)) {
        for (const dayId of row.value) {
          if (!keySet.has(`day:${dayId}`)) {
            orphans.push({ key: row.key, reason: `Index contains day:${dayId} which does not exist`, category: 'index-stale-ref' });
          }
        }
      }
    }

    // 3c. idx_day_blocks → day orphans
    for (const row of allRows.filter(r => r.key.startsWith('idx_day_blocks:'))) {
      const dayId = row.key.replace('idx_day_blocks:', '');
      if (!keySet.has(`day:${dayId}`)) {
        orphans.push({ key: row.key, reason: `Index references day:${dayId} which does not exist`, category: 'index-dangling' });
      }
      if (Array.isArray(row.value)) {
        for (const blockId of row.value) {
          if (!keySet.has(`block:${blockId}`)) {
            orphans.push({ key: row.key, reason: `Index contains block:${blockId} which does not exist`, category: 'index-stale-ref' });
          }
        }
      }
    }

    // 3d. page_slug → page orphans
    for (const row of allRows.filter(r => r.key.startsWith('page_slug:'))) {
      const pageId = row.value;
      if (typeof pageId === 'string' && !keySet.has(`page:${pageId}`)) {
        orphans.push({ key: row.key, reason: `Points to page:${pageId} which does not exist`, category: 'slug-dangling' });
      }
    }

    // 3e. content_slug → content orphans
    for (const row of allRows.filter(r => r.key.startsWith('content_slug:'))) {
      const contentId = row.value;
      if (typeof contentId === 'string' && !keySet.has(`content:${contentId}`)) {
        orphans.push({ key: row.key, reason: `Points to content:${contentId} which does not exist`, category: 'slug-dangling' });
      }
    }

    // 3f. dataset_key → dataset orphans
    for (const row of allRows.filter(r => r.key.startsWith('dataset_key:'))) {
      const datasetId = row.value;
      if (typeof datasetId === 'string' && !keySet.has(`dataset:${datasetId}`)) {
        orphans.push({ key: row.key, reason: `Points to dataset:${datasetId} which does not exist`, category: 'slug-dangling' });
      }
    }

    // 3g. Days without parent equip
    for (const row of allRows.filter(r => r.key.startsWith('day:') && !r.key.startsWith('day_'))) {
      const val = row.value;
      if (val && val.equip_id && !keySet.has(`equip:${val.equip_id}`)) {
        orphans.push({ key: row.key, reason: `Day references equip:${val.equip_id} which does not exist`, category: 'entity-orphan' });
      }
    }

    // 3h. Blocks without parent day
    for (const row of allRows.filter(r => r.key.startsWith('block:'))) {
      const val = row.value;
      if (val && val.equip_day_id && !keySet.has(`day:${val.equip_day_id}`)) {
        orphans.push({ key: row.key, reason: `Block references day:${val.equip_day_id} which does not exist`, category: 'entity-orphan' });
      }
    }

    // 3i. Enrollment referencing deleted equips
    for (const row of allRows.filter(r => r.key.startsWith('enrollment:'))) {
      const val = row.value;
      if (val && val.equip_id && !keySet.has(`equip:${val.equip_id}`)) {
        orphans.push({ key: row.key, reason: `Enrollment references equip:${val.equip_id} which does not exist`, category: 'user-data-orphan' });
      }
    }

    // 3j. journal_by_user without matching journal entry
    for (const row of allRows.filter(r => r.key.startsWith('journal_by_user:'))) {
      const val = row.value;
      if (val && val.journal_entry_id && !keySet.has(`journal:${val.journal_entry_id}`)) {
        orphans.push({ key: row.key, reason: `Index references journal:${val.journal_entry_id} which does not exist`, category: 'user-data-orphan' });
      }
    }

    // ─── 4. Naming inconsistencies ────────────────────────────
    const inconsistencies: { issue: string; keys: string[] }[] = [];

    // assessment_result: vs assessment-result: (underscore vs hyphen)
    const underscoreResults = allRows.filter(r => r.key.startsWith('assessment_result:'));
    const hyphenResults = allRows.filter(r => r.key.startsWith('assessment-result:'));
    if (underscoreResults.length > 0 && hyphenResults.length > 0) {
      inconsistencies.push({
        issue: 'Mixed naming convention: assessment_result: (underscore) and assessment-result: (hyphen) both exist',
        keys: [...underscoreResults.slice(0, 3).map(r => r.key), ...hyphenResults.slice(0, 3).map(r => r.key)]
      });
    }

    // program-progress: vs progress: (different prefix for same concept?)
    const programProgress = allRows.filter(r => r.key.startsWith('program-progress:'));
    const progressKeys = allRows.filter(r => r.key.startsWith('progress:'));
    if (programProgress.length > 0 && progressKeys.length > 0) {
      inconsistencies.push({
        issue: 'Mixed naming: program-progress: and progress: both exist for progress tracking',
        keys: [...programProgress.slice(0, 3).map(r => r.key), ...progressKeys.slice(0, 3).map(r => r.key)]
      });
    }

    // ─── 5. Growth warnings (unbounded) ─────────────────────
    const growthWarnings: { prefix: string; count: number; warning: string }[] = [];

    const auditKeys = allRows.filter(r => r.key.startsWith('audit:'));
    if (auditKeys.length > 100) {
      growthWarnings.push({ prefix: 'audit:', count: auditKeys.length, warning: 'Audit trail is growing unbounded — consider periodic pruning' });
    }

    const contactKeys = allRows.filter(r => r.key.startsWith('contact_submission:') || r.key.startsWith('contact_submissions:'));
    if (contactKeys.length > 200) {
      growthWarnings.push({ prefix: 'contact_*:', count: contactKeys.length, warning: 'Contact submissions accumulating — consider archival' });
    }

    const backupKeys = allRows.filter(r => r.key.startsWith('backup_'));
    if (backupKeys.length > 10) {
      growthWarnings.push({ prefix: 'backup_*', count: backupKeys.length, warning: 'Too many backup snapshots stored in KV — old ones should be cleaned' });
    }

    // Activity tracking keys (write-only, unbounded)
    const activityReadKeys = allRows.filter(r => r.key.startsWith('activity:read:'));
    if (activityReadKeys.length > 200) {
      growthWarnings.push({ prefix: 'activity:read:', count: activityReadKeys.length, warning: 'Read-activity records are write-only and never pruned — consider periodic cleanup' });
    }

    const userActivityKeys = allRows.filter(r => r.key.startsWith('user_activity:'));
    if (userActivityKeys.length > 200) {
      growthWarnings.push({ prefix: 'user_activity:', count: userActivityKeys.length, warning: 'User activity logs growing unbounded — one key per action per user' });
    }

    // Admin notifications (never pruned)
    const adminNotifKeys = allRows.filter(r => r.key.startsWith('admin_notification:'));
    if (adminNotifKeys.length > 50) {
      growthWarnings.push({ prefix: 'admin_notification:', count: adminNotifKeys.length, warning: 'Admin notifications are never pruned. Read notifications stay forever.' });
    }

    // Email queue (write-only, never processed)
    const emailQueueKeys = allRows.filter(r => r.key.startsWith('email_queue:'));
    if (emailQueueKeys.length > 0) {
      growthWarnings.push({ prefix: 'email_queue:', count: emailQueueKeys.length, warning: 'Email queue entries are written but never processed or cleaned in current code' });
    }

    // API logs and metrics
    const apiLogKeys = allRows.filter(r => r.key.startsWith('api-log:'));
    if (apiLogKeys.length > 1000) {
      growthWarnings.push({ prefix: 'api-log:', count: apiLogKeys.length, warning: 'API logs exceeding 1000 entries — auto-prune may not be keeping up' });
    }

    // Multi-tenant prefix mismatch warnings
    const equipAdminCount = allRows.filter(r => r.key.startsWith('equip:') && !r.key.startsWith('equip_')).length;
    const equipUserCount = allRows.filter(r => r.key.startsWith('equip_program:')).length;
    if (equipAdminCount > 0 && equipUserCount === 0) {
      growthWarnings.push({ prefix: 'equip_program:', count: 0, warning: `⚠️ CRITICAL: ${equipAdminCount} admin programs (equip:) exist but 0 user-facing copies (equip_program:). Users cannot see any programs. Run "Sync Prefixes" to fix.` });
    }

    // The assessment_def: → assessment: parity check is gone with the mirror
    // (2026-09-03). It asserted that an empty `assessment:` meant users could
    // not see assessments — never true, since the player reads assessment_def:
    // directly — and told the admin to run a "Sync Prefixes" that no longer
    // exists. This was a twin of the check in kv-audit-routes.ts; both are
    // removed. The equip: → equip_program: check above is a DIFFERENT mirror
    // that is still live, so it stays.

    // ─── 6. User data summary (multi-tenant) ──────────────
    const userKeys = allRows.filter(r => r.key.startsWith('user:'));
    const userIds = userKeys.map(r => r.key.replace('user:', ''));

    // For each user, count their data footprint
    const userDataFootprint: { userId: string; email?: string; keyCount: number; prefixes: Record<string, number> }[] = [];
    const USER_DATA_PREFIXES = [
      'journal_by_user:', 'journal:', 'tracker:', 'enrollment:', 'user_enrollment:',
      'progress:', 'assessment_result:', 'assessment-result:', 'assessment_response_by_user:',
      'program-progress:', 'audit:', 'email-change:',
      'user_activity:', 'activity:user:', 'hc_status:', 'hc_data:', 'hc_history:',
      'payment:'
    ];

    for (const uid of userIds.slice(0, 50)) { // Cap at 50 users for performance
      const prefixCounts: Record<string, number> = {};
      let total = 1; // the user: key itself
      for (const row of allRows) {
        for (const prefix of USER_DATA_PREFIXES) {
          if (row.key.includes(uid) && row.key.startsWith(prefix)) {
            prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
            total++;
          }
        }
      }
      const userVal = rowMap.get(`user:${uid}`);
      userDataFootprint.push({
        userId: uid,
        email: userVal?.email,
        keyCount: total,
        prefixes: prefixCounts
      });
    }

    // Sort by footprint descending
    userDataFootprint.sort((a, b) => b.keyCount - a.keyCount);

    // ─── 7. Soft-deleted entities still in KV ────────────
    const softDeleted: string[] = [];
    for (const row of allRows) {
      if (row.value && typeof row.value === 'object' && row.value.deleted === true) {
        softDeleted.push(row.key);
      }
    }

    // ─── Response ──────────────────────────────────────────
    return c.json({
      audit: {
        timestamp: new Date().toISOString(),
        totalKeys: allRows.length,
        categorized: Object.fromEntries(
          Object.entries(categorized).map(([k, v]) => [k, { count: v.count, samples: v.sampleValues }])
        ),
        uncategorizedKeys: uncategorized.slice(0, 50),
        uncategorizedCount: uncategorized.length,
        orphans,
        orphanCount: orphans.length,
        inconsistencies,
        growthWarnings,
        softDeleted,
        softDeletedCount: softDeleted.length,
        userDataFootprint: userDataFootprint.slice(0, 20),
        totalUsers: userIds.length,
      }
    });

  } catch (error) {
    console.error("KV Audit error:", error);
    return c.json({ error: `KV Audit failed: ${error}` }, 500);
  }
});

// ─── KV Audit: Cleanup orphaned keys ───────────────────────────
app.post("/admin/kv-audit/cleanup", requireAdmin, async (c) => {
  try {
    const { keys, dryRun = true } = await c.req.json();

    if (!Array.isArray(keys) || keys.length === 0) {
      return c.json({ error: 'No keys provided for cleanup' }, 400);
    }

    // Safety cap
    if (keys.length > 200) {
      return c.json({ error: 'Too many keys (max 200 per batch)' }, 400);
    }

    if (dryRun) {
      return c.json({ success: true, dryRun: true, wouldDelete: keys.length, keys });
    }

    // Actually delete
    const deleted: string[] = [];
    const failed: { key: string; error: string }[] = [];

    for (const key of keys) {
      try {
        await kv.del(key);
        deleted.push(key);
      } catch (err) {
        failed.push({ key, error: String(err) });
      }
    }

    return c.json({ success: true, dryRun: false, deleted: deleted.length, failed, deletedKeys: deleted });

  } catch (error) {
    console.error("KV Cleanup error:", error);
    return c.json({ error: `KV Cleanup failed: ${error}` }, 500);
  }
});

// ─── KV Audit: Prune audit trail keys older than N days ────────
app.post("/admin/kv-audit/prune-audit-trail", requireAdmin, async (c) => {
  try {
    const { olderThanDays = 30, dryRun = true } = await c.req.json();
    
    const auditSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Fetch all audit: keys
    const { data: rows, error: fetchErr } = await auditSupabase
      .from('kv_store_cc205da9')
      .select('key, value')
      .like('key', 'audit:%');
    
    if (fetchErr) throw new Error(`Fetch audit keys error: ${fetchErr.message}`);
    if (!rows || rows.length === 0) {
      return c.json({ success: true, message: 'No audit trail keys found', pruned: 0, total: 0 });
    }

    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const toPrune: string[] = [];

    for (const row of rows) {
      const val = row.value;
      const ts = val?.timestamp || val?.created_at || val?.date;
      if (ts) {
        const d = new Date(ts);
        if (!isNaN(d.getTime()) && d < cutoff) {
          toPrune.push(row.key);
        }
      }
    }

    if (dryRun) {
      return c.json({ success: true, dryRun: true, wouldPrune: toPrune.length, total: rows.length, cutoffDate: cutoff.toISOString() });
    }

    // Actually delete
    let deleted = 0;
    for (const key of toPrune) {
      try {
        await kv.del(key);
        deleted++;
      } catch { /* skip failures */ }
    }

    return c.json({ success: true, dryRun: false, pruned: deleted, total: rows.length, cutoffDate: cutoff.toISOString() });

  } catch (error) {
    console.error("Audit trail prune error:", error);
    return c.json({ error: `Audit trail prune failed: ${error}` }, 500);
  }
});

// ─── KV Audit: Migrate naming (rename keys from one prefix to another) ──
app.post("/admin/kv-audit/migrate-naming", requireAdmin, async (c) => {
  try {
    const { fromPrefix, toPrefix, dryRun = true } = await c.req.json();
    
    if (!fromPrefix || !toPrefix) {
      return c.json({ error: 'fromPrefix and toPrefix are required' }, 400);
    }

    const auditSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: rows, error: fetchErr } = await auditSupabase
      .from('kv_store_cc205da9')
      .select('key, value')
      .like('key', `${fromPrefix}%`);
    
    if (fetchErr) throw new Error(`Fetch keys error: ${fetchErr.message}`);
    if (!rows || rows.length === 0) {
      return c.json({ success: true, message: `No keys found with prefix "${fromPrefix}"`, migrated: 0 });
    }

    if (dryRun) {
      const preview = rows.slice(0, 10).map(r => ({
        from: r.key,
        to: r.key.replace(fromPrefix, toPrefix)
      }));
      return c.json({ success: true, dryRun: true, wouldMigrate: rows.length, preview });
    }

    // Perform migration: copy to new key, delete old key
    let migrated = 0;
    const errors: { key: string; error: string }[] = [];

    for (const row of rows) {
      try {
        const newKey = row.key.replace(fromPrefix, toPrefix);
        await kv.set(newKey, row.value);
        await kv.del(row.key);
        migrated++;
      } catch (err) {
        errors.push({ key: row.key, error: String(err) });
      }
    }

    return c.json({ success: true, dryRun: false, migrated, errors: errors.length > 0 ? errors : undefined });

  } catch (error) {
    console.error("Naming migration error:", error);
    return c.json({ error: `Naming migration failed: ${error}` }, 500);
  }
});

// ── KV Audit: Save snapshot for trend tracking ────────────────
app.post("/admin/kv-audit/save-snapshot", requireAdmin, async (c) => {
  try {
    const { score, totalKeys, orphanCount, inconsistencyCount, growthWarningCount, softDeletedCount, uncategorizedCount } = await c.req.json();
    
    const snapshots = await kv.get('sys_audit_snapshots') || [];
    
    snapshots.push({
      timestamp: new Date().toISOString(),
      score,
      totalKeys,
      orphanCount,
      inconsistencyCount,
      growthWarningCount,
      softDeletedCount,
      uncategorizedCount
    });

    // Keep last 30 snapshots
    const trimmed = snapshots.slice(-30);
    await kv.set('sys_audit_snapshots', trimmed);

    return c.json({ success: true, snapshotCount: trimmed.length });

  } catch (error) {
    console.error("Save audit snapshot error:", error);
    return c.json({ error: `Save snapshot failed: ${error}` }, 500);
  }
});

app.get("/admin/kv-audit/trends", requireAdmin, async (c) => {
  try {
    const snapshots = await kv.get('sys_audit_snapshots') || [];
    return c.json({ snapshots });
  } catch (error) {
    return c.json({ error: `Fetch trends failed: ${error}` }, 500);
  }
});

// ─── KV Audit: Sync admin prefixes to user-facing prefixes ─────
// Fixes the multi-tenant mismatch where admin writes equip:, assessment_def:, resource:
// but users read equip_program:, assessment:, library:resource:
app.post("/admin/kv-audit/sync-prefixes", requireAdmin, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const dryRun = body.dryRun !== false; // Default to dry run
    const actions: string[] = [];
    let synced = 0;

    // ── Sync equip: → equip_program: ──────────────────────
    //
    // FIXED 2026-09-04, and note the irony: the comment immediately below
    // records that `assessment:` died of a `if (!existing)` guard — "a sync
    // that cannot re-sync is how day:/block: died" — while this loop, four
    // lines above it, had exactly the same defect. It created a missing mirror
    // and never refreshed a stale one, so `equip_program:` could drift from
    // `equip:` forever and this endpoint would report nothing to do.
    //
    // Now it compares and refreshes. `equip_program:` is the copy the player
    // reads, so it must equal `equip:`, always.
    const equips = await kv.getByPrefix("equip:");
    for (const equip of equips) {
      if (!equip || !equip.id) continue;
      const existingProgram = await kv.get(`equip_program:${equip.id}`);
      const stale = existingProgram &&
        JSON.stringify(existingProgram) !== JSON.stringify(equip);
      if (!existingProgram || stale) {
        actions.push(
          `${existingProgram ? 'REFRESH stale' : 'CREATE missing'} ` +
          `equip_program:${equip.id} from equip:${equip.id}`
        );
        if (!dryRun) await kv.set(`equip_program:${equip.id}`, equip);
        synced++;
      }
    }

    // `equip_program_by_slug:` is deliberately NOT written here any more.
    //
    // It was a full programme copy maintained to answer a lookup that
    // `equip_slug:` already answers, and its only reader (`index.tsx`, the
    // enrolment route) now resolves through `equip_slug:` first and treats this
    // prefix as a loudly-warned last resort.
    //
    // It must also not be refreshed from `equip:` wholesale: it is an OLDER,
    // LARGER snapshot holding 8 tail days and 18 blocks that exist in no other
    // record (burnout-reset 30-32, sleep-tight 31-32, stress-buster 28-30).
    // Overwriting it destroys the only copy. Decide whether that content is
    // wanted before retiring the prefix — see blocks.md.

    // assessment_def: → assessment: sync removed 2026-09-03.
    // `assessment:` was a write-only mirror — read in two places, both of them
    // this sync checking its own output. It could not self-heal either: the
    // guard was `if (!existing)`, so it created a missing mirror and never
    // refreshed a stale one, while a bulk import wrote assessment_def: alone.
    // A sync that cannot re-sync is how day:/block: died. Readers use
    // assessment_def: directly.

    // resource: → library:resource: sync removed.
    // The mirror was written only by delete, never by create or update, so it
    // drifted into stale snapshots. Readers now use resource: directly.

    console.log(`${dryRun ? "DRY RUN" : "EXECUTED"}: Synced ${synced} records across prefixes`);

    return c.json({
      dryRun,
      synced,
      actions,
      message: dryRun
        ? `Would sync ${synced} records. Set dryRun: false to execute.`
        : `Successfully synced ${synced} records.`,
    });
  } catch (err) {
    console.log(`KV sync error: ${err}`);
    return c.json({ error: `KV sync failed: ${err}` }, 500);
  }
});

// ─── KV Audit: Purge all keys matching a prefix ─────────────────
app.post("/admin/kv-audit/purge-prefix", requireAdmin, async (c) => {
  try {
    const { prefix, dryRun = true } = await c.req.json();

    if (!prefix || typeof prefix !== 'string' || prefix.length < 2) {
      return c.json({ error: 'A valid prefix (min 2 chars) is required' }, 400);
    }

    const auditSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Fetch all keys matching the prefix
    const { data: rows, error: fetchErr } = await auditSupabase
      .from('kv_store_cc205da9')
      .select('key')
      .like('key', `${prefix}%`);

    if (fetchErr) throw new Error(`Fetch keys error: ${fetchErr.message}`);
    if (!rows || rows.length === 0) {
      return c.json({ success: true, message: `No keys found with prefix "${prefix}"`, deleted: 0, total: 0 });
    }

    if (dryRun) {
      return c.json({
        success: true,
        dryRun: true,
        wouldDelete: rows.length,
        sampleKeys: rows.slice(0, 10).map(r => r.key),
        prefix
      });
    }

    // Safety cap per batch
    if (rows.length > 5000) {
      return c.json({ error: `Too many keys (${rows.length}). Purge in smaller batches or contact support.` }, 400);
    }

    // Actually delete
    let deleted = 0;
    const failed: string[] = [];

    for (const row of rows) {
      try {
        await kv.del(row.key);
        deleted++;
      } catch {
        failed.push(row.key);
      }
    }

    console.log(`PURGE: Deleted ${deleted}/${rows.length} keys with prefix "${prefix}". ${failed.length} failures.`);

    return c.json({
      success: true,
      dryRun: false,
      deleted,
      total: rows.length,
      failed: failed.length,
      prefix
    });

  } catch (error) {
    console.error("KV Purge error:", error);
    return c.json({ error: `KV Purge failed: ${error}` }, 500);
  }
});

// ========================================
// ADMIN - SCORING ENGINE PROFILES
// ========================================

/**
 * Scoring profiles, readable by any signed-in user.
 *
 * The player needs these: `AssessmentFlow` calls `loadScoringProfiles()` on
 * every run, and without them `getSeverityFromProfile` returns null, no
 * clinical severity is resolved, and **no recommendation rule can match** — the
 * exact failure the category-join fix was meant to end. The admin-only route
 * below stays for the authoring screen; this one is read-only and carries no
 * authoring surface.
 *
 * Profiles are configuration, not user data: calc, direction, bands and their
 * severity terms. Nothing here is personal.
 */
app.get("/scoring-profiles", requireAuth, async (c) => {
  try {
    const rows = await kv.getByPrefix("scoring-profile:");
    return c.json({ profiles: Array.isArray(rows) ? rows : [] });
  } catch (error) {
    console.error("Failed to load scoring profiles (read):", error);
    return c.json({ profiles: [] });
  }
});

app.get("/admin/scoring-profiles", requireAdmin, async (c) => {
  try {
    const profileKeys = await kv.getByPrefix("scoring-profile:");
    const profiles = Array.isArray(profileKeys) ? profileKeys : [];
    return c.json({ profiles });
  } catch (error) {
    console.error("Failed to load scoring profiles:", error);
    return c.json({ profiles: [] });
  }
});

app.post("/admin/scoring-profiles", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const profile = body?.profile;
    if (!profile || !profile.id) {
      return c.json({ error: "Profile with id is required" }, 400);
    }

    // Validate before touching KV. The admin UI is not the only writer — a
    // restored backup or a direct write would otherwise install overlapping
    // bands, and overlap makes severity depend on lookup order.
    const check = validateScoringProfile(profile);
    if (!check.ok) {
      return c.json({ error: "Invalid scoring profile", issues: check.errors, warnings: check.warnings }, 400);
    }

    const existing: any = await kv.get(`scoring-profile:${profile.id}`);

    // A locked profile is in use by authored specs. Unlock it deliberately
    // before editing, so a band edit can never silently re-band stored results.
    if (existing?.locked && profile.locked !== false) {
      return c.json({
        error: `Scoring profile "${existing.name}" is locked. Unlock it explicitly before editing — ` +
               `changing bands on a profile in use re-bands every result scored against it.`,
      }, 409);
    }

    const now = new Date().toISOString();
    profile.created_at = existing?.created_at ?? profile.created_at ?? now;
    profile.updated_at = now;
    // Version is server-owned so a stale client cannot roll it backwards.
    profile.version = Number.isFinite(existing?.version) ? existing.version + 1 : 1;

    await kv.set(`scoring-profile:${profile.id}`, profile);
    return c.json({ profile, warnings: check.warnings });
  } catch (error) {
    console.error("Failed to save scoring profile:", error);
    return c.json({ error: `Failed to save scoring profile: ${error}` }, 500);
  }
});

app.delete("/admin/scoring-profiles/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");

    // Refuse while any assessment still scores against it. Deleting a
    // referenced profile leaves scores pointing at nothing, which the coverage
    // meter reports as red but which would already have broken the result page.
    const defs = await kv.getByPrefix("assessment_def:");
    const users: string[] = [];
    for (const def of (Array.isArray(defs) ? defs : []) as any[]) {
      const scores = Array.isArray(def?.scores) ? def.scores : [];
      if (scores.some((s: any) => s?.profile_id === id) || def?.scoring_profile_id === id) {
        users.push(def?.slug || def?.id);
      }
    }
    if (users.length > 0) {
      return c.json({
        error: `Scoring profile ${id} is referenced by: ${users.join(", ")}. ` +
               `Remove it from those scores first.`,
      }, 409);
    }

    await kv.del(`scoring-profile:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to delete scoring profile:", error);
    return c.json({ error: `Failed to delete scoring profile: ${error}` }, 500);
  }
});

}
// ─── Helper: Summarize a value for display ──────────────────────
function summarizeValue(val: any): string {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'string') return val.length > 80 ? val.slice(0, 80) + '...' : val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return `Array(${val.length})`;
  if (typeof val === 'object') {
    const keys = Object.keys(val);
    const preview = keys.slice(0, 4).join(', ');
    return `{${preview}${keys.length > 4 ? ', ...' : ''}} (${keys.length} keys)`;
  }
  return String(val).slice(0, 80);
}