import { motion, useReducedMotion } from 'framer-motion';
import { ConsultantCard, type Consultant } from '../ui/blocks/ConsultantCard';
import { PageHero } from '../ui/PageHero';
import { Container, PageShell } from '../ui/Container';
import { getConsultants, type SiteConsultant } from '../content/catalog';
import { APP_LOGIN_URL } from '../content/app-origin';

/**
 * The public consultant directory — static.
 *
 * The logged-out view of src/product/app/screens/Consultation.tsx, rendered
 * from the build-time snapshot as a plain grid. The app screen's search,
 * filter sheet, sort and view toggle were carried over here for a handful of
 * consultants, where they filtered almost nothing; they stay in the app.
 * Booking is an account action, so Book is a full-page link to the member
 * app's sign-in.
 */

interface ConsultationProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

/**
 * The card's type, from the snapshot. The snapshot carries only what the card
 * reads, so the fields it declares but never renders are empty, and the id is
 * positional (consultant ids are not published).
 */
const toCard = (c: SiteConsultant, i: number): Consultant => ({
  ...c,
  id: `consultant-${i}`,
  approaches: [],
  concernsICanHelp: [],
  qualifications: [],
});

/** Most-reviewed good ratings first — the app's default order without a per-user signal. */
const byWeightedRating = (a: Consultant, b: Consultant) =>
  ((b.rating || 0) * (b.reviewCount || 0)) - ((a.rating || 0) * (a.reviewCount || 0));

const CONSULTANTS = getConsultants().map(toCard).sort(byWeightedRating);

export function Consultation({ className }: ConsultationProps) {
  const reduce = useReducedMotion();

  return (
    <PageShell className={className}>
      <PageHero
        title="Find Your Consultant"
        subtitle="Connect with experienced mental health professionals who understand your needs."
      />

      <Container className="py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONSULTANTS.map((consultant, idx) => (
            <motion.div
              key={consultant.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
            >
              <ConsultantCard
                consultant={consultant}
                onBook={() => window.location.assign(APP_LOGIN_URL)}
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </PageShell>
  );
}

export default Consultation;
