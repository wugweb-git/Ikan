import React, { useEffect, useState } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { NewsletterBlock } from '../blocks/NewsletterBlock';
import { ResourcePost } from '../blocks/ResourceCard';
import { apiClient } from '../../lib/api-client';
import {
  Heart,
  Shield,
  FlaskConical,
  Handshake,
} from 'lucide-react';
import { NEWSLETTER_CONTENT } from '../../lib/constants/content';
import { PageHero } from '../ui/PageHero';
import { HowItWorksSection } from './homepage/HowItWorksSection';
import { BenefitsSection } from './homepage/BenefitsSection';

interface AboutUsProps {
  onNavigate?: (route: string, resourceId?: string) => void;
  className?: string;
}

/* ─── Content Data ─── */

const VALUES = [
  {
    icon: <Heart style={{ width: 24, height: 24 }} />,
    title: 'People Centric',
    description:
      'At iKan we keep you at the heart of everything, our sole focus is to empower you and make mental health care accessible for all.',
    color: 'var(--ikan-brand-teal)',
  },
  {
    icon: <Shield style={{ width: 24, height: 24 }} />,
    title: 'Secure',
    description:
      'We value your privacy very highly, we are committed to ensuring your data is always safe and secure.',
    color: 'var(--ikan-brand-amber)',
  },
  {
    icon: <FlaskConical style={{ width: 24, height: 24 }} />,
    title: 'Science Backed',
    description:
      'Everything we do is backed by research and validated by practising psychologists.',
    color: 'var(--ikan-brand-coral)',
  },
  {
    icon: <Handshake style={{ width: 24, height: 24 }} />,
    title: 'Our Promise',
    description:
      'We believe mental health care is for everyone and we are eager to make it a reality.',
    color: 'var(--ikan-brand-slate)',
  },
];

interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  image: string;
}

const FOUNDERS: TeamMember[] = [
  {
    name: 'Kartik Chandra',
    role: 'Co-Founder and CEO',
    bio: 'Kartik has a decade long experience in general and health insurance and health tech across various functions. He brings his experience and learnings from his personal journey to positioning iKan for growth and long term success.',
    image:
      'https://images.unsplash.com/photo-1649433658557-54cf58577c68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjBwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTkxMjE1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'Vedanshu Srivastava',
    role: 'Co-Founder and Product Head',
    bio: 'Vedanshu has a decade long experience in general and health insurance and health tech across various functions. He brings his experience and learnings from his personal journey to positioning iKan for growth and long term success.',
    image:
      'https://images.unsplash.com/photo-1720167300687-5e1a11ea955d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYWxlJTIwZW50cmVwcmVuZXVyJTIwcG9ydHJhaXQlMjBidXNpbmVzc3xlbnwxfHx8fDE3NzE5MTIxNTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'Sachin Vaishampayan',
    role: 'Co-Founder and CTO',
    bio: 'Sachin has worked in research and education for over a decade, leading and managing internationally funded projects across diverse landscapes. He has extensive experience in content creation and designing engaging learning modules, which he blends with his personal interest in developing mental health aids for growth and innovation at iKan.',
    image:
      'https://images.unsplash.com/photo-1739249432260-0bcfdc382e5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjB0ZWNobm9sb2d5JTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzcxOTEyMTU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

const TEAM: TeamMember[] = [
  {
    name: 'Vaibhav Shukla',
    role: 'System Architect',
    image:
      'https://images.unsplash.com/photo-1681165232934-c09dfa5ee694?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYWxlJTIwc29mdHdhcmUlMjBlbmdpbmVlciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTkxMjE1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'Amitabh Bhatnagar',
    role: 'Dev Engineer',
    image:
      'https://images.unsplash.com/photo-1764312386450-5d39879fb715?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYWxlJTIwZGV2ZWxvcGVyJTIwcG9ydHJhaXQlMjBjYXN1YWx8ZW58MXx8fHwxNzcxOTEyMTU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'Divyanshu Pundir',
    role: 'UX Designer',
    image:
      'https://images.unsplash.com/photo-1662302392561-b1deecd3579d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjBjcmVhdGl2ZSUyMHByb2Zlc3Npb25hbCUyMHNtaWxpbmd8ZW58MXx8fHwxNzcxOTEyMTYyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

const STORY_IMAGE =
  'https://images.unsplash.com/photo-1667351326034-c6d733c57dc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMGZyaWVuZHMlMjBjb2xsYWJvcmF0aW9uJTIwc3RhcnR1cCUyMGluZGlhfGVufDF8fHx8MTc3MTkxMjE1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

/* ─── Component ─── */

export function AboutUs({ onNavigate, className }: AboutUsProps) {
  const isMobile = useIsMobile();

  const [resources, setResources] = useState<ResourcePost[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoadingResources(true);
        const resourcesData = await apiClient.getResources();
        if (resourcesData && Array.isArray(resourcesData) && resourcesData.length > 0) {
          const mapped = resourcesData.slice(0, 3).map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.excerpt,
            image: r.thumbnail || r.image || r.image_url || r.featured_image || '',
            category: r.category,
            author: r.author,
            readTime: `${r.read_time_minutes || 5} min read`,
            date: new Date(r.created_at).toLocaleDateString(),
          }));
          setResources(mapped);
        } else {
          setResources([]);
        }
      } catch (err) {
        console.log('Resources fetch failed:', err);
        setResources([]);
      } finally {
        setLoadingResources(false);
      }
    };
    fetchResources();
  }, []);

  /* ─── Shared inline style helpers ─── */
  const sectionPadding = isMobile ? '48px 0' : '80px 0';
  const containerStyle: React.CSSProperties = {
    maxWidth: 'var(--banner-content-max, 1100px)',
    margin: '0 auto',
    padding: '0 24px',
  };

  return (
    <div
      className={`w-full ${className || ''}`}
      style={{ backgroundColor: 'var(--color-bg-page)', fontFamily: 'var(--font-family-base)' }}
    >
      {/* ═══════════════════════════════════════════════
          1. HERO BANNER
      ═══════════════════════════════════════════════ */}
      <PageHero
        title="To us, mental health matters."
        subtitle="At iKan, we believe mental health is for everyone."
      />

      {/* ═══════════════════════════════════════════════
          2. OUR STORY
      ═══════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--color-bg-card)', padding: sectionPadding }}>
        <div style={containerStyle}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '32px' : '56px',
              alignItems: 'center',
            }}
          >
            {/* Text */}
            <div>
              <SectionLabel color="var(--ikan-brand-teal)">Our Story</SectionLabel>
              <h2
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: isMobile ? '28px' : '36px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  lineHeight: '1.2',
                  margin: '0 0 20px 0',
                }}
              >
                Born from{' '}
                <span style={{ color: 'var(--ikan-brand-teal)' }}>personal</span>{' '}
                experience
              </h2>
              <p style={bodyTextStyle}>
                At some point everyone has struggled. Decades old friends Sachin, Vedanshu and Kartik
                have also faced their share of struggles, each one of us embarking on a personal
                journey to understand what we were going through. All of us witnessed first hand the
                barriers and gaps in mental healthcare in India and realised that the system is broken.
              </p>
              <p style={{ ...bodyTextStyle, marginTop: '16px' }}>
                Conversations with people who had struggled and therapists who had learned mental
                healthcare is inaccessible, costly, episodic, fragmented and needs to be fixed. We
                realised mental healthcare needs to stop being treated as a blackbox. The only way
                forward is by bringing people and technology together while being open and
                transparent. So we created{' '}
                <span style={{ fontWeight: 'var(--font-weight-medium)' as any, color: 'var(--color-text-primary)' }}>
                  iKan
                </span>.
              </p>
            </div>

            {/* Image */}
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                aspectRatio: isMobile ? '16/10' : '4/3',
              }}
            >
              <ImageWithFallback
                src={STORY_IMAGE}
                alt="Founders collaborating on iKan"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          3. MISSION & VISION
      ═══════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--color-bg-page)', padding: sectionPadding }}>
        <div style={containerStyle}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '24px',
            }}
          >
            {/* Mission Card */}
            <div
              style={{
                backgroundColor: 'var(--color-primary-default)',
                borderRadius: 'var(--radius-lg)',
                padding: isMobile ? '32px 24px' : '40px 36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: isMobile ? 'auto' : '260px',
              }}
            >
              <SectionLabel color="rgba(255,255,255,0.5)">Mission</SectionLabel>
              <h3
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: isMobile ? '24px' : '28px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-inverse)',
                  lineHeight: '1.3',
                  margin: '0 0 16px 0',
                }}
              >
                Making mental health care accessible, affordable, and stigma-free for every individual in India.
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: '1.7',
                  margin: '0',
                }}
              >
                We are on a mission to bridge the gap between people and quality mental health support
                — through technology, compassion, and transparency.
              </p>
            </div>

            {/* Vision Card */}
            <div
              style={{
                background: 'linear-gradient(160deg, var(--ikan-brand-teal-bg) 0%, var(--ikan-brand-teal-bg-end) 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: isMobile ? '32px 24px' : '40px 36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: isMobile ? 'auto' : '260px',
              }}
            >
              <SectionLabel color="var(--ikan-brand-teal-dark)">Vision</SectionLabel>
              <h3
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: isMobile ? '24px' : '28px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  lineHeight: '1.3',
                  margin: '0 0 16px 0',
                }}
              >
                A world where seeking mental health support is as natural as visiting a doctor.
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--ikan-brand-teal-dark)',
                  lineHeight: '1.7',
                  margin: '0',
                }}
              >
                We envision a future where mental wellness is normalised, people have the tools they
                need at their fingertips, and no one suffers in silence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4. WHY YOU'LL LOVE IKAN (Values)
      ═══════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--color-bg-card)', padding: sectionPadding }}>
        <div style={containerStyle}>
          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '48px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: isMobile ? '28px' : '36px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                lineHeight: '1.2',
                margin: '0 0 12px 0',
              }}
            >
              Why you'll love{' '}
              <span style={{ color: 'var(--ikan-brand-teal)' }}>iKan</span>
            </h2>
            {/* Decorative dots */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--ikan-brand-teal)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--ikan-brand-amber)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--ikan-brand-coral)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--ikan-brand-slate)' }} />
            </div>
          </div>

          {/* Value Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '20px',
            }}
          >
            {VALUES.map((val, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--color-bg-page)',
                  borderRadius: 'var(--radius-lg)',
                  padding: isMobile ? '24px' : '32px',
                  transition: 'box-shadow 0.2s ease',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                  (e.currentTarget as HTMLElement).style.borderColor = `${val.color}30`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: `${val.color}14`,
                    color: val.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--spacing-4)',
                  }}
                >
                  {val.icon}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    margin: '0 0 8px 0',
                  }}
                >
                  {val.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-muted)',
                    lineHeight: '1.7',
                    margin: '0',
                  }}
                >
                  {val.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          5. HOW IT WORKS (Recycled from Homepage)
      ═══════════════════════════════════════════════ */}
      <HowItWorksSection onNavigate={(route) => onNavigate?.(route)} />

      {/* ═══════════════════════════════════════════════
          6. WHO IS IT FOR (Recycled from Homepage)
      ═══════════════════════════════════════════════ */}
      <BenefitsSection
        onNavigate={(route) => onNavigate?.(route)}
        ctaText="Get started"
        ctaRoute="/consultation"
      />

      {/* ═══════════════════════════════════════════════
          7. OUR TEAM
      ═══════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--color-bg-page)', padding: sectionPadding }}>
        <div style={containerStyle}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '48px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: isMobile ? '28px' : '36px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                lineHeight: '1.2',
                margin: '0 0 12px 0',
              }}
            >
              Our Team
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-regular)',
                color: 'var(--color-text-muted)',
                lineHeight: '1.6',
                margin: '0',
                maxWidth: '560px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              The people behind iKan, driven by personal experience and a shared belief that mental
              health care should be better.
            </p>
            {/* Dots */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '14px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--ikan-brand-coral)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--ikan-brand-slate)' }} />
            </div>
          </div>

          {/* ─── Founders (3 large cards) ─── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            {FOUNDERS.map((founder, idx) => (
              <FounderCard key={idx} member={founder} isMobile={isMobile} />
            ))}
          </div>

          {/* ─── Team (3 compact cards) ─── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
              gap: '20px',
              maxWidth: isMobile ? '100%' : '720px',
              margin: '0 auto',
            }}
          >
            {TEAM.map((member, idx) => (
              <TeamCard key={idx} member={member} isMobile={isMobile} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          8. RESOURCES
      ═══════════════════════════════════════════════ */}
      <ResourceBlock
        title="Resources"
        posts={resources}
        loading={loadingResources}
        onPostClick={(post) => onNavigate?.('/resource-detail', post.id)}
        onViewAll={() => onNavigate?.('/resource')}
      />

      {/* ═══════════════════════════════════════════════
          9. NEWSLETTER
      ═══════════════════════════════════════════════ */}
      <NewsletterBlock
        title="Stay Informed About Mental Health"
        benefits={[
          'Get weekly mental health tips and insights',
          'Early access to new features and programs',
          'Exclusive resources and guided exercises',
        ]}
        imageAlt="Mental health newsletter"
        ctaText="Subscribe Now"
        privacyText={NEWSLETTER_CONTENT.PRIVACY_TEXT}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════════ */

/* ─── Section label (uppercase accent) ─── */
function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-family-base)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        margin: '0 0 12px 0',
      }}
    >
      {children}
    </p>
  );
}

/* ─── Shared body text style ─── */
const bodyTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--font-weight-regular)' as any,
  color: 'var(--color-text-muted)',
  lineHeight: '1.7',
  margin: '0',
};

/* ─── Founder Card (large, with bio) ─── */
function FounderCard({ member, isMobile }: { member: TeamMember; isMobile: boolean }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-light)',
        overflow: 'hidden',
        transition: 'box-shadow 0.25s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.07)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Photo */}
      <div style={{ height: isMobile ? '220px' : '240px', overflow: 'hidden' }}>
        <ImageWithFallback
          src={member.image}
          alt={member.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: isMobile ? '20px' : '24px' }}>
        <h3
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            margin: '0 0 4px 0',
          }}
        >
          {member.name}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--ikan-brand-teal)',
            margin: '0 0 12px 0',
          }}
        >
          {member.role}
        </p>
        {member.bio && (
          <p
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: '13px',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-muted)',
              lineHeight: '1.65',
              margin: '0',
            }}
          >
            {member.bio}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Team Card (compact, no bio) ─── */
function TeamCard({ member, isMobile }: { member: TeamMember; isMobile: boolean }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-light)',
        overflow: 'hidden',
        textAlign: 'center',
        transition: 'box-shadow 0.25s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Avatar */}
      <div style={{ height: isMobile ? '160px' : '180px', overflow: 'hidden' }}>
        <ImageWithFallback
          src={member.image}
          alt={member.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: isMobile ? '14px 12px 18px' : '16px 16px 20px' }}>
        <h4
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: isMobile ? '14px' : 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            margin: '0 0 4px 0',
          }}
        >
          {member.name}
        </h4>
        <p
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: isMobile ? '12px' : 'var(--text-sm)',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--color-text-muted)',
            margin: '0',
          }}
        >
          {member.role}
        </p>
      </div>
    </div>
  );
}