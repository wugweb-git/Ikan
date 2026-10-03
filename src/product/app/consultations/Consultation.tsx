import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '../ui/utils';
import { Search, X, LayoutGrid, List, Sparkles, SlidersHorizontal } from 'lucide-react';
import { apiClient } from '../../../shared/api/api';
import { percentOfRange } from '../assessments/result-presentation';
import { severityOfResult } from '../assessments/severity-presentation';
import { compareSeverity } from '../../../supabase/functions/server/scoring-vocabulary.ts';
import { ConsultantCard } from '../ui/blocks/ConsultantCard';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { Skeleton } from '../ui/skeleton-loader';
import { PageHero } from '../ui/PageHero';
import { useMetadata } from '../ui/hooks/useMetadata';
import { BookingModal } from '../ui/blocks/BookingModal';
import { useAuth } from '../../../shared/state/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ── Consultant type ─────────────────────────────────────────────
export interface Consultant {
  id: string;
  name: string;
  credentials: string;
  category: string;
  photo: string;
  yearsExperience: number;
  languages: string[];
  location: string;
  sessionModes: ('online' | 'offline' | 'call' | 'chat')[];
  expertises: string[];
  topExpertises: string[];
  approaches: string[];
  concernsICanHelp: string[];
  pricing: {
    video: number;
    call: number;
    chat: number;
    offline?: number;
  };
  nextAvailableSlot: string;
  rating: number;
  reviewCount: number;
  bio: string;
  qualifications: string[];
  available: boolean;
}

interface ConsultationProps {
  className?: string;
  onNavigate?: (route: string, consultantId?: string) => void;
}

type AvailabilityFilter = 'all' | 'today' | 'tomorrow' | 'this-week';
type SortOption = 'recommended' | 'rating' | 'price-low' | 'price-high' | 'experience' | 'next-available';
type ViewMode = 'stack' | 'grid';

// ── font helper ─────────────────────────────────────────────────
const f = (size = 'sm', weight: 400 | 500 = 400, color?: string): React.CSSProperties => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  ...(color ? { color } : {}),
});

export function Consultation({ className, onNavigate }: ConsultationProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // ── Metadata from KV ──────────────────────────────────────────
  const {
    consultantTypes: kvConsultantTypes,
    expertiseCategories: kvExpertiseCategories,
    languages: kvLanguages,
  } = useMetadata();

  // ── Data state ────────────────────────────────────────────────
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendedExpertises, setRecommendedExpertises] = useState<string[]>([]);

  // ── Filter state ──────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedExpertises, setSelectedExpertises] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [viewMode, setViewMode] = useState<ViewMode>('stack');
  const [showFilters, setShowFilters] = useState(false);

  // ── Booking modal ─────────────────────────────────────────────
  const [bookingConsultant, setBookingConsultant] = useState<Consultant | null>(null);

  // ── Load consultants ──────────────────────────────────────────
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProfessionals();
        if (!m) return;
        const list = Array.isArray(response) ? response : response?.professionals || [];
        const mapped = list.map((p: any) => ({ ...p, id: p.id || p.professional_id }));
        setConsultants(mapped);
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
        console.error('Failed to load consultants:', error);
      } finally {
        if (m) setLoading(false);
      }
    })();
    return () => { m = false; };
  }, []);

  // ── Load recommendation context from latest assessment ────────
  useEffect(() => {
    if (!user) return;
    let m = true;
    (async () => {
      try {
        const res = await apiClient.getUserAssessmentResponses();
        if (!m) return;
        const history = res?.history || [];
        if (history.length === 0) return;
        // Find latest completed assessment
        const sorted = [...history]
          .filter((r: any) => r.completed_at)
          .sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
        if (sorted.length === 0) return;
        const latest = sorted[0];
        /**
         * Gate on the clinical severity, not on a percentage.
         *
         * The band a score fell in is already the instrument's own judgement
         * about that score, so reading it needs no denominator and no floor —
         * which is what this screen could never get right, since it loads no
         * scoring profile. `severityOfResult` reads the band straight off the
         * record.
         *
         * The percentage remains only as a fallback for records written before
         * banding, and it is floor-blind: `|| 100` used to invent a maximum
         * outright (the same defect as the `?? 21` that once divided Burnout's
         * 115 by GAD-7's ceiling), and that is gone, but a 1-5 instrument still
         * reads about ten points high here. It gates a suggestion about who to
         * talk to, so a result that cannot be placed at all is skipped rather
         * than guessed at.
         */
        const severity = severityOfResult(latest);
        let atLeastModerate: boolean;
        if (severity) {
          atLeastModerate = compareSeverity(severity, 'moderate') >= 0;
        } else {
          const overall = latest.section_scores?.overall ?? latest.sectionScores?.overall ?? null;
          const value = typeof overall?.value === 'number' ? overall.value : latest.score;
          const maxScore = (typeof overall?.max === 'number' && overall.max > 0)
            ? overall.max
            : (latest.max_score || latest.maxScore || 0);
          if (typeof value !== 'number' || maxScore <= 0) return;
          atLeastModerate = percentOfRange(value, maxScore) / 100 > 0.33;
        }
        if (atLeastModerate) {
          const interpretation = latest.interpretation;
          const areas: string[] = [];
          if (interpretation?.primary_area) areas.push(interpretation.primary_area);
          if (interpretation?.recommended_expertise) areas.push(...interpretation.recommended_expertise);
          // Fallback: use assessment name as an expertise area hint
          const aName = latest.assessment_name || latest.assessment_id || '';
          if (aName && areas.length === 0) {
            const cleaned = aName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
            areas.push(cleaned);
          }
          setRecommendedExpertises(areas.map(a => a.toLowerCase()));
        }
      } catch { /* silent */ }
    })();
    return () => { m = false; };
  }, [user]);

  // ── Derive dynamic categories from consultantTypes metadata + consultant data ──
  const categoryOptions = useMemo(() => {
    const fromKV = kvConsultantTypes.map(ct => ({ value: ct.value, label: ct.label }));
    const fromData = Array.from(new Set(consultants.map(c => c.category).filter(Boolean)))
      .map(cat => ({
        value: cat,
        label: cat.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      }));
    // Merge, dedup by value
    const merged = new Map<string, string>();
    for (const item of [...fromKV, ...fromData]) {
      if (item.value && !merged.has(item.value)) merged.set(item.value, item.label);
    }
    return Array.from(merged.entries()).map(([value, label]) => ({ value, label }));
  }, [kvConsultantTypes, consultants]);

  // ── Derive available languages ────────────────────────────────
  const availableLanguages = useMemo(() => {
    const fromKV = kvLanguages.map(l => l.label);
    const fromData = consultants.flatMap(c => c.languages || []);
    return Array.from(new Set([...fromKV, ...fromData])).sort();
  }, [kvLanguages, consultants]);

  // ── Derive expertise categories ───────────────────────────────
  const expertiseCategories = useMemo(() => {
    const fromKV = kvExpertiseCategories.map(e => e.label);
    const fromData = consultants.flatMap(c => c.expertises || []);
    return Array.from(new Set([...fromKV, ...fromData])).sort();
  }, [kvExpertiseCategories, consultants]);

  // ── Dynamic price range from data ─────────────────────────────
  const dynamicPriceRange = useMemo<[number, number]>(() => {
    if (consultants.length === 0) return [0, 10000];
    const prices = consultants
      .map(c => {
        if (!c.pricing) return null;
        return Math.min(
          c.pricing.video || Infinity,
          c.pricing.call || Infinity,
          c.pricing.chat || Infinity,
          c.pricing.offline || Infinity,
        );
      })
      .filter((p): p is number => p !== null && p !== Infinity);
    if (prices.length === 0) return [0, 10000];
    return [Math.min(...prices), Math.max(...prices)];
  }, [consultants]);

  // Reset price range when data loads
  useEffect(() => {
    if (consultants.length > 0) {
      setPriceRange(dynamicPriceRange);
    }
  }, [dynamicPriceRange, consultants.length]);

  // ── Check if a consultant is recommended ──────────────────────
  const isRecommended = useCallback((c: Consultant): boolean => {
    if (recommendedExpertises.length === 0) return false;
    const cExpertises = [...(c.expertises || []), ...(c.topExpertises || [])].map(e => e.toLowerCase());
    return recommendedExpertises.some(re => cExpertises.some(ce => ce.includes(re) || re.includes(ce)));
  }, [recommendedExpertises]);

  // ── Apply filters ─────────────────────────────────────────────
  const filteredConsultants = useMemo(() => {
    let filtered = [...consultants];

    // Category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        (c.expertises || []).some(e => e.toLowerCase().includes(q)) ||
        c.credentials?.toLowerCase().includes(q) ||
        c.bio?.toLowerCase().includes(q)
      );
    }

    // Languages
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter(c =>
        selectedLanguages.some(lang => (c.languages || []).includes(lang))
      );
    }

    // Expertise
    if (selectedExpertises.length > 0) {
      filtered = filtered.filter(c =>
        selectedExpertises.some(exp => (c.expertises || []).includes(exp))
      );
    }

    // Availability
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(c => c.available);
    }

    // Price
    filtered = filtered.filter(c => {
      if (!c.pricing) return true;
      const minPrice = Math.min(
        c.pricing.video || Infinity,
        c.pricing.call || Infinity,
        c.pricing.chat || Infinity,
      );
      if (minPrice === Infinity) return true;
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price-low':
        filtered.sort((a, b) => {
          const aMin = a.pricing ? Math.min(a.pricing.video || Infinity, a.pricing.call || Infinity, a.pricing.chat || Infinity) : Infinity;
          const bMin = b.pricing ? Math.min(b.pricing.video || Infinity, b.pricing.call || Infinity, b.pricing.chat || Infinity) : Infinity;
          return aMin - bMin;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const aMax = a.pricing ? Math.max(a.pricing.video || 0, a.pricing.call || 0, a.pricing.chat || 0) : 0;
          const bMax = b.pricing ? Math.max(b.pricing.video || 0, b.pricing.call || 0, b.pricing.chat || 0) : 0;
          return bMax - aMax;
        });
        break;
      case 'experience':
        filtered.sort((a, b) => (b.yearsExperience || 0) - (a.yearsExperience || 0));
        break;
      case 'next-available':
        filtered.sort((a, b) => {
          if (a.available && !b.available) return -1;
          if (!a.available && b.available) return 1;
          return 0;
        });
        break;
      default: {
        // Recommended: boost recommended consultants to top, then by weighted score
        filtered.sort((a, b) => {
          const aRec = isRecommended(a) ? 1000 : 0;
          const bRec = isRecommended(b) ? 1000 : 0;
          return (bRec + (b.rating || 0) * (b.reviewCount || 0)) - (aRec + (a.rating || 0) * (a.reviewCount || 0));
        });
      }
    }

    return filtered;
  }, [consultants, selectedCategory, searchQuery, selectedLanguages, selectedExpertises, availabilityFilter, priceRange, sortBy, isRecommended]);

  // ── Active filter count ───────────────────────────────────────
  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedLanguages.length +
    selectedExpertises.length +
    (availabilityFilter !== 'all' ? 1 : 0) +
    (priceRange[0] !== dynamicPriceRange[0] || priceRange[1] !== dynamicPriceRange[1] ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedLanguages([]);
    setSelectedExpertises([]);
    setAvailabilityFilter('all');
    setPriceRange(dynamicPriceRange);
  };

  const handleConsultantClick = (consultantId: string) => {
    onNavigate?.(`/consultation/${consultantId}`, consultantId);
  };

  // ════════════════════════════════════════════════════════════════
  // FILTER PANEL (shared between mobile sheet & desktop sidebar)
  // ════════════════════════════════════════════════════════════════
  const FilterPanel = ({ inSheet }: { inSheet?: boolean }) => (
    <div className="flex flex-col" style={{ gap: 20 }}>
      {/* Clear Filters — top right */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          style={{
            ...f('xs', 500, 'var(--color-status-danger)'),
            background: 'none', border: 'none', cursor: 'pointer',
            alignSelf: 'flex-end', padding: '4px 0',
          }}
        >
          Clear all ({activeFilterCount})
        </button>
      )}

      {/* Availability pills */}
      <div className="flex flex-col" style={{ gap: 8 }}>
        <span style={f('xs', 500, 'var(--color-text-muted)')}>AVAILABILITY</span>
        <div className="flex flex-wrap" style={{ gap: 6 }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'today', label: 'Today' },
            { value: 'tomorrow', label: 'Tomorrow' },
            { value: 'this-week', label: 'This Week' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setAvailabilityFilter(opt.value as AvailabilityFilter)}
              style={{
                ...f('xs', 500),
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid',
                borderColor: availabilityFilter === opt.value ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                backgroundColor: availabilityFilter === opt.value ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                color: availabilityFilter === opt.value ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language pills with checkboxes */}
      {availableLanguages.length > 0 && (
        <div className="flex flex-col" style={{ gap: 8 }}>
          <span style={f('xs', 500, 'var(--color-text-muted)')}>LANGUAGE</span>
          <div className="flex flex-col" style={{ gap: 6 }}>
            {availableLanguages.map(lang => (
              <label key={lang} className="flex items-center cursor-pointer" style={{ gap: 8 }}>
                <Checkbox
                  checked={selectedLanguages.includes(lang)}
                  onCheckedChange={(checked) => {
                    setSelectedLanguages(prev =>
                      checked ? [...prev, lang] : prev.filter(l => l !== lang)
                    );
                  }}
                />
                <span style={f('sm', 400)}>{lang}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Expertise as pills (not radio list) */}
      {expertiseCategories.length > 0 && (
        <div className="flex flex-col" style={{ gap: 8 }}>
          <span style={f('xs', 500, 'var(--color-text-muted)')}>EXPERTISE</span>
          <div className="flex flex-wrap" style={{ gap: 6, maxHeight: inSheet ? 200 : 240, overflowY: 'auto' }}>
            {expertiseCategories.map(exp => {
              const active = selectedExpertises.includes(exp);
              return (
                <button
                  key={exp}
                  onClick={() => {
                    setSelectedExpertises(prev =>
                      active ? prev.filter(e => e !== exp) : [...prev, exp]
                    );
                  }}
                  style={{
                    ...f('xs', active ? 500 : 400),
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid',
                    borderColor: active ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                    backgroundColor: active ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                    color: active ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {exp}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range — dual slider */}
      <div className="flex flex-col" style={{ gap: 8 }}>
        <span style={f('xs', 500, 'var(--color-text-muted)')}>PRICE RANGE</span>
        <div className="flex items-center" style={{ gap: 10 }}>
          <span style={f('xs', 500)}>₹{priceRange[0]}</span>
          <input
            type="range"
            min={dynamicPriceRange[0]}
            max={dynamicPriceRange[1]}
            step={50}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="flex-1"
            style={{ accentColor: 'var(--color-primary-default)' }}
          />
          <span style={f('xs', 500)}>₹{priceRange[1]}</span>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // SKELETON CARDS
  // ════════════════════════════════════════════════════════════════
  const SkeletonCards = () => (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-col gap-4'}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', padding: 20 }}>
          <div className="flex" style={{ gap: 16 }}>
            <Skeleton variant="circular" width="72px" height="72px" />
            <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton variant="text" height="20px" width="60%" />
              <Skeleton variant="text" height="14px" width="40%" />
              <div className="flex" style={{ gap: 6 }}>
                <Skeleton variant="rectangular" width="60px" height="22px" className="rounded-full" />
                <Skeleton variant="rectangular" width="80px" height="22px" className="rounded-full" />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 6 }}>
            <Skeleton variant="rectangular" width="80px" height="24px" className="rounded-full" />
            <Skeleton variant="rectangular" width="100px" height="24px" className="rounded-full" />
            <Skeleton variant="rectangular" width="70px" height="24px" className="rounded-full" />
          </div>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" height="16px" width="100px" />
            <Skeleton variant="button" height="36px" width="80px" />
          </div>
        </div>
      ))}
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    <div className={cn('flex flex-col', className)} style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-page)' }}>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <PageHero
        title="Find Your Consultant"
        subtitle="Connect with experienced mental health professionals who understand your needs."
      />

      {/* ── Mobile: Search + Filter bar ─────────────────────────── */}
      {isMobile && (
        <div style={{ backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-default)' }}>
          <div className="app-container" style={{ padding: '12px 16px', display: 'flex', gap: 10 }}>
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 18, height: 18, color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search name, expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', height: 44,
                  paddingLeft: 40, paddingRight: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-default)',
                  ...f('sm'), backgroundColor: 'var(--color-bg-input)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Filter button */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <button style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-default)',
                  backgroundColor: 'var(--color-bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative', flexShrink: 0,
                }}>
                  <SlidersHorizontal size={18} style={{ color: 'var(--color-text-muted)' }} />
                  {activeFilterCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 18, height: 18, borderRadius: '50%',
                      backgroundColor: 'var(--color-status-danger)',
                      color: 'white', fontSize: 10, fontWeight: 500,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>Filters</SheetTitle>
                </SheetHeader>
                <div style={{ padding: 16 }}>
                  <FilterPanel inSheet />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile: category scroll pills */}
          {categoryOptions.length > 0 && (
            <div style={{ padding: '0 16px 12px', overflowX: 'auto', display: 'flex', gap: 6, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              <button
                onClick={() => setSelectedCategory('all')}
                style={{
                  ...f('xs', 500),
                  padding: '6px 16px', borderRadius: 'var(--radius-pill)',
                  border: '1px solid',
                  borderColor: selectedCategory === 'all' ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                  backgroundColor: selectedCategory === 'all' ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                  color: selectedCategory === 'all' ? 'white' : 'var(--color-text-primary)',
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                All
              </button>
              {categoryOptions.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  style={{
                    ...f('xs', 500),
                    padding: '6px 16px', borderRadius: 'var(--radius-pill)',
                    border: '1px solid',
                    borderColor: selectedCategory === cat.value ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                    backgroundColor: selectedCategory === cat.value ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                    color: selectedCategory === cat.value ? 'white' : 'var(--color-text-primary)',
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Main Content Area ────────────────────────────────────── */}
      <div className="flex-1 app-container" style={{ padding: isMobile ? '16px 16px 80px' : '32px 0 48px' }}>
        <div className="flex" style={{ gap: 28 }}>
          {/* ── Desktop Sidebar ──────────────────────────────────── */}
          {!isMobile && (
            <div style={{ width: 280, flexShrink: 0 }}>
              <div style={{
                position: 'sticky',
                top: 80,
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-default)',
                padding: 20,
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto',
              }}>
                {/* Role/Type pills */}
                <div className="flex flex-col" style={{ gap: 8, marginBottom: 16 }}>
                  <span style={f('xs', 500, 'var(--color-text-muted)')}>ROLE / TYPE</span>
                  <div className="flex flex-wrap" style={{ gap: 6 }}>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      style={{
                        ...f('xs', 500),
                        padding: '5px 14px', borderRadius: 'var(--radius-pill)',
                        border: '1px solid',
                        borderColor: selectedCategory === 'all' ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                        backgroundColor: selectedCategory === 'all' ? 'var(--color-primary-default)' : 'transparent',
                        color: selectedCategory === 'all' ? 'white' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      All
                    </button>
                    {categoryOptions.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        style={{
                          ...f('xs', 500),
                          padding: '5px 14px', borderRadius: 'var(--radius-pill)',
                          border: '1px solid',
                          borderColor: selectedCategory === cat.value ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                          backgroundColor: selectedCategory === cat.value ? 'var(--color-primary-default)' : 'transparent',
                          color: selectedCategory === cat.value ? 'white' : 'var(--color-text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, backgroundColor: 'var(--color-border-default)', margin: '4px 0 16px' }} />

                {/* Search */}
                <div className="relative" style={{ marginBottom: 12 }}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 16, height: 16, color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search name, expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%', height: 40,
                      paddingLeft: 36, paddingRight: 12,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-default)',
                      ...f('sm'), backgroundColor: 'var(--color-bg-input)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>

                {/* Sort */}
                <div style={{ marginBottom: 16 }}>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger style={{ width: '100%', height: 40, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-input)' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Lowest Price</SelectItem>
                      <SelectItem value="price-high">Highest Price</SelectItem>
                      <SelectItem value="experience">Most Experience</SelectItem>
                      <SelectItem value="next-available">Next Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div style={{ height: 1, backgroundColor: 'var(--color-border-default)', margin: '0 0 16px' }} />

                <FilterPanel />
              </div>
            </div>
          )}

          {/* ── Results Column ───────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Results header: count + view toggle + sort (mobile) */}
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <div>
                {!loading && (
                  <p style={{ ...f('sm', 500), margin: 0 }}>
                    <span style={{ color: 'var(--color-primary-default)' }}>{filteredConsultants.length}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
                      {' '}consultant{filteredConsultants.length !== 1 ? 's' : ''} found
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-center" style={{ gap: 6 }}>
                {/* Sort select (mobile only) */}
                {isMobile && (
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger style={{ height: 36, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', width: 'auto', minWidth: 100 }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Lowest Price</SelectItem>
                      <SelectItem value="experience">Most Experience</SelectItem>
                      <SelectItem value="next-available">Next Available</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* View mode toggle */}
                <div className="flex" style={{
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-default)',
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setViewMode('stack')}
                    aria-label="List view"
                    style={{
                      width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: viewMode === 'stack' ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                      color: viewMode === 'stack' ? 'white' : 'var(--color-text-muted)',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    style={{
                      width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: viewMode === 'grid' ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                      color: viewMode === 'grid' ? 'white' : 'var(--color-text-muted)',
                      border: 'none', cursor: 'pointer',
                      borderLeft: '1px solid var(--color-border-default)',
                    }}
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips (shown inline) */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center" style={{ gap: 6, marginBottom: 14 }}>
                {selectedCategory !== 'all' && (
                  <span onClick={() => setSelectedCategory('all')} style={{
                    ...f('xs', 500), cursor: 'pointer',
                    padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--color-accent-default)',
                    color: 'var(--color-text-primary)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {selectedCategory.replace(/[-_]/g, ' ')} <X size={12} />
                  </span>
                )}
                {selectedExpertises.map(e => (
                  <span key={e} onClick={() => setSelectedExpertises(prev => prev.filter(x => x !== e))} style={{
                    ...f('xs', 500), cursor: 'pointer',
                    padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--color-accent-default)',
                    color: 'var(--color-text-primary)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {e} <X size={12} />
                  </span>
                ))}
                {selectedLanguages.map(l => (
                  <span key={l} onClick={() => setSelectedLanguages(prev => prev.filter(x => x !== l))} style={{
                    ...f('xs', 500), cursor: 'pointer',
                    padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--color-accent-default)',
                    color: 'var(--color-text-primary)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {l} <X size={12} />
                  </span>
                ))}
                <button onClick={clearFilters} style={{
                  ...f('xs', 500, 'var(--color-status-danger)'),
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
                }}>
                  Clear all
                </button>
              </div>
            )}

            {/* Recommended banner */}
            {recommendedExpertises.length > 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                  border: '1px solid var(--color-status-success-light)',
                  marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <Sparkles size={18} style={{ color: 'var(--color-status-success)', flexShrink: 0 }} />
                <p style={{ ...f('xs', 400, 'var(--color-text-primary)'), margin: 0 }}>
                  Based on your latest assessment, we've highlighted consultants who specialize in areas that may help you.
                </p>
              </motion.div>
            )}

            {/* Loading */}
            {loading && <SkeletonCards />}

            {/* Results */}
            {!loading && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-col gap-3'}>
                <AnimatePresence mode="popLayout">
                  {filteredConsultants.map((consultant, idx) => (
                    <motion.div
                      key={consultant.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: idx < 10 ? idx * 0.03 : 0 }}
                      style={{ position: 'relative' }}
                    >
                      {/* Recommended badge */}
                      {isRecommended(consultant) && (
                        <div style={{
                          position: 'absolute', top: 10, right: 10, zIndex: 2,
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                          background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                          color: 'white',
                          ...f('xs', 500),
                          fontSize: 10,
                          boxShadow: '0 1px 4px rgba(34,197,94,0.3)',
                        }}>
                          <Sparkles size={10} />
                          Recommended for you
                        </div>
                      )}
                      <ConsultantCard
                        consultant={consultant}
                        onClick={() => handleConsultantClick(consultant.id)}
                        onBook={() => setBookingConsultant(consultant)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty state */}
                {filteredConsultants.length === 0 && (
                  <div style={{
                    padding: 40, textAlign: 'center',
                    backgroundColor: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-default)',
                    gridColumn: '1 / -1',
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                    <p style={{ ...f('base', 500), margin: '0 0 6px' }}>
                      No consultants match your filters
                    </p>
                    <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: '0 0 16px' }}>
                      Try adjusting your criteria or clearing filters.
                    </p>
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      style={{
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Booking Modal ────────────────────────────────────────── */}
      <BookingModal
        isOpen={!!bookingConsultant}
        onClose={() => setBookingConsultant(null)}
        consultantId={bookingConsultant?.id}
        consultantName={bookingConsultant?.name || ''}
        sessionModes={bookingConsultant?.sessionModes || ['video', 'call']}
        pricing={bookingConsultant?.pricing}
        onBook={(bookingData) => {
          console.log('Booking confirmed:', bookingData, 'for', bookingConsultant?.name);
          setBookingConsultant(null);
        }}
      />
    </div>
  );
}