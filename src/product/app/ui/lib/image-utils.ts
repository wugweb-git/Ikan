/**
 * Moved to `shared/api/image-url` on 2026-10-07 so the site surface can use it
 * too — the import boundary forbids site/ reaching into app/, and a second copy
 * of a four-branch URL decision is how two surfaces start disagreeing about
 * which field wins. Re-exported here so the app's call sites keep their path.
 */
export { resolveImageUrl } from '../../../../shared/api/image-url';
