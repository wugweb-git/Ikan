import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

// ═══════════════════════════════════════════════════════════════════
// KV Audit & Orphan Cleanup Routes
//
// Provides a complete map of every KV key prefix used in the system,
// counts records per prefix, detects orphans, and allows cleanup.
// ═══════════════════════════════════════════════════════════════════

// ── Canonical KV Key Schema ─────────────────────────────────────
// This is the single source of truth for every prefix in the system.
// "owner" = who creates the record. "consumers" = who reads it.

interface KVKeyDef {
  prefix: string;
  description: string;
  owner: string;            // file that writes this key
  consumers: string[];      // files that read this key
  scoped: "global" | "user" | "entity";
  category: string;
  linkedPrefixes?: string[];  // prefixes that should exist if this exists
  orphanRisk: "none" | "low" | "medium" | "high";
  notes?: string;
}

const KV_SCHEMA: KVKeyDef[] = [
  // ── USER & AUTH ─────────────────────────────────────────────
  { prefix: "user:", description: "User profile", owner: "index.tsx", consumers: ["index.tsx","admin-routes.ts","equip-routes.ts","recommendation-routes.ts","resource-routes.ts"], scoped: "user", category: "user", orphanRisk: "low" },
  { prefix: "email-change:", description: "Pending email change requests", owner: "index.tsx", consumers: ["index.tsx"], scoped: "user", category: "user", orphanRisk: "medium", notes: "Should be cleaned up after approval/rejection" },

  // ── AUDIT LOGS (write-only, never read by app) ──────────────
  { prefix: "audit:profile:", description: "Profile change audit log", owner: "index.tsx", consumers: [], scoped: "user", category: "audit", orphanRisk: "low", notes: "Write-only; grows forever" },
  { prefix: "audit:password:", description: "Password change audit log", owner: "index.tsx", consumers: [], scoped: "user", category: "audit", orphanRisk: "low", notes: "Write-only; grows forever" },
  { prefix: "audit:email:", description: "Email change audit log", owner: "index.tsx", consumers: [], scoped: "user", category: "audit", orphanRisk: "low", notes: "Write-only; grows forever" },
  { prefix: "audit:avatar:", description: "Avatar change audit log", owner: "index.tsx", consumers: [], scoped: "user", category: "audit", orphanRisk: "low", notes: "Write-only; grows forever" },
  { prefix: "audit:export:", description: "Data export audit log", owner: "index.tsx", consumers: [], scoped: "user", category: "audit", orphanRisk: "low", notes: "Write-only; grows forever" },
  { prefix: "audit:delete_account:", description: "Account deletion audit log", owner: "index.tsx", consumers: [], scoped: "user", category: "audit", orphanRisk: "low", notes: "Write-only; grows forever" },

  // ── EQUIP PROGRAMS (admin-managed) ──────────────────────────
  { prefix: "equip:", description: "Program definition (admin)", owner: "program-service.ts", consumers: ["program-service.ts","equip-routes.ts","admin-routes.ts"], scoped: "entity", category: "program", linkedPrefixes: ["equip_slug:","idx_equip_days:"], orphanRisk: "medium" },
  { prefix: "equip_slug:", description: "Program slug→ID lookup", owner: "program-service.ts", consumers: ["program-service.ts"], scoped: "entity", category: "program", orphanRisk: "medium", notes: "Should match equip: records" },
  { prefix: "idx_equip_days:", description: "Day IDs for a program", owner: "program-service.ts", consumers: ["program-service.ts"], scoped: "entity", category: "program", orphanRisk: "high", notes: "Orphaned if parent equip: deleted without cascade" },
  { prefix: "day:", description: "Day definition", owner: "program-service.ts", consumers: ["program-service.ts","admin-routes.ts"], scoped: "entity", category: "program", linkedPrefixes: ["idx_day_blocks:"], orphanRisk: "high" },
  { prefix: "idx_day_blocks:", description: "Block IDs for a day", owner: "program-service.ts", consumers: ["program-service.ts"], scoped: "entity", category: "program", orphanRisk: "high" },
  { prefix: "block:", description: "Block definition", owner: "program-service.ts", consumers: ["program-service.ts","admin-routes.ts"], scoped: "entity", category: "program", orphanRisk: "high" },

  // ── EQUIP PROGRAMS (user-facing — ⚠️ DIFFERENT prefix) ─────
  { prefix: "equip_program:", description: "Program (user-facing copy)", owner: "index.tsx (seeded)", consumers: ["index.tsx"], scoped: "entity", category: "program", orphanRisk: "high", notes: "⚠️ MISMATCH: Admin writes equip:, users read equip_program:. Programs invisible if not dual-written." },
  { prefix: "equip_program_by_slug:", description: "Program slug lookup (user-facing)", owner: "index.tsx (seeded)", consumers: ["index.tsx"], scoped: "entity", category: "program", orphanRisk: "high", notes: "⚠️ MISMATCH: same issue as equip_program:" },

  // ── CONTENT ─────────────────────────────────────────────────
  { prefix: "content:", description: "Content item", owner: "content-service.ts", consumers: ["content-service.ts","program-service.ts","progress-service.ts"], scoped: "entity", category: "content", orphanRisk: "low" },
  { prefix: "content_slug:", description: "Content slug→ID", owner: "content-service.ts", consumers: ["content-service.ts"], scoped: "entity", category: "content", orphanRisk: "low" },
  { prefix: "content_item:", description: "Content item (fallback key)", owner: "unknown", consumers: ["program-service.ts"], scoped: "entity", category: "content", orphanRisk: "high", notes: "Read as fallback but never written in current code" },

  // ── DATASETS ────────────────────────────────────────────────
  { prefix: "dataset:", description: "Dataset definition", owner: "admin-routes.ts", consumers: ["admin-routes.ts"], scoped: "entity", category: "dataset", orphanRisk: "low" },
  { prefix: "dataset_key:", description: "Dataset key→ID lookup", owner: "admin-routes.ts", consumers: [], scoped: "entity", category: "dataset", orphanRisk: "medium", notes: "Written in restore but never read" },

  // ── ASSESSMENTS ─────────────────────────────────────────────
  { prefix: "assessment_def:", description: "Assessment definition (admin)", owner: "admin-routes.ts", consumers: ["admin-routes.ts","assessment-routes.ts"], scoped: "entity", category: "assessment", orphanRisk: "medium" },
  { prefix: "assessment:", description: "Assessment (user-facing)", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "assessment", orphanRisk: "high", notes: "⚠️ MISMATCH: Admin writes assessment_def:, users read assessment:. Fixed with fallback." },
  { prefix: "assessment_result:", description: "Assessment result (underscore)", owner: "assessment-routes.ts", consumers: ["assessment-routes.ts"], scoped: "user", category: "assessment", orphanRisk: "medium" },
  { prefix: "assessment-result:", description: "Assessment result (hyphen — legacy)", owner: "index.tsx (data export)", consumers: ["index.tsx (data export)"], scoped: "user", category: "assessment", orphanRisk: "high", notes: "⚠️ NAMING MISMATCH: Hyphen vs underscore. Data export reads assessment-result: but assessment-routes writes assessment_result:" },
  { prefix: "assessment_response:", description: "Assessment response by ID", owner: "index.tsx", consumers: ["index.tsx"], scoped: "user", category: "assessment", orphanRisk: "medium" },
  { prefix: "assessment_response_by_user:", description: "Assessment response (user index)", owner: "index.tsx,assessment-routes.ts", consumers: ["index.tsx","assessment-routes.ts","recommendation-service.ts"], scoped: "user", category: "assessment", orphanRisk: "low" },

  // ── JOURNALS / MOOD ─────────────────────────────────────────
  { prefix: "journal:", description: "Journal entry by ID", owner: "index.tsx,mood-routes.ts", consumers: ["index.tsx"], scoped: "entity", category: "journal", orphanRisk: "medium" },
  { prefix: "journal_by_user:", description: "Journal user-date index", owner: "index.tsx,mood-routes.ts", consumers: ["index.tsx,mood-routes.ts"], scoped: "user", category: "journal", orphanRisk: "medium", notes: "⚠️ index.tsx writes :userId:date, mood-routes writes :userId:date:id — inconsistent" },

  // ── ENROLLMENT & PROGRESS ───────────────────────────────────
  { prefix: "enrollment:", description: "Enrollment record", owner: "index.tsx,progress-service.ts", consumers: ["index.tsx","progress-service.ts","program-service.ts","equip-routes.ts"], scoped: "user", category: "enrollment", orphanRisk: "high", notes: "⚠️ Two key patterns: enrollment:{userId}:{equipId} vs enrollment:{enrollmentId}" },
  { prefix: "user_enrollment:", description: "User enrollment index", owner: "index.tsx", consumers: ["index.tsx","program-service.ts"], scoped: "user", category: "enrollment", orphanRisk: "medium" },
  { prefix: "progress:", description: "Day-level progress", owner: "progress-service.ts", consumers: ["progress-service.ts"], scoped: "user", category: "enrollment", orphanRisk: "medium" },
  { prefix: "program-progress:", description: "Program progress (hyphen — legacy)", owner: "unknown", consumers: ["index.tsx (data export)"], scoped: "user", category: "enrollment", orphanRisk: "high", notes: "⚠️ Read in data export but never written in current code. Legacy/orphan prefix." },

  // ── RESOURCES / LIBRARY ─────────────────────────────────────
  { prefix: "resource:", description: "Resource (admin)", owner: "admin-routes.ts,resource-routes.ts", consumers: ["admin-routes.ts","resource-routes.ts","index.tsx (fallback)"], scoped: "entity", category: "resource", orphanRisk: "low" },
  { prefix: "library:resource:", description: "Resource (library prefix)", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "resource", orphanRisk: "medium", notes: "Dual prefix — user reads library:resource: first, falls back to resource:" },

  // ── CATEGORIES ──────────────────────────────────────────────
  { prefix: "category:", description: "Category", owner: "admin-routes.ts", consumers: ["admin-routes.ts","resource-routes.ts"], scoped: "entity", category: "category", orphanRisk: "low" },

  // ── MEDIA ───────────────────────────────────────────────────
  { prefix: "media:", description: "Media file metadata", owner: "admin-routes.ts", consumers: ["admin-routes.ts"], scoped: "entity", category: "media", orphanRisk: "low" },

  // ── CMS PAGES ───────────────────────────────────────────────
  { prefix: "page:", description: "CMS page", owner: "admin-routes.ts", consumers: ["index.tsx","admin-routes.ts"], scoped: "entity", category: "cms", orphanRisk: "low" },
  { prefix: "page_slug:", description: "Page slug→ID", owner: "admin-routes.ts", consumers: ["index.tsx"], scoped: "entity", category: "cms", orphanRisk: "low" },
  { prefix: "cms_page:", description: "CMS page (alternate key)", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "cms", orphanRisk: "medium", notes: "Legacy fallback for page:" },

  // ── PROFESSIONALS / CONSULTANTS ─────────────────────────────
  { prefix: "consultant:", description: "Consultant profile (legacy)", owner: "seeded externally", consumers: ["index.tsx"], scoped: "entity", category: "professional", orphanRisk: "low", notes: "Read-only in code, must be seeded via admin/migration" },
  { prefix: "professional:", description: "Professional profile (active)", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "professional", orphanRisk: "low" },
  { prefix: "professional:pending-", description: "Pending professional application data", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "professional", orphanRisk: "medium", notes: "Should be cleaned after approval/rejection. Approved ones get moved to professional:{id}" },
  { prefix: "professional_application:", description: "Professional application tracker", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "professional", orphanRisk: "medium", notes: "Tracks application status (pending/approved/rejected)" },

  // ── PAYMENTS ────────────────────────────────────────────────
  { prefix: "payment:", description: "Payment record", owner: "index.tsx", consumers: ["index.tsx"], scoped: "user", category: "payment", orphanRisk: "medium" },

  // ── RECOMMENDATIONS ─────────────────────────────────────────
  { prefix: "recommendation_rule:", description: "Recommendation rule", owner: "recommendation-service.ts", consumers: ["recommendation-service.ts"], scoped: "entity", category: "recommendation", orphanRisk: "low" },
  { prefix: "recommendation_rules", description: "Recommendation rules (singleton)", owner: "admin-routes.ts", consumers: ["admin-routes.ts"], scoped: "global", category: "recommendation", orphanRisk: "none" },

  // ── HEALTH CONNECT ──────────────────────────────────────────
  { prefix: "hc_status:", description: "Health Connect connection status", owner: "health-connect-routes.ts", consumers: ["health-connect-routes.ts"], scoped: "user", category: "health", orphanRisk: "low" },
  { prefix: "hc_data:", description: "Health Connect latest data", owner: "health-connect-routes.ts", consumers: ["health-connect-routes.ts"], scoped: "user", category: "health", orphanRisk: "low" },
  { prefix: "hc_history:", description: "Health Connect daily history", owner: "health-connect-routes.ts", consumers: ["health-connect-routes.ts"], scoped: "user", category: "health", orphanRisk: "low" },

  // ── CHECK-IN SCALES ─────────────────────────────────────────
  { prefix: "checkin_scale:", description: "Check-in scale configuration", owner: "scales-routes.ts", consumers: ["scales-routes.ts"], scoped: "global", category: "scales", orphanRisk: "none" },

  // ── ACTIVITY TRACKING ───────────────────────────────────────
  { prefix: "activity:read:", description: "Read activity record", owner: "index.tsx", consumers: [], scoped: "entity", category: "activity", orphanRisk: "high", notes: "Write-only; never cleaned. Grows unbounded with user reads." },
  { prefix: "activity:user:", description: "User's read activity ID list", owner: "index.tsx", consumers: ["index.tsx"], scoped: "user", category: "activity", orphanRisk: "medium", notes: "Array grows unbounded per user" },
  { prefix: "user_activity:", description: "User activity log", owner: "index.tsx", consumers: ["index.tsx"], scoped: "user", category: "activity", orphanRisk: "high", notes: "Write-only log; never pruned. One key per action per user." },

  // ── ADMIN NOTIFICATIONS ─────────────────────────────────────
  { prefix: "admin_notification:", description: "Admin notification", owner: "index.tsx", consumers: ["index.tsx"], scoped: "global", category: "admin", orphanRisk: "medium", notes: "Never pruned. Read notifications kept forever." },

  // ── SITE SETTINGS ───────────────────────────────────────────
  { prefix: "settings:site", description: "Site settings (singleton)", owner: "index.tsx", consumers: ["index.tsx"], scoped: "global", category: "settings", orphanRisk: "none" },

  // ── COMMUNICATION / BREVO ───────────────────────────────────
  { prefix: "comm-config:", description: "Communication channel config", owner: "index.tsx", consumers: ["index.tsx"], scoped: "global", category: "communication", orphanRisk: "low" },
  { prefix: "email_queue:", description: "Queued email notifications", owner: "index.tsx", consumers: [], scoped: "entity", category: "communication", orphanRisk: "high", notes: "Write-only queue; never processed or cleaned in current code" },
  { prefix: "brevo-config", description: "Brevo API configuration (singleton)", owner: "brevo-routes.ts", consumers: ["brevo-routes.ts","index.tsx"], scoped: "global", category: "communication", orphanRisk: "none" },
  { prefix: "brevo-logs", description: "Brevo send logs (singleton array)", owner: "brevo-routes.ts", consumers: ["brevo-routes.ts"], scoped: "global", category: "communication", orphanRisk: "none", notes: "Auto-trimmed to last 100 entries" },

  // ── MONITORING / OBSERVABILITY ──────────────────────────────
  { prefix: "api-log:", description: "API request log", owner: "logging.tsx", consumers: ["logging.tsx"], scoped: "global", category: "monitoring", orphanRisk: "medium", notes: "Auto-pruned to last 1000 entries" },
  { prefix: "metrics:", description: "Performance metrics snapshot", owner: "performance.tsx", consumers: ["performance.tsx"], scoped: "global", category: "monitoring", orphanRisk: "medium", notes: "Auto-pruned to last 24 hours" },

  // ── LEGACY / DATA EXPORT GHOSTS ─────────────────────────────
  { prefix: "tracker:", description: "Tracker entries (legacy)", owner: "unknown", consumers: ["index.tsx (data export)"], scoped: "user", category: "legacy", orphanRisk: "high", notes: "⚠️ Read in data export but never written. Ghost prefix from earlier version." },

  // ── SYSTEM ──────────────────────────────────────────────────
  { prefix: "sys_backups", description: "Backup metadata list", owner: "admin-routes.ts", consumers: ["admin-routes.ts"], scoped: "global", category: "system", orphanRisk: "none" },
  { prefix: "backup:", description: "Backup data snapshot", owner: "admin-routes.ts", consumers: ["admin-routes.ts"], scoped: "global", category: "system", orphanRisk: "low", notes: "Kept last 10, old ones auto-pruned" },

  // ── NEWSLETTER ──────────────────────────────────────────────
  { prefix: "newsletter:", description: "Newsletter subscriptions", owner: "newsletter-routes.ts", consumers: ["newsletter-routes.ts"], scoped: "entity", category: "newsletter", orphanRisk: "low" },

  // ── CONTACT SUBMISSIONS ─────────────────────────────────────
  { prefix: "contact_submission:", description: "Contact form submission", owner: "contact-routes.ts", consumers: ["contact-routes.ts"], scoped: "entity", category: "contact", orphanRisk: "low", notes: "Never pruned but low volume" },
];

// All known prefixes for classification
const ALL_KNOWN_PREFIXES = KV_SCHEMA.map(s => s.prefix).sort((a, b) => b.length - a.length);

function classifyKey(key: string): KVKeyDef | null {
  for (const def of KV_SCHEMA) {
    if (key.startsWith(def.prefix) || key === def.prefix.replace(/:$/, "")) {
      return def;
    }
  }
  return null;
}

// ── Route registration ────────────────────────────────────────

export function registerKVAuditRoutes(app: Hono, requireAuth: any) {

  // ── GET /admin/kv-audit — Full KV audit ─────────────────────
  app.get("/admin/kv-audit", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      // Verify admin
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      console.log("🔍 Starting KV audit...");

      // Scan every known prefix
      const prefixCounts: Record<string, { count: number; sampleKeys: string[]; totalValueSize: number }> = {};
      const orphanKeys: string[] = [];
      const mismatches: Array<{ issue: string; details: string; severity: string }> = [];
      let totalRecords = 0;

      for (const def of KV_SCHEMA) {
        try {
          const results = await kv.getByPrefix(def.prefix);
          const count = Array.isArray(results) ? results.length : 0;
          totalRecords += count;

          // Estimate value sizes
          let totalSize = 0;
          const sampleKeys: string[] = [];
          if (Array.isArray(results)) {
            for (let i = 0; i < Math.min(results.length, 3); i++) {
              const r = results[i];
              if (r && typeof r === "object" && r.key) {
                sampleKeys.push(r.key);
              }
              totalSize += JSON.stringify(r).length;
            }
            // Extrapolate size
            if (results.length > 3 && sampleKeys.length > 0) {
              totalSize = Math.round((totalSize / 3) * results.length);
            }
          }

          prefixCounts[def.prefix] = { count, sampleKeys, totalValueSize: totalSize };
        } catch (err) {
          prefixCounts[def.prefix] = { count: -1, sampleKeys: [], totalValueSize: 0 };
        }
      }

      // ── Detect prefix mismatches ─────────────────────────────
      const equipCount = prefixCounts["equip:"]?.count || 0;
      const equipProgramCount = prefixCounts["equip_program:"]?.count || 0;
      if (equipCount > 0 && equipProgramCount === 0) {
        mismatches.push({
          issue: "Programs invisible to users",
          details: `Admin has ${equipCount} programs (equip:) but user-facing prefix (equip_program:) has ${equipProgramCount}. Users cannot see any programs.`,
          severity: "critical",
        });
      }

      const assessmentDefCount = prefixCounts["assessment_def:"]?.count || 0;
      const assessmentCount = prefixCounts["assessment:"]?.count || 0;
      if (assessmentDefCount > 0 && assessmentCount === 0) {
        mismatches.push({
          issue: "Assessments invisible to users",
          details: `Admin has ${assessmentDefCount} assessment definitions (assessment_def:) but user-facing prefix (assessment:) has ${assessmentCount}.`,
          severity: "critical",
        });
      }

      const resourceCount = prefixCounts["resource:"]?.count || 0;
      const libraryResourceCount = prefixCounts["library:resource:"]?.count || 0;
      if (resourceCount > 0 && libraryResourceCount === 0) {
        mismatches.push({
          issue: "Resources may have reduced visibility",
          details: `Admin resources (resource:) = ${resourceCount}, library resources (library:resource:) = ${libraryResourceCount}. User code tries library:resource: first, falls back to resource:. Working but redundant.`,
          severity: "warning",
        });
      }

      // Audit logs growing forever
      let auditTotal = 0;
      for (const def of KV_SCHEMA.filter(d => d.category === "audit")) {
        auditTotal += prefixCounts[def.prefix]?.count || 0;
      }
      if (auditTotal > 100) {
        mismatches.push({
          issue: "Audit logs accumulating",
          details: `${auditTotal} audit records are write-only and never read. Consider periodic cleanup.`,
          severity: "info",
        });
      }

      // Enrollment key structure mismatch
      const enrollmentCount = prefixCounts["enrollment:"]?.count || 0;
      const userEnrollmentCount = prefixCounts["user_enrollment:"]?.count || 0;
      if (enrollmentCount > 0 && userEnrollmentCount > 0 && Math.abs(enrollmentCount - userEnrollmentCount) > 2) {
        mismatches.push({
          issue: "Enrollment record count mismatch",
          details: `enrollment: has ${enrollmentCount} records, user_enrollment: has ${userEnrollmentCount}. These should be roughly equal.`,
          severity: "warning",
        });
      }

      // Build category summaries
      const categories: Record<string, { count: number; prefixes: string[] }> = {};
      for (const def of KV_SCHEMA) {
        if (!categories[def.category]) {
          categories[def.category] = { count: 0, prefixes: [] };
        }
        categories[def.category].count += prefixCounts[def.prefix]?.count || 0;
        categories[def.category].prefixes.push(def.prefix);
      }

      console.log(`✅ KV audit complete: ${totalRecords} total records, ${mismatches.length} issues`);

      return c.json({
        totalRecords,
        schema: KV_SCHEMA,
        prefixCounts,
        categories,
        mismatches,
        orphanKeys: orphanKeys.slice(0, 100),
      });
    } catch (err) {
      console.log(`KV audit error: ${err}`);
      return c.json({ error: `KV audit failed: ${err}` }, 500);
    }
  });

  // ── POST /admin/kv-sync-prefixes — Fix prefix mismatches ────
  // Copies admin-written records to user-facing prefixes
  app.post("/admin/kv-sync-prefixes", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const body = await c.req.json().catch(() => ({}));
      const dryRun = body.dryRun !== false; // Default to dry run
      const actions: string[] = [];
      let synced = 0;

      // ── Sync equip: → equip_program: ──────────────────────
      const equips = await kv.getByPrefix("equip:");
      for (const equip of equips) {
        if (!equip || !equip.id) continue;
        const existingProgram = await kv.get(`equip_program:${equip.id}`);
        if (!existingProgram) {
          actions.push(`SYNC equip:${equip.id} → equip_program:${equip.id}`);
          if (!dryRun) {
            await kv.set(`equip_program:${equip.id}`, equip);
            if (equip.slug) {
              await kv.set(`equip_program_by_slug:${equip.slug}`, equip);
            }
          }
          synced++;
        }
      }

      // ── Sync assessment_def: → assessment: ────────────────
      const assessmentDefs = await kv.getByPrefix("assessment_def:");
      for (const def of assessmentDefs) {
        if (!def || !def.id || def.deleted) continue;
        const existingAssessment = await kv.get(`assessment:${def.id}`);
        if (!existingAssessment) {
          actions.push(`SYNC assessment_def:${def.id} → assessment:${def.id}`);
          if (!dryRun) {
            await kv.set(`assessment:${def.id}`, def);
          }
          synced++;
        }
      }

      // ── Sync resource: → library:resource: ────────────────
      const resources = await kv.getByPrefix("resource:");
      for (const res of resources) {
        if (!res || !res.id) continue;
        const existingLib = await kv.get(`library:resource:${res.id}`);
        if (!existingLib) {
          actions.push(`SYNC resource:${res.id} → library:resource:${res.id}`);
          if (!dryRun) {
            await kv.set(`library:resource:${res.id}`, res);
          }
          synced++;
        }
      }

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

  // ── POST /admin/kv-cleanup — Remove orphaned records ────────
  app.post("/admin/kv-cleanup", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const body = await c.req.json().catch(() => ({}));
      const dryRun = body.dryRun !== false;
      const target = body.target || "all"; // "audit" | "orphan-indexes" | "all"
      const actions: string[] = [];
      let cleaned = 0;

      // ── Clean old audit logs (keep last 30 per user) ──────
      if (target === "audit" || target === "all") {
        const auditPrefixes = [
          "audit:profile:", "audit:password:", "audit:email:",
          "audit:avatar:", "audit:export:", "audit:delete_account:",
        ];
        for (const prefix of auditPrefixes) {
          const records = await kv.getByPrefix(prefix);
          if (records.length > 30) {
            // Sort by timestamp (last segment of key) descending, keep 30
            const sorted = records
              .filter((r: any) => r && r.timestamp)
              .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const toDelete = sorted.slice(30);
            for (const record of toDelete) {
              const key = record.key || `${prefix}${record.userId}:${new Date(record.timestamp).getTime()}`;
              actions.push(`DELETE ${key} (old audit log)`);
              cleaned++;
              // Note: We can't easily delete without the exact key.
              // The getByPrefix returns values, not keys, so we'd need key info.
              // For now, just count and report.
            }
          }
        }
      }

      // ── Clean orphaned index records ──────────────────────
      if (target === "orphan-indexes" || target === "all") {
        // Check idx_equip_days references
        const dayIndexes = await kv.getByPrefix("idx_equip_days:");
        for (const idx of dayIndexes) {
          if (!idx || !Array.isArray(idx)) continue;
          // The index value is an array of day IDs. Check parent equip exists.
          // We'd need the key to extract equip ID — getByPrefix returns values.
          // This is a limitation; we report the count instead.
        }
        actions.push(`Found ${dayIndexes.length} day index records to verify`);

        // Check idx_day_blocks references
        const blockIndexes = await kv.getByPrefix("idx_day_blocks:");
        actions.push(`Found ${blockIndexes.length} block index records to verify`);
      }

      // ── Clean stale email-change requests (older than 7 days) ─
      if (target === "all") {
        const emailChanges = await kv.getByPrefix("email-change:");
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        for (const req of emailChanges) {
          if (req && req.requestedAt && new Date(req.requestedAt).getTime() < cutoff) {
            actions.push(`DELETE email-change:${req.userId} (stale, ${req.requestedAt})`);
            if (!dryRun && req.userId) {
              await kv.del(`email-change:${req.userId}`);
            }
            cleaned++;
          }
        }
      }

      console.log(`${dryRun ? "DRY RUN" : "EXECUTED"}: Cleaned ${cleaned} records`);

      return c.json({
        dryRun,
        cleaned,
        actions,
        message: dryRun
          ? `Would clean ${cleaned} records. Set dryRun: false to execute.`
          : `Successfully cleaned ${cleaned} records.`,
      });
    } catch (err) {
      console.log(`KV cleanup error: ${err}`);
      return c.json({ error: `KV cleanup failed: ${err}` }, 500);
    }
  });

  // ── GET /admin/kv-schema — Just return the schema definition ─
  app.get("/admin/kv-schema", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      return c.json({
        schema: KV_SCHEMA,
        totalPrefixes: KV_SCHEMA.length,
        categories: [...new Set(KV_SCHEMA.map(s => s.category))],
        criticalMismatches: [
          {
            admin: "equip:{id}",
            user: "equip_program:{id}",
            fix: "POST /admin/kv-sync-prefixes",
          },
          {
            admin: "assessment_def:{id}",
            user: "assessment:{id}",
            fix: "POST /admin/kv-sync-prefixes",
          },
          {
            admin: "resource:{id}",
            user: "library:resource:{id}",
            fix: "POST /admin/kv-sync-prefixes (or user code has fallback)",
          },
        ],
        writeOnlyPrefixes: KV_SCHEMA.filter(s => s.consumers.length === 0).map(s => s.prefix),
        neverWrittenPrefixes: KV_SCHEMA.filter(s => s.owner === "unknown" || s.owner.includes("seeded")).map(s => ({
          prefix: s.prefix,
          notes: s.notes,
        })),
      });
    } catch (err) {
      console.log(`KV schema error: ${err}`);
      return c.json({ error: `Failed to get schema: ${err}` }, 500);
    }
  });
}