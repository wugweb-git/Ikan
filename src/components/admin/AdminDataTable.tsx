import React, { useState, useMemo, ReactNode } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  type?: 'text' | 'image' | 'badge' | 'date' | 'custom'; // NEW: column type
  imageKey?: keyof T; // NEW: key for image URL
  imageFallback?: string; // NEW: fallback image
}

export interface FilterOption {
  key: string; // The key in the data to filter by (e.g., 'status', 'category')
  label: string; // Label for the filter dropdown
  options: { label: string; value: string }[];
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKeys?: (keyof T)[]; // Keys to search in
  filters?: FilterOption[]; // Filter configurations
  searchPlaceholder?: string;
  actions?: ReactNode; // Extra actions (e.g. Export button) next to search
  onRowClick?: (item: T) => void;
  pageSize?: number;
  idField?: keyof T;
}

export function AdminDataTable<T extends { [key: string]: any }>({ 
  columns, 
  data, 
  searchKeys = [], 
  filters = [],
  searchPlaceholder = "Search...", 
  actions,
  onRowClick,
  pageSize = 10,
  idField = 'id'
}: AdminDataTableProps<T>) {
  const isMobile = useIsMobile();
  
  // -- State --
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: 'asc' | 'desc' }>({ 
    key: null, 
    direction: 'asc' 
  });
  
  // Store active filters as Record<key, value>
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // -- Handlers --

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => {
      if (value === 'all') {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
    setCurrentPage(1); // Reset to first page on filter change
  };

  // -- Filtering & Sorting Logic --

  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Search
    if (searchTerm && searchKeys.length > 0) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(item => {
        return searchKeys.some(key => {
          const value = item[key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(lowerTerm);
        });
      });
    }

    // 2. Filters
    Object.entries(activeFilters).forEach(([key, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        result = result.filter(item => {
          const itemValue = (item as any)[key];
          return String(itemValue) === filterValue;
        });
      }
    });

    // 3. Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === bValue) return 0;
        
        // Handle nulls
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, searchKeys, activeFilters, sortConfig]);

  // -- Pagination --
  const totalPages = Math.ceil(processedData.length / currentPageSize);
  const paginatedData = processedData.slice((currentPage - 1) * currentPageSize, currentPage * currentPageSize);

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1" style={{ color: 'var(--color-primary-default)' }} />
      : <ArrowDown className="w-3 h-3 ml-1" style={{ color: 'var(--color-primary-default)' }} />;
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Search & Filters Group */}
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <Input 
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              {filters.map(filter => (
                <div key={filter.key} className="w-full md:w-48">
                  <Select 
                    value={activeFilters[filter.key] || 'all'} 
                    onValueChange={(val) => handleFilterChange(filter.key, val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {filter.label}</SelectItem>
                      {filter.options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Extra Actions */}
            {actions && (
              <div className="flex gap-2">
                {actions}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table / Mobile Cards */}
      {isMobile ? (
        <div className="space-y-4">
          {paginatedData.length > 0 ? (
            paginatedData.map((item, rowIdx) => (
              <Card 
                key={(item[idField] as unknown as string) || rowIdx}
                className={onRowClick ? "cursor-pointer transition-colors" : ""}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
                onClick={() => onRowClick && onRowClick(item)}
              >
                <CardContent className="p-4 flex gap-4">
                  {/* Find image column if exists */}
                  {columns.find(c => c.type === 'image' && c.imageKey) && (
                    <div className="shrink-0">
                       <img 
                          src={item[columns.find(c => c.type === 'image')!.imageKey!] as string || '/placeholder.png'} 
                          alt=""
                          className="w-16 h-16 object-cover"
                          style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}
                       />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    {columns.filter(c => c.type !== 'image').map((col, colIdx) => (
                      <div key={colIdx} className="flex justify-between items-start gap-2">
                        {colIdx === 0 ? (
                           <h4 className="truncate" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-base)' }}>
                             {col.render ? col.render(item) : (col.accessorKey ? (item[col.accessorKey] as ReactNode) : null)}
                           </h4>
                        ) : (
                           <div className="truncate" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
                             {col.header}: {col.render ? col.render(item) : (col.accessorKey ? (item[col.accessorKey] as ReactNode) : null)}
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center p-8" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border-default)' }}>
              No results found
            </div>
          )}
        </div>
      ) : (
      <div className="admin-table-container">
        <Table className="admin-table">
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead 
                  key={index} 
                  className={`${col.className || ''} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                >
                  <div className="flex items-center">
                    {col.header}
                    {col.sortable && col.accessorKey && getSortIcon(col.accessorKey)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIdx) => (
                <TableRow 
                  key={(item[idField] as unknown as string) || rowIdx} 
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} className={col.className}>
                      {col.type === 'image' && col.imageKey ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={item[col.imageKey] as string || col.imageFallback || '/placeholder.png'} 
                            alt=""
                            className="w-12 h-12 object-cover"
                            style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)' }}
                            onError={(e) => {
                              if (col.imageFallback) {
                                (e.target as HTMLImageElement).src = col.imageFallback;
                              }
                            }}
                          />
                          {col.render ? col.render(item) : (col.accessorKey ? (item[col.accessorKey] as ReactNode) : null)}
                        </div>
                      ) : (
                        col.render ? col.render(item) : (col.accessorKey ? (item[col.accessorKey] as ReactNode) : null)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
            {processedData.length > 0 ? (
               <>
                 Showing {(currentPage - 1) * currentPageSize + 1} to {Math.min(currentPage * currentPageSize, processedData.length)} of {processedData.length} entries
               </>
            ) : (
               'No entries'
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}