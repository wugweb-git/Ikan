import { useEffect } from 'react';

const SITE_NAME = 'iKAN Health';
const SITE_ORIGIN = 'https://ikanhealth.in';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/pwa-512x512.png`;

export interface SeoOptions {
  title?: string;
  description?: string;
  /** Path or absolute URL used for canonical + og:url. Defaults to current location. */
  canonicalPath?: string;
  image?: string;
  /** og:type — 'website' | 'article' | 'product' etc. */
  type?: string;
  /** Optional JSON-LD structured data object (schema.org). */
  jsonLd?: Record<string, any> | null;
  /** When false, skip applying (e.g. while data is still loading). */
  enabled?: boolean;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSONLD_ID = 'seo-jsonld';
function upsertJsonLd(data: Record<string, any> | null | undefined) {
  const existing = document.getElementById(JSONLD_ID);
  if (!data) {
    if (existing) existing.remove();
    return;
  }
  let el = existing as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = JSONLD_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Dynamically manage per-page SEO tags for this client-rendered SPA:
 * document title, description, canonical, OpenGraph, Twitter cards and
 * optional JSON-LD structured data. Google renders JS so these are picked up;
 * non-JS social scrapers fall back to the static tags in index.html.
 */
export function useSeo(opts: SeoOptions) {
  const { title, description, canonicalPath, image, type = 'website', jsonLd, enabled = true } = opts;

  useEffect(() => {
    if (!enabled) return;

    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const url = canonicalPath
      ? (canonicalPath.startsWith('http') ? canonicalPath : `${SITE_ORIGIN}${canonicalPath}`)
      : (typeof window !== 'undefined' ? window.location.href.split('?')[0] : SITE_ORIGIN);
    const img = image || DEFAULT_IMAGE;

    document.title = fullTitle;
    if (description) upsertMeta('name', 'description', description);

    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', fullTitle);
    if (description) upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', img);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    if (description) upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', img);

    upsertCanonical(url);
    upsertJsonLd(jsonLd);
  }, [title, description, canonicalPath, image, type, enabled, JSON.stringify(jsonLd)]);
}
