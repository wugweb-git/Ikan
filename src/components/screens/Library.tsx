import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Search, BookOpen, Play, Video, Wrench, FileText } from 'lucide-react';
import { CardSkeleton, LibraryEmptyState, StaggeredReveal } from '../utils/LoadingStates';
import { BlogSectionBlock } from '../blocks/BlogSectionBlock';
import { DUMMY_BLOGS, formatBlogsForSection } from '../../lib/dummy-blogs';
import { BlogPost } from '../blocks/BlogCard';

interface LibraryProps {
  onResourceSelect?: (resourceId: string) => void;
  className?: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'tool';
  image: string;
  date: string;
  readTime?: string;
}

export function Library({ onResourceSelect, className }: LibraryProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Sample resources data with Unsplash images
  const resources: Resource[] = [
    {
      id: '1',
      title: 'Understanding Mental Health: A Complete Guide',
      description: 'Comprehensive guide to understanding mental health, recognizing symptoms, and finding support when you need it most.',
      category: 'recommended',
      type: 'article',
      image: 'https://images.unsplash.com/photo-1718975592728-7b594fb035b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBib29rcyUyMHJlYWRpbmd8ZW58MXx8fHwxNzU5Mjk3NDkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      date: 'March 15, 2025',
      readTime: '8 min read'
    },
    {
      id: '2',
      title: 'Daily Meditation Practice for Beginners',
      description: 'Learn how to start a meditation practice that fits into your daily routine and helps manage stress and anxiety.',
      category: 'stress-management',
      type: 'video',
      image: 'https://images.unsplash.com/photo-1687180948607-9ba1dd045e10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMG1lZGl0YXRpb24lMjBjYWxtfGVufDF8fHx8MTc1OTI4MzE2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      date: 'March 10, 2025',
      readTime: '15 min watch'
    },
    {
      id: '3',
      title: 'Workplace Stress Management Toolkit',
      description: 'Essential tools and techniques for managing workplace stress, setting boundaries, and maintaining work-life balance.',
      category: 'stress-management',
      type: 'tool',
      image: 'https://images.unsplash.com/photo-1758611972613-3afe657c3249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlc3MlMjBtYW5hZ2VtZW50JTIwd29ya3BsYWNlfGVufDF8fHx8MTc1OTI5NzUwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      date: 'March 08, 2025',
      readTime: 'Interactive tool'
    },
    {
      id: '4',
      title: 'Anxiety Relief: 5 Quick Techniques',
      description: 'Five evidence-based techniques you can use anywhere to quickly calm anxiety and regain your sense of control.',
      category: 'recommended',
      type: 'article',
      image: 'https://images.unsplash.com/photo-1620302044615-3883082d075a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbnhpZXR5JTIwcmVsaWVmJTIwdGVjaG5pcXVlc3xlbnwxfHx8fDE3NTkyOTc1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      date: 'March 05, 2025',
      readTime: '6 min read'
    },
    {
      id: '5',
      title: 'Parenting Through Difficult Times',
      description: 'Supporting your family\'s mental health while managing your own stress and maintaining strong relationships.',
      category: 'parenting',
      type: 'article',
      image: 'https://images.unsplash.com/photo-1600563093202-337471bde37e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJlbnRpbmclMjBzdXBwb3J0JTIwZmFtaWx5fGVufDF8fHx8MTc1OTI5NzUxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      date: 'March 02, 2025',
      readTime: '12 min read'
    },
    {
      id: '6',
      title: 'Journaling for Mental Health',
      description: 'Discover how therapeutic writing can help process emotions, track progress, and improve overall wellbeing.',
      category: 'recommended',
      type: 'tool',
      image: 'https://images.unsplash.com/photo-1683119510482-be8f631d8353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBqb3VybmFsJTIwd3JpdGluZ3xlbnwxfHx8fDE3NTkyOTc1MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      date: 'February 28, 2025',
      readTime: 'Interactive guide'
    },
    {
      id: '7',
      title: 'Professional Therapy Sessions: What to Expect',
      description: 'A comprehensive guide to understanding different types of therapy and how to prepare for your first session.',
      category: 'recommended',
      type: 'article',
      image: 'https://images.unsplash.com/photo-1758273241078-8eec353836be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVyYXB5JTIwc2Vzc2lvbiUyMGNvdW5zZWxpbmd8ZW58MXx8fHwxNzU5Mjk3NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      date: 'February 25, 2025',
      readTime: '10 min read'
    },
    {
      id: '8',
      title: 'Building a Self-Care Routine That Works',
      description: 'Practical steps to create sustainable self-care habits that fit your lifestyle and improve your mental wellbeing.',
      category: 'stress-management',
      type: 'video',
      image: 'https://images.unsplash.com/photo-1642005799051-a43dfbe7dc2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWxmJTIwY2FyZSUyMHdlbGxuZXNzJTIwcm91dGluZXxlbnwxfHx8fDE3NTkyOTcyODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      date: 'February 22, 2025',
      readTime: '12 min watch'
    },
    {
      id: '9',
      title: 'Finding Your Support Network',
      description: 'How to identify, build, and maintain meaningful connections that support your mental health journey.',
      category: 'recommended',  
      type: 'tool',
      image: 'https://images.unsplash.com/photo-1620147512372-9e00421556bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBzdXBwb3J0JTIwZ3JvdXB8ZW58MXx8fHwxNzU5Mjk3NzU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      date: 'February 20, 2025',
      readTime: 'Interactive assessment'
    }
  ];

  // Filter resources based on search and filters
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTypeFilter === 'all' || resource.type === activeTypeFilter;
    const matchesCategory = activeCategoryFilter === 'all' || resource.category === activeCategoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleResourceClick = (resourceId: string) => {
    onResourceSelect?.(resourceId);
  };

  const handleBlogClick = (post: BlogPost) => {
    // Navigate to resource detail with the blog ID
    onResourceSelect?.(post.id);
  };

  // Type filter buttons
  const typeFilters = [
    { id: 'all', label: 'All', icon: BookOpen },
    { id: 'article', label: 'Articles', icon: BookOpen },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'tool', label: 'Tools', icon: Wrench }
  ];

  // Category filter buttons
  const categoryFilters = [
    { id: 'all', label: 'All Resources' },
    { id: 'recommended', label: 'Recommended' },
    { id: 'parenting', label: 'Parenting' },
    { id: 'stress-management', label: 'Stress Management' }
  ];

  return (
    <div className={cn("relative w-full", className)}>
      {/* Header Section */}
      <div 
        className="absolute left-0 top-0 w-full max-w-4xl"
        style={{ 
          paddingLeft: 'var(--spacing-4)', // 16px instead of left-4
        }}
      >
        <div style={{ gap: 'var(--spacing-2)' }} className="flex flex-col">
          <h1 
            style={{
              fontSize: isMobile ? 'var(--text-2xl)' : 'var(--text-3xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-sm)'
            }}
          >
            Resources
          </h1>
          <p 
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-md)'
            }}
          >
            Gain insight into your mental and emotional health and find ways to support yourself
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div 
        className="absolute left-0 w-full max-w-lg"
        style={{ 
          paddingLeft: 'var(--spacing-4)', // 16px instead of left-4
          top: '128px' // 32 * 4 = 128px (top-32)
        }}
      >
        <div className="relative">
          <div 
            className="absolute inset-y-0 left-0 flex items-center pointer-events-none"
            style={{ paddingLeft: 'var(--spacing-5)' }} // 20px instead of pl-5
          >
            <Search size={14} style={{ color: '#D9D9D9' }} />
          </div>
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-gray-200"
            style={{
              paddingLeft: 'calc(var(--spacing-3) * 4)', // 48px (pl-12)
              paddingRight: 'var(--spacing-4)', // 16px (pr-4)
              paddingTop: 'var(--spacing-3)', // 12px (closest to py-2.5)
              paddingBottom: 'var(--spacing-3)' // 12px (closest to py-2.5)
            }}
            style={{
              backgroundColor: 'white',
              fontSize: 'var(--text-sm)',
              color: '#757575'
            }}
          />
        </div>
      </div>

      {/* Type Filter Buttons */}
      <div 
        className="absolute right-0 flex"
        style={{
          paddingRight: 'var(--spacing-4)', // 16px instead of right-4
          top: '128px', // 32 * 4 = 128px (top-32)
          gap: 'var(--spacing-2)' // 8px instead of gap-2
        }}
      >
        {typeFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeTypeFilter === filter.id;
          
          return (
            <Button
              key={filter.id}
              onClick={() => setActiveTypeFilter(filter.id)}
              variant={isActive ? "default" : "outline"}
              className="rounded-2xl"
              style={{
                gap: 'var(--spacing-2)', // 8px instead of gap-2
                paddingLeft: 'var(--spacing-5)', // 20px (px-5)
                paddingRight: 'var(--spacing-5)', // 20px (px-5)
                paddingTop: 'var(--spacing-3)', // 12px (closest to py-2.5)
                paddingBottom: 'var(--spacing-3)' // 12px (closest to py-2.5)
              }}
              style={{
                backgroundColor: isActive ? '#2e2a2f' : 'white',
                color: isActive ? 'white' : '#757575',
                border: isActive ? 'none' : '1px solid #d9d9d9',
                fontSize: 'var(--text-sm)'
              }}
            >
              <Icon size={16} />
              {filter.label}
            </Button>
          );
        })}
      </div>

      {/* Category Filter Pills */}
      <div 
        className="absolute left-0 rounded-2xl flex"
        style={{ 
          paddingLeft: 'var(--spacing-4)', // 16px instead of left-4
          top: '208px', // 52 * 4 = 208px (top-52)
          backgroundColor: '#F5F5F5',
          padding: 'var(--spacing-2)', // 8px (closest to p-1.5)
          gap: 'var(--spacing-2)' // 8px instead of gap-2
        }}
      >
        {categoryFilters.map((filter) => {
          const isActive = activeCategoryFilter === filter.id;
          
          return (
            <Button
              key={filter.id}
              onClick={() => setActiveCategoryFilter(filter.id)}
              variant="ghost"
              className="rounded-2xl"
              style={{
                paddingLeft: 'var(--spacing-5)', // 20px (px-5)
                paddingRight: 'var(--spacing-5)', // 20px (px-5)
                paddingTop: 'var(--spacing-3)', // 12px (closest to py-2.5)
                paddingBottom: 'var(--spacing-3)' // 12px (closest to py-2.5)
              }}
              style={{
                backgroundColor: isActive ? '#2e2a2f' : 'transparent',
                color: isActive ? 'white' : '#757575',
                fontSize: 'var(--text-sm)'
              }}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>

      {/* Resources Grid */}
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-6xl"
        style={{ top: '288px' }} // 72 * 4 = 288px (top-72)
      >
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ gap: 'var(--spacing-4)' }} // 16px instead of gap-4
        >
          {filteredResources.map((resource) => (
            <Card 
              key={resource.id} 
              className="cursor-pointer hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden"
              onClick={() => handleResourceClick(resource.id)}
              style={{ backgroundColor: 'white' }}
            >
              <CardContent style={{ padding: 'var(--spacing-4)' }}>
                <div style={{ gap: 'var(--spacing-4)' }} className="flex flex-col">
                  {/* Resource Image */}
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={resource.image}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Resource Date */}
                  <p 
                    className="uppercase tracking-wider opacity-60"
                    style={{
                      fontSize: '11.438px',
                      color: 'var(--color-text-primary)',
                      lineHeight: '19.2px',
                      letterSpacing: '1.2px'
                    }}
                  >
                    {resource.date}
                  </p>

                  {/* Resource Title */}
                  <h3 
                    className="leading-9"
                    style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {resource.title}
                  </h3>

                  {/* Resource Description */}
                  <p 
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 'var(--line-height-md)'
                    }}
                  >
                    {resource.description}
                  </p>

                  {/* Read More Link */}
                  <div 
                    className="border-t border-gray-200"
                    style={{ paddingTop: 'var(--spacing-4)' }}
                  >
                    <span 
                      className="text-sm tracking-wide cursor-pointer hover:opacity-70 transition-opacity"
                      style={{
                        fontSize: '13.711px',
                        color: 'var(--color-text-primary)',
                        letterSpacing: '0.3px',
                        lineHeight: '17px'
                      }}
                    >
                      Read more
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen 
              size={48} 
              className="mx-auto mb-4 opacity-50"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <h3 
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              No resources found
            </h3>
            <p 
              className="mt-2"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)'
              }}
            >
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            style={{ gap: 'var(--spacing-4)' }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="rounded-xl">
                <CardContent style={{ padding: 'var(--spacing-4)' }}>
                  <div 
                    className="animate-pulse"
                    style={{ gap: 'var(--spacing-4)' }}
                  >
                    <div className="aspect-video bg-gray-200 rounded-xl"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div 
                      className="flex flex-col"
                      style={{ gap: 'var(--spacing-2)' }}
                    >
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Featured Blog Section - Using BlogSectionBlock */}
        {!loading && filteredResources.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-16)' }}>
            <BlogSectionBlock
              title="Featured Articles & Guides"
              posts={formatBlogsForSection(DUMMY_BLOGS.slice(0, 3))}
              onPostClick={handleBlogClick}
            />
          </div>
        )}

        {/* More Resources Section - Using BlogSectionBlock */}
        {!loading && filteredResources.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-16)' }}>
            <BlogSectionBlock
              title="More Mental Health Resources"
              posts={formatBlogsForSection(DUMMY_BLOGS.slice(3, 6))}
              onPostClick={handleBlogClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}