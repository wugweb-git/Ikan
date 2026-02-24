import React, { useState, useEffect } from 'react';
import {
  Users, Download, Plus, Star, MapPin, Calendar as CalendarIcon,
  Edit2, MoreHorizontal, ShieldCheck, FileText, CheckCircle, XCircle,
  Eye, Clock, Briefcase, Languages, Link2, Copy, ExternalLink
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminEmptyState } from '../admin/AdminEmptyState';
import { AdminLoading } from '../admin/AdminLoading';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { AdminStatusBadge, resolveStatusVariant } from '../admin/AdminStatusBadge';
import { ConsultantEditPage, Consultant } from './ConsultantEditPage';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '../ui/dialog';
import { BookingCalendar } from '../admin/BookingCalendar';
import { AdminDataTable, Column, FilterOption } from '../admin/AdminDataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AdminConsultationManagerProps {
  onBack?: () => void;
  onNavigate?: (path: string) => void;
}

type ViewMode = 'list' | 'edit' | 'create';

interface ApplicationSummary {
  id: string;
  name: string;
  credentials: string;
  category?: string;
  location?: string;
  yearsExperience?: number;
  expertises?: string[];
  languages?: string[];
  status: 'pending_review' | 'approved' | 'rejected';
  submitted_at: string;
  rejection_reason?: string;
}

interface ApplicationDetail {
  id: string;
  name: string;
  credentials: string;
  category: string;
  bio: string;
  location: string;
  yearsExperience: number;
  photo?: string;
  languages: string[];
  expertises: string[];
  therapeuticApproaches: string[];
  qualifications: string[];
  demographicSpecialties: string[];
  therapeuticPhilosophy?: string;
  sessionModes: string[];
  clientFAQs?: { question: string; answer: string }[];
  testimonials?: { text: string; clientName: string }[];
  videoIntroUrl?: string;
  certificates?: string[];
  willingToShareArticles?: boolean;
  availabilityPreferences?: {
    workingHours: string;
    daysAvailable: string[];
    weekendAvailability: boolean;
  };
  submitted_at: string;
  status: string;
  [key: string]: any;
}

export function AdminConsultationManager({ onBack, onNavigate }: AdminConsultationManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<Consultant[]>([]);
  const [activeTab, setActiveTab] = useState<'professionals' | 'applications'>('professionals');

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | undefined>();

  // Booking dialog
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingProfessional, setBookingProfessional] = useState<Consultant | null>(null);

  // Applications state
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null);
  const [showAppPreview, setShowAppPreview] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectAppId, setRejectAppId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingApp, setProcessingApp] = useState<string | null>(null);

  // Universal link dialog
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  useEffect(() => {
    if (viewMode === 'list') {
      loadProfessionals();
    }
  }, [viewMode]);

  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications();
    }
  }, [activeTab]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getProfessionals();
      const data = Array.isArray(result) ? result : result.professionals || [];
      const mapped = data.map((item: any) => ({
        ...item,
        id: item.professional_id || item.id,
        expertises: item.specialties || item.expertises || [],
        category: item.category || 'Therapist',
        available: item.available !== undefined ? item.available : false,
        rating: item.rating || 5.0,
        credentials: item.title || item.credentials || 'Professional'
      }));
      setProfessionals(mapped);
    } catch (error) {
      console.error('Failed to load professionals:', error);
      showToast('error', 'API Error', 'Failed to load professionals');
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setLoadingApps(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/professional-applications`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
      showToast('error', 'API Error', 'Failed to load applications');
    } finally {
      setLoadingApps(false);
    }
  };

  const loadApplicationDetail = async (appId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/professional-applications/${appId}`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      const data = await response.json();
      if (data.application) {
        setSelectedApplication(data.application);
        setShowAppPreview(true);
      } else {
        showToast('error', 'Not Found', 'Application data not found');
      }
    } catch (error) {
      console.error('Failed to load application detail:', error);
      showToast('error', 'Error', 'Failed to load application details');
    }
  };

  const handleApproveApp = async (appId: string) => {
    setProcessingApp(appId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/professional-applications/${appId}/approve`,
        { method: 'POST', headers: { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data.success) {
        showToast('success', 'Approved', 'Application approved and professional profile is now live.');
        loadApplications();
        loadProfessionals();
        setShowAppPreview(false);
      } else {
        showToast('error', 'Error', data.error || 'Failed to approve');
      }
    } catch (error) {
      console.error('Approve error:', error);
      showToast('error', 'Error', 'Failed to approve application');
    } finally {
      setProcessingApp(null);
    }
  };

  const handleRejectApp = async () => {
    if (!rejectAppId) return;
    setProcessingApp(rejectAppId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/professional-applications/${rejectAppId}/reject`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: rejectReason })
        }
      );
      const data = await response.json();
      if (data.success) {
        showToast('success', 'Rejected', 'Application has been rejected.');
        loadApplications();
        setShowRejectDialog(false);
        setShowAppPreview(false);
        setRejectReason('');
        setRejectAppId(null);
      } else {
        showToast('error', 'Error', data.error || 'Failed to reject');
      }
    } catch (error) {
      console.error('Reject error:', error);
      showToast('error', 'Error', 'Failed to reject application');
    } finally {
      setProcessingApp(null);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join/professional`;
    navigator.clipboard.writeText(link);
    showToast('success', 'Link Copied', 'Universal application link copied to clipboard.');
  };

  const handleTestIntegrity = () => {
    let issues = 0;
    const report: string[] = [];
    professionals.forEach(p => {
      const missing = [];
      if (!p.name) missing.push('Name');
      if (!p.credentials) missing.push('Credentials');
      if (!p.category) missing.push('Category');
      if (missing.length > 0) { issues++; report.push(`"${p.name || 'Unknown'}": Missing ${missing.join(', ')}`); }
    });
    if (issues === 0) showToast('success', 'Integrity Check Passed', 'All profiles appear valid.');
    else { console.warn('Issues:', report); showToast('warning', 'Issues Found', `${issues} profiles with missing data.`); }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Credentials', 'Category', 'Expertises', 'Available'].join(','),
      ...professionals.map(p => [p.name, p.credentials, p.category, (p.expertises || []).join('; '), p.available ? 'Yes' : 'No'].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `professionals-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    showToast('success', 'Export Complete', 'Professionals exported to CSV');
  };

  const handleCreateNew = () => { setSelectedConsultantId(undefined); setViewMode('create'); };
  const handleEdit = (id: string) => { setSelectedConsultantId(id); setViewMode('edit'); };
  const handleViewCalendar = (p: Consultant) => { setBookingProfessional(p); setIsBookingDialogOpen(true); };
  const handleBackToList = () => { setViewMode('list'); setSelectedConsultantId(undefined); };

  // ── Stats ──
  const pendingCount = applications.filter(a => a.status === 'pending_review').length;
  const stats = [
    { label: 'Total Professionals', value: professionals.length, icon: <Users className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} /> },
    { label: 'Available', value: professionals.filter(p => p.available).length, icon: <Star className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} /> },
    { label: 'Avg Rating', value: (professionals.reduce((a, p) => a + (p.rating || 0), 0) / professionals.length || 0).toFixed(1), icon: <Star className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} /> },
    { label: 'Pending Apps', value: pendingCount, icon: <FileText className="w-4 h-4" style={{ color: pendingCount > 0 ? 'var(--color-status-warning)' : 'var(--color-info-default)' }} /> },
  ];

  // ── Professional Columns ──
  const columns: Column<Consultant>[] = [
    {
      header: 'Professional', accessorKey: 'name', sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
            {p.photo ? <img src={p.photo} alt={p.name} className="w-full h-full object-cover" /> :
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-default)', color: 'var(--color-text-primary)', fontWeight: 500 }}>{p.name.charAt(0)}</div>}
          </div>
          <div className="flex flex-col">
            <span style={{ fontWeight: 500 }}>{p.name}</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{p.credentials}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Category', accessorKey: 'category', sortable: true,
      render: (p) => <AdminStatusBadge status="neutral" label={p.category} />
    },
    {
      header: 'Created', accessorKey: 'created_at', sortable: true,
      render: (p) => <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</span>
    },
    {
      header: 'Status', accessorKey: 'available', sortable: true,
      render: (p) => (
        <AdminStatusBadge 
          status={p.available ? 'success' : 'neutral'} 
          label={p.available ? 'Available' : 'Unavailable'} 
          dot 
        />
      )
    },
    {
      header: 'Details',
      render: (p) => (
        <div className="flex flex-col gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.location}</span>
          <span className="flex items-center gap-1"><Star className="w-3 h-3" style={{ color: 'var(--color-rating-star)', fill: 'var(--color-rating-star)' }} /> {p.rating?.toFixed(1) || '5.0'}</span>
        </div>
      )
    },
    {
      header: 'Actions', className: 'text-right',
      render: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewCalendar(p); }}><CalendarIcon className="mr-2 h-4 w-4" /> View Calendar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(p.id); }}><Edit2 className="mr-2 h-4 w-4" /> Edit Profile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  // ── Application Columns ──
  const appColumns: Column<ApplicationSummary>[] = [
    {
      header: 'Applicant', accessorKey: 'name', sortable: true,
      render: (a) => (
        <div className="flex flex-col">
          <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{a.name}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{a.credentials}</span>
        </div>
      )
    },
    {
      header: 'Category', accessorKey: 'category', sortable: true,
      render: (a) => <AdminStatusBadge status="neutral" label={a.category || 'Therapist'} />
    },
    {
      header: 'Details',
      render: (a) => (
        <div className="flex flex-col gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {a.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.location}</span>}
          {a.yearsExperience !== undefined && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {a.yearsExperience}+ yrs</span>}
          {(a.languages || []).length > 0 && <span className="flex items-center gap-1"><Languages className="w-3 h-3" /> {a.languages!.slice(0, 2).join(', ')}{a.languages!.length > 2 ? ` +${a.languages!.length - 2}` : ''}</span>}
        </div>
      )
    },
    {
      header: 'Submitted', accessorKey: 'submitted_at', sortable: true,
      render: (a) => (
        <div className="flex flex-col">
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{new Date(a.submitted_at).toLocaleDateString()}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{new Date(a.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      header: 'Status', accessorKey: 'status', sortable: true,
      render: (a) => (
        <AdminStatusBadge status={resolveStatusVariant(a.status)} label={a.status.replace('_', ' ')} />
      )
    },
    {
      header: 'Actions', className: 'text-right',
      render: (a) => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); loadApplicationDetail(a.id); }} style={{ gap: 'var(--spacing-1)', height: 'var(--ikan-component-button-height-sm)', fontSize: 'var(--text-xs)' }}>
            <Eye className="w-3 h-3" /> View
          </Button>
          {a.status === 'pending_review' && (
            <>
              <Button size="sm" onClick={(e) => { e.stopPropagation(); handleApproveApp(a.id); }} disabled={processingApp === a.id}
                style={{ gap: 'var(--spacing-1)', height: 'var(--ikan-component-button-height-sm)', fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-status-success)', color: 'var(--color-text-inverse)' }}>
                <CheckCircle className="w-3 h-3" /> Approve
              </Button>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setRejectAppId(a.id); setShowRejectDialog(true); }}
                style={{ gap: 'var(--spacing-1)', height: 'var(--ikan-component-button-height-sm)', fontSize: 'var(--text-xs)', color: 'var(--color-status-danger)', borderColor: 'var(--color-status-danger)' }}>
                <XCircle className="w-3 h-3" /> Reject
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  const filters: FilterOption[] = [
    { key: 'category', label: 'Category', options: [
      { label: 'Therapist', value: 'therapist' }, { label: 'Psychiatrist', value: 'psychiatrist' },
      { label: 'Counselor', value: 'counselor' }, { label: 'Family Therapist', value: 'family-therapist' },
    ]},
  ];

  const appFilters: FilterOption[] = [
    { key: 'status', label: 'Status', options: [
      { label: 'Pending Review', value: 'pending_review' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' },
    ]},
  ];

  // ── Edit/Create mode ──
  if (viewMode === 'edit' || viewMode === 'create') {
    return <ConsultantEditPage consultantId={selectedConsultantId} onBack={handleBackToList} onSave={handleBackToList} />;
  }

  if (loading && professionals.length === 0 && activeTab === 'professionals') {
    return <AdminLoading message="Loading professionals..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Consultation Manager"
        description="Manage professionals, review applications, and share the universal onboarding link"
        onBack={onBack}
        breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Consultation Manager' }]}
        stats={stats}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setShowLinkDialog(true)} style={{ gap: 'var(--spacing-2)' }}>
              <Link2 className="w-4 h-4" /> {!isMobile && 'Share Link'}
            </Button>
            <Button variant="outline" onClick={handleTestIntegrity}>
              <ShieldCheck className="w-4 h-4 mr-2" />{!isMobile && 'Integrity'}
            </Button>
            <Button onClick={handleCreateNew} style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
              <Plus className="w-4 h-4 mr-2" />{!isMobile && 'Add Professional'}
            </Button>
          </div>
        }
      />

      {/* Tab Switcher */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="professionals" style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>
            Professionals ({professionals.length})
          </TabsTrigger>
          <TabsTrigger value="applications" style={{ fontWeight: 500, fontSize: 'var(--text-sm)', position: 'relative' }}>
            Applications ({applications.length})
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -8,
                width: 18, height: 18, borderRadius: '50%',
                backgroundColor: 'var(--color-status-danger)',
                color: 'var(--color-text-inverse)', fontSize: 10, fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ═══ Professionals Tab ═══ */}
        <TabsContent value="professionals">
          <AdminDataTable
            columns={columns} data={professionals}
            searchKeys={['name', 'credentials', 'category', 'location']}
            filters={filters} searchPlaceholder="Search professionals..."
            onRowClick={(item) => handleEdit(item.id)}
            actions={
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />{!isMobile && 'Export'}
              </Button>
            }
          />
        </TabsContent>

        {/* ═══ Applications Tab ═══ */}
        <TabsContent value="applications">
          {loadingApps ? (
            <AdminLoading message="Loading applications..." />
          ) : applications.length === 0 ? (
            <AdminEmptyState
              title="No Applications Yet"
              description="Share the universal application link with professionals to start receiving applications."
              icon={<FileText className="w-12 h-12" style={{ color: 'var(--color-text-muted)' }} />}
              action={{ label: 'Copy Application Link', onClick: handleCopyLink }}
            />
          ) : (
            <AdminDataTable
              columns={appColumns} data={applications}
              searchKeys={['name', 'credentials', 'category', 'location']}
              filters={appFilters} searchPlaceholder="Search applications..."
              onRowClick={(item) => loadApplicationDetail(item.id)}
              actions={
                <Button variant="outline" onClick={loadApplications} className="gap-2">
                  <Clock className="w-4 h-4" />{!isMobile && 'Refresh'}
                </Button>
              }
            />
          )}
        </TabsContent>
      </Tabs>

      {/* ═══ Application Preview Dialog ═══ */}
      <Dialog open={showAppPreview} onOpenChange={setShowAppPreview}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle style={{ fontWeight: 500 }}>Application: {selectedApplication.name}</DialogTitle>
                <DialogDescription>Submitted {new Date(selectedApplication.submitted_at).toLocaleDateString()}</DialogDescription>
              </DialogHeader>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
                {/* Photo + Basic Info */}
                <div className="flex items-start gap-4">
                  {selectedApplication.photo && (
                    <img src={selectedApplication.photo} alt={selectedApplication.name}
                      style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  )}
                  <div className="flex-1">
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 500 }}>{selectedApplication.name}</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{selectedApplication.credentials}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <AdminStatusBadge status="neutral" label={selectedApplication.category} />
                      <AdminStatusBadge status="neutral" label={`${selectedApplication.yearsExperience || 0}+ yrs experience`} />
                      {selectedApplication.location && (
                        <AdminStatusBadge status="neutral">
                           <MapPin className="w-3 h-3 mr-1 inline-block" />{selectedApplication.location}
                        </AdminStatusBadge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <PreviewSection title="Brief Introduction">
                  <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--line-height-lg)' }}>{selectedApplication.bio}</p>
                </PreviewSection>

                {/* Languages */}
                {(selectedApplication.languages || []).length > 0 && (
                  <PreviewSection title="Languages">
                    <div className="flex flex-wrap gap-2">{selectedApplication.languages.map(l => <AdminStatusBadge key={l} status="neutral" label={l} />)}</div>
                  </PreviewSection>
                )}

                {/* Expertises */}
                {(selectedApplication.expertises || []).length > 0 && (
                  <PreviewSection title="Issues Addressed">
                    <div className="flex flex-wrap gap-2">{selectedApplication.expertises.map(e => <AdminStatusBadge key={e} status="neutral" label={e} />)}</div>
                  </PreviewSection>
                )}

                {/* Approaches */}
                {(selectedApplication.therapeuticApproaches || []).length > 0 && (
                  <PreviewSection title="Therapeutic Approaches">
                    <div className="flex flex-wrap gap-2">{selectedApplication.therapeuticApproaches.map(a => <AdminStatusBadge key={a} status="neutral" label={a} />)}</div>
                  </PreviewSection>
                )}

                {/* Qualifications */}
                {(selectedApplication.qualifications || []).length > 0 && (
                  <PreviewSection title="Qualifications">
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      {selectedApplication.qualifications.map((q, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: 'var(--color-primary-default)', flexShrink: 0 }} />
                          <span style={{ fontSize: 'var(--text-sm)' }}>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </PreviewSection>
                )}

                {/* Demographic Specialties */}
                {(selectedApplication.demographicSpecialties || []).length > 0 && (
                  <PreviewSection title="Works With">
                    <div className="flex flex-wrap gap-2">{selectedApplication.demographicSpecialties.map(d => <AdminStatusBadge key={d} status="neutral" label={d} />)}</div>
                  </PreviewSection>
                )}

                {/* Philosophy */}
                {selectedApplication.therapeuticPhilosophy && (
                  <PreviewSection title="Therapeutic Philosophy">
                    <p style={{ fontSize: 'var(--text-sm)', fontStyle: 'italic', lineHeight: 'var(--line-height-lg)' }}>"{selectedApplication.therapeuticPhilosophy}"</p>
                  </PreviewSection>
                )}

                {/* Session Modes */}
                {(selectedApplication.sessionModes || []).length > 0 && (
                  <PreviewSection title="Session Formats">
                    <div className="flex gap-2">{selectedApplication.sessionModes.map(m => <AdminStatusBadge key={m} status="neutral" label={m === 'online' ? 'Video Call' : m === 'call' ? 'Phone Call' : m} />)}</div>
                  </PreviewSection>
                )}

                {/* Availability */}
                {selectedApplication.availabilityPreferences && (
                  <PreviewSection title="Availability">
                    {selectedApplication.availabilityPreferences.workingHours && (
                      <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--spacing-2)' }}>Working Hours: {selectedApplication.availabilityPreferences.workingHours}</p>
                    )}
                    {(selectedApplication.availabilityPreferences.daysAvailable || []).length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {selectedApplication.availabilityPreferences.daysAvailable.map(d => (
                          <span key={d} style={{ padding: '2px 10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>{d.slice(0, 3)}</span>
                        ))}
                      </div>
                    )}
                    {selectedApplication.availabilityPreferences.weekendAvailability && (
                      <p className="flex items-center gap-1 mt-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-status-success)' }}>
                        <CheckCircle className="w-3 h-3" /> Available on weekends
                      </p>
                    )}
                  </PreviewSection>
                )}

                {/* FAQs */}
                {(selectedApplication.clientFAQs || []).length > 0 && (
                  <PreviewSection title={`FAQs (${selectedApplication.clientFAQs!.length})`}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                      {selectedApplication.clientFAQs!.map((faq, i) => (
                        <div key={i} style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-sm)' }}>
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 4 }}>Q: {faq.question}</p>
                          {faq.answer && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>A: {faq.answer}</p>}
                        </div>
                      ))}
                    </div>
                  </PreviewSection>
                )}

                {/* Testimonials */}
                {(selectedApplication.testimonials || []).length > 0 && (
                  <PreviewSection title={`Testimonials (${selectedApplication.testimonials!.length})`}>
                    {selectedApplication.testimonials!.map((t, i) => (
                      <div key={i} style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-accent-default)', marginBottom: 'var(--spacing-2)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>"{t.text}"</p>
                        {t.clientName && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>— {t.clientName}</p>}
                      </div>
                    ))}
                  </PreviewSection>
                )}

                {/* Video Intro */}
                {selectedApplication.videoIntroUrl && (
                  <PreviewSection title="Video Introduction">
                    <a href={selectedApplication.videoIntroUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-default)' }}>
                      <ExternalLink className="w-4 h-4" /> {selectedApplication.videoIntroUrl}
                    </a>
                  </PreviewSection>
                )}

                {/* Certificates */}
                {(selectedApplication.certificates || []).length > 0 && (
                  <PreviewSection title={`Certificates (${selectedApplication.certificates!.length})`}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      {selectedApplication.certificates!.map((cert, i) => (
                        <a key={i} href={cert} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-default)' }}>
                          <FileText className="w-4 h-4" /> Certificate {i + 1}
                        </a>
                      ))}
                    </div>
                  </PreviewSection>
                )}

                {/* Willing to share articles */}
                <PreviewSection title="Content Contribution">
                  <p style={{ fontSize: 'var(--text-sm)' }}>
                    {selectedApplication.willingToShareArticles ? '✓ Willing to share articles on iKan' : '✗ Not interested in sharing articles'}
                  </p>
                </PreviewSection>
              </div>

              {/* Actions */}
              {selectedApplication.status === 'pending_review' && (
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => { setRejectAppId(selectedApplication.id); setShowRejectDialog(true); }}
                    style={{ color: 'var(--color-status-danger)', borderColor: 'var(--color-status-danger)', gap: 'var(--spacing-2)' }} disabled={!!processingApp}>
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                  <Button onClick={() => handleApproveApp(selectedApplication.id)}
                    style={{ backgroundColor: 'var(--color-status-success)', color: 'var(--color-text-inverse)', gap: 'var(--spacing-2)' }} disabled={!!processingApp}>
                    <CheckCircle className="w-4 h-4" /> Approve & Publish
                  </Button>
                </DialogFooter>
              )}
              {selectedApplication.status === 'approved' && (
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-status-success-light)', borderRadius: 'var(--radius-md)' }}>
                  <p className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-status-success)', fontWeight: 500 }}>
                    <CheckCircle className="w-4 h-4" /> This application has been approved
                  </p>
                </div>
              )}
              {selectedApplication.status === 'rejected' && (
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-status-danger-light)', borderRadius: 'var(--radius-md)' }}>
                  <p className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-status-danger)', fontWeight: 500 }}>
                    <XCircle className="w-4 h-4" /> This application has been rejected
                  </p>
                  {selectedApplication.rejection_reason && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>Reason: {selectedApplication.rejection_reason}</p>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ Reject Confirmation Dialog ═══ */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 500 }}>Reject Application</DialogTitle>
            <DialogDescription>Please provide a reason for rejection (optional).</DialogDescription>
          </DialogHeader>
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <Label style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: 4, display: 'block' }}>Rejection Reason</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Incomplete credentials, unable to verify qualifications..."
              className="min-h-[80px]"
              style={{ borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectReason(''); setRejectAppId(null); }}>Cancel</Button>
            <Button onClick={handleRejectApp} disabled={!!processingApp}
              style={{ backgroundColor: 'var(--color-status-danger)', color: 'var(--color-text-inverse)', gap: 'var(--spacing-2)' }}>
              {processingApp ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Universal Link Dialog ═══ */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 500 }}>Universal Application Link</DialogTitle>
            <DialogDescription>Share this link with professionals. They can fill out the application form on their device.</DialogDescription>
          </DialogHeader>
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: 'var(--text-sm)', wordBreak: 'break-all' }}>
                {window.location.origin}/join/professional
              </div>
              <Button onClick={handleCopyLink} style={{ gap: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}>
                <Copy className="w-4 h-4" /> Copy
              </Button>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)', lineHeight: 'var(--line-height-lg)' }}>
              Applications submitted via this link will appear in the "Applications" tab above with a "Pending Review" status. You can then approve or reject them.
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Booking Dialog ═══ */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Book Consultation</DialogTitle></DialogHeader>
          <BookingCalendar professionalName={bookingProfessional?.name} onBookSlot={(date, time) => {
            showToast('success', 'Booking Confirmed', `Booked for ${date.toLocaleDateString()} at ${time}`);
            setIsBookingDialogOpen(false);
          }} />
          <DialogFooter><Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Helper: Preview Section ──
function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-2)' }}>
        {title}
      </h4>
      {children}
    </div>
  );
}