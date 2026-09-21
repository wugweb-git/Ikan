/**
 * What the store will show, while you type it. §21 item 5.
 *
 * It renders the LIVE `EquipProgramCard` — the same component the Equip listing
 * uses — rather than a second card built to look like it. A preview drawn by its
 * own markup is a copy that drifts, and the point of a preview is that it does
 * not.
 *
 * `pointer-events: none` because it is a preview, not a link: clicking it in the
 * builder should not navigate anywhere.
 */
import { EquipProgramCard } from '../../../app/ui/blocks/EquipProgramCard';

export interface LandingPreviewCardProps {
  data: {
    title?: string;
    description?: string;
    thumbnail?: string;
    cover_image?: string;
    hero_image?: string;
    category?: string;
    is_paid?: boolean;
    price?: number;
    currency?: string;
    duration_days?: number;
  };
}

export function LandingPreviewCard({ data }: LandingPreviewCardProps) {
  const days = data.duration_days;
  return (
    <div>
      <div
        style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em',
          color: 'var(--color-text-muted)', marginBottom: 9, textTransform: 'uppercase',
        }}
      >
        Store card
      </div>
      <div style={{ pointerEvents: 'none' }} aria-hidden="true">
        <EquipProgramCard
          program={{
            title: data.title,
            description: data.description,
            /* The card prefers `thumbnail`; the wizard writes cover and thumbnail
               together, and `hero_image` has no editor at all — so fall through
               the same order `EquipDetail` does. */
            thumbnail: data.thumbnail || data.cover_image || data.hero_image || '',
            category: data.category,
            is_paid: data.is_paid,
            price: data.price,
            currency: data.currency,
          }}
          durationLabel={days ? `${days} days` : ''}
          onClick={() => {}}
        />
      </div>
      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 12, lineHeight: 1.5 }}>
        Updates as you type. This is the same card the Equip listing renders —
        not a copy of it.
      </p>
    </div>
  );
}
