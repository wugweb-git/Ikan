import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../ui/utils';
import {
  CreditCard, Receipt, Check, Clock, X, RotateCcw, Download, ChevronDown, ChevronUp, Inbox,
} from 'lucide-react';

// ─── Font helper ──────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

interface Transaction {
  id: string;
  type: 'purchase' | 'refund';
  programId: string;
  programTitle: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  date: string;
  description?: string;
}

interface PaymentSummary {
  totalSpent: number;
  totalPrograms: number;
  activePrograms: number;
  completedPrograms: number;
}

interface PaymentHistoryProps {
  className?: string;
}

export function PaymentHistory({ className }: PaymentHistoryProps) {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    const timer = setTimeout(() => loadPaymentHistory(), 100);
    return () => clearTimeout(timer);
  }, [user, authLoading]);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const history = await apiClient.getPaymentHistory();

      setTransactions(history ?? []);

      // Compute summary from real data only — no fallbacks
      if (history && history.length > 0) {
        setSummary({
          totalSpent: history.reduce((sum: number, t: Transaction) => sum + (t.type === 'purchase' ? t.amount : 0), 0),
          totalPrograms: history.filter((t: Transaction) => t.type === 'purchase').length,
          activePrograms: history.filter((t: Transaction) => t.type === 'purchase' && t.status === 'completed').length,
          completedPrograms: 0,
        });
      } else {
        setSummary(null);
      }
    } catch (err: any) {
      console.error('Failed to load payment history:', err);
      setError('Unable to load billing information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount / 100);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'var(--color-status-success)';
      case 'pending': return 'var(--color-status-warning)';
      case 'failed': return 'var(--color-status-danger)';
      case 'refunded': return 'var(--color-text-muted)';
      default: return 'var(--color-text-muted)';
    }
  };

  const StatusIcon = ({ status }: { status: Transaction['status'] }) => {
    const size = 16;
    const color = getStatusColor(status);
    switch (status) {
      case 'completed': return <Check size={size} style={{ color }} />;
      case 'pending': return <Clock size={size} style={{ color }} />;
      case 'failed': return <X size={size} style={{ color }} />;
      case 'refunded': return <RotateCcw size={size} style={{ color }} />;
      default: return null;
    }
  };

  // ─── Loading skeleton ───────────────────────────────────────
  if (loading) {
    return (
      <div className={cn('', className)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <div className="animate-pulse" style={{ height: 100, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-muted)' }} />
        <div className="animate-pulse" style={{ height: 200, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-muted)' }} />
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div className={cn('', className)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <div style={{
          backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)', padding: '40px 20px',
          textAlign: 'center',
        }}>
          <Receipt size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
          <div style={f('sm', 500, 'var(--color-status-danger)')}>{error}</div>
          <button
            onClick={loadPaymentHistory}
            style={{
              marginTop: 16, padding: '8px 20px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-card)',
              cursor: 'pointer', ...f('sm', 500),
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Empty state (no transactions in KV) ────────────────────
  if (transactions.length === 0) {
    return (
      <div className={cn('', className)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <div style={{
          backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)', padding: '48px 20px',
          textAlign: 'center',
        }}>
          <Inbox size={44} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
          <div style={f('base', 500)}>No billing history</div>
          <div style={{ ...f('sm', 400, 'var(--color-text-muted)'), marginTop: 4, lineHeight: 1.5 }}>
            When you purchase programs, your transactions will appear here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('', className)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>

      {/* ═══ SUMMARY ═══ */}
      {summary && (
        <section>
          <div style={{ ...f('xs', 500, 'var(--color-text-muted)'), textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Overview
          </div>
          <div style={{
            backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-default)', overflow: 'hidden',
          }}>
            <div className={cn('grid', isMobile ? 'grid-cols-2' : 'grid-cols-4')} style={{ gap: 0 }}>
              {[
                { label: 'Total Spent', value: formatAmount(summary.totalSpent, 'INR'), color: 'var(--color-primary-default)' },
                { label: 'Programs', value: String(summary.totalPrograms), color: 'var(--color-primary-default)' },
                { label: 'Active', value: String(summary.activePrograms), color: 'var(--color-status-info)' },
                { label: 'Completed', value: String(summary.completedPrograms), color: 'var(--color-status-success)' },
              ].map((stat, i) => (
                <div key={stat.label} style={{
                  padding: '20px 16px', textAlign: 'center',
                  borderRight: (isMobile ? i % 2 === 0 : i < 3) ? '1px solid var(--color-border-default)' : 'none',
                  borderBottom: isMobile && i < 2 ? '1px solid var(--color-border-default)' : 'none',
                }}>
                  <div style={{ ...f('xl', 500, stat.color) }}>{stat.value}</div>
                  <div style={{ ...f('xs', 400, 'var(--color-text-muted)'), marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ TRANSACTION HISTORY ═══ */}
      <section>
        <div style={{ ...f('xs', 500, 'var(--color-text-muted)'), textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Transactions
        </div>
        <div style={{
          backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)', overflow: 'hidden',
        }}>
          {transactions.map((txn, i) => {
            const isExpanded = expandedId === txn.id;
            const isLast = i === transactions.length - 1;

            return (
              <div key={txn.id} style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-border-default)' }}>
                {/* Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : txn.id)}
                  style={{
                    width: '100%', padding: '16px 20px', border: 'none', background: 'transparent',
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                  }}
                >
                  <div className="flex items-center" style={{ gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      backgroundColor: 'var(--color-bg-muted)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <StatusIcon status={txn.status} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="truncate" style={f('sm', 500)}>{txn.programTitle}</div>
                      <div style={{ ...f('xs', 400, 'var(--color-text-muted)'), marginTop: 2 }}>
                        {formatDate(txn.date)} · {txn.paymentMethod}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div>
                        <div style={f('sm', 500, txn.type === 'refund' ? 'var(--color-status-success)' : 'var(--color-text-primary)')}>
                          {txn.type === 'refund' ? '+' : ''}{formatAmount(txn.amount, txn.currency)}
                        </div>
                        <Badge style={{
                          backgroundColor: txn.status === 'completed' ? 'var(--color-status-success-light)' : 'var(--color-bg-muted)',
                          color: getStatusColor(txn.status), textTransform: 'capitalize', fontSize: 10,
                        }}>
                          {txn.status}
                        </Badge>
                      </div>
                      {isExpanded
                        ? <ChevronUp size={14} style={{ color: 'var(--color-text-muted)' }} />
                        : <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 12,
                  }}>
                    <div style={{
                      padding: 16, borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-muted)',
                    }}>
                      <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
                        <div>
                          <div style={f('xs', 500, 'var(--color-text-muted)')}>Transaction ID</div>
                          <div style={{ ...f('sm', 400), marginTop: 2 }}>{txn.transactionId}</div>
                        </div>
                        <div>
                          <div style={f('xs', 500, 'var(--color-text-muted)')}>Program ID</div>
                          <div style={{ ...f('sm', 400), marginTop: 2 }}>{txn.programId}</div>
                        </div>
                      </div>
                      {txn.description && (
                        <div style={{ marginTop: 12 }}>
                          <div style={f('xs', 500, 'var(--color-text-muted)')}>Description</div>
                          <div style={{ ...f('sm', 400), marginTop: 2 }}>{txn.description}</div>
                        </div>
                      )}
                    </div>
                    <div className={cn('flex', isMobile ? 'flex-col gap-2' : 'gap-2')}>
                      <button
                        onClick={() => showToast('info', 'Receipt', `Receipt for ${txn.programTitle} will be sent to your email`)}
                        className="flex items-center justify-center"
                        style={{
                          padding: '8px 16px', borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border-default)',
                          backgroundColor: 'var(--color-bg-card)', cursor: 'pointer',
                          gap: 6, ...f('sm', 500),
                        }}
                      >
                        <Download size={14} /> Download Receipt
                      </button>
                      {txn.status === 'completed' && txn.type === 'purchase' && (
                        <button
                          onClick={() => showToast('info', 'Refund', `Refund request for ${txn.programTitle} has been submitted`)}
                          className="flex items-center justify-center"
                          style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border-default)',
                            backgroundColor: 'var(--color-bg-card)', cursor: 'pointer',
                            gap: 6, ...f('sm', 500),
                          }}
                        >
                          <RotateCcw size={14} /> Request Refund
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
