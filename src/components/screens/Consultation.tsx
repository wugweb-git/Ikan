import React, { useState, useEffect } from 'react';
import { cn } from '../ui/utils';
import { Filter, Search, ChevronDown, X } from 'lucide-react';
import ConsultantCard from '../../imports/ConsultantCard';
import { consultantsData, expertiseCategories, type Consultant } from '../../lib/sample-data/consultants';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ConsultationProps {
  className?: string;
  onNavigate?: (route: string, consultantId?: string) => void;
}

type CategoryType = 'all' | 'therapist' | 'psychiatrist' | 'counselor' | 'family-therapist';
type AvailabilityFilter = 'all' | 'today' | 'tomorrow' | 'this-week';
type SortOption = 'recommended' | 'rating' | 'price-low' | 'price-high' | 'experience';

export function Consultation({ className, onNavigate }: ConsultationProps) {
  const isMobile = useIsMobile();
  const [consultants, setConsultants] = useState<Consultant[]>(consultantsData);
  const [filteredConsultants, setFilteredConsultants] = useState<Consultant[]>(consultantsData);
  
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
      const minPrice = Math.min(c.pricing.video, c.pricing.call, c.pricing.chat || Infinity);
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        filtered.sort((a, b) => {
          const aMin = Math.min(a.pricing.video, a.pricing.call, a.pricing.chat || Infinity);
          const bMin = Math.min(b.pricing.video, b.pricing.call, b.pricing.chat || Infinity);
          return aMin - bMin;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const aMax = Math.max(a.pricing.video, a.pricing.call, a.pricing.chat || 0);
          const bMax = Math.max(b.pricing.video, b.pricing.call, b.pricing.chat || 0);
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

  const FilterPanel = () => (
    <div className="flex flex-col gap-6" style={{ padding: 'var(--spacing-4)' }}>
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
            <Button
              key={option.value}
              variant={availabilityFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAvailabilityFilter(option.value as AvailabilityFilter)}
              style={{ 
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-regular)'
              }}
            >
              {option.label}
            </Button>
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
            height: '48px',
            borderRadius: 'var(--radius-sm)',
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
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-bg-card)', padding: 'var(--spacing-6) var(--spacing-4)' }}>
        <h1 style={{ 
          fontSize: 'var(--text-2xl)', 
          fontWeight: 'var(--font-weight-medium)',
          marginBottom: 'var(--spacing-2)'
        }}>
          Find Your Consultant
        </h1>
        <p style={{ 
          fontSize: 'var(--text-sm)', 
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--color-text-muted)'
        }}>
          Connect with experienced mental health professionals
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{ backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-default)' }}>
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as CategoryType)}>
          <TabsList className={cn("w-full justify-start overflow-x-auto", isMobile && "rounded-none")}>
            <TabsTrigger value="all" style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
              All
            </TabsTrigger>
            <TabsTrigger value="therapist" style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
              Therapist
            </TabsTrigger>
            <TabsTrigger value="psychiatrist" style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
              Psychiatrist
            </TabsTrigger>
            <TabsTrigger value="counselor" style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
              Counselor
            </TabsTrigger>
            <TabsTrigger value="family-therapist" style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
              Family Therapist
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ 
        backgroundColor: 'var(--color-bg-card)', 
        padding: 'var(--spacing-4)',
        display: 'flex',
        gap: 'var(--spacing-3)',
        borderBottom: '1px solid var(--color-border-default)'
      }}>
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '48px',
              paddingLeft: '40px',
              paddingRight: 'var(--spacing-3)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-default)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-regular)',
              backgroundColor: 'var(--color-bg-input)'
            }}
          />
        </div>

        {/* Filter Button (Mobile) */}
        {isMobile && (
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                style={{
                  height: '48px',
                  borderRadius: 'var(--radius-sm)',
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
              <FilterPanel />
            </SheetContent>
          </Sheet>
        )}

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger style={{ width: isMobile ? '120px' : '180px', height: '48px', borderRadius: 'var(--radius-sm)' }}>
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

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar Filters (Desktop) */}
        {!isMobile && (
          <div style={{ 
            width: '280px', 
            backgroundColor: 'var(--color-bg-card)',
            borderRight: '1px solid var(--color-border-default)',
            overflowY: 'auto'
          }}>
            <FilterPanel />
          </div>
        )}

        {/* Consultant List */}
        <div className="flex-1" style={{ padding: 'var(--spacing-4)' }}>
          {/* Results Count */}
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
              {filteredConsultants.length} consultant{filteredConsultants.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Consultant Cards */}
          <div className="flex flex-col gap-4">
            {filteredConsultants.map(consultant => {
              // Convert to old professional format for existing card
              const professional = {
                professional_id: consultant.id,
                name: consultant.name,
                title: consultant.credentials,
                specialties: consultant.topExpertises,
                location: consultant.location,
                phone: `Book ${consultant.category}`,
                available: consultant.available
              };

              return (
                <div 
                  key={consultant.id}
                  onClick={() => handleConsultantClick(consultant.id)}
                  className="cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  <ConsultantCard professional={professional} />
                </div>
              );
            })}

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
        </div>
      </div>
    </div>
  );
}