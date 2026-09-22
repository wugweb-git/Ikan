import { useState } from 'react';
import { Users, Plus, Star, FileText, Link2 } from 'lucide-react';
import { useNotifications } from '../../shared/state/NotificationContext';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { AdminLoading } from '../ui/kit/AdminLoading';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { copyToClipboard } from '../ui/lib/clipboard';
import { ConsultantEditPage } from './ConsultantEditPage';
import type { Consultant } from './consultant-form';
import { useConsultationData } from './useConsultationData';
import { ProfessionalsTable, ApplicationsTable } from './ConsultationTables';
import { ApplicationPreviewDialog } from './ApplicationPreviewDialog';
import { RejectApplicationDialog, ShareLinkDialog, BookingDialog, APPLICATION_LINK_PATH } from './ConsultationDialogs';

interface AdminConsultationManagerProps {
  onNavigate?: (path: string) => void;
}

type ViewMode = 'list' | 'edit' | 'create';
type Tab = 'professionals' | 'applications';

export function AdminConsultationManager({ onNavigate }: AdminConsultationManagerProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<Tab>('professionals');

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | undefined>();

  // Dialogs
  const [bookingProfessional, setBookingProfessional] = useState<Consultant | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectAppId, setRejectAppId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const data = useConsultationData({ listVisible: viewMode === 'list', applicationsTab: activeTab === 'applications' });
  const { professionals, applications } = data;

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(`${window.location.origin}${APPLICATION_LINK_PATH}`);
    if (ok) {
      showToast('success', 'Link Copied', 'Universal application link copied to clipboard.');
    } else {
      showToast('info', 'Copy Manually', 'Auto-copy is blocked in this environment. Please select the link text and copy it manually.');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Credentials', 'Category', 'Expertises', 'Available'].join(','),
      ...professionals.map(p => [p.name, p.credentials, p.category, (p.expertises || []).join('; '), p.available ? 'Yes' : 'No'].join(',')),
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

  const openReject = (appId: string) => { setRejectAppId(appId); setShowRejectDialog(true); };
  const closeReject = () => { setShowRejectDialog(false); setRejectReason(''); setRejectAppId(null); };
  const handleRejectApp = async () => {
    if (!rejectAppId) return;
    if (await data.rejectApplication(rejectAppId, rejectReason)) closeReject();
  };

  // ── Stats ──
  const pendingCount = applications.filter(a => a.status === 'pending_review').length;
  const stats = [
    { label: 'Total Professionals', value: professionals.length, icon: <Users className="w-4 h-4 text-[var(--color-primary-default)]" /> },
    { label: 'Available', value: professionals.filter(p => p.available).length, icon: <Star className="w-4 h-4 text-[var(--color-status-success)]" /> },
    { label: 'Avg Rating', value: (professionals.reduce((a, p) => a + (p.rating || 0), 0) / professionals.length || 0).toFixed(1), icon: <Star className="w-4 h-4 text-[var(--color-warning-default)]" /> },
    { label: 'Pending Apps', value: pendingCount, icon: <FileText className={`w-4 h-4 ${pendingCount > 0 ? 'text-[var(--color-status-warning)]' : 'text-[var(--color-info-default)]'}`} /> },
  ];

  // ── Edit/Create mode ──
  if (viewMode === 'edit' || viewMode === 'create') {
    return <ConsultantEditPage consultantId={selectedConsultantId} onBack={handleBackToList} onSave={handleBackToList} />;
  }

  return (
    <AdminPageLayout
      title="Consultation Manager"
      description="Manage professionals, review applications, and share the universal onboarding link"
      stats={stats}
      actions={
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowLinkDialog(true)} className="gap-2">
            <Link2 className="w-4 h-4" /> {!isMobile && 'Share Link'}
          </Button>
          <Button onClick={handleCreateNew} className="bg-[var(--color-primary-default)] text-[var(--color-primary-on)]">
            <Plus className="w-4 h-4 mr-2" />{!isMobile && 'Add Professional'}
          </Button>
        </div>
      }
      loading={data.loadingProfessionals && professionals.length === 0 && activeTab === 'professionals'}
      loadingFallback={<AdminLoading message="Loading professionals..." />}
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="professionals" className="font-medium text-sm">
            Professionals ({professionals.length})
          </TabsTrigger>
          <TabsTrigger value="applications" className="font-medium text-sm relative">
            Applications ({applications.length})
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-2 w-[18px] h-[18px] rounded-full bg-[var(--color-status-danger)] text-[var(--color-text-inverse)] text-[10px] font-medium flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="professionals">
          <ProfessionalsTable professionals={professionals} onEdit={handleEdit} onViewCalendar={handleViewCalendar} onExport={handleExport} />
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationsTable
            applications={applications}
            loading={data.loadingApplications}
            processingApp={data.processingApp}
            onView={data.openApplication}
            onApprove={data.approveApplication}
            onReject={openReject}
            onRefresh={data.reloadApplications}
            onCopyLink={handleCopyLink}
          />
        </TabsContent>
      </Tabs>

      <ApplicationPreviewDialog
        open={data.showAppPreview}
        onOpenChange={data.setShowAppPreview}
        application={data.selectedApplication}
        processing={!!data.processingApp}
        onApprove={data.approveApplication}
        onReject={openReject}
      />

      <RejectApplicationDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        processing={!!data.processingApp}
        onCancel={closeReject}
        onConfirm={handleRejectApp}
      />

      <ShareLinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onCopy={handleCopyLink}
        onPreview={() => { setShowLinkDialog(false); onNavigate?.(APPLICATION_LINK_PATH); }}
      />

      <BookingDialog
        open={isBookingDialogOpen}
        onOpenChange={setIsBookingDialogOpen}
        professionalName={bookingProfessional?.name}
        onBooked={(date, time) => {
          showToast('success', 'Booking Confirmed', `Booked for ${date.toLocaleDateString()} at ${time}`);
          setIsBookingDialogOpen(false);
        }}
      />
    </AdminPageLayout>
  );
}
