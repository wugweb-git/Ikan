import { Hono } from "npm:hono";
import * as kv from "./kv_dual_write.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ═══════════════════════════════════════════════════════════════════
// KV Audit & Orphan Cleanup Routes
//
// Full database scan (paginated in batches of 1000) instead of only
// scanning known prefixes. Detects orphans, uncategorized keys,
// naming inconsistencies, growth warnings, soft-deleted entities,
// and per-user data footprints.
// ═══════════════════════════════════════════════════════════════════

const supabase = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

// ── Canonical KV Key Schema ─────────────────────────────────────
interface KVKeyDef {
  prefix: string;
  description: string;
  owner: string;
  consumers: string[];
  scoped: "global" | "user" | "entity";
  category: string;
  linkedPrefixes?: string[];
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
  { prefix: "audit_snapshot:", description: "KV audit health snapshots", owner: "kv-audit-routes.ts", consumers: ["kv-audit-routes.ts"], scoped: "global", category: "audit", orphanRisk: "low", notes: "Snapshot of KV health over time" },

  // ── EQUIP PROGRAMS (admin-managed) ──────────────────────────
  { prefix: "equip:", description: "Program definition (admin)", owner: "program-service.ts", consumers: ["program-service.ts","equip-routes.ts","admin-routes.ts"], scoped: "entity", category: "program", linkedPrefixes: ["equip_slug:","idx_equip_days:"], orphanRisk: "medium" },
  { prefix: "equip_slug:", description: "Program slug->ID lookup", owner: "program-service.ts", consumers: ["program-service.ts"], scoped: "entity", category: "program", orphanRisk: "medium" },
  { prefix: "idx_equip_days:", description: "Day IDs for a program", owner: "program-service.ts", consumers: ["program-service.ts"], scoped: "entity", category: "program", orphanRisk: "high" },
  { prefix: "day:", description: "Day definition", owner: "program-service.ts", consumers: ["program-service.ts","admin-routes.ts"], scoped: "entity", category: "program", linkedPrefixes: ["idx_day_blocks:"], orphanRisk: "high" },
  { prefix: "idx_day_blocks:", description: "Block IDs for a day", owner: "program-service.ts", consumers: ["program-service.ts"], scoped: "entity", category: "program", orphanRisk: "high" },
  { prefix: "block:", description: "Block definition", owner: "program-service.ts", consumers: ["program-service.ts","admin-routes.ts"], scoped: "entity", category: "program", orphanRisk: "high" },
  { prefix: "week:", description: "Week definition for programs", owner: "program-service.ts", consumers: ["program-service.ts"], scoped: "entity", category: "program", orphanRisk: "medium", notes: "Week grouping within program days" },

  // ── EQUIP PROGRAMS (user-facing) ─────────────────────────────
  { prefix: "equip_program:", description: "Program (user-facing copy)", owner: "index.tsx (seeded)", consumers: ["index.tsx"], scoped: "entity", category: "program", orphanRisk: "high", notes: "Admin writes equip:, users read equip_program:" },
  { prefix: "equip_program_by_slug:", description: "Program slug lookup (user-facing)", owner: "index.tsx (seeded)", consumers: ["index.tsx"], scoped: "entity", category: "program", orphanRisk: "high" },

  // ── CONTENT ─────────────────────────────────────────────────
  { prefix: "content:", description: "Content item", owner: "content-service.ts", consumers: ["content-service.ts","program-service.ts","progress-service.ts"], scoped: "entity", category: "content", orphanRisk: "low" },
  { prefix: "content_slug:", description: "Content slug->ID", owner: "content-service.ts", consumers: ["content-service.ts"], scoped: "entity", category: "content", orphanRisk: "low" },
  { prefix: "content_item:", description: "Content item (fallback key)", owner: "unknown", consumers: ["program-service.ts"], scoped: "entity", category: "content", orphanRisk: "high" },

  // ── DATASETS ────────────────────────────────────────────────
  { prefix: "dataset:", description: "Dataset definition", owner: "admin-routes.ts", consumers: ["admin-routes.ts"], scoped: "entity", category: "dataset", orphanRisk: "low" },
  { prefix: "dataset_key:", description: "Dataset key->ID lookup", owner: "admin-routes.ts", consumers: [], scoped: "entity", category: "dataset", orphanRisk: "medium" },

  // ── ASSESSMENTS ─────────────────────────────────────────────
  { prefix: "assessment_def:", description: "Assessment definition (admin)", owner: "admin-routes.ts", consumers: ["admin-routes.ts","assessment-routes.ts"], scoped: "entity", category: "assessment", linkedPrefixes: ["assessment_slug:"], orphanRisk: "medium" },
  { prefix: "assessment_slug:", description: "Assessment slug->ID lookup", owner: "admin-routes.ts", consumers: ["assessment-routes.ts"], scoped: "entity", category: "assessment", orphanRisk: "medium", notes: "Required for /assessment/<slug> URLs — never purge" },
  { prefix: "assessment:", description: "Assessment (user-facing)", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "assessment", orphanRisk: "high" },
  { prefix: "assessment_result:", description: "Assessment result (underscore)", owner: "assessment-routes.ts", consumers: ["assessment-routes.ts"], scoped: "user", category: "assessment", orphanRisk: "medium" },
  { prefix: "assessment-result:", description: "Assessment result (hyphen - legacy)", owner: "index.tsx (data export)", consumers: ["index.tsx (data export)"], scoped: "user", category: "assessment", orphanRisk: "high", notes: "Naming mismatch: hyphen vs underscore" },
  { prefix: "assessment_response:", description: "Assessment response by ID", owner: "index.tsx", consumers: ["index.tsx"], scoped: "user", category: "assessment", orphanRisk: "medium" },
  { prefix: "assessment_response_by_user:", description: "Assessment response (user index)", owner: "index.tsx,assessment-routes.ts", consumers: ["index.tsx","assessment-routes.ts","recommendation-service.ts"], scoped: "user", category: "assessment", orphanRisk: "low" },

  // ── JOURNALS / MOOD ─────────────────────────────────────────
  { prefix: "journal:", description: "Journal entry by ID", owner: "index.tsx,mood-routes.ts", consumers: ["index.tsx"], scoped: "entity", category: "journal", orphanRisk: "medium" },
  { prefix: "journal_by_user:", description: "Journal user-date index", owner: "index.tsx,mood-routes.ts", consumers: ["index.tsx,mood-routes.ts"], scoped: "user", category: "journal", orphanRisk: "medium" },
  { prefix: "mood:", description: "Mood log entries AND mood-type definitions (two shapes share this prefix)", owner: "mood-routes.ts,scales-routes.ts,index.tsx", consumers: ["mood-routes.ts","scales-routes.ts","index.tsx"], scoped: "user", category: "journal", orphanRisk: "low", notes: "Collision: per-user log entries and global mood-type config both live here, written by three different files. mood_type: holds a third copy of the type config. Editing via one admin screen will not reflect in another." },
  { prefix: "mood_type:", description: "Mood type definition", owner: "mood-routes.ts", consumers: ["mood-routes.ts"], scoped: "global", category: "journal", orphanRisk: "none", notes: "Configurable mood types" },

  // ── ENROLLMENT & PROGRESS ───────────────────────────────────
  { prefix: "enrollment:", description: "Enrollment record", owner: "index.tsx,progress-service.ts", consumers: ["index.tsx","progress-service.ts","program-service.ts","equip-routes.ts"], scoped: "user", category: "enrollment", orphanRisk: "high" },
  { prefix: "user_enrollment:", description: "User enrollment index", owner: "index.tsx", consumers: ["index.tsx","program-service.ts"], scoped: "user", category: "enrollment", orphanRisk: "medium" },
  { prefix: "progress:", description: "Day-level progress", owner: "progress-service.ts", consumers: ["progress-service.ts"], scoped: "user", category: "enrollment", orphanRisk: "medium" },
  { prefix: "program-progress:", description: "Program progress (hyphen - legacy)", owner: "unknown", consumers: ["index.tsx (data export)"], scoped: "user", category: "enrollment", orphanRisk: "high" },

  // ── RESOURCES / LIBRARY ─────────────────────────────────────
  { prefix: "resource:", description: "Resource (canonical)", owner: "admin-routes.ts,resource-routes.ts", consumers: ["admin-routes.ts","resource-routes.ts","index.tsx"], scoped: "entity", category: "resource", orphanRisk: "low" },
  { prefix: "resource_view:", description: "Resource view tracking", owner: "resource-routes.ts", consumers: ["resource-routes.ts","index.tsx"], scoped: "user", category: "resource", orphanRisk: "low", notes: "Append-only view log; grows unbounded" },
  { prefix: "library:resource:", description: "DEPRECATED mirror of resource: — no longer written; readers fall back to resource:", owner: "(none)", consumers: [], scoped: "entity", category: "resource", orphanRisk: "medium", notes: "Only delete maintained it, so mirrors were stale snapshots. Any key appearing here now is a regression." },

  // ── CATEGORIES ──────────────────────────────────────────────
  { prefix: "category:", description: "Category / generic taxonomy (~15 enum types keyed by a `type` field: expertise_category, interaction_type, therapeutic_approach, language, …)", owner: "index.tsx", consumers: ["index.tsx","admin-routes.ts","resource-routes.ts"], scoped: "entity", category: "category", orphanRisk: "low", notes: "index.tsx owns /categories CRUD; admin-routes.ts has a parallel /admin/categories set" },

  // ── MEDIA ───────────────────────────────────────────────────
  { prefix: "media:", description: "Media file metadata", owner: "admin-routes.ts", consumers: ["admin-routes.ts"], scoped: "entity", category: "media", orphanRisk: "low" },

  // ── CMS PAGES ───────────────────────────────────────────────
  { prefix: "page:", description: "CMS page", owner: "admin-routes.ts", consumers: ["index.tsx","admin-routes.ts"], scoped: "entity", category: "cms", orphanRisk: "low" },
  { prefix: "page_slug:", description: "Page slug->ID", owner: "admin-routes.ts", consumers: ["index.tsx"], scoped: "entity", category: "cms", orphanRisk: "low" },
  { prefix: "cms_page:", description: "CMS page (alternate key)", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "cms", orphanRisk: "medium" },

  // ── PROFESSIONALS / CONSULTANTS ─────────────────────────────
  { prefix: "consultant:", description: "Consultant profile (legacy)", owner: "seeded externally", consumers: ["index.tsx"], scoped: "entity", category: "professional", orphanRisk: "low" },
  { prefix: "professional:", description: "Professional profile (active)", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "professional", orphanRisk: "low" },
  { prefix: "professional:pending-", description: "Pending professional application", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "professional", orphanRisk: "medium" },
  { prefix: "professional_application:", description: "Professional application tracker", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "professional", orphanRisk: "medium" },

  // ── PAYMENTS ────────────────────────────────────────────────
  { prefix: "payment:", description: "Payment record", owner: "index.tsx", consumers: ["index.tsx"], scoped: "user", category: "payment", orphanRisk: "medium" },

  // ── RECOMMENDATIONS ─────────────────────────────────────────
  { prefix: "recommendation_rule:", description: "Recommendation rule", owner: "recommendation-service.ts", consumers: ["recommendation-service.ts"], scoped: "entity", category: "recommendation", orphanRisk: "low" },
  { prefix: "recommendation_rules", description: "Recommendation rules (singleton)", owner: "admin-routes.ts", consumers: ["admin-routes.ts"], scoped: "global", category: "recommendation", orphanRisk: "none" },

  // ── HEALTH CONNECT ──────────────────────────────────────────
  { prefix: "hc_status:", description: "Health Connect connection status", owner: "health-connect-routes.ts", consumers: ["health-connect-routes.ts"], scoped: "user", category: "health", orphanRisk: "low" },
  { prefix: "hc_data:", description: "Health Connect latest data", owner: "health-connect-routes.ts", consumers: ["health-connect-routes.ts"], scoped: "user", category: "health", orphanRisk: "low" },
  { prefix: "hc_history:", description: "Health Connect daily history", owner: "health-connect-routes.ts", consumers: ["health-connect-routes.ts"], scoped: "user", category: "health", orphanRisk: "low" },
  { prefix: "health:", description: "Health data records", owner: "health-connect-routes.ts", consumers: ["health-connect-routes.ts"], scoped: "user", category: "health", orphanRisk: "low", notes: "General health data entries" },

  // ── CHECK-IN SCALES ─────────────────────────────────────────
  { prefix: "checkin_scale:", description: "Check-in scale configuration", owner: "scales-routes.ts", consumers: ["scales-routes.ts"], scoped: "global", category: "scales", orphanRisk: "none" },

  // ── iKAN SCORE ─────────────────────────────────────────────
  { prefix: "ikan_score:", description: "Daily iKAN wellness score snapshots", owner: "ikan-score-routes.ts", consumers: ["ikan-score-routes.ts"], scoped: "user", category: "scoring", orphanRisk: "low", notes: "Daily snapshots for trend tracking, keyed as ikan_score:{userId}:{date}" },

  // ── ACTIVITY TRACKING ───────────────────────────────────────
  { prefix: "activity:read:", description: "Read activity record", owner: "index.tsx", consumers: [], scoped: "entity", category: "activity", orphanRisk: "high", notes: "Write-only; never cleaned" },
  { prefix: "activity:user:", description: "User's read activity ID list", owner: "index.tsx", consumers: ["index.tsx"], scoped: "user", category: "activity", orphanRisk: "medium" },
  { prefix: "user_activity:", description: "User activity log", owner: "index.tsx", consumers: ["index.tsx"], scoped: "user", category: "activity", orphanRisk: "high" },

  // ── ADMIN NOTIFICATIONS ─────────────────────────────────────
  { prefix: "admin_notification:", description: "Admin notification", owner: "index.tsx", consumers: ["index.tsx"], scoped: "global", category: "admin", orphanRisk: "medium" },

  // ── SITE SETTINGS ───────────────────────────────────────────
  { prefix: "settings:site", description: "Site settings (singleton)", owner: "index.tsx,admin-routes.ts", consumers: ["index.tsx","admin-routes.ts"], scoped: "global", category: "settings", orphanRisk: "none", notes: "Two writers: PUT /admin/settings merges, PUT /settings overwrites wholesale. Admin UI uses the merging one; the overwrite path would silently drop omitted fields." },

  // ── COMMUNICATION / BREVO ───────────────────────────────────
  { prefix: "comm-config:", description: "Communication channel config", owner: "index.tsx", consumers: ["index.tsx"], scoped: "global", category: "communication", orphanRisk: "low" },
  { prefix: "email_queue:", description: "Queued email notifications", owner: "index.tsx", consumers: [], scoped: "entity", category: "communication", orphanRisk: "high" },
  { prefix: "brevo-config", description: "Brevo API configuration (singleton)", owner: "brevo-routes.ts", consumers: ["brevo-routes.ts","index.tsx"], scoped: "global", category: "communication", orphanRisk: "none" },
  { prefix: "brevo-logs", description: "Brevo send logs (singleton array)", owner: "brevo-routes.ts", consumers: ["brevo-routes.ts"], scoped: "global", category: "communication", orphanRisk: "none" },

  // ── MONITORING / OBSERVABILITY ──────────────────────────────
  { prefix: "api-log:", description: "API request log", owner: "logging.tsx", consumers: ["logging.tsx"], scoped: "global", category: "monitoring", orphanRisk: "medium" },
  { prefix: "metrics:", description: "Performance metrics snapshot", owner: "performance.tsx", consumers: ["performance.tsx"], scoped: "global", category: "monitoring", orphanRisk: "medium" },

  // ── SECURITY ────────────────────────────────────────────────
  { prefix: "session:", description: "Active user session", owner: "security.tsx", consumers: ["security.tsx"], scoped: "user", category: "security", orphanRisk: "medium", notes: "Active sessions, should be cleaned on logout" },
  { prefix: "alert:", description: "Security alert", owner: "security.tsx", consumers: ["security.tsx"], scoped: "global", category: "security", orphanRisk: "medium", notes: "Security alerts (brute force, etc.)" },
  { prefix: "failed-login:", description: "Failed login attempt tracker", owner: "security.tsx", consumers: ["security.tsx"], scoped: "user", category: "security", orphanRisk: "medium", notes: "Tracks failed login attempts for rate limiting" },
  { prefix: "rate-limit:", description: "Rate limiting counter", owner: "security.tsx", consumers: ["security.tsx"], scoped: "user", category: "security", orphanRisk: "low", notes: "Auto-expiring rate limit counters" },

  // ── CORPORATE ───────────────────────────────────────────────
  { prefix: "corporate_program:", description: "Corporate wellness program", owner: "corporate-routes.ts", consumers: ["corporate-routes.ts"], scoped: "entity", category: "corporate", orphanRisk: "low", notes: "Corporate program definitions" },
  { prefix: "user_employer:", description: "User employer linkage", owner: "corporate-routes.ts", consumers: ["corporate-routes.ts"], scoped: "user", category: "corporate", orphanRisk: "medium", notes: "Links user to corporate employer" },
  { prefix: "corporate:", description: "Corporate entity/config", owner: "corporate-routes.ts", consumers: ["corporate-routes.ts"], scoped: "entity", category: "corporate", orphanRisk: "low", notes: "Corporate entity records" },

  // ── LEGACY / DATA EXPORT GHOSTS ─────────────────────────────
  { prefix: "tracker:", description: "Tracker entries (legacy)", owner: "unknown", consumers: ["index.tsx (data export)"], scoped: "user", category: "legacy", orphanRisk: "high" },

  // ── SYSTEM ──────────────────────────────────────────────────
  { prefix: "sys_backups", description: "Backup metadata list", owner: "admin-routes.ts", consumers: ["admin-routes.ts"], scoped: "global", category: "system", orphanRisk: "none" },
  { prefix: "backup:", description: "Backup data snapshot", owner: "admin-routes.ts", consumers: ["admin-routes.ts"], scoped: "global", category: "system", orphanRisk: "low" },
  { prefix: "backup_", description: "Full KV snapshot (underscore form)", owner: "admin-routes.ts", consumers: ["admin-routes.ts"], scoped: "global", category: "system", orphanRisk: "none", notes: "Point-in-time restore snapshots — never purge" },
  { prefix: "analytics:", description: "Aggregated analytics counters", owner: "index.tsx", consumers: ["index.tsx"], scoped: "global", category: "monitoring", orphanRisk: "low" },
  { prefix: "checkin_template_active:", description: "Active check-in template pointer", owner: "checkin-template-routes.ts", consumers: ["checkin-template-routes.ts"], scoped: "global", category: "scales", orphanRisk: "none" },

  // ── NEWSLETTER ──────────────────────────────────────────────
  { prefix: "newsletter:", description: "Newsletter subscriptions", owner: "newsletter-routes.ts", consumers: ["newsletter-routes.ts"], scoped: "entity", category: "newsletter", orphanRisk: "low" },

  // ── CONTACT SUBMISSIONS ─────────────────────────────────────
  { prefix: "contact_submission:", description: "Contact form submission", owner: "contact-routes.ts", consumers: ["contact-routes.ts"], scoped: "entity", category: "contact", orphanRisk: "low" },
  { prefix: "contact_submissions:", description: "Contact submissions (alternate)", owner: "contact-routes.ts", consumers: ["contact-routes.ts"], scoped: "entity", category: "contact", orphanRisk: "low", notes: "Alternate prefix for contact submissions" },

  // ── ACTIVITY LOGS ───────────────────────────────────────────
  { prefix: "activity_log:", description: "User activity log entry", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "activity", orphanRisk: "high", notes: "Write-heavy; one entry per tracked action; grows unbounded" },

  // ── BOOKINGS / CONSULTATIONS ────────────────────────────────
  { prefix: "booking:", description: "Consultation booking record", owner: "index.tsx", consumers: ["index.tsx"], scoped: "user", category: "booking", orphanRisk: "medium", notes: "User consultation bookings with professionals" },

  // ── TRANSACTIONS / PAYMENTS ─────────────────────────────────
  { prefix: "transaction:", description: "Razorpay payment transaction", owner: "index.tsx", consumers: ["index.tsx"], scoped: "entity", category: "payment", orphanRisk: "medium", notes: "Payment transactions via Razorpay gateway" },

  // ── SCORING ENGINE ──────────────────────────────────────────
  { prefix: "scoring-profile:", description: "Scoring engine profile config", owner: "admin-routes.ts", consumers: ["admin-routes.ts"], scoped: "entity", category: "scoring", orphanRisk: "low", notes: "Admin-defined scoring profiles for assessments" },

  // ── HERO BANNERS ────────────────────────────────────────────
  { prefix: "hero_banner:", description: "Hero banner config per page", owner: "hero-banner-routes.ts", consumers: ["hero-banner-routes.ts"], scoped: "global", category: "cms", orphanRisk: "none", notes: "Per-page hero banner overrides for built-in screens" },

  // ── CHECK-IN TEMPLATES ──────────────────────────────────────
  { prefix: "checkin_template:", description: "Check-in flow template", owner: "checkin-template-routes.ts", consumers: ["checkin-template-routes.ts"], scoped: "global", category: "scales", orphanRisk: "low", notes: "Admin-configured check-in flow templates" },

  // ── REMINDERS ───────────────────────────────────────────────
  { prefix: "reminder:last:", description: "Last reminder sent timestamp", owner: "reminder-routes.ts", consumers: ["reminder-routes.ts"], scoped: "user", category: "communication", orphanRisk: "low", notes: "Cooldown timestamps for reminder deduplication" },
];

// Sort prefixes longest-first so longer prefixes match before shorter ones
const ALL_KNOWN_PREFIXES = KV_SCHEMA.map(s => s.prefix).sort((a, b) => b.length - a.length);

function classifyKey(key: string): KVKeyDef | null {
  for (const def of KV_SCHEMA) {
    if (key.startsWith(def.prefix) || key === def.prefix.replace(/:$/, "")) {
      return def;
    }
  }
  return null;
}

// ── Full database scan (paginated) ────────────────────────────
// Returns ALL rows as { key, value } pairs
async function fullDatabaseScan(): Promise<{ key: string; value: any }[]> {
  const client = supabase();
  const allRows: { key: string; value: any }[] = [];
  const batchSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await client
      .from("kv_store_cc205da9")
      .select("key, value")
      .range(offset, offset + batchSize - 1)
      .order("key", { ascending: true });

    if (error) {
      console.log(`DB scan error at offset ${offset}: ${error.message}`);
      throw error;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allRows.push(...data);
      offset += data.length;
      if (data.length < batchSize) {
        hasMore = false;
      }
    }
  }

  return allRows;
}

// ── UUID detection ────────────────────────────────────────────
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function extractUserId(key: string): string | null {
  const match = key.match(UUID_RE);
  return match ? match[0] : null;
}

// ── Parent → child relations ────────────────────────────────────────
// Records in this store relate through FIELDS INSIDE THE VALUE, not through
// key structure. Checking key shape (or the idx_* index keys) reports records
// as orphaned when they are correctly linked: every day: carries equip_id and
// every block: carries equip_day_id, and none of them dangle — but the
// idx_equip_days:/idx_day_blocks: keys those checks looked for do not exist in
// this database and never did, because program content lives in the
// equip.daily_content blob instead.
//
// Declare the real relations here and join on them. Anything added to the
// store should gain an entry, so the auditor keeps describing the actual schema.
interface Relation {
  child: string;            // child key prefix
  parent: string;           // parent key prefix
  fields: string[];         // candidate fields on the child holding the parent reference
  label: string;
  /**
   * By default the child's reference is the parent's id, resolved as
   * `${parent}${id}`. When set, the reference instead matches one of these
   * FIELDS on the parent record — resource.category holds a slug like
   * "mental-health", not a category id, so it resolves against category.slug.
   */
  parentMatchFields?: string[];
  /** References that legitimately have no parent record. */
  exempt?: (id: string, value: any) => boolean;
}

const RELATIONS: Relation[] = [
  { child: "day:",                 parent: "equip:",          fields: ["equip_id", "equipId"],            label: "day → equip" },
  { child: "block:",               parent: "day:",            fields: ["equip_day_id", "day_id", "dayId"], label: "block → day" },
  { child: "progress:",            parent: "equip:",          fields: ["equip_id", "equipId"],            label: "progress → equip" },
  { child: "enrollment:",          parent: "equip:",          fields: ["programId", "equip_id"],          label: "enrollment → equip" },
  { child: "recommendation_rule:", parent: "equip:",          fields: ["equip_id", "programId"],          label: "rule → equip" },
  {
    child: "resource:", parent: "category:", fields: ["category", "category_id", "categoryId"],
    label: "resource → category",
    parentMatchFields: ["slug", "name"],
  },
  {
    child: "assessment_result:", parent: "assessment_def:", fields: ["assessment_id"],
    label: "result → assessment",
    // Check-ins reuse this field with a synthetic id that has no definition,
    // and results whose assessment was deliberately deleted are kept as user
    // history and flagged at delete time — neither is an orphan.
    exempt: (id, value) => id.startsWith("checkin") || value?.assessment_deleted === true,
  },
];

/** Resolve the parent id a child record points at, if any. */
function parentIdFor(rel: Relation, value: any): string | null {
  if (!value || typeof value !== "object") return null;
  for (const f of rel.fields) {
    const v = value[f];
    if (typeof v === "string" && v !== "") return v;
  }
  return null;
}

// ── Route registration ────────────────────────────────────────

export function registerKVAuditRoutes(app: Hono, requireAuth: any) {

  // ── GET /admin/kv-audit — Full KV audit (full DB scan) ──────
  app.get("/admin/kv-audit", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      console.log("Starting full KV database scan...");
      const allRows = await fullDatabaseScan();
      console.log(`Scanned ${allRows.length} total keys`);

      // Classify every key
      const categorized: Record<string, { count: number; samples: { key: string; valuePreview: string }[] }> = {};
      const uncategorizedKeys: { key: string; value: string }[] = [];
      const orphans: { key: string; reason: string; category: string }[] = [];
      const softDeleted: string[] = [];
      const userKeyCounts: Record<string, { email?: string; keyCount: number; prefixes: Record<string, number> }> = {};

      // Index of all keys for orphan detection
      const allKeySet = new Set(allRows.map(r => r.key));

      // Owner set for user-data orphan checks. auth.users is authoritative —
      // the `user:` KV records are stale copies (13 of them for 6 real
      // accounts), so keying off those both missed real orphans and risked
      // flagging live users. If the lookup fails, leave this null and skip the
      // owner checks entirely rather than report every record as orphaned.
      let authUserIds: Set<string> | null = null;
      try {
        const { data, error } = await supabase().auth.admin.listUsers({ perPage: 1000 });
        if (error) {
          console.log(`kv-audit: auth user list failed, skipping owner checks: ${error.message}`);
        } else {
          authUserIds = new Set((data?.users ?? []).map((u: any) => u.id));
        }
      } catch (err) {
        console.log(`kv-audit: auth user list threw, skipping owner checks: ${err}`);
      }

      // Lazily-built index of parent field values, for relations that match a
      // field on the parent (resource.category -> category.slug) rather than
      // the parent's id. Built once per relation, not per row.
      const parentFieldCache = new Map<string, Set<string>>();
      const parentFieldIndex = (rel: Relation): Set<string> => {
        const cacheKey = `${rel.child}->${rel.parent}`;
        const cached = parentFieldCache.get(cacheKey);
        if (cached) return cached;

        const idx = new Set<string>();
        for (const r of allRows) {
          if (!r.key.startsWith(rel.parent)) continue;
          if (!r.value || typeof r.value !== "object") continue;
          for (const f of rel.parentMatchFields ?? []) {
            const v = (r.value as any)[f];
            if (typeof v === "string" && v !== "") idx.add(v);
          }
        }
        parentFieldCache.set(cacheKey, idx);
        return idx;
      };

      for (const row of allRows) {
        const def = classifyKey(row.key);

        if (def) {
          // Categorized
          if (!categorized[def.prefix]) {
            categorized[def.prefix] = { count: 0, samples: [] };
          }
          categorized[def.prefix].count++;
          if (categorized[def.prefix].samples.length < 3) {
            categorized[def.prefix].samples.push({
              key: row.key,
              valuePreview: JSON.stringify(row.value).slice(0, 120)
            });
          }
        } else {
          // Uncategorized
          uncategorizedKeys.push({
            key: row.key,
            value: JSON.stringify(row.value).slice(0, 80)
          });
        }

        // Detect soft-deleted entities
        if (row.value && typeof row.value === "object" && row.value.deleted === true) {
          softDeleted.push(row.key);
        }

        // Per-user data footprint
        const uid = extractUserId(row.key);
        if (uid) {
          if (!userKeyCounts[uid]) {
            userKeyCounts[uid] = { keyCount: 0, prefixes: {} };
          }
          userKeyCounts[uid].keyCount++;
          const colonIdx = row.key.indexOf(":");
          const pfx = colonIdx > 0 ? row.key.substring(0, colonIdx + 1) : row.key;
          userKeyCounts[uid].prefixes[pfx] = (userKeyCounts[uid].prefixes[pfx] || 0) + 1;

          // Try to extract email from user: records
          if (row.key.startsWith("user:") && row.value?.email) {
            userKeyCounts[uid].email = row.value.email;
          }
        }
      }

      // ── Orphan detection ──────────────────────────────────────
      // Check slug -> entity references
      for (const row of allRows) {
        // slug lookups pointing to nonexistent entities
        if (row.key.startsWith("equip_slug:") && row.value) {
          const equipId = typeof row.value === "string" ? row.value : row.value.id;
          if (equipId && !allKeySet.has(`equip:${equipId}`)) {
            orphans.push({ key: row.key, reason: `Points to missing equip:${equipId}`, category: "slug-dangling" });
          }
        }
        if (row.key.startsWith("page_slug:") && row.value) {
          const pageId = typeof row.value === "string" ? row.value : row.value;
          if (pageId && !allKeySet.has(`page:${pageId}`)) {
            orphans.push({ key: row.key, reason: `Points to missing page:${pageId}`, category: "slug-dangling" });
          }
        }
        if (row.key.startsWith("content_slug:") && row.value) {
          const contentId = typeof row.value === "string" ? row.value : row.value;
          if (contentId && !allKeySet.has(`content:${contentId}`)) {
            orphans.push({ key: row.key, reason: `Points to missing content:${contentId}`, category: "slug-dangling" });
          }
        }

        // Parent references, joined on VALUE FIELDS.
        // The previous checks here looked for idx_equip_days:/idx_day_blocks:
        // index keys. Those do not exist in this database and never have, so
        // the checks were dead while the records they were meant to validate
        // (day:, block:) went unchecked. RELATIONS describes how records
        // actually link; see the comment on that table.
        for (const rel of RELATIONS) {
          if (!row.key.startsWith(rel.child)) continue;

          const ref = parentIdFor(rel, row.value);
          if (!ref) {
            orphans.push({
              key: row.key,
              reason: `${rel.label}: no parent reference (expected one of ${rel.fields.join(", ")})`,
              category: "missing-parent-ref",
            });
            break;
          }

          if (rel.exempt?.(ref, row.value)) break;

          const exists = rel.parentMatchFields
            ? parentFieldIndex(rel).has(ref)
            : allKeySet.has(`${rel.parent}${ref}`);

          if (!exists) {
            orphans.push({
              key: row.key,
              reason: `${rel.label}: parent "${ref}" not found`,
              category: "parent-dangling",
            });
          }
          break;
        }

        // user-scoped data whose owner no longer exists.
        // Checked against auth.users, not `user:{uid}` KV records: those are
        // stale copies (13 exist for 6 real accounts), so keying off them both
        // missed genuine orphans and could flag live users.
        if (row.key.startsWith("enrollment:") || row.key.startsWith("user_enrollment:") ||
            row.key.startsWith("assessment_response_by_user:") || row.key.startsWith("journal_by_user:") ||
            row.key.startsWith("assessment_result:") || row.key.startsWith("journal:") ||
            row.key.startsWith("progress:") || row.key.startsWith("ikan_score:") ||
            row.key.startsWith("payment:")) {
          const uid = extractUserId(row.key) ??
            (typeof row.value === "object" ? (row.value?.user_id ?? row.value?.userId ?? null) : null);
          if (uid && authUserIds && !authUserIds.has(uid)) {
            orphans.push({
              key: row.key,
              reason: `Owner ${String(uid).slice(0, 8)}… no longer in auth.users`,
              category: "user-data-orphan",
            });
          }
        }
      }

      // ── Naming inconsistencies ────────────────────────────────
      const inconsistencies: { issue: string; keys: string[] }[] = [];

      // assessment_result: vs assessment-result:
      const underscoreResults = categorized["assessment_result:"]?.count || 0;
      const hyphenResults = categorized["assessment-result:"]?.count || 0;
      if (underscoreResults > 0 && hyphenResults > 0) {
        inconsistencies.push({
          issue: "assessment_result: and assessment-result: both exist (underscore vs hyphen)",
          keys: ["assessment_result:*", "assessment-result:*"]
        });
      }

      // program-progress: vs progress:
      const programProgressCount = categorized["program-progress:"]?.count || 0;
      const progressCount = categorized["progress:"]?.count || 0;
      if (programProgressCount > 0 && progressCount > 0) {
        inconsistencies.push({
          issue: "program-progress: and progress: both exist (legacy vs current)",
          keys: ["program-progress:*", "progress:*"]
        });
      }

      // ── Growth warnings ───────────────────────────────────────
      const growthWarnings: { prefix: string; count: number; warning: string }[] = [];

      // Check prefix mismatches (CRITICAL)
      const equipCount = categorized["equip:"]?.count || 0;
      const equipProgramCount = categorized["equip_program:"]?.count || 0;
      if (equipCount > 0 && equipProgramCount === 0) {
        growthWarnings.push({
          prefix: "equip_program:",
          count: 0,
          warning: `CRITICAL: Admin has ${equipCount} programs (equip:) but user-facing prefix (equip_program:) has 0. Users cannot see programs. Use Sync.`
        });
      }

      const assessmentDefCount = categorized["assessment_def:"]?.count || 0;
      const assessmentCount = categorized["assessment:"]?.count || 0;
      if (assessmentDefCount > 0 && assessmentCount === 0) {
        growthWarnings.push({
          prefix: "assessment:",
          count: 0,
          warning: `CRITICAL: Admin has ${assessmentDefCount} assessment definitions but user-facing prefix has 0. Users cannot see assessments.`
        });
      }

      // Audit logs growing
      let auditTotal = 0;
      for (const pfx of Object.keys(categorized)) {
        if (pfx.startsWith("audit:")) auditTotal += categorized[pfx].count;
      }
      if (auditTotal > 100) {
        growthWarnings.push({
          prefix: "audit:*",
          count: auditTotal,
          warning: `${auditTotal} audit records are write-only and accumulating. Consider pruning.`
        });
      }

      // Activity growing
      const activityReadCount = categorized["activity:read:"]?.count || 0;
      if (activityReadCount > 200) {
        growthWarnings.push({
          prefix: "activity:read:",
          count: activityReadCount,
          warning: `${activityReadCount} read-activity records growing unbounded.`
        });
      }

      // Enrollment mismatch
      const enrollmentCount = categorized["enrollment:"]?.count || 0;
      const userEnrollmentCount = categorized["user_enrollment:"]?.count || 0;
      if (enrollmentCount > 0 && userEnrollmentCount > 0 && Math.abs(enrollmentCount - userEnrollmentCount) > 2) {
        growthWarnings.push({
          prefix: "enrollment:",
          count: enrollmentCount,
          warning: `enrollment: has ${enrollmentCount}, user_enrollment: has ${userEnrollmentCount}. These should be roughly equal.`
        });
      }

      // Build per-user footprint (top 20 by key count)
      const userDataFootprint = Object.entries(userKeyCounts)
        .sort((a, b) => b[1].keyCount - a[1].keyCount)
        .slice(0, 20)
        .map(([uid, data]) => ({
          userId: uid,
          email: data.email,
          keyCount: data.keyCount,
          prefixes: data.prefixes
        }));

      // Count unique users
      const uniqueUsers = new Set(
        allRows.filter(r => r.key.startsWith("user:") && !r.key.includes(":")).length > 0
          ? allRows.filter(r => r.key.startsWith("user:")).map(r => r.key.replace("user:", ""))
          : Object.keys(userKeyCounts)
      );

      const audit = {
        timestamp: new Date().toISOString(),
        totalKeys: allRows.length,
        categorized,
        uncategorizedKeys: uncategorizedKeys.slice(0, 500), // Cap sample at 500
        uncategorizedCount: uncategorizedKeys.length,
        orphans,
        orphanCount: orphans.length,
        inconsistencies,
        growthWarnings,
        softDeleted: softDeleted.slice(0, 100),
        softDeletedCount: softDeleted.length,
        userDataFootprint,
        totalUsers: uniqueUsers.size || Object.keys(userKeyCounts).length
      };

      console.log(`KV audit complete: ${allRows.length} total, ${uncategorizedKeys.length} uncategorized, ${orphans.length} orphans`);

      return c.json({ audit });
    } catch (err) {
      console.log(`KV audit error: ${err}`);
      return c.json({ error: `KV audit failed: ${err}` }, 500);
    }
  });

  // ── POST /admin/kv-audit/cleanup — Delete specific keys ─────
  app.post("/admin/kv-audit/cleanup", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const { keys, dryRun } = await c.req.json();
      if (!Array.isArray(keys) || keys.length === 0) {
        return c.json({ error: "keys array is required" }, 400);
      }

      if (dryRun !== false) {
        return c.json({ wouldDelete: keys.length, keys: keys.slice(0, 20) });
      }

      let deleted = 0;
      const failed: string[] = [];

      // Delete in batches of 50
      for (let i = 0; i < keys.length; i += 50) {
        const batch = keys.slice(i, i + 50);
        try {
          await kv.mdel(batch);
          deleted += batch.length;
        } catch (err) {
          console.log(`Batch delete error: ${err}`);
          failed.push(...batch);
        }
      }

      console.log(`KV cleanup: deleted ${deleted}, failed ${failed.length}`);
      return c.json({ deleted, failed, total: keys.length });
    } catch (err) {
      console.log(`KV cleanup error: ${err}`);
      return c.json({ error: `KV cleanup failed: ${err}` }, 500);
    }
  });

  // ── POST /admin/kv-audit/prune-audit-trail ──────────────────
  app.post("/admin/kv-audit/prune-audit-trail", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const { olderThanDays, dryRun } = await c.req.json();
      const days = Number(olderThanDays) || 30;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Scan all audit: keys
      const client = supabase();
      const { data: auditRows, error } = await client
        .from("kv_store_cc205da9")
        .select("key, value")
        .like("key", "audit:%");

      if (error) throw error;

      const total = auditRows?.length || 0;
      const toDelete: string[] = [];

      for (const row of auditRows || []) {
        const ts = row.value?.timestamp || row.value?.created_at;
        if (ts && new Date(ts) < cutoffDate) {
          toDelete.push(row.key);
        }
      }

      if (dryRun !== false) {
        return c.json({
          wouldPrune: toDelete.length,
          total,
          cutoffDate: cutoffDate.toISOString(),
          sampleKeys: toDelete.slice(0, 10)
        });
      }

      // Delete in batches
      let pruned = 0;
      for (let i = 0; i < toDelete.length; i += 50) {
        const batch = toDelete.slice(i, i + 50);
        try {
          await kv.mdel(batch);
          pruned += batch.length;
        } catch (err) {
          console.log(`Prune batch error: ${err}`);
        }
      }

      console.log(`Pruned ${pruned} of ${total} audit keys (cutoff: ${cutoffDate.toISOString()})`);
      return c.json({ pruned, total, cutoffDate: cutoffDate.toISOString() });
    } catch (err) {
      console.log(`Prune error: ${err}`);
      return c.json({ error: `Prune failed: ${err}` }, 500);
    }
  });

  // ── POST /admin/kv-audit/migrate-naming ─────────────────────
  app.post("/admin/kv-audit/migrate-naming", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const { fromPrefix, toPrefix, dryRun } = await c.req.json();
      if (!fromPrefix || !toPrefix) {
        return c.json({ error: "fromPrefix and toPrefix are required" }, 400);
      }

      // Get all keys with fromPrefix
      const client = supabase();
      const { data: rows, error } = await client
        .from("kv_store_cc205da9")
        .select("key, value")
        .like("key", `${fromPrefix}%`);

      if (error) throw error;

      const total = rows?.length || 0;

      if (dryRun !== false) {
        return c.json({
          wouldMigrate: total,
          fromPrefix,
          toPrefix,
          sampleKeys: (rows || []).slice(0, 5).map(r => ({
            from: r.key,
            to: toPrefix + r.key.slice(fromPrefix.length)
          }))
        });
      }

      let migrated = 0;
      const errors: string[] = [];

      for (const row of rows || []) {
        const newKey = toPrefix + row.key.slice(fromPrefix.length);
        try {
          await kv.set(newKey, row.value);
          await kv.del(row.key);
          migrated++;
        } catch (err) {
          errors.push(`${row.key}: ${err}`);
        }
      }

      console.log(`Migrated ${migrated} keys from "${fromPrefix}" to "${toPrefix}"`);
      return c.json({ migrated, total, errors: errors.length > 0 ? errors : undefined });
    } catch (err) {
      console.log(`Migration error: ${err}`);
      return c.json({ error: `Migration failed: ${err}` }, 500);
    }
  });

  // ── POST /admin/kv-audit/save-snapshot ──────────────────────
  app.post("/admin/kv-audit/save-snapshot", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const data = await c.req.json();
      const snapshot = {
        ...data,
        timestamp: new Date().toISOString(),
        savedBy: userId
      };

      await kv.set(`audit_snapshot:${Date.now()}`, snapshot);

      console.log(`Audit snapshot saved: score=${data.score}, keys=${data.totalKeys}`);
      return c.json({ success: true, snapshot });
    } catch (err) {
      console.log(`Snapshot save error: ${err}`);
      return c.json({ error: `Failed to save snapshot: ${err}` }, 500);
    }
  });

  // ── GET /admin/kv-audit/trends ──────────────────────────────
  app.get("/admin/kv-audit/trends", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const client = supabase();
      const { data: rows, error } = await client
        .from("kv_store_cc205da9")
        .select("key, value")
        .like("key", "audit_snapshot:%")
        .order("key", { ascending: true });

      if (error) throw error;

      const snapshots = (rows || []).map(r => r.value).filter(Boolean);

      return c.json({ snapshots });
    } catch (err) {
      console.log(`Trends error: ${err}`);
      return c.json({ error: `Failed to get trends: ${err}` }, 500);
    }
  });

  // ── POST /admin/kv-audit/sync-prefixes ──────────────────────
  app.post("/admin/kv-audit/sync-prefixes", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const body = await c.req.json().catch(() => ({}));
      const dryRun = body.dryRun !== false;
      const actions: string[] = [];
      let synced = 0;

      // Sync equip: -> equip_program:
      const equips = await kv.getByPrefix("equip:");
      for (const equip of equips) {
        if (!equip || !equip.id) continue;
        const existing = await kv.get(`equip_program:${equip.id}`);
        if (!existing) {
          actions.push(`SYNC equip:${equip.id} -> equip_program:${equip.id}`);
          if (!dryRun) {
            await kv.set(`equip_program:${equip.id}`, equip);
            if (equip.slug) {
              await kv.set(`equip_program_by_slug:${equip.slug}`, equip);
            }
          }
          synced++;
        }
      }

      // Sync assessment_def: -> assessment:
      const assessmentDefs = await kv.getByPrefix("assessment_def:");
      for (const def of assessmentDefs) {
        if (!def || !def.id || def.deleted) continue;
        const existing = await kv.get(`assessment:${def.id}`);
        if (!existing) {
          actions.push(`SYNC assessment_def:${def.id} -> assessment:${def.id}`);
          if (!dryRun) {
            await kv.set(`assessment:${def.id}`, def);
          }
          synced++;
        }
      }

      // resource: -> library:resource: sync removed.
      // The mirror was written only by delete, never by create or update, so it
      // drifted into stale snapshots. Readers now use resource: directly.

      console.log(`${dryRun ? "DRY RUN" : "EXECUTED"}: Synced ${synced} records`);

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

  // ── POST /admin/kv-audit/purge-prefix ───────────────────────
  app.post("/admin/kv-audit/purge-prefix", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const { prefix, dryRun, force } = await c.req.json();
      if (!prefix || prefix.length < 2) {
        return c.json({ error: "Prefix must be at least 2 characters" }, 400);
      }

      // ── Guardrail ────────────────────────────────────────────────
      // A purge of `assessment_slug:` once wiped every slug->id lookup and
      // broke /assessment/<slug> site-wide. Reverse-index and snapshot keys
      // look like junk (short values, no obvious owner) but are load-bearing,
      // so they can never be purged by prefix. Delete the parent entity
      // instead — its CRUD handler cleans up the matching index key.
      const PROTECTED_PREFIXES = [
        "assessment_slug:", "equip_slug:", "page_slug:", "content_slug:",
        "dataset_key:", "equip_program_by_slug:",
        "idx_equip_days:", "idx_day_blocks:",
        "backup_", "backup:", "sys_backups",
      ];
      const protectedHit = PROTECTED_PREFIXES.find(
        p => prefix.startsWith(p) || p.startsWith(prefix)
      );
      if (protectedHit) {
        return c.json({
          error: `Refusing to purge "${prefix}" — it overlaps the protected prefix "${protectedHit}". ` +
                 `These are reverse-index or backup keys that the app depends on. ` +
                 `Delete the parent record instead; its CRUD handler removes the index entry.`,
          protectedPrefix: protectedHit,
        }, 400);
      }

      // Purging a registered prefix means deleting live, owned data — require
      // an explicit force flag so it can't happen from a stray click.
      const registered = KV_SCHEMA.find(e => e.prefix === prefix);
      if (registered && dryRun === false && force !== true) {
        return c.json({
          error: `"${prefix}" is a registered, in-use prefix (${registered.description}, owner: ${registered.owner}). ` +
                 `Re-send with force=true if you really mean to delete this live data.`,
          requiresForce: true,
          registered,
        }, 409);
      }

      // Get all keys with this prefix
      const client = supabase();
      const { data: rows, error } = await client
        .from("kv_store_cc205da9")
        .select("key")
        .like("key", `${prefix}%`);

      if (error) throw error;

      const total = rows?.length || 0;
      const keys = (rows || []).map(r => r.key);

      if (dryRun !== false) {
        return c.json({
          wouldDelete: total,
          prefix,
          sampleKeys: keys.slice(0, 10)
        });
      }

      // Delete in batches
      let deleted = 0;
      let failedCount = 0;

      for (let i = 0; i < keys.length; i += 50) {
        const batch = keys.slice(i, i + 50);
        try {
          await kv.mdel(batch);
          deleted += batch.length;
        } catch (err) {
          console.log(`Purge batch error: ${err}`);
          failedCount += batch.length;
        }
      }

      console.log(`Purged ${deleted} keys with prefix "${prefix}" (${failedCount} failed)`);
      return c.json({ deleted, total, failed: failedCount > 0 ? failedCount : undefined, prefix });
    } catch (err) {
      console.log(`Purge error: ${err}`);
      return c.json({ error: `Purge failed: ${err}` }, 500);
    }
  });

  // ── GET /admin/kv-schema — Schema definition ────────────────
  app.get("/admin/kv-schema", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const userProfile = await kv.get(`user:${userId}`);
      if (!userProfile?.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      // Live relation health. The registry alone only says how things are
      // *meant* to link; these counts say whether they actually do. Computed
      // from a full scan, same source of truth the audit itself uses.
      const allRows = await fullDatabaseScan();
      const keySet = new Set(allRows.map(r => r.key));
      const liveCounts: Record<string, number> = {};
      for (const row of allRows) {
        const p = row.key.indexOf(":") > 0 ? row.key.slice(0, row.key.indexOf(":") + 1) : row.key;
        liveCounts[p] = (liveCounts[p] || 0) + 1;
      }

      // Same parent-field index the audit scan uses, rebuilt here because that
      // one is scoped to its own handler. Built once per relation, not per row.
      const parentFieldIndex = (rel: Relation): Set<string> => {
        const idx = new Set<string>();
        for (const r of allRows) {
          if (!r.key.startsWith(rel.parent)) continue;
          if (!r.value || typeof r.value !== "object") continue;
          for (const f of rel.parentMatchFields ?? []) {
            const v = (r.value as any)[f];
            if (typeof v === "string" && v !== "") idx.add(v);
          }
        }
        return idx;
      };

      const relationHealth = RELATIONS.map(rel => {
        const children = allRows.filter(r => r.key.startsWith(rel.child));
        const parentIdx = rel.parentMatchFields ? parentFieldIndex(rel) : null;
        let missingRef = 0;
        let dangling = 0;
        let exempt = 0;

        for (const child of children) {
          const ref = parentIdFor(rel, child.value);
          if (!ref) { missingRef++; continue; }
          if (rel.exempt?.(ref, child.value)) { exempt++; continue; }
          const exists = parentIdx ? parentIdx.has(ref) : keySet.has(`${rel.parent}${ref}`);
          if (!exists) dangling++;
        }

        return {
          label: rel.label,
          child: rel.child,
          parent: rel.parent,
          joinFields: rel.fields,
          childCount: children.length,
          parentCount: liveCounts[rel.parent] ?? 0,
          missingRef,
          exempt,
          dangling,
          healthy: missingRef === 0 && dangling === 0,
        };
      });

      return c.json({
        schema: KV_SCHEMA,
        totalPrefixes: KV_SCHEMA.length,
        categories: [...new Set(KV_SCHEMA.map(s => s.category))],
        relations: relationHealth,
        liveCounts,
        unregisteredPrefixes: Object.keys(liveCounts)
          .filter(p => !p.startsWith("backup_") && !KV_SCHEMA.some(s => p.startsWith(s.prefix) || s.prefix.startsWith(p)))
          .map(p => ({ prefix: p, count: liveCounts[p] })),
        criticalMismatches: [
          { admin: "equip:{id}", user: "equip_program:{id}", fix: "POST /admin/kv-audit/sync-prefixes" },
          { admin: "assessment_def:{id}", user: "assessment:{id}", fix: "POST /admin/kv-audit/sync-prefixes" },
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