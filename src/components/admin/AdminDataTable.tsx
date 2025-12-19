import React, { useState, useMemo } from 'react';
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
  ArrowDown,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
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
  actions?: React.ReactNode; // Extra actions (e.g. Export button) next to search
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
  
  // -- State --
  const [currentPage, setCurrentPage] = useState(1);
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
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1 text-primary" />
      : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead 
                  key={index} 
                  className={`${col.className || ''} ${col.sortable ? 'cursor-pointer select-none hover:bg-muted/50' : ''}`}
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
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} className={col.className}>
                      {col.render ? col.render(item) : (col.accessorKey ? (item[col.accessorKey] as React.ReactNode) : null)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-sm text-muted-foreground mr-4">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
