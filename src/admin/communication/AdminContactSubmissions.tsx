import { useState, type ReactNode } from 'react';
import { Mail, Inbox, RefreshCw, MessageSquare, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { apiClient } from '../../shared/api/api';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { AdminLoading } from '../ui/kit/AdminLoading';
import { AdminStatusBadge } from '../ui/kit/AdminStatusBadge';
import { AdminDataTable, type Column } from '../ui/kit/AdminDataTable';
import { useConfirm } from '../ui/kit/ConfirmDialog';
import { useAdminResource } from '../ui/hooks/useAdminResource';
import { cn } from '../ui/utils';
import {
  STATUS_OPTIONS, SubmissionCard, formatDate,
  type ContactSubmission, type NewsletterSubscriber,
} from './ContactSubmissionCard';

type TabType = 'submissions' | 'newsletter';

interface ContactData {
  submissions: ContactSubmission[];
  subscribers: NewsletterSubscriber[];
}

const FILTER_PILL = 'px-3 py-1 transition-colors rounded-sm text-xs font-medium border-none cursor-pointer';
const PILL_ON = 'bg-[var(--color-primary-default)] text-[var(--color-primary-on)]';
const PILL_OFF = 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]';

const SUBSCRIBER_COLUMNS: Column<NewsletterSubscriber>[] = [
  {
    header: 'Email',
    render: (sub) => (
      <a href={`mailto:${sub.email}`} className="text-sm text-[var(--color-text-primary)] underline">{sub.email}</a>
    ),
  },
  { header: 'Name', render: (sub) => <span className="text-sm text-[var(--color-text-primary)]">{sub.name || '—'}</span> },
  { header: 'Source', render: (sub) => <AdminStatusBadge status="neutral" label={sub.source || 'web'} /> },
  { header: 'Subscribed', render: (sub) => <span className="text-sm text-[var(--color-text-muted)]">{formatDate(sub.subscribedAt)}</span> },
];

function EmptyCard({ icon, message }: { icon: ReactNode; message: string }) {
  return (
    <Card className="p-8 text-center rounded-lg border border-[var(--color-border-default)]">
      {icon}
      <p className="text-base text-[var(--color-text-muted)]">{message}</p>
    </Card>
  );
}

export function AdminContactSubmissions() {
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState<TabType>('submissions');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, setData, loading, error, reload } = useAdminResource<ContactData>(
    async () => {
      const [subsRes, newsRes] = await Promise.all([
        apiClient.getContactSubmissions(),
        apiClient.getNewsletterSubscribers(),
      ]);
      return { submissions: subsRes.submissions || [], subscribers: newsRes.subscribers || [] };
    },
    { initialData: { submissions: [], subscribers: [] }, toastOnError: false, errorTitle: 'Failed to load submissions' },
  );
  const { submissions, subscribers } = data;

  const setSubmissions = (update: (prev: ContactSubmission[]) => ContactSubmission[]) =>
    setData(prev => ({ ...prev, submissions: update(prev.submissions) }));

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await apiClient.updateContactSubmission(id, { status: newStatus });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus, updated_at: new Date().toISOString() } : s))
      );
    } catch (err) {
      console.error('Error updating submission status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Are you sure you want to delete this submission?',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    setActionLoading(id);
    try {
      await apiClient.deleteContactSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setExpandedId((cur) => (cur === id ? null : cur));
    } catch (err) {
      console.error('Error deleting submission:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSubmissions =
    statusFilter === 'all' ? submissions : submissions.filter((s) => s.status === statusFilter);

  const newCount = submissions.filter((s) => s.status === 'new').length;

  return (
    <AdminPageLayout
      title="Contact & Newsletter"
      description="Manage contact form submissions and newsletter subscribers"
      maxWidth="none"
      loading={loading}
      loadingFallback={<AdminLoading message="Loading submissions..." />}
      error={error}
      onRetry={reload}
      stats={[
        {
          label: 'Total Submissions',
          value: submissions.length,
          icon: <Inbox className="w-4 h-4 text-[var(--color-text-muted)]" />,
        },
        {
          label: 'New / Unread',
          value: newCount,
          icon: <Mail className="w-4 h-4 text-[var(--color-status-info)]" />,
          trend: newCount > 0 ? 'up' : 'neutral',
        },
        {
          label: 'Replied',
          value: submissions.filter((s) => s.status === 'replied').length,
          icon: <Send className="w-4 h-4 text-[var(--color-status-success)]" />,
        },
        {
          label: 'Newsletter Subs',
          value: subscribers.length,
          icon: <MessageSquare className="w-4 h-4 text-[var(--color-text-muted)]" />,
        },
      ]}
      actions={
        <Button variant="outline" size="sm" onClick={() => { void reload(); }} className="rounded-md!">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-md bg-[var(--color-bg-muted)]">
        {(['submissions', 'newsletter'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2 px-4 transition-all rounded-sm text-sm font-medium border-none cursor-pointer',
              activeTab === tab
                ? 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]'
                : 'bg-transparent text-[var(--color-text-muted)] shadow-none',
            )}
          >
            {tab === 'submissions' ? `Contact Submissions (${submissions.length})` : `Newsletter (${subscribers.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Status filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">Filter:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(FILTER_PILL, statusFilter === 'all' ? PILL_ON : PILL_OFF)}
            >
              All ({submissions.length})
            </button>
            {STATUS_OPTIONS.map((opt) => {
              const count = submissions.filter((s) => s.status === opt.value).length;
              return (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(FILTER_PILL, statusFilter === opt.value ? PILL_ON : PILL_OFF)}
                >
                  {opt.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Submission list */}
          {filteredSubmissions.length === 0 ? (
            <EmptyCard
              icon={<Inbox className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-muted)]" />}
              message={statusFilter === 'all' ? 'No contact submissions yet.' : `No ${statusFilter} submissions.`}
            />
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  expanded={expandedId === submission.id}
                  onToggle={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  isLoading={actionLoading === submission.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'newsletter' && (
        <div className="space-y-4">
          {subscribers.length === 0 ? (
            <EmptyCard
              icon={<Mail className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-muted)]" />}
              message="No newsletter subscribers yet."
            />
          ) : (
            <AdminDataTable
              columns={SUBSCRIBER_COLUMNS}
              data={subscribers}
              getRowKey={(sub) => sub.email}
              showToolbar={false}
              paginate={false}
              mobileLayout="table"
            />
          )}
        </div>
      )}
    </AdminPageLayout>
  );
}
