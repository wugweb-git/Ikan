// Freeze the public catalogue into the static site.
//
// ikanhealth.in serves static pages only (2026-09-21): the assessment, equip
// and consultation pages render from JSON committed under
// src/product/site/content/data/, not from live API calls. This script refreshes that
// JSON from the same public, read-only endpoints any visitor's browser calls
// (anon key). It writes nothing anywhere else.
//
//   node scripts/snapshot-site-data.mjs
//
// Review the diff before committing — this is how new or edited programs reach
// the site.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const info = readFileSync(join(ROOT, 'src/shared/api/supabase-info.tsx'), 'utf8');
const projectId = info.match(/projectId\s*=\s*"([^"]+)"/)[1];
const anonKey = info.match(/publicAnonKey\s*=\s*"([^"]+)"/)[1];
const API = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;
const OUT = join(ROOT, 'src/product/site/content/data');

async function get(path) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${anonKey}` } });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

// ── What gets written ─────────────────────────────────────────────────────
//
// ONLY the fields the five static pages read (src/product/site/pages/
// {Assessments,AssessmentDetail,EquipPrograms,EquipDetail,Consultation}.tsx,
// via src/product/site/content/catalog.ts). Everything else the API returns is
// dropped here, on purpose:
//   - equip day/activity content (`daily_content`, `days`, onboarding, check-in
//     config) is the paid programme itself — only its day/activity COUNTS ship;
//   - assessment questions, options and scoring stay in the app — only the
//     question COUNT ships;
//   - consultant reviews (patient names), FAQs, availability calendars and ids
//     are not shown on the listing and are not written.
// Adding a field to a page means adding it to the pick below, deliberately.

/** Copy only `keys` that are present (not undefined/null) on `src`. */
function pick(src, keys) {
  const out = {};
  for (const k of keys) {
    const v = src?.[k];
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out;
}

function pickAssessment(a) {
  const questionCount = Array.isArray(a.questions) && a.questions.length > 0 ? a.questions.length : null;
  const metadata = pick(a.metadata, [
    'category', 'thumbnail', 'hero_image', 'image',
    'important_note_1', 'important_note_2', 'tile4_content', 'tile5_content',
  ]);
  return {
    ...pick(a, [
      'id', 'assessment_id', 'slug', 'title', 'description', 'category', 'published',
      'duration', 'difficulty', 'cta_button_text',
      'thumbnail', 'hero_image', 'image_url', 'thumbnail_url', 'cover_image',
      'section1_title', 'section1_eligibility_title', 'section1_eligibility_points',
      'section1_who_title', 'section1_who_content',
      'section2_title', 'about_title', 'section2_content', 'about_content',
      'section2_image', 'about_image', 'section2_bullets',
      'section3_title', 'highlights_title', 'section3_subtitle', 'section3_content', 'highlights',
      'section4_notes_title', 'notes_title', 'section4_notes', 'notes',
    ]),
    questionCount,
    ...(Object.keys(metadata).length ? { metadata } : {}),
  };
}

function pickProgram(p) {
  // Counts only — the same rule as src/product/app/programs/equip-meta.ts.
  const days = Array.isArray(p.daily_content) && p.daily_content.length > 0 ? p.daily_content
    : Array.isArray(p.days) ? p.days : [];
  let activities = 0;
  for (const d of days) {
    const blocks = d?.blocks ?? d?.activities;
    if (Array.isArray(blocks)) activities += blocks.length;
  }
  const metadata = pick(p.metadata, [
    'hero_image', 'cover_image', 'image', 'thumbnail',
    'tile1_content', 'tile2_content', 'tile3_content', 'tile4_content',
    'eligibility_intro', 'eligibility_point_1', 'eligibility_point_2',
    'eligibility_point_3', 'eligibility_point_4',
    'right_column_items', 'how_it_works_subtitle', 'how_it_works_footer',
  ]);
  return {
    ...pick(p, [
      'id', 'equip_id', 'slug', 'title', 'name', 'description', 'short_description', 'summary',
      'category', 'published', 'is_paid', 'price', 'currency', 'cta_button_text',
      'thumbnail', 'thumbnail_url', 'hero_image', 'image_url', 'cover_image', 'image',
    ]),
    dayCount: days.length > 0 ? days.length : null,
    activityCount: activities > 0 ? activities : null,
    ...(Object.keys(metadata).length ? { metadata } : {}),
  };
}

function pickConsultant(c) {
  return pick(c, [
    'name', 'credentials', 'category', 'photo', 'yearsExperience', 'languages', 'location',
    'sessionModes', 'expertises', 'topExpertises', 'pricing', 'nextAvailableSlot',
    'rating', 'reviewCount', 'bio', 'available',
  ]);
}

const assessmentsList = (await get('/assessments')).assessments ?? [];
const assessments = [];
for (const a of assessmentsList) {
  const full = (await get(`/assessments/${encodeURIComponent(a.id)}`)).assessment ?? a;
  if (full.published === false) continue;
  assessments.push(pickAssessment(full));
}
const programsList = (await get('/equip/programs')).programs ?? [];
const programs = [];
for (const p of programsList) {
  const full = (await get(`/equip/programs/${encodeURIComponent(p.id)}`)).program ?? p;
  if (full.published !== true) continue;
  programs.push(pickProgram(full));
}
const consultants = ((await get('/consultants')).consultants ?? []).map(pickConsultant);

mkdirSync(OUT, { recursive: true });
const stamp = new Date().toISOString();
for (const [name, rows] of [['assessments', assessments], ['equip-programs', programs], ['consultants', consultants]]) {
  writeFileSync(join(OUT, `${name}.json`), JSON.stringify({ snapshotAt: stamp, rows }, null, 1) + '\n');
  console.log(`${name}: ${rows.length}`);
}
