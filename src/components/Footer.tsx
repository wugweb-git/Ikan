import { Icon } from './Icon';
import { cn } from './ui/utils';
import { Mail, Phone } from 'lucide-react';
import { LogoFull } from './Logo';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

// Certification/compliance images - Using public URLs
const imgIso = "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=150&h=150&fit=crop"; // ISO certification
const imgAsset31 = "https://images.unsplash.com/photo-1551135049-8a33b5883817?w=150&h=150&fit=crop"; // TUV
const imgLayer1 = "https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=150&h=150&fit=crop"; // Cert 1
const imgLayer4 = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop"; // Cert 2
const imgLayer2 = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=150&h=150&fit=crop"; // Cert 3
const imgLayer3 = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=150&fit=crop"; // Cert 4

import svgPaths from "../imports/svg-ul0k820b9n";

function WugwebLogo() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Wugweb Logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Wugweb Logo">
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

// Custom X (Twitter) Icon
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
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const socialLinks = [
    { name: 'Facebook', icon: Icon, url: 'https://facebook.com/ikan.health' },
    { name: 'Instagram', icon: Icon, url: 'https://instagram.com/ikan.health' },
    { name: 'LinkedIn', icon: Icon, url: 'https://linkedin.com/company/ikan-health' },
    { name: 'YouTube', icon: Icon, url: 'https://youtube.com/@ikan.health' },
    { name: 'X', icon: XIcon, url: 'https://twitter.com/ikan_health' },
  ];

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Assessment', path: '/assessments' },
    { name: 'Programs', path: '/equip-programs' },
    { name: 'Library', path: '/library' },
    { name: 'Consultation', path: '/consultation' },
  ];

  const supportLinks = [
    { name: 'About us', path: '/about' },
    { name: 'FAQs', path: '/faq' },
    { name: "Let's Talk", path: '/contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms & Condition', path: '/terms' },
    { name: 'Return Policy', path: '/return-policy' },
    { name: 'Sitemap', path: '/sitemap' },
    { name: 'Cancellation Policy', path: '/cancellation-policy' },
  ];

  return (
    <footer 
      className={cn("w-full flex-none", className)}
      style={{
        backgroundColor: '#2A2A2A', // Dark background as requested
        color: '#FFFFFF',
        paddingTop: 'var(--spacing-8)',
        paddingBottom: 'var(--spacing-8)'
      }}
    >
      <div 
        className="max-w-7xl mx-auto px-6"
        style={{ paddingLeft: 'var(--spacing-6)', paddingRight: 'var(--spacing-6)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand & Description Column (Span 4) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <LogoFull height={32} className="text-white" style={{ color: 'white' }} />
              <p 
                className="max-w-xs"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: '#FFFFFF',
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-family-base)',
                  opacity: 0.8
                }}
              >
                Ikan is your trusted partner in mental health and wellness. We provide evidence-based tools, professional assessments, and expert support to help you on your journey to better mental health.
              </p>
            </div>
            
            {/* Certifications */}
             <div className="space-y-2">
               <p className="text-[10px] uppercase tracking-wider opacity-50 font-medium">Certifications</p>
               <div className="flex gap-3 items-center flex-wrap opacity-90">
                 <div className="w-8 h-8 relative grayscale hover:grayscale-0 transition-all"><ImageWithFallback src={imgAsset31} alt="Certification" className="w-full h-full object-contain" /></div>
                 <div className="w-8 h-8 relative grayscale hover:grayscale-0 transition-all"><ImageWithFallback src={imgIso} alt="ISO 27001" className="w-full h-full object-contain" /></div>
                 <div className="w-8 h-6 relative grayscale hover:grayscale-0 transition-all"><ImageWithFallback src={imgLayer1} alt="Cert 1" className="w-full h-full object-contain" /></div>
                 <div className="w-8 h-6 relative grayscale hover:grayscale-0 transition-all"><ImageWithFallback src={imgLayer4} alt="Cert 2" className="w-full h-full object-contain" /></div>
                 <div className="w-16 h-4 relative grayscale hover:grayscale-0 transition-all"><ImageWithFallback src={imgLayer2} alt="Cert 3" className="w-full h-full object-contain" /></div>
                 <div className="w-8 h-8 relative grayscale hover:grayscale-0 transition-all"><ImageWithFallback src={imgLayer3} alt="Cert 4" className="w-full h-full object-contain" /></div>
               </div>
             </div>
          </div>

          {/* Spacer (Span 1) - Reduced to make room for 3 columns on right */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Links Columns (Span 7) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h3 
                className="mb-6 text-sm font-medium text-white/50 uppercase tracking-wide"
              >
                Quick Links
              </h3>
              <ul className="space-y-4">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleNavigate(link.path)}
                      className="text-sm font-medium hover:text-white text-white/80 transition-colors text-left"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 
                className="mb-6 text-sm font-medium text-white/50 uppercase tracking-wide"
              >
                Support
              </h3>
              <ul className="space-y-4">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleNavigate(link.path)}
                      className="text-sm font-medium hover:text-white text-white/80 transition-colors text-left"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 
                className="mb-6 text-sm font-medium text-white/50 uppercase tracking-wide"
              >
                Contact Us
              </h3>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <Mail className="w-4 h-4 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
                  <a 
                    href="mailto:support@ikan.health" 
                    className="text-sm font-medium hover:text-white text-white/90 transition-colors"
                  >
                    support@ikan.health
                  </a>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <Phone className="w-4 h-4 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
                  <a 
                    href="tel:08001110111" 
                    className="text-sm font-medium hover:text-white text-white/90 transition-colors"
                  >
                    0 800 111 0 111
                  </a>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <WhatsAppIcon className="w-4 h-4 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
                  <a 
                    href="https://wa.me/918001110111" 
                    className="text-sm font-medium hover:text-white text-white/90 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    0 800 111 0 111
                  </a>
                </div>
              </div>

              {/* Follow Us - Nested under Contact Us column */}
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
              © {new Date().getFullYear()} iKan. All rights reserved.
            </div>
            <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-white/70 font-medium">Designed by</span>
                <WugwebLogo />
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 order-1 md:order-2">
            {legalLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigate(link.path)}
                className="text-[10px] font-medium text-white/60 hover:text-white transition-colors"
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}