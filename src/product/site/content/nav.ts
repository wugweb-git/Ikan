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
import {
  MENU,
  MENU_PRIMARY,
  MENU_SUPPORT,
  MENU_HOME,
  MENU_SERVICES,
  MENU_ABOUT,
  MENU_FAQ,
  MENU_CONTACT,
  MENU_APP,
} from '../../../shared/navigation/menu';

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
  home: MENU_HOME,
  services: MENU_SERVICES,
  assessments: { label: 'Assessments', to: '/assessment', icon: 'clipboard-check', description: 'Clinically validated mental health screenings' },
  equip: { label: 'Equip Programs', to: '/equip', icon: 'book-open', description: 'Self-paced CBT-based wellness programs', badge: 'beta' },
  consultation: { label: 'Consultation', to: '/consultation', icon: 'stethoscope', description: 'Book sessions with licensed professionals', badge: 'coming soon' },
  joinProfessional: { label: 'Join as a Professional', to: '/join/professional', icon: 'stethoscope', description: 'Apply to join iKAN as a consultant' },
  about: MENU_ABOUT,
  faq: MENU_FAQ,
  contact: MENU_CONTACT,
  privacy: { label: 'Privacy Policy', to: '/privacy', icon: 'shield', description: 'How we handle and protect your data' },
  terms: { label: 'Terms of Service', to: '/terms', icon: 'file-text', description: 'Legal terms governing use of iKAN' },
  returns: { label: 'Return Policy', to: '/return-policy', icon: 'rotate-ccw', description: 'Our refund and return policy' },
  cancellation: { label: 'Cancellation Policy', to: '/cancellation-policy', icon: 'ban', description: 'How to cancel subscriptions and services' },
  app: MENU_APP,
  login: { label: 'Log in', to: APP_LOGIN_URL, icon: 'user-circle', description: 'Your dashboard, account and mood journal, in the iKAN app' },
} satisfies Record<string, NavLink>;

/**
 * The main product pages: footer "Quick Links", mobile "Main Menu".
 *
 * One `Services` link rather than Assessments / Equip / Consultation side by
 * side. The header made that merge when `/service` was created, and a footer
 * still offering the three separately contradicts it on every page — a visitor
 * who follows the footer lands somewhere the nav says does not exist.
 * The three detail routes still work and are still listed on the sitemap.
 */
export const PRIMARY_NAV: NavLink[] = MENU_PRIMARY;

/**
 * Help pages: footer "Support", mobile "More".
 *
 * About Us sits in PRIMARY_NAV above, not here. It is a page about the company,
 * not a place to get help, and grouping it with FAQ and Contact implied the
 * reader had a problem to solve.
 */
export const SUPPORT_NAV: NavLink[] = MENU_SUPPORT;

/** The footer's bottom bar. */
export const LEGAL_NAV: NavLink[] = [LINKS.privacy, LINKS.terms, LINKS.returns, LINKS.cancellation];

export const FOOTER_GROUPS: NavGroup[] = [
  { title: 'Quick Links', links: PRIMARY_NAV },
  { title: 'Support', links: SUPPORT_NAV },
];

/**
 * Mobile menu, "More" section.
 *
 * The same three as the footer's Support column, and nothing else. Privacy
 * Policy and Terms of Service used to be appended here, which put legal pages
 * in a main menu between "Open the app" and "Sign in": they belong in the
 * footer's legal row, where they already are.
 */
export const MOBILE_MORE_NAV: NavLink[] = [...SUPPORT_NAV];

/**
 * THE MENU. One list, rendered by both the desktop capsule and the mobile
 * drawer, so the two cannot say different things.
 *
 * They had drifted: the capsule carried Home / Services / About Us hardcoded
 * in its own JSX while the drawer read these arrays, so FAQ, Contact Us and
 * Open the app existed on a phone and nowhere else. Neither bar builds its own
 * list any more — if an entry belongs in the menu it goes here and both get it.
 */
export const MENU_NAV: NavLink[] = MENU;

export const SITEMAP_SECTIONS: NavGroup[] = [
  { title: 'Main Pages', links: [LINKS.home, LINKS.about, LINKS.contact] },
  { title: 'Mental Health Services', links: [LINKS.services, LINKS.assessments, LINKS.equip, LINKS.consultation, LINKS.joinProfessional] },
  { title: 'Your Account', links: [LINKS.login] },
  { title: 'Legal & Help', links: [LINKS.faq, LINKS.privacy, LINKS.terms, LINKS.cancellation, LINKS.returns] },
];
