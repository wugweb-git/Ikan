import { useState, useEffect } from 'react';
import { cn } from '../ui/utils';
import { Filter, Search, X } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { ConsultantCard } from '../blocks/ConsultantCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Skeleton } from '../ui/skeleton-loader';
import { PageHero } from '../ui/PageHero';
import { BookingModal } from '../blocks/BookingModal';

// Define Consultant type locally
export interface Consultant {
  id: string;
  name: string;
  credentials: string;
  category: 'therapist' | 'psychiatrist' | 'counselor' | 'family-therapist';
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

// Expertise categories
export const expertiseCategories = [
  "Anxiety Disorders",
  "Depressive Disorders",
  "Relationship Skills",
  "Stress Management",
  "Anger Management",
  "Grief and Loss",
  "Loneliness",
  "Lack of Motivation",
  "Negative Thinking",
  "Overthinking",
  "Self-Improvement",
  "Sleep Disorder",
  "Bipolar Disorder",
  "Obsessive-Compulsive Disorder (OCD)",
  "Schizophrenia",
  "Sexual Dysfunction",
  "General Well-Being",
  "LGBTQIA+ Concerns",
  "Adult ADHD",
  "Personality Disorder",
  "Trauma",
  "Child Specialist / Child Therapy",
  "Eating Disorders",
  "Trauma-Related Disorders",
  "Adult Autism / Neurodiversity",
  "Geriatric Mental Health",
  "Fertility and Pregnancy Concerns",
  "Work-Related Concerns",
  "Parenting Concerns",
  "Life Transitions",
  "Academic Concerns",
  "Communication Skills",
  "PTSD",
  "Addiction Recovery",
  "Body Image",
  "Self-Esteem"
];

interface ConsultationProps {
  className?: string;
  onNavigate?: (route: string, consultantId?: string) => void;
}

interface HeroBanner {
  title: string;
  subtitle: string;
  image_url: string;
  cta_text?: string;
  cta_link?: string;
}

type CategoryType = 'all' | 'therapist' | 'psychiatrist' | 'counselor' | 'family-therapist';
type AvailabilityFilter = 'all' | 'today' | 'tomorrow' | 'this-week';
type SortOption = 'recommended' | 'rating' | 'price-low' | 'price-high' | 'experience';

export function Consultation({ className, onNavigate }: ConsultationProps) {
  const isMobile = useIsMobile();
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [filteredConsultants, setFilteredConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroBanner, setHeroBanner] = useState<HeroBanner | null>(null);
  
  // Load hero banner from admin config
  useEffect(() => {
    let isMounted = true;
    apiClient.getHeroBanner('consultation').then(res => {
      if (isMounted && res?.banner) setHeroBanner(res.banner);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Load consultants from API
  useEffect(() => {
    let isMounted = true;
    const loadConsultants = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProfessionals();
        if (!isMounted) return;
        if (response && Array.isArray(response)) {
          const mapped = response.map((p: any) => ({ ...p, id: p.id || p.professional_id }));
          setConsultants(mapped);
          setFilteredConsultants(mapped);
        } else if (response && response.professionals) {
           const mapped = response.professionals.map((p: any) => ({ ...p, id: p.id || p.professional_id }));
           setConsultants(mapped);
           setFilteredConsultants(mapped);
        }
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
        console.error('Failed to load consultants:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    loadConsultants();

    return () => { isMounted = false; };
  }, []);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedExpertises, setSelectedExpertises] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [showFilters, setShowFilters] = useState(false);
  
  // Booking Modal State
  const [bookingConsultant, setBookingConsultant] = useState<Consultant | null>(null);

  // Get unique languages from all consultants
  const availableLanguages = Array.from(
    new Set(consultants.flatMap(c => c.languages))
  ).sort();

  // Apply filters
  useEffect(() => {
    let filtered = [...consultants];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.expertises.some(e => e.toLowerCase().includes(query)) ||
        c.bio.toLowerCase().includes(query)
      );
    }

    // Language filter
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter(c =>
        selectedLanguages.some(lang => c.languages.includes(lang))
      );
    }

    // Expertise filter
    if (selectedExpertises.length > 0) {
      filtered = filtered.filter(c =>
        selectedExpertises.some(exp => c.expertises.includes(exp))
      );
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      // Mock filter - in production, check actual availability dates
      filtered = filtered.filter(c => c.available);
    }

    // Price filter
    filtered = filtered.filter(c => {
      // Check if pricing exists and has valid values
      if (!c.pricing) return false;
      const minPrice = Math.min(
        c.pricing.video || Infinity, 
        c.pricing.call || Infinity, 
        c.pricing.chat || Infinity
      );
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        filtered.sort((a, b) => {
          const aMin = a.pricing ? Math.min(
            a.pricing.video || Infinity, 
            a.pricing.call || Infinity, 
            a.pricing.chat || Infinity
          ) : Infinity;
          const bMin = b.pricing ? Math.min(
            b.pricing.video || Infinity, 
            b.pricing.call || Infinity, 
            b.pricing.chat || Infinity
          ) : Infinity;
          return aMin - bMin;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const aMax = a.pricing ? Math.max(
            a.pricing.video || 0, 
            a.pricing.call || 0, 
            a.pricing.chat || 0
          ) : 0;
          const bMax = b.pricing ? Math.max(
            b.pricing.video || 0, 
            b.pricing.call || 0, 
            b.pricing.chat || 0
          ) : 0;
          return bMax - aMax;
        });
        break;
      case 'experience':
        filtered.sort((a, b) => b.yearsExperience - a.yearsExperience);
        break;
      default: // recommended
        filtered.sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount));
    }

    setFilteredConsultants(filtered);
  }, [selectedCategory, searchQuery, selectedLanguages, selectedExpertises, availabilityFilter, priceRange, selectedGender, sortBy, consultants]);

  const handleConsultantClick = (consultantId: string) => {
    if (onNavigate) {
      onNavigate(`/consultation/${consultantId}`, consultantId);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLanguages([]);
    setSelectedExpertises([]);
    setAvailabilityFilter('all');
    setPriceRange([0, 5000]);
    setSelectedGender('all');
  };

  const activeFilterCount = 
    selectedLanguages.length + 
    selectedExpertises.length + 
    (availabilityFilter !== 'all' ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 5000 ? 1 : 0) +
    (selectedGender !== 'all' ? 1 : 0);

  const FilterPanel = ({ className }: { className?: string }) => (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Availability Quick Filters */}
      <div className="flex flex-col gap-3">
        <Label style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
          Availability
        </Label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'today', label: 'Today' },
            { value: 'tomorrow', label: 'Tomorrow' },
            { value: 'this-week', label: 'This Week' }
          ].map(option => (
            <div
              key={option.value}
              className={cn(
                "filter-pill",
                availabilityFilter === option.value && "active"
              )}
              onClick={() => setAvailabilityFilter(option.value as AvailabilityFilter)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>

      {/* Language Filter */}
      <div className="flex flex-col gap-3">
        <Label style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
          Language
        </Label>
        <div className="flex flex-col gap-2">
          {availableLanguages.slice(0, 5).map(lang => (
            <div key={lang} className="flex items-center gap-2">
              <Checkbox
                id={`lang-${lang}`}
                checked={selectedLanguages.includes(lang)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedLanguages([...selectedLanguages, lang]);
                  } else {
                    setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                  }
                }}
              />
              <Label
                htmlFor={`lang-${lang}`}
                className="cursor-pointer"
                style={{ fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-sm)' }}
              >
                {lang}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Expertise Filter */}
      <div className="flex flex-col gap-3">
        <Label style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
          Expertise
        </Label>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {expertiseCategories.slice(0, 10).map(exp => (
            <div key={exp} className="flex items-center gap-2">
              <Checkbox
                id={`exp-${exp}`}
                checked={selectedExpertises.includes(exp)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedExpertises([...selectedExpertises, exp]);
                  } else {
                    setSelectedExpertises(selectedExpertises.filter(e => e !== exp));
                  }
                }}
              />
              <Label
                htmlFor={`exp-${exp}`}
                className="cursor-pointer"
                style={{ fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-sm)' }}
              >
                {exp}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-3">
        <Label style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
          Price Range
        </Label>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)' }}>
            ₹{priceRange[0]}
          </span>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="flex-1"
          />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)' }}>
            ₹{priceRange[1]}
          </span>
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={clearFilters}
          style={{
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Clear Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className={cn("flex flex-col", className)} style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-page)' }}>
      {/* Hero Section */}
      <PageHero 
        title={heroBanner?.title || 'Find Your Consultant'}
        subtitle={heroBanner?.subtitle || 'Connect with experienced mental health professionals'}
        backgroundImage={heroBanner?.image_url}
        ctaText={heroBanner?.cta_text}
        ctaLink={heroBanner?.cta_link}
      />

      {/* Mobile-only: Category Tabs */}
      {isMobile && (
        <div style={{ backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-default)' }}>
          <div className="app-container">
            <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as CategoryType)}>
              <TabsList className={cn("w-full justify-start overflow-x-auto h-14 bg-transparent p-0 rounded-none")}>
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-[var(--color-bg-page)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-none px-4 py-2 mr-2"
                  style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' }}
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="therapist" 
                  className="data-[state=active]:bg-[var(--color-bg-page)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-none px-4 py-2 mr-2"
                  style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' }}
                >
                  Therapist
                </TabsTrigger>
                <TabsTrigger 
                  value="psychiatrist" 
                  className="data-[state=active]:bg-[var(--color-bg-page)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-none px-4 py-2 mr-2"
                  style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' }}
                >
                  Psychiatrist
                </TabsTrigger>
                <TabsTrigger 
                  value="counselor" 
                  className="data-[state=active]:bg-[var(--color-bg-page)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-none px-4 py-2 mr-2"
                  style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' }}
                >
                  Counselor
                </TabsTrigger>
                <TabsTrigger 
                  value="family-therapist" 
                  className="data-[state=active]:bg-[var(--color-bg-page)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-none px-4 py-2 mr-2"
                  style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' }}
                >
                  Family Therapist
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      {/* Mobile-only: Search & Filter Bar */}
      {isMobile && (
        <div style={{ 
          backgroundColor: 'var(--color-bg-card)', 
          borderBottom: '1px solid var(--color-border-default)'
        }}>
          <div className="app-container py-4 flex gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search by name, expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '52px',
                  paddingLeft: '48px',
                  paddingRight: 'var(--spacing-3)',
                  borderRadius: '16px',
                  border: '1px solid var(--color-border-default)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-regular)',
                  backgroundColor: 'var(--color-bg-input)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            {/* Filter Button (Mobile) */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  style={{
                    height: '52px',
                    borderRadius: '16px',
                    position: 'relative'
                  }}
                >
                  <Filter className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="destructive"
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        height: '20px',
                        minWidth: '20px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 'var(--font-weight-medium)'
                      }}
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>Filters</SheetTitle>
                </SheetHeader>
                <FilterPanel className="p-4" />
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger style={{ width: '120px', height: '52px', borderRadius: '16px' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="experience">Most Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 app-container px-[0px] py-[48px]">
        <div className="flex gap-8">
          {/* Sidebar Filters (Desktop) */}
          {!isMobile && (
            <div style={{ 
              width: '280px', 
              flexShrink: 0,
            }}>
              <div style={{
                backgroundColor: 'var(--color-bg-page)',
                borderRadius: '24px',
                padding: '24px',
                position: 'sticky',
                top: '140px',
              }}>
                {/* Category Tabs in Sidebar */}
                <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as CategoryType)}>
                  <TabsList className="w-full justify-start overflow-x-auto h-auto bg-transparent p-0 flex-wrap gap-1">
                    <TabsTrigger 
                      value="all" 
                      className="data-[state=active]:bg-[var(--color-bg-card)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm px-4 py-2"
                      style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' }}
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger 
                      value="therapist" 
                      className="data-[state=active]:bg-[var(--color-bg-card)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm px-4 py-2"
                      style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' }}
                    >
                      Therapist
                    </TabsTrigger>
                    <TabsTrigger 
                      value="psychiatrist" 
                      className="data-[state=active]:bg-[var(--color-bg-card)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm px-4 py-2"
                      style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' }}
                    >
                      Psychiatrist
                    </TabsTrigger>
                    <TabsTrigger 
                      value="counselor" 
                      className="data-[state=active]:bg-[var(--color-bg-card)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm px-4 py-2"
                      style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' }}
                    >
                      Counselor
                    </TabsTrigger>
                    <TabsTrigger 
                      value="family-therapist" 
                      className="data-[state=active]:bg-[var(--color-bg-card)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm px-4 py-2"
                      style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' }}
                    >
                      Family Therapist
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: 'var(--color-border-default)', margin: '16px 0' }} />

                {/* Search in Sidebar */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search by name, expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: 'var(--ikan-component-input-height)',
                      paddingLeft: '36px',
                      paddingRight: 'var(--spacing-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-default)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-regular)',
                      backgroundColor: 'var(--color-bg-card)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>

                {/* Sort in Sidebar */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger style={{ width: '100%', height: 'var(--ikan-component-input-height)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-card)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="experience">Most Experience</SelectItem>
                  </SelectContent>
                </Select>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: 'var(--color-border-default)', margin: '16px 0' }} />

                {/* Existing Filter Panel */}
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Consultant List */}
          <div className="flex-1 mobile-content-clearance">
            {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
                  {/* Profile Header */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <Skeleton variant="circular" width="80px" height="80px" />
                      <div className="flex-1 space-y-2">
                        <Skeleton variant="text" height="24px" width="70%" />
                        <Skeleton variant="text" height="16px" width="50%" />
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Skeleton key={star} variant="circular" width="16px" height="16px" />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Bio */}
                    <Skeleton variant="text" height="16px" width="100%" />
                    <Skeleton variant="text" height="16px" width="90%" />
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Skeleton variant="rectangular" width="80px" height="24px" className="rounded-full" />
                      <Skeleton variant="rectangular" width="100px" height="24px" className="rounded-full" />
                      <Skeleton variant="rectangular" width="70px" height="24px" className="rounded-full" />
                    </div>
                    
                    {/* Pricing */}
                    <div className="pt-4 space-y-2">
                      <Skeleton variant="text" height="20px" width="150px" />
                      <Skeleton variant="button" height="40px" width="100%" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Count */}
          {!loading && (
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
                {filteredConsultants.length} consultant{filteredConsultants.length !== 1 ? 's' : ''} found
              </p>
            </div>
          )}

          {/* Consultant Cards */}
          {!loading && (
            <div className="flex flex-col gap-4">
              {filteredConsultants.map(consultant => (
                <ConsultantCard
                  key={consultant.id}
                  consultant={consultant}
                  onClick={() => handleConsultantClick(consultant.id)}
                  onBook={() => setBookingConsultant(consultant)}
                />
              ))}

            {filteredConsultants.length === 0 && (
              <div style={{ 
                padding: 'var(--spacing-8)', 
                textAlign: 'center',
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
                  No consultants found
                </p>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
            </div>
          )}
          </div>
        </div>
      </div>

      <BookingModal 
        isOpen={!!bookingConsultant}
        onClose={() => setBookingConsultant(null)}
        consultantName={bookingConsultant?.name || ''}
        onBook={(slotId) => {
          console.log('Booked slot', slotId, 'for', bookingConsultant?.name);
          setBookingConsultant(null);
          // Here you would typically navigate to a confirmation page or show a success toast
        }}
      />
    </div>
  );
}