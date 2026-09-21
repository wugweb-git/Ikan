/**
 * Every navigation list on the marketing site, from one table.
 *
 * The footer, the sitemap and the mobile menu each used to carry their own
 * list, and they disagreed: `/assessments` in one, `/assessment` in another,
 * `/privacy-policy` next to `/privacy`, links to a library the site does not
 * have, and member-only screens (`/dashboard`, `/account`, `/mood-journal`…)
 * that the marketing host cannot serve. Each link is defined once here and the
 * lists below pick from it, so they cannot drift apart again.
 *
 * `to` is either an internal route that App.tsx serves (checked against its
 * `validRoutes` and switch) or an absolute URL. Member screens are reached
 * through one "Log in" link to the app's sign-in page.
 */
import { APP_LOGIN_URL } from './app-origin';

export interface NavLink {
  label: string;
  to: string;
  /** Sitemap line under the label. */
  description?: string;
  /** Key into ui/NavIcon. */
  icon?: string;
  /** Status pill (see ui/NavBadge). */
  badge?: string;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}

const LINKS = {
  home: { label: 'Home', to: '/', icon: 'house', description: 'Landing page with assessments and programs' },
  assessments: { label: 'Assessments', to: '/assessment', icon: 'clipboard-check', description: 'Clinically validated mental health screenings' },
  equip: { label: 'Equip Programs', to: '/equip', icon: 'book-open', description: 'Self-paced CBT-based wellness programs', badge: 'beta' },
  consultation: { label: 'Consultation', to: '/consultation', icon: 'stethoscope', description: 'Book sessions with licensed professionals', badge: 'coming soon' },
  joinProfessional: { label: 'Join as a Professional', to: '/join/professional', icon: 'stethoscope', description: 'Apply to join iKan as a consultant' },
  about: { label: 'About Us', to: '/about', icon: 'info', description: 'Our mission, values, and what iKan offers' },
  faq: { label: 'FAQ', to: '/faq', icon: 'circle-help', description: 'Frequently asked questions and help center' },
  contact: { label: 'Contact Us', to: '/contact', icon: 'mail', description: 'Get in touch with the iKan team' },
  privacy: { label: 'Privacy Policy', to: '/privacy', icon: 'shield', description: 'How we handle and protect your data' },
  terms: { label: 'Terms of Service', to: '/terms', icon: 'file-text', description: 'Legal terms governing use of iKan' },
  returns: { label: 'Return Policy', to: '/return-policy', icon: 'rotate-ccw', description: 'Our refund and return policy' },
  cancellation: { label: 'Cancellation Policy', to: '/cancellation-policy', icon: 'ban', description: 'How to cancel subscriptions and services' },
  sitemap: { label: 'Sitemap', to: '/sitemap', icon: 'file-text', description: 'Every page on this site' },
  login: { label: 'Log in', to: APP_LOGIN_URL, icon: 'user-circle', description: 'Your dashboard, account and mood journal, in the iKan app' },
} satisfies Record<string, NavLink>;

/** The main product pages: footer "Quick Links", mobile "Main Menu". */
export const PRIMARY_NAV: NavLink[] = [LINKS.home, LINKS.assessments, LINKS.equip, LINKS.consultation];

/** Company and help pages: footer "Support", mobile "More". */
export const SUPPORT_NAV: NavLink[] = [LINKS.about, LINKS.faq, LINKS.contact];

/** The footer's bottom bar. */
export const LEGAL_NAV: NavLink[] = [LINKS.privacy, LINKS.terms, LINKS.returns, LINKS.sitemap, LINKS.cancellation];

export const FOOTER_GROUPS: NavGroup[] = [
  { title: 'Quick Links', links: PRIMARY_NAV },
  { title: 'Support', links: SUPPORT_NAV },
];

/** Mobile menu, "More" section. */
export const MOBILE_MORE_NAV: NavLink[] = [...SUPPORT_NAV, LINKS.privacy, LINKS.terms];

export const SITEMAP_SECTIONS: NavGroup[] = [
  { title: 'Main Pages', links: [LINKS.home, LINKS.about, LINKS.contact] },
  { title: 'Mental Health Services', links: [LINKS.assessments, LINKS.equip, LINKS.consultation, LINKS.joinProfessional] },
  { title: 'Your Account', links: [LINKS.login] },
  { title: 'Legal & Help', links: [LINKS.faq, LINKS.privacy, LINKS.terms, LINKS.cancellation, LINKS.returns] },
];
