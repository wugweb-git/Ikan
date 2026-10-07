import { sanitizeHtml } from './sanitize';

/**
 * Strip an authored article back to semantic HTML, so the page's own type
 * scale is the only thing styling it.
 *
 * Library articles are pasted into the admin editor out of Google Docs, and
 * they arrive wearing the whole export: a `docs-internal-guid-…` id on the
 * wrapper, then `font-family: Arial`, `font-size: 11pt`, `line-height: 1.38`
 * and `margin-top: 0pt` inline on *every* paragraph and span. Inline styles
 * beat a stylesheet, so `.prose-ikan` — the thing that gives every other
 * long-form page on this site its measure, rhythm and colour — loses on every
 * single rule. The article renders as 11pt Arial on a page set in Manrope.
 *
 * `sanitizeHtml` does not help here and should not: DOMPurify's job is to stop
 * script, not to have opinions about typography, and it deliberately keeps
 * `style` because plenty of legitimate CMS markup needs it.
 *
 * So this runs after it and removes presentation outright:
 *
 *   `style`, `class` and `id` from every element — `id` because the Google
 *   wrapper's is the only one these documents carry, and leaving it lets a
 *   `:target` or a duplicate-id collision happen for no benefit.
 *
 *   `<span>`s and `<div>`s that are left holding no attributes, which after the
 *   above is nearly all of them. Google wraps every run of text in one; kept,
 *   they turn a paragraph into a dozen nested inline boxes for nothing.
 *
 *   Paragraphs with no text and no image — the empty `<p><span></span></p>`
 *   pairs Docs uses as line breaks, which otherwise become real vertical gaps
 *   under `.prose-ikan`'s flow spacing.
 *
 * `width`/`height` on images are kept: they are real attributes, not styling,
 * and dropping them reintroduces layout shift.
 *
 * LegalPage does the same thing by a cruder route (a regex over `class="…"`),
 * because the policy HTML carries Tailwind utilities rather than inline rules.
 * This one is DOM-based, because a regex over `style="…"` cannot tell an
 * attribute from the same characters inside a text node.
 */
export function cleanAuthoredHtml(raw: string | null | undefined): string {
  const safe = sanitizeHtml(raw);
  // No DOM (tests, SSR): the sanitised string is still correct, just unstyled.
  if (!safe || typeof document === 'undefined') return safe;

  const root = document.createElement('div');
  root.innerHTML = safe;

  for (const el of Array.from(root.querySelectorAll('[style], [class], [id]'))) {
    el.removeAttribute('style');
    el.removeAttribute('class');
    el.removeAttribute('id');
  }

  /* Outer-first document order, so unwrapping a span leaves its children in
     the tree to be visited in turn. */
  for (const el of Array.from(root.querySelectorAll('span, div'))) {
    if (el.attributes.length === 0) el.replaceWith(...Array.from(el.childNodes));
  }

  for (const p of Array.from(root.querySelectorAll('p'))) {
    if (!p.textContent?.trim() && !p.querySelector('img')) p.remove();
  }

  return root.innerHTML;
}
