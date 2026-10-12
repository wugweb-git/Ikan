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

      {/* Seats are the fact an administrator acts on — whether to invite more
          people, and whether to buy more room. It gets the weight; the rest
          of the roster arithmetic sits under a rule beneath it. Four equal
          cards gave "0 invited" the same prominence as the contract. */}
      <div className="org-lead">
        <p className="org-lead__value">
          {seats.used}
          <span className="org-lead__of"> of {seats.purchased}</span>
        </p>
        <div className="org-lead__side">
          <p className="org-lead__label">seats in use</p>
          <p className={`org-lead__delta${seats.remaining === 0 ? ' org-lead__delta--down' : ''}`}>
            {seats.remaining === 0 ? 'None remaining' : `${seats.remaining} remaining`}
          </p>
        </div>
      </div>

      <div className="org-meter" style={{ marginTop: 18 }}>
        <div
          className={`org-meter__fill${seats.remaining === 0 ? ' org-meter__fill--full' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="org-facts">
        <div className="org-fact">
          <p className="org-fact__value">{onboarding.accepted}</p>
          <p className="org-fact__label">have joined</p>
        </div>
        <div className="org-fact">
          <p className="org-fact__value">{onboarding.pending}</p>
          <p className="org-fact__label">
            {onboarding.pending === 0 ? 'invitations outstanding' : 'invited, not yet joined'}
          </p>
        </div>
        <div className="org-fact">
          <p className="org-fact__value">
            {onboarding.adoption_rate === null ? '—' : `${onboarding.adoption_rate}%`}
          </p>
          <p className="org-fact__label">
            {onboarding.adoption_rate === null ? 'set a seat count to measure adoption' : 'of seats taken up'}
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
