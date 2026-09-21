import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { FileText, Brain, Shield, Activity } from 'lucide-react';
import { cn } from '../ui/utils';
import { PageHero } from '../ui/PageHero';
import { AssessmentCard } from '../ui/blocks/AssessmentCard';
import { assessmentImage } from '../../../shared/lib/assessment-meta';
import { getAssessments, type SiteAssessment } from '../lib/catalog';

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

/** Catalogue entries, de-duplicated the way the app screen does it. */
function catalogue(): SiteAssessment[] {
  const seen = new Set<string>();
  const out: SiteAssessment[] = [];
  for (const a of getAssessments()) {
    const key = a.slug || a.assessment_id || a.id;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    // Only published assessments are listed.
    if (a.published === false) continue;
    out.push(a);
  }
  return out;
}

export function Assessments({ className, onNavigate }: AssessmentsProps) {
  const assessments = catalogue();

  const openLanding = (a: SiteAssessment) => {
    onNavigate?.(a.slug ? `/assessment/${a.slug}` : `/assessment-detail?id=${a.id}`);
  };

  return (
    <div className={cn("w-full", className)}>
      <PageHero
        title="Health Assessments"
        subtitle="Quick, evidence-based screenings to help you understand your mental well-being."
      />
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

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
             color: "var(--color-primary-default)",
             bg: "var(--color-bg-muted)"
           },
           {
             title: "Private & Secure",
             desc: "Your results are private to your account and never shared with third parties.",
             icon: Shield,
             color: "var(--color-status-success)",
             bg: "var(--color-status-success-light)"
           },
           {
             title: "Instant Insights",
             desc: "Get immediate feedback and personalized recommendations.",
             icon: Activity,
             color: "var(--color-status-warning)",
             bg: "var(--color-status-warning-light)"
           }
         ].map((item, i) => (
           <Card key={i} className="border-none shadow-sm rounded-[var(--radius-lg)] h-full" style={{ backgroundColor: 'var(--color-bg-card)' }}>
             <CardContent className="p-6 flex flex-col gap-4 h-full">
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                 <item.icon size={24} style={{ color: item.color }} />
               </div>
               <div>
                 <h3 style={{ fontWeight: 500, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)', marginBottom: 4 }}>{item.title}</h3>
                 <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)', lineHeight: 1.6, fontWeight: 400 }}>
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
          <h3 className="text-xl font-medium text-[var(--color-text-primary)]">Available Assessments</h3>
        </div>

        {assessments.length === 0 ? (
          <Card className="border-none shadow-sm rounded-[var(--radius-lg)]" style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <CardContent className="text-center p-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <FileText size={24} className="text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">No assessments available</h3>
              <p className="text-[var(--color-text-muted)]">Assessments will appear here once they are published. Please check back later.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assessments.map((assessment, index) => {
              const category = assessment.category || assessment.metadata?.category || 'wellness';
              // Authored image first, stock photo by category only as a last resort.
              const imageUrl = getAssessmentImage(category, assessmentImage(assessment));
              const minutes = typeof assessment.duration === 'number' && assessment.duration > 0 ? assessment.duration : null;

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
                  onSelect={() => openLanding(assessment)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

export default Assessments;
