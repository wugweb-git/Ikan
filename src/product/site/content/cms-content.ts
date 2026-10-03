/**
 * READING WHAT THE CMS ACTUALLY STORES.
 *
 * Six blocks drop authored content, and five of the six drop it the same way: a
 * field is stored as one newline-delimited string and read as if it were an
 * array. `Array.isArray(tile4Content)` is false for `"Better Sleep Quality. …\n
 * Reduced Sleep Anxiety. …"`, so the override never runs and the generic default
 * renders instead — on every programme, invisibly, because a default looks like
 * content.
 *
 * These are the three shapes the store actually holds, as functions, so the
 * parsing is in one tested place rather than repeated per block with a slightly
 * different guard each time.
 */

/**
 * A CMS list field → its lines.
 *
 * Accepts what the store holds: a newline-delimited string (`tile2_content`,
 * `tile3_content`, `tile4_content`), an already-split array, or an array of
 * objects from an older shape. Empty lines are dropped — an author's trailing
 * newline is not a bullet.
 */
export function cmsLines(value: unknown): string[] {
  if (typeof value === 'string') {
    return value.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  }
  if (Array.isArray(value)) {
    return value
      .map(v => (typeof v === 'string'
        ? v
        : (v as { text?: string; title?: string; description?: string })?.text
          ?? (v as { title?: string })?.title
          ?? ''))
      .map(l => String(l).trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * An outcome line → its title and its explanation.
 *
 * The four outcome tiles are authored as `"Better Sleep Quality. Fall asleep
 * faster and wake up refreshed"` — one line, the title before the first period.
 * Nothing split them, so all four tiles kept the generic defaults on all four
 * programmes.
 *
 * The split is on the FIRST period only, and a line with no period keeps its
 * whole text as the title rather than being cut at an arbitrary length.
 */
export function splitTitleAndSubtitle(line: string): { title: string; subtitle?: string } {
  const text = (line ?? '').trim();
  const i = text.indexOf('.');
  if (i === -1 || i === text.length - 1) return { title: text.replace(/\.$/, '') };
  return {
    title: text.slice(0, i).trim(),
    subtitle: text.slice(i + 1).trim() || undefined,
  };
}

/**
 * Rich-text tile HTML with its duplicated heading removed.
 *
 * `metadata.tile4_content` opens with `<p>What you’ll see</p>` and is rendered
 * under a heading that already says "What you'll see", because the same words
 * are authored in two fields. Printing both reads as a mistake; dropping the
 * authored heading instead would be worse, since it is the one an author edits.
 *
 * Only an exact leading match is removed — same words, ignoring case, curly
 * quotes and trailing punctuation. Anything else is content and is left alone.
 */
export function stripDuplicateHeading(html: string | undefined | null, heading: string | undefined | null): string {
  const source = (html ?? '').trim();
  if (!source || !heading) return source;
  const norm = (s: string) => s
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9' ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  const first = source.match(/^<(p|h[1-6])[^>]*>([\s\S]*?)<\/\1>\s*/i);
  if (!first) return source;
  const text = first[2].replace(/<[^>]*>/g, '');
  return norm(text) === norm(heading) ? source.slice(first[0].length) : source;
}

/**
 * THE IMAGE A RECORD ACTUALLY HAS.
 *
 * `SectionHero` takes one field and has no fallback — a deliberate decision, so
 * that a missing hero is visible rather than papered over with a stock image.
 * The callers then passed `hero_image` alone, which **no live equip programme or
 * assessment carries**: Sleep Tight has `cover_image` and `image_url`, and both
 * detail pages open with an empty band.
 *
 * A ladder, not a stand-in. Every candidate here is an image OF THIS RECORD that
 * an author uploaded; nothing is invented, and a record with none still returns
 * undefined so the hero stays honest about it.
 *
 * Signed Supabase URLs expire, so an unsigned candidate wins over a signed one
 * at the same rank — the same rule `EquipDetail` already applies when it picks a
 * thumbnail.
 */
export function recordImage(record: Record<string, unknown> | null | undefined): string | undefined {
  const meta = (record?.metadata ?? {}) as Record<string, unknown>;
  const candidates = [
    record?.hero_image, meta.hero_image,
    record?.cover_image, meta.cover_image,
    record?.image_url, meta.image,
    record?.thumbnail, meta.thumbnail,
    record?.thumbnail_url,
  ];
  const usable = candidates.filter((c): c is string => typeof c === 'string' && c.trim() !== '');
  return usable.find(u => !u.includes('/object/sign/')) ?? usable[0];
}
