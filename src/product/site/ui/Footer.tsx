import { cn } from './utils';
import { Mail, Phone, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { LogoFull } from './Logo';
import { NavBadge } from './NavBadge';
import { SiteLink } from './SiteLink';
import { SITE_SETTINGS as settings } from '../content/site-settings';
import { FOOTER_GROUPS, LEGAL_NAV } from '../content/nav';

import svgPaths from "./svg/svg-ul0k820b9n";

function WugwebLogo() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Wugweb Logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Wugweb Logo">
          {/* Wugweb brand colors — third-party logo, must remain as hex */}
          <rect fill="#101010" height="24" rx="6" width="24" />
          <g id="Vector">
            <path d={svgPaths.p34e2cf00} fill="white" />
            <path d={svgPaths.p3f18d100} fill="white" />
            <path d={svgPaths.p3ce2ae00} fill="#FFBE1A" />
            <path d={svgPaths.p8d1430} fill="#FFBE1A" />
          </g>
        </g>
      </svg>
    </div>
  );
}

// Custom X (formerly Twitter) Icon
function XIcon({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Custom WhatsApp Icon
function WhatsAppIcon({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

interface FooterProps {
  onNavigate?: (route: string) => void;
  className?: string;
}

export function Footer({ onNavigate, className }: FooterProps) {
  /*
   * Contact methods and socials are DATA-DRIVEN, not hardcoded. Each renders
   * only when `site-settings.ts` carries a value, so a column never shows an
   * empty heading and a dead icon row. Today only `contactEmail` is filled in;
   * the moment a phone, a WhatsApp number or a social URL is added there, it
   * appears here with no code change.
   */
  const contactMethods = [
    settings.contactEmail && {
      key: 'email',
      icon: Mail,
      label: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
      external: false,
    },
    settings.contactPhone && {
      key: 'phone',
      icon: Phone,
      label: settings.contactPhone,
      href: `tel:${settings.contactPhone.replace(/\s/g, '')}`,
      external: false,
    },
    settings.contactWhatsapp && {
      key: 'whatsapp',
      icon: WhatsAppIcon,
      label: settings.contactWhatsapp,
      href: `https://wa.me/${settings.contactWhatsapp.replace(/[^0-9]/g, '')}`,
      external: true,
    },
  ].filter(Boolean) as Array<{
    key: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    href: string;
    external: boolean;
  }>;

  /* Order as the brand lists them. YouTube stays last so it appears if that
     channel is ever filled in, without needing a code change. */
  const socialLinks = [
    { name: 'X', icon: XIcon, url: settings.xUrl },
    { name: 'Instagram', icon: Instagram, url: settings.instagramUrl },
    { name: 'Facebook', icon: Facebook, url: settings.facebookUrl },
    { name: 'LinkedIn', icon: Linkedin, url: settings.linkedinUrl },
    { name: 'YouTube', icon: Youtube, url: settings.youtubeUrl },
  ].filter((link) => link.url) as Array<{
    name: string;
    icon: React.ComponentType<{ size?: number }>;
    url: string;
  }>;

  /*
   * The two crisis lines are the single most important thing in this footer.
   * They used to sit inside a paragraph of disclaimer prose below the
   * copyright, which is past the point most people stop reading, and on a
   * phone they were a wall of 11px text. They are now their own labelled
   * block with each number as a separate tap target.
   */
  const helplines = [
    { name: 'National Helpline', number: '1800-599-0019', tel: '18005990019' },
    { name: 'iCALL Suicide Prevention', number: '9152987821', tel: '9152987821' },
  ];

  return (
    <footer className={cn('ikan2-theme', 'site-footer', className)}>
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          {/* Brand */}
          <div className="site-footer__brand">
            <LogoFull
              height={40}
              className="site-footer__logo"
              style={{ color: 'var(--background)' }}
            />
            <p className="site-footer__blurb">{settings.companyDescription}</p>

            {socialLinks.length > 0 && (
              <ul className="site-footer__social" aria-label={`${settings.siteName} on social media`}>
                {socialLinks.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      <social.icon size={17} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} className="site-footer__col" aria-label={group.title}>
              <h2 className="site-footer__label">{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.to}>
                    <SiteLink to={link.to} onNavigate={onNavigate}>
                      {link.label}
                      <NavBadge label={link.badge} />
                    </SiteLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {contactMethods.length > 0 && (
            <div className="site-footer__col">
              <h2 className="site-footer__label">Contact us</h2>
              <ul>
                {contactMethods.map((m) => (
                  <li key={m.key}>
                    <a
                      href={m.href}
                      {...(m.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      <m.icon size={16} />
                      {m.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Crisis block */}
        <aside className="site-footer__crisis" aria-labelledby="footer-crisis">
          <div>
            <h2 className="site-footer__label" id="footer-crisis">
              In an emergency
            </h2>
            <p>
              {settings.siteName} does not provide emergency support. If you or someone you know
              needs immediate help, please reach one of these lines.
            </p>
          </div>
          <ul>
            {helplines.map((h) => (
              <li key={h.tel}>
                <a href={`tel:${h.tel}`}>
                  <Phone size={16} aria-hidden="true" />
                  <span>
                    <strong>{h.number}</strong>
                    <small>{h.name}</small>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="site-footer__bottom">
          <nav className="site-footer__legal" aria-label="Legal">
            {LEGAL_NAV.map((link) => (
              <SiteLink key={link.to} to={link.to} onNavigate={onNavigate}>
                {link.label}
              </SiteLink>
            ))}
          </nav>

          <div className="site-footer__meta">
            <span>
              © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
            </span>
            {/* Credit links out to the studio. It carried the mark and the words
                "Designed by" but no link and no studio name, so it read as
                decoration rather than an attribution. */}
            <a
              className="site-footer__by"
              href="https://wugweb.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Designed by
              <WugwebLogo />
              <span>Wugweb</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
