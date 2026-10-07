/**
 * THE PUBLIC MENU, in one place.
 *
 * It lives in `shared/` rather than in `site/content/nav.ts` because BOTH
 * surfaces render it: the site's compact drawer and the app shell's desktop
 * capsule. `app/` may not import `site/`, and the alternative the boundary
 * rule offers — give each surface its own copy — is exactly the thing that let
 * the two menus drift apart in the first place, with FAQ, Contact Us and Open
 * the app existing on a phone and nowhere else.
 *
 * Data only, no UI, no imports: that is what makes it legal here.
 *
 * `to` is either an internal route this site serves or an absolute URL. The
 * site's `nav.ts` builds its footer and sitemap groups from the same entries,
 * so a label changed here changes everywhere it appears.
 */
export interface MenuLink {
  label: string;
  to: string;
  /** Sitemap line under the label. */
  description?: string;
  /** Key into the site's NavIcon. */
  icon?: string;
  /** Status pill (see NavBadge). */
  badge?: string;
}

/** The member app's origin. Mirrors `app/shell/app-host.ts`, which documents why. */
export const MENU_APP_ORIGIN = 'https://app.ikanhealth.in';

export const MENU_HOME: MenuLink = {
  label: 'Home',
  to: '/',
  icon: 'house',
  description: 'Landing page with assessments and programs',
};

export const MENU_SERVICES: MenuLink = {
  label: 'Services',
  to: '/service',
  icon: 'clipboard-check',
  description: 'Assessments, Equip, Mood, Resources and Consultation in one place',
};

export const MENU_RESOURCES: MenuLink = {
  label: 'Resources',
  to: '/resource',
  icon: 'book-open',
  description: 'Articles, videos and audio on sleep, stress, burnout and balance',
};

export const MENU_ABOUT: MenuLink = {
  label: 'About Us',
  to: '/about',
  icon: 'info',
  description: 'Our mission, values, and what iKAN offers',
};

export const MENU_FAQ: MenuLink = {
  label: 'FAQ',
  to: '/faq',
  icon: 'circle-help',
  description: 'Frequently asked questions and help center',
};

export const MENU_CONTACT: MenuLink = {
  label: 'Contact Us',
  to: '/contact',
  icon: 'mail',
  description: 'Get in touch with the iKAN team',
};

/*
 * "Open the app" was here, and sat in the footer's Support column. Removed
 * 2026-10-07 on request. Both bars already carry a "Sign in" to the same
 * origin, and the footer's own Quick Links now lead somewhere a signed-out
 * reader can actually go.
 */

/** The product pages: the drawer's first group, the footer's "Quick Links". */
export const MENU_PRIMARY: MenuLink[] = [MENU_HOME, MENU_SERVICES, MENU_RESOURCES, MENU_ABOUT];

/**
 * Help pages, for the FOOTER's "Support" column. Contact Us belongs in a
 * footer, where someone goes looking for a way to get in touch.
 *
 * Two entries now rather than three: Resources is a product page, so it joined
 * Quick Links above rather than padding this column out to match it.
 */
export const MENU_SUPPORT: MenuLink[] = [MENU_FAQ, MENU_CONTACT];

/**
 * THE menu. Both bars render exactly this, in this order, so they cannot say
 * different things.
 *
 * Contact Us is deliberately NOT here: the bars carry a "Let's Talk" button to
 * the same `/contact`, and one destination under two names in one bar is the
 * duplicate this list exists to prevent. The button wins over the menu entry
 * because the action is the point.
 */
/**
 * The bars' second group.
 *
 * "Open the app" is NOT here. It belongs to the footer's Support column, which
 * is where it was asked for; in a bar it sits two controls away from "Sign in",
 * which goes to the same place.
 */
export const MENU_MORE: MenuLink[] = [MENU_FAQ];

export const MENU: MenuLink[] = [...MENU_PRIMARY, ...MENU_MORE];

/** The bars' secondary action. Same destination the footer's Contact Us uses. */
export const MENU_TALK: MenuLink = { label: "Let's Talk", to: MENU_CONTACT.to };
