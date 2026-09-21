import DOMPurify, { type Config } from 'dompurify';

/**
 * HTML sanitiser for every `dangerouslySetInnerHTML` / `innerHTML` sink.
 *
 * CMS, admin-authored and stored rich-text HTML is rendered as markup across
 * the app. Without this, anything that reaches those fields — a compromised
 * admin account, a pasted snippet, a bad import — runs as script in every
 * viewer's session. DOMPurify keeps normal formatting (headings, lists,
 * emphasis, tables, links, images, inline style) and drops script, style,
 * iframe/object/embed, forms, event-handler attributes and javascript: URLs.
 *
 * Links that open a new tab get rel="noopener noreferrer".
 *
 * One copy per surface (admin / product app / product site) on purpose — the
 * lint boundary forbids cross-surface imports, and this is not a runtime
 * singleton that belongs in shared/. Keep the copies identical.
 */
const CONFIG: Config = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'meta', 'link', 'base'],
  FORBID_ATTR: ['srcdoc', 'formaction'],
  ALLOW_DATA_ATTR: false,
};

let purifier: ReturnType<typeof DOMPurify> | null = null;

function getPurifier(): ReturnType<typeof DOMPurify> | null {
  if (purifier) return purifier;
  if (typeof window === 'undefined') return null;
  // A private instance, so the hook below is registered exactly once and does
  // not leak into any other DOMPurify user.
  const instance = DOMPurify(window);
  instance.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target')) {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  purifier = instance;
  return purifier;
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (html == null || html === '') return '';
  const p = getPurifier();
  // No DOM (SSR/tests): never pass untrusted markup through unsanitised.
  if (!p || !p.isSupported) return '';
  return p.sanitize(String(html), CONFIG) as unknown as string;
}
