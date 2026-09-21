import { useMemo } from 'react';
import { Star } from 'lucide-react';
import { useIsMobile } from '../../ui/hooks/useIsMobile';
import { ImageWithFallback } from '../../ui/ImageWithFallback';
import { DEFAULT_CMS_CONTENT } from '../../content/cms-defaults';
import { CONTENT_MAX } from '../../ui/Container';

/* ─── Data ─── */
interface Review {
  quote: string;
  name: string;
  avatarBg: string;
  avatarEmoji: string;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    quote:
      'iKan helped me understand my emotions better. I used to bottle everything up, but now I have tools to process what I feel. The assessments gave me clarity I never expected.',
    name: 'Priya M.',
    avatarBg: '#7ED4C8',
    avatarEmoji: '😊',
  },
  {
    quote:
      'I was hesitant at first, but the guided programs made it so easy to start. The Equip programs fit right into my schedule, and I genuinely look forward to each session now.',
    name: 'Arjun K.',
    avatarBg: '#F5C842',
    avatarEmoji: '😌',
  },
  {
    quote:
      "Finding affordable mental health support felt impossible until I found iKan. The resources are thoughtful and the consultations are judgment-free. It's changed how I take care of myself.",
    name: 'Sneha R.',
    avatarBg: '#E8A0D4',
    avatarEmoji: '🤗',
  },
];

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1758275557348-23950a3ddeae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMGZyaWVuZHMlMjBoYXBweSUyMG91dGRvb3IlMjBnYXRoZXJpbmclMjBkaXZlcnNlfGVufDF8fHx8MTc3MTkwODY4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

/* ─── Star Row ─── */
function Stars() {
  return (
    <div className="flex items-center" style={{ gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={18} fill="#F5A623" stroke="none" />
      ))}
    </div>
  );
}

/* ─── Single Card ─── */
function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: '24px',
        border: '2px solid #EFE8DE',
        padding: '28px',
        minHeight: '300px',
        flex: '1 1 0',
        minWidth: 0,
      }}
    >
      <div className="flex flex-col" style={{ gap: '16px' }}>
        <Stars />
        <p
          style={{
            fontFamily: 'var(--font-family-base)',
            fontWeight: 'var(--font-weight-regular)',
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--line-height-md)',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          {review.quote}
        </p>
      </div>

      <div className="flex items-center" style={{ gap: '12px', marginTop: '24px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: review.avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-lg)',
            flexShrink: 0,
          }}
        >
          {review.avatarEmoji}
        </div>
        <span
          style={{
            fontFamily: 'var(--font-family-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-base)',
            color: '#666362',
          }}
        >
          {review.name}
        </span>
      </div>
    </div>
  );
}

/* ─── Mobile Card (stacked) ─── */
function MobileReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="flex flex-col justify-between w-full"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: '20px',
        border: '2px solid #EFE8DE',
        padding: '24px',
      }}
    >
      <div className="flex flex-col" style={{ gap: '12px' }}>
        <Stars />
        <p
          style={{
            fontFamily: 'var(--font-family-base)',
            fontWeight: 'var(--font-weight-regular)',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--line-height-md)',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          {review.quote}
        </p>
      </div>

      <div className="flex items-center" style={{ gap: '10px', marginTop: '16px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: review.avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-base)',
            flexShrink: 0,
          }}
        >
          {review.avatarEmoji}
        </div>
        <span
          style={{
            fontFamily: 'var(--font-family-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-sm)',
            color: '#666362',
          }}
        >
          {review.name}
        </span>
      </div>
    </div>
  );
}

/* ─── Section ─── */
export function ReviewsSection() {
  const isMobile = useIsMobile();

  const cmsContent = DEFAULT_CMS_CONTENT['homepage-reviews-section'];
  const cms = useMemo(() => {
    if (!cmsContent?.content) return null;
    try { return JSON.parse(cmsContent.content); } catch { return null; }
  }, [cmsContent]);

  const heading = cms?.heading || 'Reasons to keep showing up';
  const heroImage = cms?.heroImage || DEFAULT_HERO_IMAGE;
  const reviews: Review[] = cms?.reviews || DEFAULT_REVIEWS;

  return (
    <section
      style={{
        backgroundColor: 'var(--color-bg-page)',
        paddingTop: '64px',
        paddingBottom: isMobile ? '40px' : '64px',
      }}
    >
      <div
        style={{
          maxWidth: CONTENT_MAX,
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {/* ── Title row ── */}
        <div
          className="flex items-center justify-center"
          style={{
            gap: '12px',
            marginBottom: isMobile ? '24px' : '40px',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontSize: isMobile ? 'var(--text-2xl)' : 'var(--text-3xl)',
              color: 'var(--color-text-primary)',
              lineHeight: '1.3',
              letterSpacing: '-0.5px',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {heading}
          </h2>
          <div className="flex items-center" style={{ gap: '4px' }}>
            <div
              style={{
                width: isMobile ? '18px' : '22px',
                height: isMobile ? '18px' : '22px',
                borderRadius: '50%',
                backgroundColor: '#7ED4C8',
              }}
            />
            <div
              style={{
                width: isMobile ? '18px' : '22px',
                height: isMobile ? '18px' : '22px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-default)',
              }}
            />
          </div>
        </div>

        {/* ── Desktop layout ── */}
        {!isMobile && (
          <div className="relative">
            <div
              style={{
                width: '100%',
                borderRadius: '28px',
                overflow: 'hidden',
                height: '400px',
              }}
            >
              <ImageWithFallback
                src={heroImage}
                alt="A supportive community of people sharing moments together"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 30%' }}
              />
            </div>

            <div
              className="flex"
              style={{
                gap: '20px',
                marginTop: '-160px',
                position: 'relative',
                zIndex: 2,
                padding: '0 20px',
              }}
            >
              {reviews.map((review) => (
                <ReviewCard key={review.name} review={review} />
              ))}
            </div>
          </div>
        )}

        {/* ── Mobile layout ── */}
        {isMobile && (
          <div className="flex flex-col" style={{ gap: '16px' }}>
            <div
              style={{
                width: '100%',
                borderRadius: '20px',
                overflow: 'hidden',
                height: '200px',
              }}
            >
              <ImageWithFallback
                src={heroImage}
                alt="A supportive community of people sharing moments together"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 30%' }}
              />
            </div>

            {reviews.map((review) => (
              <MobileReviewCard key={review.name} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
