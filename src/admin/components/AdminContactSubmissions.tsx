import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { apiClient } from '../../shared/api-client';
import {
  Mail,
  Inbox,
  CircleCheck,
  Archive,
  Trash2,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Clock,
  User,
  Send,
  Eye,
} from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { AdminLoading } from './AdminLoading';
import { AdminStatusBadge, type StatusVariant } from './AdminStatusBadge';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  submitted_at: string;
  updated_at?: string;
  adminNotes?: string;
}

interface NewsletterSubscriber {
  email: string;
  name: string;
  subscribedAt: string;
  status: string;
  source: string;
}

interface AdminContactSubmissionsProps {
  onBack?: () => void;
}

type TabType = 'submissions' | 'newsletter';

const STATUS_OPTIONS: { value: string; label: string; variant: StatusVariant }[] = [
  { value: 'new', label: 'New', variant: 'info' },
  { value: 'read', label: 'Read', variant: 'warning' },
  { value: 'replied', label: 'Replied', variant: 'success' },
  { value: 'archived', label: 'Archived', variant: 'neutral' },
];

export function AdminContactSubmissions({ onBack }: AdminContactSubmissionsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('submissions');
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await apiClient.getContactSubmissions();
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error('Error fetching contact submissions:', err);
    }
  }, []);

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await apiClient.getNewsletterSubscribers();
      setSubscribers(res.subscribers || []);
    } catch (err) {
      console.error('Error fetching newsletter subscribers:', err);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSubmissions(), fetchSubscribers()]);
    setLoading(false);
  }, [fetchSubmissions, fetchSubscribers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    if (!confirm('Are you sure you want to delete this submission?')) return;
    setActionLoading(id);
    try {
      await apiClient.deleteContactSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error('Error deleting submission:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSubmissions =
    statusFilter === 'all' ? submissions : submissions.filter((s) => s.status === statusFilter);

  const newCount = submissions.filter((s) => s.status === 'new').length;

  if (loading) return <AdminLoading message="Loading submissions..." />;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Contact & Newsletter"
        description="Manage contact form submissions and newsletter subscribers"
        onBack={onBack}
        stats={[
          {
            label: 'Total Submissions',
            value: submissions.length,
            icon: <Inbox className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />,
          },
          {
            label: 'New / Unread',
            value: newCount,
            icon: <Mail className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />,
            trend: newCount > 0 ? 'up' : 'neutral',
          },
          {
            label: 'Replied',
            value: submissions.filter((s) => s.status === 'replied').length,
            icon: <Send className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} />,
          },
          {
            label: 'Newsletter Subs',
            value: subscribers.length,
            icon: <MessageSquare className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />,
          },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            style={{ borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' as any }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Tabs */}
      <div
        className="flex gap-1 p-1"
        style={{ backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)' }}
      >
        {(['submissions', 'newsletter'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 px-4 transition-all"
            style={{
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)' as any,
              backgroundColor: activeTab === tab ? 'var(--color-bg-card)' : 'transparent',
              color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {tab === 'submissions' ? `Contact Submissions (${submissions.length})` : `Newsletter (${subscribers.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Status filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                fontWeight: 'var(--font-weight-medium)' as any,
              }}
            >
              Filter:
            </span>
            <button
              onClick={() => setStatusFilter('all')}
              className="px-3 py-1 transition-colors"
              style={{
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-medium)' as any,
                backgroundColor: statusFilter === 'all' ? 'var(--color-primary-default)' : 'var(--color-bg-muted)',
                color: statusFilter === 'all' ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              All ({submissions.length})
            </button>
            {STATUS_OPTIONS.map((opt) => {
              const count = submissions.filter((s) => s.status === opt.value).length;
              return (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className="px-3 py-1 transition-colors"
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-medium)' as any,
                    backgroundColor: statusFilter === opt.value ? 'var(--color-primary-default)' : 'var(--color-bg-muted)',
                    color: statusFilter === opt.value ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Submission list */}
          {filteredSubmissions.length === 0 ? (
            <Card
              className="p-8 text-center"
              style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}
            >
              <Inbox className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 'var(--font-weight-regular)' as any,
                }}
              >
                {statusFilter === 'all' ? 'No contact submissions yet.' : `No ${statusFilter} submissions.`}
              </p>
            </Card>
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
            <Card
              className="p-8 text-center"
              style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}
            >
              <Mail className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 'var(--font-weight-regular)' as any,
                }}
              >
                No newsletter subscribers yet.
              </p>
            </Card>
          ) : (
            <Card
              style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', overflow: 'hidden' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                      {['Email', 'Name', 'Source', 'Subscribed'].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3"
                          style={{
                            fontFamily: 'var(--font-family-base)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-weight-medium)' as any,
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr
                        key={sub.email}
                        style={{ borderTop: '1px solid var(--color-border-default)' }}
                      >
                        <td
                          className="px-4 py-3"
                          style={{
                            fontFamily: 'var(--font-family-base)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-primary)',
                            fontWeight: 'var(--font-weight-regular)' as any,
                          }}
                        >
                          <a
                            href={`mailto:${sub.email}`}
                            style={{ color: 'var(--color-text-primary)', textDecoration: 'underline' }}
                          >
                            {sub.email}
                          </a>
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{
                            fontFamily: 'var(--font-family-base)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-primary)',
                            fontWeight: 'var(--font-weight-regular)' as any,
                          }}
                        >
                          {sub.name || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <AdminStatusBadge status="neutral" label={sub.source || 'web'} />
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{
                            fontFamily: 'var(--font-family-base)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-muted)',
                            fontWeight: 'var(--font-weight-regular)' as any,
                          }}
                        >
                          {formatDate(sub.subscribedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── Submission Card ──────────────────────────────────────────────

function SubmissionCard({
  submission,
  expanded,
  onToggle,
  onStatusChange,
  onDelete,
  isLoading,
}: {
  submission: ContactSubmission;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}) {
  const statusVariant: StatusVariant =
    submission.status === 'new'
      ? 'info'
      : submission.status === 'read'
      ? 'warning'
      : submission.status === 'replied'
      ? 'success'
      : 'neutral';

  return (
    <Card
      style={{
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${submission.status === 'new' ? 'var(--color-info-default)' : 'var(--color-border-default)'}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        onClick={() => {
          onToggle();
          if (submission.status === 'new') {
            onStatusChange(submission.id, 'read');
          }
        }}
        className="w-full flex items-center gap-3 p-4 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)' as any,
                color: 'var(--color-text-primary)',
              }}
            >
              {submission.subject}
            </span>
            <AdminStatusBadge status={statusVariant} label={submission.status} dot />
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
              <User className="w-3 h-3" />
              {submission.name}
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
              <Mail className="w-3 h-3" />
              {submission.email}
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
              <Clock className="w-3 h-3" />
              {formatDate(submission.submitted_at)}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div
          className="px-4 pb-4 pt-0 space-y-4"
          style={{ borderTop: '1px solid var(--color-border-default)' }}
        >
          {/* Message */}
          <div
            className="p-4 mt-4"
            style={{
              backgroundColor: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                fontWeight: 'var(--font-weight-regular)' as any,
                lineHeight: 'var(--line-height-base)',
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {submission.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {submission.status !== 'read' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(submission.id, 'read')}
                disabled={isLoading}
                style={{ borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' as any }}
              >
                <Eye className="w-4 h-4 mr-1" />
                Mark Read
              </Button>
            )}
            {submission.status !== 'replied' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(submission.id, 'replied')}
                disabled={isLoading}
                style={{ borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' as any }}
              >
                <CircleCheck className="w-4 h-4 mr-1" />
                Mark Replied
              </Button>
            )}
            {submission.status !== 'archived' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(submission.id, 'archived')}
                disabled={isLoading}
                style={{ borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' as any }}
              >
                <Archive className="w-4 h-4 mr-1" />
                Archive
              </Button>
            )}
            <a
              href={`mailto:${submission.email}?subject=Re: ${encodeURIComponent(submission.subject)}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)' as any,
                color: 'var(--color-primary-on)',
                backgroundColor: 'var(--color-primary-default)',
                textDecoration: 'none',
              }}
            >
              <Send className="w-4 h-4" />
              Reply via Email
            </a>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(submission.id)}
              disabled={isLoading}
              style={{
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-status-danger)',
                fontFamily: 'var(--font-family-base)',
                fontWeight: 'var(--font-weight-medium)' as any,
              }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = diffMs / (1000 * 60 * 60);

    if (diffH < 1) return `${Math.max(1, Math.round(diffMs / 60000))}m ago`;
    if (diffH < 24) return `${Math.round(diffH)}h ago`;
    if (diffH < 48) return 'Yesterday';

    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}