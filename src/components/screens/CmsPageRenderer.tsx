/**
 * CmsPageRenderer — Renders user-facing CMS pages created via Admin → Page Manager.
 * Fetches page data by slug from the public /cms/pages/:slug endpoint.
 * Supports hero section, HTML content, and SEO meta.
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { apiClient } from '../../lib/api-client';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  heroEnabled?: boolean;
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  heroOverlayOpacity?: number;
  featuredImage?: string;
  metaDescription?: string;
  published: boolean;
}

interface CmsPageRendererProps {
  slug: string;
  onNavigate?: (route: string) => void;
  className?: string;
}

export function CmsPageRenderer({ slug, onNavigate, className }: CmsPageRendererProps) {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { settings } = usePublicSettings();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    (async () => {
      try {
        const res = await apiClient.getPagePublic(slug);
        if (!cancelled) {
          const p = res?.page || res;
          if (p && p.title) {
            setPage(p);
            // Update document title
            document.title = `${p.title} — ${settings.siteName || 'iKan'}`;
          } else {
            setNotFound(true);
          }
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [slug]);

  // ── Loading skeleton ──────────────────────────────────────────
  if (loading) {
    return (
      <div className={`max-w-4xl mx-auto px-4 py-8 ${className || ''}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--color-bg-muted)] rounded-lg w-2/3" />
          <div className="h-48 bg-[var(--color-bg-muted)] rounded-xl" />
          <div className="space-y-3">
            <div className="h-4 bg-[var(--color-bg-muted)] rounded w-full" />
            <div className="h-4 bg-[var(--color-bg-muted)] rounded w-5/6" />
            <div className="h-4 bg-[var(--color-bg-muted)] rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────
  if (notFound || !page) {
    return null; // Let the parent handle 404
  }

  const overlayOpacity = page.heroOverlayOpacity ?? 0.4;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {/* ── Hero Section ───────────────────────────────────────── */}
      {page.heroEnabled && page.heroImage && (
        <div
          className="relative w-full overflow-hidden"
          style={{
            minHeight: 280,
            maxHeight: 420,
            borderRadius: 'var(--radius-lg)',
            margin: '0 auto 32px',
            maxWidth: 1200,
          }}
        >
          <ImageWithFallback
            src={page.heroImage}
            alt={page.heroTitle || page.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
          />
          {/* Hero Content */}
          <div
            className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16"
            style={{ minHeight: 280 }}
          >
            <h1
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-base)',
                color: 'var(--color-text-inverse)',
                marginBottom: 12,
              }}
            >
              {page.heroTitle || page.title}
            </h1>
            {page.heroSubtitle && (
              <p
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 400,
                  fontFamily: 'var(--font-family-base)',
                  color: 'rgba(255,255,255,0.85)',
                  maxWidth: 600,
                  lineHeight: 1.6,
                }}
              >
                {page.heroSubtitle}
              </p>
            )}
            {page.heroCtaText && page.heroCtaLink && (
              <button
                onClick={() => onNavigate?.(page.heroCtaLink!)}
                style={{
                  marginTop: 24,
                  padding: '12px 32px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-text-inverse)',
                  color: 'var(--color-text-primary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-base)',
                }}
              >
                {page.heroCtaText}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Page Content ───────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Title (if no hero) */}
        {(!page.heroEnabled || !page.heroImage) && (
          <h1
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-base)',
              color: 'var(--color-text-primary)',
              marginBottom: 24,
              paddingTop: 16,
            }}
          >
            {page.title}
          </h1>
        )}

        {/* Rich text content */}
        <div
          className="cms-content prose prose-neutral max-w-none"
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-base)',
            fontWeight: 400,
            lineHeight: 1.7,
            color: 'var(--color-text-primary)',
          }}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>

      {/* ── Inline styles for CMS content ── */}
      <style>{`
        .cms-content h1 { font-size: var(--text-2xl); font-weight: var(--font-weight-medium); margin: 1.5em 0 0.5em; font-family: var(--font-family-base); }
        .cms-content h2 { font-size: var(--text-xl); font-weight: var(--font-weight-medium); margin: 1.4em 0 0.4em; font-family: var(--font-family-base); }
        .cms-content h3 { font-size: var(--text-lg); font-weight: var(--font-weight-medium); margin: 1.2em 0 0.3em; font-family: var(--font-family-base); }
        .cms-content p { margin: 0 0 1em; }
        .cms-content ul, .cms-content ol { padding-left: 1.5em; margin: 0 0 1em; }
        .cms-content li { margin-bottom: 0.4em; }
        .cms-content a { color: var(--color-primary-default); text-decoration: underline; }
        .cms-content a:hover { opacity: 0.8; }
        .cms-content img { max-width: 100%; height: auto; border-radius: var(--radius-md); margin: 1em 0; }
        .cms-content blockquote {
          border-left: 3px solid var(--color-primary-default);
          padding: 12px 16px;
          margin: 1em 0;
          background: var(--color-bg-muted);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          color: var(--color-text-muted);
          font-style: italic;
        }
        .cms-content table { width: 100%; border-collapse: collapse; margin: 1em 0; }
        .cms-content th, .cms-content td { padding: 8px 12px; border: 1px solid var(--color-border-default); text-align: left; }
        .cms-content th { background: var(--color-bg-muted); font-weight: var(--font-weight-medium); }
      `}</style>
    </motion.div>
  );
}