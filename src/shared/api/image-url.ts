import { projectId } from './supabase-info';

/**
 * Resolve an image reference out of a KV record to something `<img src>` takes.
 *
 * Stored images are not one shape. A resource may carry an absolute URL, a
 * base64 data URI pasted by the admin editor, a Supabase Storage path, or a
 * `figma:asset` token left over from the original export — so every caller
 * needs the same four-way decision, and before this lived in `shared/` the
 * site surface could not reach the app's copy without crossing the import
 * boundary.
 */
export function resolveImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('figma:asset')) return url;
  // Supabase Storage, stored relative.
  if (url.startsWith('/storage/')) return `https://${projectId}.supabase.co${url}`;
  return url;
}
