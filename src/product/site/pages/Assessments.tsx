import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { FileText, Brain, Shield, Activity } from 'lucide-react';
import { PageHero } from '../ui/PageHero';
import { Container, PageShell } from '../ui/Container';
import { AssessmentCard } from '../ui/blocks/AssessmentCard';
import { assessmentImage } from '../content/assessment-meta';
import { assessmentMinutes, assessmentUrl, getListedAssessments } from '../content/catalog';
import { useSeo } from '../ui/hooks/useSeo';

/**
 * The public assessment catalogue — static.
 *
 * The logged-out view of src/product/app/screens/Assessments.tsx (list view),
 * rendered from the build-time snapshot. No drafts, history or recommendations:
 * those are per-user and live in the app at APP_ORIGIN. A card opens this
 * site's own landing page; starting an assessment happens from there.
 */

interface AssessmentsProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

// Helper to get Unsplash images
const getAssessmentImage = (category?: string, customImage?: string | null) => {
  if (customImage) return customImage;

  const normalizedCategory = (category || 'wellness').toLowerCase();
  // Using Unsplash source for placeholders as requested in audit
  if (normalizedCategory.includes('anxiety')) return "https://images.unsplash.com/photo-1702032773321-afc433d91ce8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwcGVhY2VmdWwlMjBtaW5kJTIwc2VyZW5lJTIwd2F0ZXJ8ZW58MXx8fHwxNzY1NDU5MTU1fDA&ixlib=rb-4.1.0&q=80&w=1080";
  if (normalizedCategory.includes('depression')) return "https://images.unsplash.com/photo-1600262912301-d288169c6cda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3BlJTIwc3Vuc2hpbmUlMjBjbG91ZHN8ZW58MXx8fHwxNzY1NDU5MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080";
  if (normalizedCategory.includes('stress')) return "https://images.unsplash.com/photo-1676386749756-1987d8a0e32a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwcGVhY2VmdWwlMjBuYXR1cmUlMjBzdHJlc3MlMjByZWxpZWZ8ZW58MXx8fHwxNzY1NDU4MzIzfDA&ixlib=rb-4.1.0&q=80&w=1080";
  if (normalizedCategory.includes('burnout')) return "https://images.unsplash.com/photo-1564341505027-b410c159e1b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5yaXNlJTIwZW5lcmd5fGVufDF8fHx8MTc2NTQ1ODM0Mnww&ixlib=rb-4.1.0&q=80&w=1080";
  if (normalizedCategory.includes('sleep')) return "https://images.unsplash.com/photo-1743748978909-169017ab0720?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMHNsZWVwJTIwYmVkfGVufDF8fHx8MTc2NTQ1ODMxOHww&ixlib=rb-4.1.0&q=80&w=1080";
  if (normalizedCategory.includes('work')) return "https://images.unsplash.com/photo-1698047682320-1ea97303dbd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JrJTIwbGlmZSUyMGJhbGFuY2UlMjBsYXB0b3AlMjBuYXR1cmV8ZW58MXx8fHwxNzY1NDU5MTY4fDA&ixlib=rb-4.1.0&q=80&w=1080";

  // Default/General
  return "https://images.unsplash.com/photo-1758274539447-a675587a2b6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbGlmZXN0eWxlJTIwYmFsYW5jZSUyMG5hdHVyZXxlbnwxfHx8fDE3NjU0NTkxNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080";
};

export function Assessments({ className, onNavigate }: AssessmentsProps) {
  /* Without this the tab keeps whatever the previous route set: arrive here
     from another page and the title still names that one. Taken from the hero
     so the tab and the <h1> cannot diverge. */
  useSeo({
    title: 'Health Assessments',
    description: 'Quick, evidence-based screenings to help you understand your mental well-being.',
    canonicalPath: '/assessment',
    type: 'website',
  });

  const assessments = getListedAssessments();

  return (
    <PageShell className={className}>
      <PageHero
        title="Health Assessments"
        subtitle="Quick, evidence-based screenings to help you understand your mental well-being."
      />
      <Container className="py-4 md:py-8 space-y-8">

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
         {[
           {
             title: "Clinical Screenings",
             desc: "Evidence-based tools for anxiety, depression, and more.",
             icon: Brain,
             color: "var(--foreground)",
             bg: "var(--secondary)"
           },
           {
             title: "Private & Secure",
             desc: "Your results are private to your account and never shared with third parties.",
             icon: Shield,
             color: "var(--calm-strong)",
             bg: "var(--calm-soft)"
           },
           {
             title: "Instant Insights",
             desc: "Get immediate feedback and personalized recommendations.",
             icon: Activity,
             color: "var(--rest-strong)",
             bg: "var(--rest-soft)"
           }
         ].map((item, i) => (
           <Card key={i} className="border-none shadow-sm rounded-[var(--radius-lg)] h-full" style={{ backgroundColor: 'var(--card)' }}>
             <CardContent className="p-6 flex flex-col gap-4 h-full">
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                 <item.icon size={24} style={{ color: item.color }} />
               </div>
               <div>
                 <h3 style={{ fontWeight: 500, fontSize: '18px', color: 'var(--foreground)', fontFamily: 'var(--font-sans)', marginBottom: 4 }}>{item.title}</h3>
                 <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)', lineHeight: 1.6, fontWeight: 400 }}>
                   {item.desc}
                 </p>
               </div>
             </CardContent>
           </Card>
         ))}
      </motion.div>

      <div id="assessments-grid" className="scroll-mt-32" />

      {/* Assessment Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-[var(--foreground)]">Available Assessments</h3>
        </div>

        {assessments.length === 0 ? (
          <Card className="border-none shadow-sm rounded-[var(--radius-lg)]" style={{ backgroundColor: 'var(--card)' }}>
            <CardContent className="text-center p-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--secondary)' }}>
                <FileText size={24} className="text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No assessments available</h3>
              <p className="text-[var(--muted-foreground)]">Assessments will appear here once they are published. Please check back later.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assessments.map((assessment, index) => {
              const category = assessment.category || assessment.metadata?.category || 'wellness';
              // Authored image first, stock photo by category only as a last resort.
              const imageUrl = getAssessmentImage(category, assessmentImage(assessment));
              const minutes = assessmentMinutes(assessment);

              return (
                <AssessmentCard
                  key={assessment.id || index}
                  index={index}
                  variant="full"
                  item={{
                    id: assessment.id,
                    title: assessment.title,
                    description: assessment.description,
                    eyebrow: category,
                    image: imageUrl,
                    // Null renders no chip. An assessment that has not said
                    // how long it takes does not get a number invented for it.
                    durationLabel: minutes !== null ? `${minutes} min` : null,
                    countLabel: assessment.questionCount !== null
                      ? `${assessment.questionCount} questions` : null,
                    completed: false,
                    cta: 'Start assessment',
                  }}
                  href={assessmentUrl(assessment)}
                  onNavigate={onNavigate}
                />
              );
            })}
          </div>
        )}
      </div>
    </Container>
    </PageShell>
  );
}

export default Assessments;
