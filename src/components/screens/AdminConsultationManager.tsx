import React, { useState, useEffect } from 'react';
import {
  Users,
  Download,
  Plus,
  Star,
  MapPin,
  Calendar as CalendarIcon,
  Edit2,
  MoreHorizontal
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminEmptyState } from '../admin/AdminEmptyState';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ConsultantEditPage, Consultant } from './ConsultantEditPage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { BookingCalendar } from '../admin/BookingCalendar';
import { AdminDataTable, Column, FilterOption } from '../admin/AdminDataTable';
import { ErrorState } from '../ui/error-state';
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton-loader';
import { TouchFeedback } from '../ui/touch-feedback';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from '../ui/utils';

interface AdminConsultationManagerProps {
  onBack?: () => void;
}

type ViewMode = 'list' | 'edit' | 'create';

export function AdminConsultationManager({ onBack }: AdminConsultationManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<Consultant[]>([]);

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | undefined>();

  // Booking dialog
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingProfessional, setBookingProfessional] = useState<Consultant | null>(null);

  useEffect(() => {
    if (viewMode === 'list') {
      loadProfessionals();
    }
  }, [viewMode]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getProfessionals();
      const data = Array.isArray(result) ? result : result.professionals || [];
      
      // Map API response to Component Consultant type
      const mappedProfessionals = data.map((item: any) => ({
        ...item,
        id: item.professional_id || item.id,
        expertises: item.specialties || item.expertises || [],
        // Ensure other fields
        category: item.category || 'Therapist',
        available: item.available !== undefined ? item.available : false,
        rating: item.rating || 5.0,
        credentials: item.title || item.credentials || 'Professional'
      }));

      setProfessionals(mappedProfessionals);
      setLoading(false); 
    } catch (error) {
      console.error('Failed to load professionals:', error);
      console.error('Backend error - showing infinite loader to force proper backend setup');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Credentials', 'Category', 'Expertises', 'Available'].join(','),
      ...professionals.map((p) => [
        p.name,
        p.credentials,
        p.category,
        (p.expertises || []).join('; '),
        p.available ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `professionals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('success', 'Export Complete', 'Professionals exported to CSV');
  };

  const handleCreateNew = () => {
    setSelectedConsultantId(undefined);
    setViewMode('create');
  };

  const handleEdit = (id: string) => {
    setSelectedConsultantId(id);
    setViewMode('edit');
  };

  const handleViewCalendar = (professional: Consultant) => {
    setBookingProfessional(professional);
    setIsBookingDialogOpen(true);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedConsultantId(undefined);
  };

  const stats = [
    {
      label: 'Total Professionals',
      value: professionals.length,
      icon: <Users className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
    {
      label: 'Available',
      value: professionals.filter((p) => p.available).length,
      icon: <Star className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />
    },
    {
      label: 'Avg Rating',
      value: (professionals.reduce((acc, p) => acc + (p.rating || 0), 0) / professionals.length || 0).toFixed(1),
      icon: <Star className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} />
    },
    {
      label: 'Specialties',
      value: new Set(professionals.flatMap((p) => p.expertises || [])).size,
      icon: <Users className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
    }
  ];

  const columns: Column<Consultant>[] = [
    {
      header: 'Professional',
      accessorKey: 'name',
      sortable: true,
      render: (professional) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
            {professional.photo ? (
              <img
                src={professional.photo}
                alt={professional.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium"
              >
                {professional.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{professional.name}</span>
            <span className="text-xs text-muted-foreground">{professional.credentials}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      render: (professional) => (
        <Badge variant="outline" className="capitalize">
          {professional.category}
        </Badge>
      )
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      sortable: true,
      render: (professional) => (
        <span className="text-sm text-muted-foreground">
          {professional.created_at ? new Date(professional.created_at).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'available',
      sortable: true,
      render: (professional) => (
        professional.available ? (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
            Available
          </Badge>
        ) : (
          <Badge variant="outline">Unavailable</Badge>
        )
      )
    },
    {
      header: 'Details',
      render: (professional) => (
        <div className="flex flex-col text-xs text-muted-foreground gap-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {professional.location}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {professional.rating?.toFixed(1) || '5.0'}
          </span>
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (professional) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewCalendar(professional); }}>
              <CalendarIcon className="mr-2 h-4 w-4" /> View Calendar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(professional.id); }}>
              <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const filters: FilterOption[] = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { label: 'Therapist', value: 'therapist' },
        { label: 'Psychiatrist', value: 'psychiatrist' },
        { label: 'Counselor', value: 'counselor' },
        { label: 'Family Therapist', value: 'family-therapist' },
      ]
    },
    // Note: Availability boolean filter would need mapping in AdminDataTable if we wanted it strictly there
  ];

  if (viewMode === 'edit' || viewMode === 'create') {
    return (
      <ConsultantEditPage
        consultantId={selectedConsultantId}
        onBack={handleBackToList}
        onSave={handleBackToList}
      />
    );
  }

  if (loading && professionals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 mx-auto mb-4 w-12 h-12 border-muted border-t-primary" />
          <p className="text-muted-foreground">Loading professionals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Consultation Manager"
        description="Manage mental health professionals and their profiles"
        onBack={onBack}
        breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Consultation Manager' }]}
        stats={stats}
        actions={
          <Button onClick={handleCreateNew} style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
            <Plus className="w-4 h-4 mr-2" />
            {!isMobile && 'Add Professional'}
          </Button>
        }
      />

      <AdminDataTable 
        columns={columns} 
        data={professionals} 
        searchKeys={['name', 'credentials', 'category', 'location']}
        filters={filters}
        searchPlaceholder="Search professionals..."
        onRowClick={(item) => handleEdit(item.id)}
        actions={
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            {!isMobile && 'Export'}
          </Button>
        }
      />

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Consultation</DialogTitle>
          </DialogHeader>

          <BookingCalendar
            professionalName={bookingProfessional?.name}
            onBookSlot={(date, time) => {
              showToast(
                'success',
                'Booking Confirmed',
                `Consultation booked for ${date.toLocaleDateString()} at ${time}`
              );
              setIsBookingDialogOpen(false);
            }}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}