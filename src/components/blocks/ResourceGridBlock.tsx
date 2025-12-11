import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description: string;
    category: string;
    readTimeMinutes: number;
    contentType: string;
    author?: string;
    publishedDate?: string;
  };
  onSelect?: (id: string) => void;
}

function ResourceCard({ resource, onSelect }: ResourceCardProps) {
  return (
    <>
      {/* Desktop Version - Hidden on mobile */}
      <div 
        className="bg-white relative rounded-[12px] hover:shadow-md transition-all duration-200 cursor-pointer animate-fadeIn hidden sm:block"
        onClick={() => onSelect?.(resource.id)}
        data-name="Resource Card Desktop"
      >
        <div className="size-full">
          <div className="box-border content-stretch flex flex-col items-start p-[16px] relative size-full">
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              {/* Hero Image */}
              <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full">
                <div className="h-[250px] relative rounded-[12px] shrink-0 w-full" data-name="ResourceImage">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[12px]">
                    <ImageWithFallback 
                      alt={resource.title}
                      className="absolute h-[106.5%] left-0 max-w-none top-[-3.25%] w-full object-cover"
                      src={`https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=518&h=250&fit=crop&crop=center`}
                    />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                {/* Date */}
                <div className="content-stretch flex flex-col items-start opacity-60 relative shrink-0 w-full">
                  <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[12px] text-nowrap">
                    <p className="leading-[18px] whitespace-pre">
                      {new Date(resource.publishedDate || Date.now()).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Title and Description */}
                <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                  <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                    {/* Title */}
                    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                      <div className="box-border content-stretch flex items-start px-0 py-[0.695px] relative shrink-0 w-full">
                        <div className="basis-0 flex flex-col font-['Ubuntu:Bold',_sans-serif] grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#151515] text-[24px]">
                          <p className="leading-[36px]">{resource.title}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[14px] w-full">
                        <p className="leading-[21px]">{resource.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Read More Button */}
                  <div className="content-stretch flex flex-col items-center relative shrink-0">
                    <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
                      <p className="leading-[28px] whitespace-pre">Read more</p>
                    </div>
                    <div className="absolute bg-[#151515] bottom-[-4.17%] left-0 right-0 top-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version - Visible only on mobile */}
      <div 
        className="bg-white relative rounded-[12px] hover:shadow-md transition-all duration-200 cursor-pointer animate-fadeIn block sm:hidden"
        onClick={() => onSelect?.(resource.id)}
        data-name="Resource Card Mobile"
      >
        <div className="size-full">
          <div className="box-border content-stretch flex flex-col items-start p-[10px] relative size-full">
            <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
              {/* Image */}
              <div className="content-stretch flex flex-col items-start justify-center relative self-stretch shrink-0">
                <div className="basis-0 grow min-h-px min-w-px relative rounded-[12px] shrink-0 w-[80px]">
                  <ImageWithFallback 
                    alt={resource.title}
                    className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[12px] size-full"
                    src={`https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=80&fit=crop&crop=center`}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="basis-0 content-stretch flex flex-col gap-[2px] grow items-start min-h-px min-w-px relative shrink-0">
                {/* Date */}
                <div className="content-stretch flex flex-col items-start opacity-60 relative shrink-0 w-full">
                  <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[10px] w-full">
                    <p className="leading-[15px]">
                      {new Date(resource.publishedDate || Date.now()).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[226px]">
                  <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[20px] w-[226px]">
                    <p className="leading-[25px]">{resource.title}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface ResourceGridBlockProps {
  resources?: ResourceCardProps['resource'][];
  onResourceSelect?: (id: string) => void;
  onFilter?: (category: string) => void;
  onSort?: (sortBy: string) => void;
  className?: string;
}

export function ResourceGridBlock({ 
  resources = [], 
  onResourceSelect,
  onFilter,
  onSort,
  className 
}: ResourceGridBlockProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  // Sample resources if none provided
  const defaultResources = [
    {
      id: '1',
      title: 'Understanding Anxiety: A Comprehensive Guide',
      description: 'Learn about the science behind anxiety and discover practical strategies for managing anxious thoughts and feelings.',
      category: 'Mental Health',
      readTimeMinutes: 8,
      contentType: 'Article',
      author: 'Dr. Sarah Johnson',
      publishedDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Mindfulness Meditation for Beginners',
      description: 'Start your mindfulness journey with simple techniques that can be practiced anywhere, anytime.',
      category: 'Mindfulness',
      readTimeMinutes: 5,
      contentType: 'Guide',
      author: 'Mark Thompson',
      publishedDate: '2024-01-10'
    },
    {
      id: '3',
      title: 'Building Healthy Sleep Habits',
      description: 'Discover evidence-based strategies for improving sleep quality and establishing consistent sleep routines.',
      category: 'Wellness',
      readTimeMinutes: 12,
      contentType: 'Article',
      author: 'Dr. Emily Chen',
      publishedDate: '2024-01-08'
    },
    {
      id: '4',
      title: 'Coping with Stress at Work',
      description: 'Professional strategies for managing workplace stress and maintaining work-life balance.',
      category: 'Workplace',
      readTimeMinutes: 10,
      contentType: 'Guide',
      author: 'Alex Rodriguez',
      publishedDate: '2024-01-05'
    },
    {
      id: '5',
      title: 'The Science of Happiness',
      description: 'Explore research-backed methods for increasing life satisfaction and emotional wellbeing.',
      category: 'Psychology',
      readTimeMinutes: 15,
      contentType: 'Research',
      author: 'Dr. Michael Brown',
      publishedDate: '2024-01-03'
    },
    {
      id: '6',
      title: 'Communication Skills for Better Relationships',
      description: 'Improve your relationships through effective communication techniques and active listening.',
      category: 'Relationships',
      readTimeMinutes: 7,
      contentType: 'Guide',
      author: 'Lisa Williams',
      publishedDate: '2024-01-01'
    }
  ];

  const displayResources = resources.length > 0 ? resources : defaultResources;
  
  const categories = ['all', ...Array.from(new Set(displayResources.map(r => r.category)))];
  
  const filteredResources = displayResources.filter(resource => 
    activeFilter === 'all' || resource.category === activeFilter
  );

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'readTime':
        return a.readTimeMinutes - b.readTimeMinutes;
      case 'latest':
      default:
        return new Date(b.publishedDate || '').getTime() - new Date(a.publishedDate || '').getTime();
    }
  });

  const handleFilter = (category: string) => {
    setActiveFilter(category);
    onFilter?.(category);
  };

  const handleSort = (sortOption: string) => {
    setSortBy(sortOption);
    onSort?.(sortOption);
  };

  return (
    <div 
      className={cn("w-full", className)}
      style={{
        minWidth: 'var(--constraint-content-min)',
        maxWidth: 'var(--constraint-content-max)'
      }}
    >
      {/* Filter and Sort Controls */}
      <div 
        className="flex flex-col sm:flex-row gap-4 mb-6"
        style={{ gap: 'var(--spacing-3)' }}
      >
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilter(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="px-3 py-1 rounded-md border text-sm"
            style={{
              backgroundColor: 'var(--color-bg-input)',
              borderColor: 'var(--color-border-default)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)'
            }}
          >
            <option value="latest">Latest</option>
            <option value="title">Title</option>
            <option value="readTime">Read Time</option>
          </select>
        </div>
      </div>

      {/* Resource Grid */}
      <div 
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        style={{ gap: 'var(--spacing-3)' }}
      >
        {sortedResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onSelect={onResourceSelect}
          />
        ))}
      </div>

      {sortedResources.length === 0 && (
        <div className="text-center py-12">
          <Icon name="search" size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            No resources found for the selected filter.
          </p>
        </div>
      )}
    </div>
  );
}