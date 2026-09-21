import { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api-client';

export interface SiteSettings {
  // General
  siteName: string;
  siteDescription: string;
  companyDescription: string;
  logoUrl: string;
  faviconUrl: string;
  
  // Logo variants
  logoIconUrl: string;
  logoFullLightUrl: string;
  logoFullDarkUrl: string;
  metaImageUrl: string;

  // Contact
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactAddress: string;

  // Social Media
  facebookUrl: string;
  xUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;

  // Certifications (array of { imageUrl, alt })
  certifications: Array<{ imageUrl: string; alt: string }>;

  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;

  // Feature toggles
  maintenanceMode: boolean;

  [key: string]: any;
}

const EMPTY_SETTINGS: SiteSettings = {
  siteName: '',
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
  certifications: [],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  ogImage: '',
  maintenanceMode: false,
};

// Simple in-memory cache to avoid re-fetching on every component mount
let cachedSettings: SiteSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings || EMPTY_SETTINGS);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If cache is still fresh, skip fetch
    if (cachedSettings && Date.now() - cacheTimestamp < CACHE_TTL) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.getPublicSettings();
        const data = res?.settings || res || {};
        // Normalize: support both legacy `twitterUrl` and new `xUrl`
        const normalized: SiteSettings = {
          ...EMPTY_SETTINGS,
          ...data,
          xUrl: data.xUrl || data.twitterUrl || '',
          contactWhatsapp: data.contactWhatsapp || data.whatsappNumber || '',
        };
        if (!cancelled) {
          cachedSettings = normalized;
          cacheTimestamp = Date.now();
          setSettings(normalized);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.warn('Failed to load site settings:', err?.message);
          setError(err?.message || 'Failed to load settings');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { settings, loading, error };
}
