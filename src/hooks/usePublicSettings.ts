/**
 * usePublicSettings – Fetches site settings from the public /settings endpoint.
 * Used by header, footer, Logo, SEO meta, and any user-facing component that
 * needs site name, logo, social links, or feature flags.
 *
 * Settings are cached in-memory for the lifetime of the SPA session
 * and re-fetched only on explicit invalidation.
 */
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../shared/api-client';

export interface PublicSettings {
  siteName: string;
  siteDescription: string;
  companyDescription: string;
  logoUrl: string;
  faviconUrl: string;
  logoIconUrl: string;
  logoFullLightUrl: string;
  logoFullDarkUrl: string;
  metaImageUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactAddress: string;
  facebookUrl: string;
  xUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  newsletterEnabled: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterImageUrl: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  certifications: Array<{ imageUrl: string; alt: string }>;
  primaryColor: string;
  accentColor: string;
  exploreCardProgramsImage: string;
  exploreCardAssessmentsImage: string;
  enableUserRegistration: boolean;
  maintenanceMode: boolean;
}

const DEFAULTS: PublicSettings = {
  siteName: 'iKan',
  siteDescription: '',
  companyDescription: '',
  logoUrl: '',
  faviconUrl: '',
  logoIconUrl: '',
  logoFullLightUrl: '',
  logoFullDarkUrl: '',
  metaImageUrl: '',
  contactEmail: '',
  contactPhone: '',
  contactWhatsapp: '',
  contactAddress: '',
  facebookUrl: '',
  xUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  newsletterEnabled: false,
  newsletterTitle: '',
  newsletterDescription: '',
  newsletterImageUrl: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  ogImage: '',
  certifications: [],
  primaryColor: '',
  accentColor: '',
  exploreCardProgramsImage: '',
  exploreCardAssessmentsImage: '',
  enableUserRegistration: true,
  maintenanceMode: false,
};

let _cache: PublicSettings | null = null;
let _fetchPromise: Promise<PublicSettings> | null = null;

async function fetchSettings(): Promise<PublicSettings> {
  if (_cache) return _cache;
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = (async () => {
    try {
      const res = await apiClient.getPublicSettings();
      const s = res?.settings || res || {};
      _cache = { ...DEFAULTS, ...s } as PublicSettings;
      return _cache;
    } catch (e) {
      console.error('Failed to load public settings:', e);
      _cache = DEFAULTS;
      return _cache;
    } finally {
      _fetchPromise = null;
    }
  })();
  return _fetchPromise;
}

/** Invalidate the in-memory cache so the next hook mount re-fetches */
export function invalidatePublicSettings() {
  _cache = null;
  _fetchPromise = null;
}

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings>(_cache || DEFAULTS);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    let cancelled = false;
    fetchSettings().then((s) => {
      if (!cancelled) {
        setSettings(s);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const refresh = useCallback(async () => {
    invalidatePublicSettings();
    setLoading(true);
    const s = await fetchSettings();
    setSettings(s);
    setLoading(false);
  }, []);

  return { settings, loading, refresh };
}
