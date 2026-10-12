import { Star, MapPin, Calendar as CalendarIcon, MoreHorizontal, CircleCheck, CircleX, Eye, Briefcase, Languages, Pencil, Download, Clock, FileText, Mail, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { AdminStatusBadge, resolveStatusVariant } from '../ui/kit/AdminStatusBadge';
import { AdminDataTable, type Column, type FilterOption } from '../ui/kit/AdminDataTable';
import { AdminEmptyState } from '../ui/kit/AdminEmptyState';
import { AdminLoading } from '../ui/kit/AdminLoading';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { useMetadata } from '../ui/hooks/useMetadata';
import type { Consultant } from './consultant-form';
import type { ApplicationSummary } from './useConsultationData';

const MUTED_XS = 'text-xs text-[var(--color-text-muted)]';
const SMALL_ACTION = 'gap-1 h-[var(--ikan-component-button-height-sm)] text-xs';

// ── Professionals ──────────────────────────────────────────────────

interface ProfessionalsTableProps {
  professionals: Consultant[];
  onEdit: (id: string) => void;
  onViewCalendar: (p: Consultant) => void;
  onExport: () => void;
}

export function ProfessionalsTable({ professionals, onEdit, onViewCalendar, onExport }: ProfessionalsTableProps) {
  const isMobile = useIsMobile();
  const { consultantTypes } = useMetadata();

  const columns: Column<Consultant>[] = [
    {
      header: 'Professional', accessorKey: 'name', sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[var(--color-bg-muted)]">
            {p.photo ? <img src={p.photo} alt={p.name} className="w-full h-full object-cover" /> :
              <div className="w-full h-full flex items-center justify-center bg-[var(--color-accent-default)] text-[var(--color-text-primary)] font-medium">{p.name.charAt(0)}</div>}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{p.name}</span>
            <span className={MUTED_XS}>{p.credentials}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Category', accessorKey: 'category', sortable: true,
      render: (p) => <AdminStatusBadge status="neutral" label={p.category} />,
    },
    {
      header: 'Created', accessorKey: 'created_at', sortable: true,
      render: (p) => <span className="text-sm text-[var(--color-text-muted)]">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</span>,
    },
    {
      header: 'Status', accessorKey: 'available', sortable: true,
      render: (p) => (
        <AdminStatusBadge status={p.available ? 'success' : 'neutral'} label={p.available ? 'Available' : 'Unavailable'} dot />
      ),
    },
    {
      header: 'Details',
      render: (p) => (
        <div className={`flex flex-col gap-1 ${MUTED_XS}`}>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.location}</span>
          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-[var(--color-rating-star)] fill-[var(--color-rating-star)]" /> {p.rating?.toFixed(1) || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Actions', className: 'text-right',
      render: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewCalendar(p); }}><CalendarIcon className="mr-2 h-4 w-4" /> View Calendar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(p.id); }}><Pencil className="mr-2 h-4 w-4" /> Edit Profile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filters: FilterOption[] = [
    { key: 'category', label: 'Category', options: consultantTypes.map(ct => ({ label: ct.label, value: ct.value })) },
  ];

  return (
    <AdminDataTable
      columns={columns} data={professionals}
      searchKeys={['name', 'credentials', 'category', 'location']}
      filters={filters} searchPlaceholder="Search professionals..."
      onRowClick={(item) => onEdit(item.id)}
      actions={
        <Button variant="outline" onClick={onExport} className="gap-2">
          <Download className="w-4 h-4" />{!isMobile && 'Export'}
        </Button>
      }
    />
  );
}

// ── Applications ───────────────────────────────────────────────────

const APP_FILTERS: FilterOption[] = [
  { key: 'status', label: 'Status', options: [
    { label: 'Pending Review', value: 'pending_review' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' },
  ] },
];

interface ApplicationsTableProps {
  applications: ApplicationSummary[];
  loading: boolean;
  processingApp: string | null;
  onView: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRefresh: () => void;
  onCopyLink: () => void;
}

export function ApplicationsTable({ applications, loading, processingApp, onView, onApprove, onReject, onRefresh, onCopyLink }: ApplicationsTableProps) {
  const isMobile = useIsMobile();

  if (loading) return <AdminLoading message="Loading applications..." />;
  if (applications.length === 0) {
    return (
      <AdminEmptyState
        title="No Applications Yet"
        description="Share the partner application link with therapists and practitioners to start receiving applications."
        icon={<FileText className="w-12 h-12 text-[var(--color-text-muted)]" />}
        action={{ label: 'Copy Application Link', onClick: onCopyLink }}
      />
    );
  }

  const columns: Column<ApplicationSummary>[] = [
    {
      header: 'Applicant', accessorKey: 'name', sortable: true,
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{a.name}</span>
          <span className={MUTED_XS}>{a.credentials}</span>
          {a.email && <a href={`mailto:${a.email}`} onClick={(e) => e.stopPropagation()} className={`${MUTED_XS} flex items-center gap-1 hover:underline`}><Mail className="w-3 h-3" /> {a.email}</a>}
          {a.phone && <a href={`tel:${a.phone.replace(/[^\d+]/g, '')}`} onClick={(e) => e.stopPropagation()} className={`${MUTED_XS} flex items-center gap-1 hover:underline`}><Phone className="w-3 h-3" /> {a.phone}</a>}
        </div>
      ),
    },
    {
      header: 'Category', accessorKey: 'category', sortable: true,
      render: (a) => <AdminStatusBadge status="neutral" label={a.category || 'Therapist'} />,
    },
    {
      header: 'Details',
      render: (a) => {
        const langs = a.languages || [];
        return (
          <div className={`flex flex-col gap-1 ${MUTED_XS}`}>
            {a.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.location}</span>}
            {a.yearsExperience !== undefined && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {a.yearsExperience}+ yrs</span>}
            {langs.length > 0 && <span className="flex items-center gap-1"><Languages className="w-3 h-3" /> {langs.slice(0, 2).join(', ')}{langs.length > 2 ? ` +${langs.length - 2}` : ''}</span>}
          </div>
        );
      },
    },
    {
      header: 'Submitted', accessorKey: 'submitted_at', sortable: true,
      render: (a) => (
        <div className="flex flex-col">
          <span className="text-sm text-[var(--color-text-primary)]">{new Date(a.submitted_at).toLocaleDateString()}</span>
          <span className={MUTED_XS}>{new Date(a.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      ),
    },
    {
      header: 'Status', accessorKey: 'status', sortable: true,
      render: (a) => <AdminStatusBadge status={resolveStatusVariant(a.status)} label={a.status.replace('_', ' ')} />,
    },
    {
      header: 'Actions', className: 'text-right',
      render: (a) => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onView(a.id); }} className={SMALL_ACTION}>
            <Eye className="w-3 h-3" /> View
          </Button>
          {a.status === 'pending_review' && (
            <>
              <Button size="sm" onClick={(e) => { e.stopPropagation(); onApprove(a.id); }} disabled={processingApp === a.id}
                className={`${SMALL_ACTION} bg-[var(--color-status-success)] text-[var(--color-text-inverse)]`}>
                <CircleCheck className="w-3 h-3" /> Approve
              </Button>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onReject(a.id); }}
                className={`${SMALL_ACTION} text-[var(--color-status-danger)] border-[var(--color-status-danger)]`}>
                <CircleX className="w-3 h-3" /> Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      columns={columns} data={applications}
      searchKeys={['name', 'email', 'phone', 'credentials', 'category', 'location']}
      filters={APP_FILTERS} searchPlaceholder="Search applications..."
      onRowClick={(item) => onView(item.id)}
      actions={
        <Button variant="outline" onClick={onRefresh} className="gap-2">
          <Clock className="w-4 h-4" />{!isMobile && 'Refresh'}
        </Button>
      }
    />
  );
}
