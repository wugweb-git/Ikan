import { useSeo } from '../ui/hooks/useSeo';

/**
 * What an employer can and cannot see — written for the employee.
 *
 * DRAFT, and marked as one on the page: the copy is written but has not been
 * through legal review, and under the DPDP Act consent that arrives through
 * an employer is the case a regulator looks at hardest. It is published now
 * because an organisation rolling iKAN out needs something to point their
 * people at on day one, and because the promise should be legible before
 * anybody is asked to rely on it.
 *
 * This is the canonical wording. The member app shows its own consent screen
 * at sign-up; that screen should quote this page rather than paraphrase it,
 * so there is one statement of the promise and not two that drift.
 */

const CAN_SEE = [
  'How many people in the organisation have an iKAN account, and how many have started using it.',
  'An overall wellbeing score for the organisation, and whether it is going up or down.',
  'The same for a department — but only when at least ten people in it have data.',
  'What share of people use each part of iKAN: assessments, Equip, the journal, consultations.',
];

const CANNOT_SEE = [
  'Your score, on any assessment, ever.',
  'Your answers to any question.',
  'Anything you write in your journal.',
  'Whether you have had a consultation, booked one, or attended one.',
  'Whether you use iKAN at all, or how often.',
  'Any figure for a group small enough to point at you.',
];

export function WorkplacePrivacy({ className }: { className?: string }) {
  useSeo({
    title: 'What your employer can see',
    description:
      'If your organisation pays for iKAN, this is exactly what they can and cannot see about you.',
    canonicalPath: '/workplace-privacy',
    type: 'website',
  });

  return (
    <div className={['ikan2-theme', 'info-page', 'site-page-below-nav', className].filter(Boolean).join(' ')}>
      <section className="info-band">
        <div className="info-band__inner">
          <p className="info-eyebrow">For people whose employer provides iKAN</p>
          <h1 className="info-title">What your employer can see</h1>
          <p className="info-subtitle">
            Short version: numbers about everyone, never anything about you. Here is the whole of it.
          </p>

          <div className="org-note org-note--warn" style={{ maxWidth: '38rem' }}>
            <strong>Draft.</strong> This wording is being reviewed by our lawyers before it becomes
            the version you are asked to agree to. The commitments below are already how the
            product is built.
          </div>

          <h2 className="info-subhead">What they can see</h2>
          <ul className="info-list">
            {CAN_SEE.map((line) => <li key={line}>{line}</li>)}
          </ul>

          <h2 className="info-subhead">What they cannot see</h2>
          <ul className="info-list info-list--strong">
            {CANNOT_SEE.map((line) => <li key={line}>{line}</li>)}
          </ul>

          <h2 className="info-subhead">Why the group of ten matters</h2>
          <p>
            A number about three people is a number about those three people. So nothing is
            reported for a group smaller than ten, and that rule is applied after any filter — your
            employer cannot narrow by team and date until only you are left. If withholding one
            group would let them work it out by subtracting the rest from the total, a second group
            is withheld too.
          </p>
          <p>
            Your organisation can raise that threshold. Nobody, including us, can lower it below
            five.
          </p>

          <h2 className="info-subhead">If you leave</h2>
          <p>
            Your account is yours. When you leave the organisation, your history and progress stay
            with you, and you choose what happens next — we will write to you about the options
            rather than deleting anything. Figures you contributed to in the past remain part of
            those past reports; nothing new about you is added after you go.
          </p>

          <h2 className="info-subhead">In an emergency</h2>
          <p>
            Nothing you record in iKAN is passed to your employer, including anything that suggests
            you are struggling. If you need someone now, the KIRAN helpline is{' '}
            <a href="tel:18005990019">1800-599-0019</a> (24×7) and iCALL is{' '}
            <a href="tel:9152987821">9152987821</a>.
          </p>

          <p className="info-fine">
            Questions about any of this: <a href="mailto:support@ikanhealth.in">support@ikanhealth.in</a>.
            Our full <a href="/privacy">privacy policy</a> covers everything else.
          </p>
        </div>
      </section>
    </div>
  );
}

export default WorkplacePrivacy;
