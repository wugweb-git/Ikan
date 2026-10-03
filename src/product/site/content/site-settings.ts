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
  siteName: 'iKAN',
  companyDescription:
    'iKAN is your trusted partner in mental health and wellness. We provide evidence-based tools, professional assessments, and expert support to help you on your journey to better mental health.',

  contactEmail: 'support@ikanhealth.in',
  /*
   * Stored with spacing for display. The footer strips it for the `tel:` and
   * `wa.me/` hrefs, so the readable form and the dialable form stay in step
   * from one value.
   */
  contactPhone: '+91 85275 45503',
  contactWhatsapp: '+91 98998 43330',

  /*
   * The footer renders an icon for each of these that is non-empty, in the
   * order the footer lists them, so adding YouTube later needs a value here
   * and no code change.
   */
  facebookUrl: 'https://facebook.com/ikanhealth',
  instagramUrl: 'https://instagram.com/ikanhealth',
  linkedinUrl: 'https://linkedin.com/company/ikanhealth',
  youtubeUrl: '',
  xUrl: 'https://x.com/ikanhealth',
};
