import React from 'react';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPreviousNext?: boolean;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  disabled?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPreviousNext = true,
  showFirstLast = true,
  maxVisiblePages = 5,
  disabled = false,
  className
}: PaginationProps) {
  // Helper function to generate page numbers to display
  const getVisiblePages = (): (number | 'ellipsis')[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    // Always show first page
    pages.push(1);
    
    // Calculate start and end of visible range
    let start = Math.max(2, currentPage - halfVisible);
    let end = Math.min(totalPages - 1, currentPage + halfVisible);
    
    // Adjust range if we're near the beginning or end
    if (currentPage <= halfVisible + 1) {
      end = Math.min(totalPages - 1, maxVisiblePages - 1);
    }
    if (currentPage >= totalPages - halfVisible) {
      start = Math.max(2, totalPages - maxVisiblePages + 2);
    }
    
    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('ellipsis');
    }
    
    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }
    
    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageClick = (page: number) => {
    if (disabled || page === currentPage || page < 1 || page > totalPages) {
      return;
    }
    onPageChange(page);
  };

  const canGoPrevious = currentPage > 1 && !disabled;
  const canGoNext = currentPage < totalPages && !disabled;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav 
      className={cn("flex items-center justify-center", className)}
      style={{
        minWidth: 'var(--constraint-component-min)',
        maxWidth: 'var(--constraint-component-max)'
      }}
      aria-label="Pagination navigation"
    >
      <div 
        className="flex items-center space-x-1 animate-fadeIn"
        style={{ gap: 'var(--spacing-2)' }}
      >
        {/* First Page Button */}
        {showFirstLast && currentPage > 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(1)}
            disabled={!canGoPrevious}
            className="gap-1"
            aria-label="Go to first page"
          >
            <Icon name="chevronLeft" size={14} />
            <Icon name="chevronLeft" size={14} />
          </Button>
        )}

        {/* Previous Button */}
        {showPreviousNext && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={!canGoPrevious}
            className="gap-1"
            aria-label="Go to previous page"
          >
            <Icon name="chevronLeft" size={14} />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        )}

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1"
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-sm)'
                  }}
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            
            return (
              <Button
                key={page}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageClick(page)}
                disabled={disabled}
                className={cn(
                  "min-w-[40px] h-[40px] p-0 transition-all duration-200",
                  isActive && "animate-scaleIn"
                )}
                style={{
                  backgroundColor: isActive ? 'var(--color-primary-default)' : 'transparent',
                  color: isActive ? 'var(--color-primary-on)' : 'var(--color-text-primary)',
                  borderColor: isActive ? 'var(--color-primary-default)' : 'var(--color-border-default)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                  borderRadius: 'var(--radius-md)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Next Button */}
        {showPreviousNext && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={!canGoNext}
            className="gap-1"
            aria-label="Go to next page"
          >
            <span className="hidden sm:inline">Next</span>
            <Icon name="chevronRight" size={14} />
          </Button>
        )}

        {/* Last Page Button */}
        {showFirstLast && currentPage < totalPages - 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(totalPages)}
            disabled={!canGoNext}
            className="gap-1"
            aria-label="Go to last page"
          >
            <Icon name="chevronRight" size={14} />
            <Icon name="chevronRight" size={14} />
          </Button>
        )}
      </div>

      {/* Page Info */}
      <div className="ml-4 hidden md:block">
        <span 
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)'
          }}
        >
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </nav>
  );
}

// Simple pagination info component
interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className
}: PaginationInfoProps) {
  const getItemRange = () => {
    if (!totalItems || !itemsPerPage) return null;
    
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    return { start, end };
  };

  const itemRange = getItemRange();

  return (
    <div 
      className={cn("text-center", className)}
      style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)'
      }}
    >
      {itemRange ? (
        <span>
          Showing {itemRange.start} to {itemRange.end} of {totalItems} items
        </span>
      ) : (
        <span>
          Page {currentPage} of {totalPages}
        </span>
      )}
    </div>
  );
}

export default Pagination;