/**
 * Site-wide facts the footer and logo show — static.
 *
 * These used to be fetched from the public `/settings` endpoint on every page
 * (`useSiteSettings` in the footer, `usePublicSettings` in the logo). The
 * marketing site serves static pages only, so the values live here. Each one
 * is the default the code already carried: `siteName` and the company blurb
 * from those hooks and the footer, the support address from the
 * `page-contact` entry in cms-defaults.ts. An empty string renders nothing.
 */
export interface SiteSettings {
  siteName: string;
  companyDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  xUrl: string;
}

export const SITE_SETTINGS: SiteSettings = {
  siteName: 'iKan',
  companyDescription:
    'Ikan is your trusted partner in mental health and wellness. We provide evidence-based tools, professional assessments, and expert support to help you on your journey to better mental health.',

  contactEmail: 'support@ikanhealth.in',
  contactPhone: '',
  contactWhatsapp: '',

  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  xUrl: '',
};
