/**
 * One mapping from a stored `resource:` record to the shape `ResourceCard`
 * renders.
 *
 * It is a module rather than a function inside a screen because the mapping is
 * not obvious and getting it wrong is silent. The stored record does **not**
 * carry the field names the card expects:
 *
 * | card wants | record actually has | on |
 * |---|---|---|
 * | `image`    | `thumbnail`         | 9 of 9 |
 * |            | `image_url`         | 2 of 9 |
 * | `readTime` | `readTime`          | 9 of 9 |
 * |            | `read_time`         | 2 of 9 |
 *
 * Measured across all 9 live records 2026-09-08. Reading `record.image`
 * directly yields `undefined` on every one of them and renders a card with an
 * empty image well — no error, no warning, just a hole. This is the same class
 * of defect as `equip_name` vs `title` on the recommendations endpoint, and as
 * the `category_id` / `category` mismatch in CLAUDE.md's relation-check note:
 * a field name assumed to match a similarly-named entity.
 *
 * `Library.tsx` worked out the correct chain already; this is that chain,
 * extracted so a second reader cannot get a different answer.
 */
import type { ResourcePost } from '../components/page-blocks/ResourceCard';

/** A stored `resource:` record. Untyped in KV, so every field is optional. */
export interface ResourceRecord {
  id?: string;
  resource_id?: string;
  title?: string;
  description?: string;
  excerpt?: string;
  category?: string;
  contentType?: string;
  thumbnail?: string;
  image?: string;
  image_url?: string;
  /** Stored as a NUMBER on all 9 live records, despite the name. */
  readTime?: string | number;
  read_time?: string | number;
  read_time_minutes?: number;
  created_at?: string;
  date?: string;
  publishedDate?: string;
  published?: boolean;
  published_at?: string;
  featured?: boolean;
}

export interface PresentedResource extends ResourcePost {
  published: boolean;
  featured: boolean;
}

/**
 * The image, or an empty string.
 *
 * Order matters: `thumbnail` is the field every live record carries, so it is
 * tried first. `image` is included only because a future record might use the
 * name the card's own type declares.
 */
export function resourceImage(r: ResourceRecord): string {
  return r.thumbnail || r.image || r.image_url || '';
}

/**
 * Reading time as a display string, however the record spells it.
 *
 * All 9 live records store `readTime: "5"` — a bare number, not a phrase — so
 * the card rendered "Mar 11, 2026 · 5". A numeric value is given its unit
 * rather than passed through; a value that already reads as a phrase
 * ("6 min read") is left alone.
 */
export function resourceReadTime(r: ResourceRecord): string {
  if (typeof r.read_time_minutes === 'number' && r.read_time_minutes > 0) {
    return `${r.read_time_minutes} min read`;
  }
  // KV is untyped and this field is a NUMBER on every live record, so it is
  // coerced before anything string-shaped is done to it. `value->>'readTime'`
  // in SQL renders it as text, which hides the distinction completely.
  const raw = String(r.readTime ?? r.read_time ?? '').trim();
  if (!raw) return '5 min read';
  return /^\d+$/.test(raw) ? `${raw} min read` : raw;
}

/**
 * The candidate dates for an article, in the order they should be trusted.
 *
 * `published_at` is the editorial date; `created_at` is when the row was
 * written, which can be months earlier — the GAD-7 article was created
 * 2025-12-20 and published 2026-03-19. Ordering and display MUST read the same
 * field or a correctly sorted list looks broken: sorted by publication it sat
 * second, while its card showed the 2025 creation date and so appeared out of
 * sequence.
 */
function dateCandidates(r: ResourceRecord): (string | undefined)[] {
  return [r.published_at, r.created_at, r.date, r.publishedDate];
}

function resourceDate(r: ResourceRecord): string {
  for (const raw of dateCandidates(r)) {
    if (!raw) continue;
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }
  return r.date || r.publishedDate || 'Recently';
}

/**
 * `published` is absent on some records and means published when it is.
 * Defaulting the other way would hide live articles.
 */
export function isPublished(r: ResourceRecord): boolean {
  return r.published !== false;
}

/**
 * One deliberate difference from the mapping this replaces: a record with no
 * id gets `''`, where `Library.tsx` minted `resource-${Math.random()}`. A
 * random id is a fresh value on every render, so it defeats React's key
 * reconciliation and the id-based de-duplication immediately below its own
 * call site. All 9 live records carry an id, so nothing observable changes;
 * `''` is the honest answer to "what is this record's id".
 */
export function toResourcePost(r: ResourceRecord): PresentedResource {
  return {
    id: r.id || r.resource_id || '',
    title: r.title || 'Untitled Resource',
    description: r.description || r.excerpt || '',
    category: r.category || 'General',
    readTime: resourceReadTime(r),
    date: resourceDate(r),
    image: resourceImage(r),
    slug: r.id || r.resource_id || '',
    published: isPublished(r),
    featured: r.featured === true,
  };
}

/**
 * A blog category expressed as an assessment category.
 *
 * The two vocabularies overlap but are not the same list: articles are tagged
 * with blog labels, and only some of those name an assessment. Measured on the
 * 9 live records, the only label that is not an assessment category is
 * `mental-health` (2 articles), which is general-interest material — so it
 * reads as `general`. Everything else passes through unchanged.
 *
 * This is a map, not a rename: adding a label here is how a new blog category
 * is pointed at an existing assessment, without re-tagging the articles.
 */
const BLOG_CATEGORY_TO_ASSESSMENT: Record<string, string> = {
  'mental-health': 'general',
};

export function blogCategoryToAssessmentCategory(category: unknown): string {
  const v = String(category ?? '').trim().toLowerCase();
  return BLOG_CATEGORY_TO_ASSESSMENT[v] ?? v;
}

/**
 * A sortable timestamp for an article, newest first.
 *
 * `published_at` is the editorial date and wins; `created_at` is when the row
 * was written. An unparseable or absent date sorts last rather than to the
 * epoch-adjacent top, which is where `new Date(undefined)` would put it.
 */
export function articleTime(r: ResourceRecord): number {
  for (const raw of dateCandidates(r)) {
    if (!raw) continue;
    const t = new Date(raw).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return -Infinity;
}
