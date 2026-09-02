import { Hono } from 'npm:hono';
import * as kv from './kv_dual_write.ts';
import { EquipService, EquipDayService, EquipBlockService } from './program-service.ts';

export function registerEquipRoutes(app: Hono, requireAuth: any, isAdminRequest: (c: any) => Promise<boolean>) {

// ========================================
// EQUIP PROGRAM ENDPOINTS (NEW SCHEMA)
// ========================================

app.get("/admin/equip/enrollments", requireAuth, async (c) => {
    try {
        const user = c.get('user');
        const userProfile = await kv.get(`user:${user.id}`);
        if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);
        
        const enrollments = await kv.getByPrefix('enrollment:');
        return c.json({ enrollments });
    } catch (error) {
        return c.json({ error: 'Failed to list enrollments' }, 500);
    }
});

app.get("/equip/programs", async (c) => {
  try {
    const programs = await EquipService.listEquips();

    // PUBLIC endpoint: ONLY published programs. No auth sniffing.
    const published = programs.filter((p: any) => p.published === true);

    return c.json({ programs: published });
  } catch (error) {
    console.log('List equip programs error:', error);
    return c.json({ error: 'Failed to list programs' }, 500);
  }
});

// ADMIN endpoint: all programs with enrollment counts
app.get("/admin/equip/programs", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const programs = await EquipService.listEquips();

    // Compute enrollment counts
    const allEnrollments = await kv.getByPrefix('enrollment:');
    const enrollmentCountMap: Record<string, number> = {};
    for (const e of allEnrollments) {
      if (!e) continue;
      const eid = e.equip_id || e.programId;
      if (!eid) continue;
      enrollmentCountMap[eid] = (enrollmentCountMap[eid] || 0) + 1;
    }

    const programsWithCounts = programs.map((p: any) => ({
      ...p,
      enrollmentCount: enrollmentCountMap[p.id] || enrollmentCountMap[p.equip_id] || 0,
    }));

    return c.json({ programs: programsWithCounts });
  } catch (error) {
    console.log('Admin list equip programs error:', error);
    return c.json({ error: 'Failed to list programs' }, 500);
  }
});

app.get("/equip/programs/:equipId", async (c) => {
  try {
    const equipId = c.req.param('equipId');
    // Try by ID first, then slug
    let program = await EquipService.getFullEquip(equipId);
    if (!program) {
        // We need getFullEquipBySlug? No, let's resolve slug first.
        const bySlug = await EquipService.getEquipBySlug(equipId);
        if (bySlug) {
            program = await EquipService.getFullEquip(bySlug.id);
        }
    }
    
    if (!program) {
      return c.json({ error: 'Program not found' }, 404);
    }

    // FIXED 2026-09-01. Unpublished programs were hidden client-side only
    // (EquipDetail.tsx checks `published === false`), so calling this endpoint
    // directly returned unreleased content in full — days, blocks and all — to
    // anyone with the anon key. The sibling list route already filters
    // correctly; this one never did.
    //
    // 404 rather than 403: an unpublished program should not confirm it exists.
    // Admins still get it, because this same route backs the admin editor via
    // apiClient.getEquipProgram.
    if (program.published === false && !(await isAdminRequest(c))) {
      return c.json({ error: 'Program not found' }, 404);
    }

    return c.json({ program });
  } catch (error) {
    console.log('Get equip program error:', error);
    return c.json({ error: 'Failed to get program' }, 500);
  }
});

app.post("/equip/programs", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const data = await c.req.json();
    
    // Separate nested content from main equip data
    const { days, ...equipData } = data;
    
    // 1. Create Equip
    const program = await EquipService.createEquip(equipData);
    
    // 2. Create Days & Blocks if provided
    if (days && Array.isArray(days)) {
        for (const dayData of days) {
            const { blocks, ...dayInfo } = dayData;
            const day = await EquipDayService.createDay({
                ...dayInfo,
                equip_id: program.id
            });
            
            if (blocks && Array.isArray(blocks)) {
                let order = 0;
                for (const blockData of blocks) {
                    await EquipBlockService.createBlock({
                        ...blockData,
                        equip_day_id: day.id,
                        order_index: blockData.order_index ?? order++
                    });
                }
            }
        }
    }
    
    // 3. Return full program structure
    const fullProgram = await EquipService.getFullEquip(program.id);
    return c.json({ program: fullProgram });
  } catch (error: any) {
    console.log('Create equip error:', error);
    return c.json({ error: `Failed to create program: ${error.message}` }, 500);
  }
});

app.put("/equip/programs/:equipId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const equipId = c.req.param('equipId');
    const updates = await c.req.json();
    
    // Resolve ID if slug passed
    let targetId = equipId;
    const existing = await EquipService.getEquip(equipId);
    if (!existing) {
        const bySlug = await EquipService.getEquipBySlug(equipId);
        if (bySlug) targetId = bySlug.id;
        else return c.json({ error: 'Program not found' }, 404);
    }

    const program = await EquipService.updateEquip(targetId, updates);
    return c.json({ program });
  } catch (error) {
    console.log('Update equip error:', error);
    return c.json({ error: 'Failed to update program' }, 500);
  }
});

app.delete("/equip/programs/:equipId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const equipId = c.req.param('equipId');
    // Resolve ID
    let targetId = equipId;
    const existing = await EquipService.getEquip(equipId);
    if (!existing) {
        const bySlug = await EquipService.getEquipBySlug(equipId);
        if (bySlug) targetId = bySlug.id;
        else return c.json({ error: 'Program not found' }, 404);
    }

    await EquipService.deleteEquip(targetId);
    // Also clean up the user-facing equip_program: prefix (legacy dual-prefix system)
    await kv.del(`equip_program:${targetId}`).catch(() => {});
    if (existing?.slug) {
      await kv.del(`equip_program_by_slug:${existing.slug}`).catch(() => {});
    }
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete equip error:', error);
    return c.json({ error: 'Failed to delete program' }, 500);
  }
});

// The legacy day:/block: REST surface (GET/POST/PUT/DELETE on
// /equip/programs/:equipId/days, /equip/days/:dayId, /equip/days/:dayId/blocks,
// /equip/blocks/:blockId) was removed 2026-08-06. It predates the current
// content model — the admin editor (EquipDailyEditor.tsx) has always saved a
// program's entire day/block tree as one inline `daily_content` array via
// apiClient.updateEquipProgram(), and nothing in this codebase's frontend
// ever called these routes. Left live, they could write orphan day:/block:
// records nobody reads. EquipDayService/EquipBlockService themselves are
// untouched — deleteEquip's cascade cleanup still calls deleteDay/deleteBlock
// to clear out legacy records when a program is deleted.

// ADMIN UTILS
app.post("/admin/equip/cleanup-zombies", requireAuth, async (c) => {
    try {
        const user = c.get('user');
        const userProfile = await kv.get(`user:${user.id}`);
        if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

        const result = await EquipService.cleanupZombieEnrollments();
        return c.json({ success: true, ...result });
    } catch (error) {
        return c.json({ error: 'Failed to cleanup' }, 500);
    }
});

} // End registerEquipRoutes
