import { cn } from './utils';
import { Mail, Phone, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { LogoFull } from './Logo';
import { NavBadge } from './NavBadge';
import { SiteLink } from './SiteLink';
import { CONTENT_MAX } from './Container';
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
  // Social links — only those with a URL (see content/site-settings.ts).
  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: settings.facebookUrl },
    { name: 'Instagram', icon: Instagram, url: settings.instagramUrl },
    { name: 'LinkedIn', icon: Linkedin, url: settings.linkedinUrl },
    { name: 'YouTube', icon: Youtube, url: settings.youtubeUrl },
    { name: 'X', icon: XIcon, url: settings.xUrl },
  ].filter(link => link.url) as Array<{ name: string; icon: React.ComponentType<{ size?: number }>; url: string }>;

  const { contactEmail, contactPhone, contactWhatsapp } = settings;

  return (
    <footer 
      className={cn("w-full flex-none", className)}
      style={{
        backgroundColor: 'var(--color-primary-default)',
        color: 'var(--color-primary-on)',
        paddingTop: 'var(--spacing-8)',
        paddingBottom: 'var(--spacing-8)'
      }}
    >
      <div className="mx-auto w-full px-6" style={{ maxWidth: CONTENT_MAX }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand & Description Column (Span 4) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <LogoFull height={32} className="text-white" style={{ color: 'white' }} />
              <p 
                className="max-w-xs"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-primary-on)',
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-family-base)',
                  opacity: 0.8
                }}
              >
                {settings.companyDescription}
              </p>
            </div>
          </div>

          {/* Spacer (Span 1) */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Links Columns (Span 7) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="mb-6 text-sm font-medium text-white/50 uppercase tracking-wide">
                  {group.title}
                </h3>
                <ul className="space-y-4">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <SiteLink
                        to={link.to}
                        onNavigate={onNavigate}
                        className="text-sm font-medium hover:text-white text-white/80 transition-colors text-left no-underline"
                      >
                        {link.label}
                        <NavBadge label={link.badge} />
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Us */}
            <div>
              <h3 
                className="mb-6 text-sm font-medium text-white/50 uppercase tracking-wide"
              >
                Contact Us
              </h3>
              <div className="space-y-3 mb-8">
                {contactEmail && (
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <Mail className="w-4 h-4 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
                    <a 
                      href={`mailto:${contactEmail}`} 
                      className="text-sm font-medium hover:text-white text-white/90 transition-colors"
                    >
                      {contactEmail}
                    </a>
                  </div>
                )}
                {contactPhone && (
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <Phone className="w-4 h-4 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
                    <a 
                      href={`tel:${contactPhone.replace(/\s/g, '')}`} 
                      className="text-sm font-medium hover:text-white text-white/90 transition-colors"
                    >
                      {contactPhone}
                    </a>
                  </div>
                )}
                {contactWhatsapp && (
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <WhatsAppIcon className="w-4 h-4 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
                    <a 
                      href={`https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}`} 
                      className="text-sm font-medium hover:text-white text-white/90 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {contactWhatsapp}
                    </a>
                  </div>
                )}
              </div>

              {/* Follow Us - Nested under Contact Us column */}
              {socialLinks.length > 0 && (
                <>
                  <h3 
                    className="mb-4 text-sm font-medium text-white/50 uppercase tracking-wide"
                  >
                    Follow Us
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all"
                        aria-label={social.name}
                      >
                        <social.icon size={16} />
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 order-2 md:order-1">
            <div 
              className="text-xs text-white/50"
            >
              © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
            </div>
            <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-white/70 font-medium">Designed by</span>
                <WugwebLogo />
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 order-1 md:order-2">
            {LEGAL_NAV.map((link) => (
              <SiteLink
                key={link.to}
                to={link.to}
                onNavigate={onNavigate}
                className="text-[10px] font-medium text-white/60 hover:text-white transition-colors no-underline"
              >
                {link.label}
              </SiteLink>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer — crisis helplines (ported from main; iKan does not provide emergency support) */}
      <div className="border-t border-white/10 px-6 py-5">
        <p className="mx-auto text-[11px] leading-[18px] text-white/55" style={{ maxWidth: CONTENT_MAX }}>
          <strong className="text-white/75 font-medium">Disclaimer:</strong>{' '}
          We at iKan deeply care about your mental health but we do not provide emergency
          support. If you or someone you know needs immediate assistance, please reach out to the{' '}
          <a href="tel:18005990019" className="text-white/75 underline">National Helpline: 1800-599-0019</a>{' '}
          or the{' '}
          <a href="tel:9152987821" className="text-white/75 underline">iCALL Suicide Prevention Helpline: 9152987821</a>.
        </p>
      </div>
    </footer>
  );
}