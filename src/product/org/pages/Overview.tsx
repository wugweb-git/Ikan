import { ShieldCheck } from 'lucide-react';
import type { Overview as OverviewData } from '../api';

/**
 * What an organisation admin sees first.
 *
 * Every figure here is roster arithmetic computed from the portal's own
 * tables — seats, invites, acceptance. None of it touches member activity,
 * which is why it can be shown honestly today.
 *
 * The wellbeing panel deliberately shows its absence rather than a zero. A
 * zero is a measurement; "not connected" is the truth, and the difference
 * matters to someone deciding whether their workforce is doing badly or their
 * dashboard is not finished.
 */

export function Overview({ data }: { data: OverviewData }) {
  const { seats, onboarding, organization } = data;
  const pct = seats.purchased > 0 ? Math.min(100, Math.round((seats.used / seats.purchased) * 100)) : 0;

  return (
    <div className="org-page">
      <h1 className="org-page__title">{organization.name}</h1>
      <p className="org-page__lede">
        Seats, invitations and adoption. Wellbeing reporting appears here once it is connected,
        and will always be aggregate.
      </p>

      <div className="org-stats">
        <div className="org-stat">
          <p className="org-stat__label">Seats used</p>
          <p className="org-stat__value">
            {seats.used}
            <span style={{ fontSize: 18, color: 'var(--muted-foreground)' }}> / {seats.purchased}</span>
          </p>
          <div className="org-meter">
            <div
              className={`org-meter__fill${seats.remaining === 0 ? ' org-meter__fill--full' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="org-stat__note">
            {seats.remaining === 0
              ? 'No seats remaining'
              : `${seats.remaining} remaining`}
          </p>
        </div>

        <div className="org-stat">
          <p className="org-stat__label">Joined</p>
          <p className="org-stat__value">{onboarding.accepted}</p>
          <p className="org-stat__note">People who accepted their invitation</p>
        </div>

        <div className="org-stat">
          <p className="org-stat__label">Invited, not yet joined</p>
          <p className="org-stat__value">{onboarding.pending}</p>
          <p className="org-stat__note">
            {onboarding.pending === 0 ? 'Everyone invited has joined' : 'Awaiting sign-up'}
          </p>
        </div>

        <div className="org-stat">
          <p className="org-stat__label">Adoption</p>
          <p className="org-stat__value">
            {onboarding.adoption_rate === null ? '—' : `${onboarding.adoption_rate}%`}
          </p>
          <p className="org-stat__note">
            {onboarding.adoption_rate === null
              ? 'Set a seat count to measure adoption'
              : 'Of purchased seats'}
          </p>
        </div>
      </div>

      {!data.wellbeing.available && (
        <section className="org-panel org-panel--pending">
          <h2 className="org-panel__title">Wellbeing reporting is not connected yet</h2>
          <p className="org-panel__body">
            {data.wellbeing.reason} When it is, you will see your organisation&rsquo;s overall score
            and its trend, score distribution across bands, and engagement per product — all of it
            aggregate, and none of it attributable to a person.
          </p>
        </section>
      )}

      <aside className="org-privacy">
        <ShieldCheck aria-hidden="true" />
        <p>
          <strong>You will never see an individual&rsquo;s wellbeing data here.</strong> No scores,
          no assessment answers, no journal entries, no therapy attendance — not for any person, and
          not through any filter. Figures are only ever shown for groups of at least{' '}
          {organization.min_group_size} people; below that, this portal says so rather than showing
          a number. The roster below is the list your organisation supplied, and carries nothing
          about anyone&rsquo;s health.
        </p>
      </aside>
    </div>
  );
}
