import React, { useEffect, useMemo, useState } from 'react';
import { ContentImage } from '../ui/ContentImage';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { ResourceBlock } from '../ui/blocks/ResourceBlock';
import { NewsletterBlock } from '../ui/blocks/NewsletterBlock';
import { ResourcePost } from '../ui/blocks/ResourceCard';
import { apiClient } from '../../../shared/api';
import {
  Heart,
  Shield,
  FlaskConical,
  Handshake,
} from 'lucide-react';
import { NEWSLETTER_CONTENT } from '../content/content';
import { PageHero } from '../ui/PageHero';
import { HowItWorksSection } from './homepage/HowItWorksSection';
import { BenefitsSection } from './homepage/BenefitsSection';
import { DEFAULT_CMS_CONTENT } from '../lib/cms-defaults';

interface AboutUsProps {
  onNavigate?: (route: string, resourceId?: string) => void;
  className?: string;
}

/* ─── Content Data ─── */

const ICON_MAP: Record<string, React.ReactNode> = {
  heart: <Heart style={{ width: 24, height: 24 }} />,
  shield: <Shield style={{ width: 24, height: 24 }} />,
  'flask-conical': <FlaskConical style={{ width: 24, height: 24 }} />,
  handshake: <Handshake style={{ width: 24, height: 24 }} />,
};

interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  image: string;
}

/* ─── Component ─── */

export function AboutUs({ onNavigate, className }: AboutUsProps) {
  const isMobile = useIsMobile();

  // ── CMS content for the entire About Us page ──
  const cmsContent = DEFAULT_CMS_CONTENT['page-about-us'];
  const cms = useMemo(() => {
    if (!cmsContent?.content) return null;
    try { return JSON.parse(cmsContent.content); } catch { return null; }
  }, [cmsContent]);

  /*
    THE HERO BANNER SYSTEM WAS HERE — a per-page override fetched from
    `getHeroBanner('about')`, layered above the CMS hero and a hardcoded
    fallback. Removed 2026-09-10: the feature is gone, and the CMS/hardcoded
    layer beneath it is unchanged.
  */
  const heroTitle = cms?.hero?.title || 'To us, mental health matters.';
  const heroSubtitle = cms?.hero?.subtitle || 'At iKan, we believe mental health is for everyone.';

  const storyLabel = cms?.story?.label || 'Our Story';
  const storyImage = cms?.story?.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
  const storyImageAlt = cms?.story?.imageAlt || 'Founders collaborating on iKan';

  const missionLabel = cms?.mission?.label || 'Mission';
  const missionTitle = cms?.mission?.title || 'Making mental health care accessible, affordable, and stigma-free for every individual in India.';
  const missionDescription = cms?.mission?.description || 'We are on a mission to bridge the gap between people and quality mental health support — through technology, compassion, and transparency.';

  const visionLabel = cms?.vision?.label || 'Vision';
  const visionTitle = cms?.vision?.title || 'A world where seeking mental health support is as natural as visiting a doctor.';
  const visionDescription = cms?.vision?.description || 'We envision a future where mental wellness is normalised, people have the tools they need at their fingertips, and no one suffers in silence.';

  const valuesHeading = cms?.valuesHeading || "Why you'll love iKan";
  const teamHeading = cms?.teamHeading || 'Our Team';
  const teamDescription = cms?.teamDescription || 'The people behind iKan, driven by personal experience and a shared belief that mental health care should be better.';

  const values = useMemo(() => {
    if (!cms?.values) return [
      { iconName: 'heart', title: 'People Centric', description: 'At iKan we keep you at the heart of everything, our sole focus is to empower you and make mental health care accessible for all.', color: 'var(--ikan-brand-teal)' },
      { iconName: 'shield', title: 'Secure', description: 'We value your privacy very highly, we are committed to ensuring your data is always safe and secure.', color: 'var(--ikan-brand-amber)' },
      { iconName: 'flask-conical', title: 'Science Backed', description: 'Everything we do is backed by research and validated by practising psychologists.', color: 'var(--ikan-brand-coral)' },
      { iconName: 'handshake', title: 'Our Promise', description: 'We believe mental health care is for everyone and we are eager to make it a reality.', color: 'var(--ikan-brand-slate)' },
    ];
    return cms.values;
  }, [cms]);

  const founders: TeamMember[] = cms?.founders || [
    { name: 'Kartik Chandra', role: 'Co-Founder and CEO', bio: 'Kartik has a decade long experience in general and health insurance and health tech across various functions.', image: '/team/kartik.jpg' },
    { name: 'Vedanshu Srivastava', role: 'Co-Founder and Product Head', bio: 'Vedanshu has a decade long experience in general and health insurance and health tech across various functions.', image: '/team/vedanshu.jpg' },
    { name: 'Sachin Vaishampayan', role: 'Co-Founder and CTO', bio: 'Sachin has worked in research and education for over a decade.', image: '/team/sachin.jpg' },
  ];

  const team: TeamMember[] = cms?.team || [
    { name: 'Vaibhav Shukla', role: 'System Architect', image: '/team/vaibhav.jpg' },
    { name: 'Amitabh Bhatnagar', role: 'Dev Engineer', image: '/team/amitabh.jpg' },
    { name: 'Divyanshu Pundir', role: 'UX Designer', image: '/team/divyanshu.jpg' },
  ];

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
        title={heroTitle}
        subtitle={heroSubtitle}
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
              <SectionLabel color="var(--ikan-brand-teal)">{storyLabel}</SectionLabel>
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
              <ContentImage
                src={storyImage}
                alt={storyImageAlt}
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
              <SectionLabel color="rgba(255,255,255,0.5)">{missionLabel}</SectionLabel>
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
                {missionTitle}
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
                {missionDescription}
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
              <SectionLabel color="var(--ikan-teal-on-wash)">{visionLabel}</SectionLabel>
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
                {visionTitle}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--ikan-teal-on-wash)',
                  lineHeight: '1.7',
                  margin: '0',
                }}
              >
                {visionDescription}
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
              {valuesHeading}
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
            {values.map((val, idx) => (
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
                  (e.currentTarget as HTMLElement).style.borderColor = `color-mix(in srgb, ${val.color} 19%, transparent)`;
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
                    backgroundColor: `color-mix(in srgb, ${val.color} 8%, transparent)`,
                    color: val.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--spacing-4)',
                  }}
                >
                  {ICON_MAP[val.iconName]}
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
        {/* Team photos: desaturated by default, full colour on hover */}
        <style>{`
          .ikan-team-photo img {
            filter: grayscale(1);
            transition: filter 0.4s ease, transform 0.4s ease;
          }
          .ikan-team-photo:hover img {
            filter: grayscale(0) saturate(1.05);
            transform: scale(1.03);
          }
        `}</style>
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
              {teamHeading}
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
              {teamDescription}
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
            {founders.map((founder, idx) => (
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
            {team.map((member, idx) => (
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
      <div className="ikan-team-photo" style={{ height: isMobile ? '220px' : '240px', overflow: 'hidden' }}>
        <ContentImage
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
      <div className="ikan-team-photo" style={{ height: isMobile ? '160px' : '180px', overflow: 'hidden' }}>
        <ContentImage
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