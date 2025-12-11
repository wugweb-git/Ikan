import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Icon } from '../Icon';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../ui/utils';

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
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    totalSpent: 0,
    totalPrograms: 0,
    activePrograms: 0,
    completedPrograms: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    // Add delay to prevent immediate loading issues
    const timer = setTimeout(() => {
      loadPaymentHistory();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const loadPaymentHistory = async () => {
    try {
      // Use mock data to avoid API timeout issues for now
      console.log('Loading payment history (using mock data)');
      
      // Mock data for demo
      const mockTransactions: Transaction[] = [
        {
          id: 'txn_001',
          type: 'purchase',
          programId: 'equip-burnout-32',
          programTitle: 'Burnout Recovery Program',
          amount: 49900, // in cents
          currency: 'INR',
          status: 'completed',
          paymentMethod: 'Razorpay - UPI',
          transactionId: 'pay_NyJONOPe5UF5xE',
          date: '2024-01-15T10:30:00Z',
          description: '32-day comprehensive burnout recovery program'
        },
        {
          id: 'txn_002',
          type: 'purchase',
          programId: 'equip-mindfulness-8week',
          programTitle: '8-Week Mindfulness Course',
          amount: 39900,
          currency: 'INR',
          status: 'completed',
          paymentMethod: 'Razorpay - Credit Card',
          transactionId: 'pay_MxKLMNOp3TG2vH',
          date: '2024-01-10T15:45:00Z',
          description: 'Evidence-based mindfulness training program'
        },
        {
          id: 'txn_003',
          type: 'purchase',
          programId: 'equip-anxiety-management',
          programTitle: 'Anxiety Management Toolkit',
          amount: 29900,
          currency: 'INR',
          status: 'completed',
          paymentMethod: 'Razorpay - Debit Card',
          transactionId: 'pay_LvQRSTuv4WX8yZ',
          date: '2024-01-05T12:20:00Z',
          description: 'Comprehensive anxiety management strategies'
        }
      ];

      const mockSummary: PaymentSummary = {
        totalSpent: mockTransactions.reduce((sum, t) => sum + (t.type === 'purchase' ? t.amount : 0), 0),
        totalPrograms: mockTransactions.filter(t => t.type === 'purchase').length,
        activePrograms: 2,
        completedPrograms: 1
      };

      setTransactions(mockTransactions);
      setSummary(mockSummary);
    } catch (error) {
      console.error('Failed to load payment history:', error);
      showToast('error', 'Error', 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'var(--color-status-success)';
      case 'pending':
        return 'var(--color-status-warning)';
      case 'failed':
        return 'var(--color-status-danger)';
      case 'refunded':
        return 'var(--color-text-muted)';
      default:
        return 'var(--color-text-muted)';
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'check';
      case 'pending':
        return 'clock';
      case 'failed':
        return 'x';
      case 'refunded':
        return 'rotate-ccw';
      default:
        return 'circle';
    }
  };

  const handleDownloadReceipt = (transaction: Transaction) => {
    // In real app, this would download or generate a receipt
    showToast('info', 'Receipt', `Receipt for ${transaction.programTitle} will be sent to your email`);
  };

  const handleRequestRefund = (transaction: Transaction) => {
    // In real app, this would open a refund request flow
    showToast('info', 'Refund Request', `Refund request for ${transaction.programTitle} has been submitted`);
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="creditCard" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
          )}>
            <div className="text-center">
              <div 
                style={{ 
                  fontSize: 'var(--text-2xl)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-primary-default)'
                }}
              >
                {formatAmount(summary.totalSpent, 'INR')}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Total Spent
              </p>
            </div>
            <div className="text-center">
              <div 
                style={{ 
                  fontSize: 'var(--text-2xl)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-primary-default)'
                }}
              >
                {summary.totalPrograms}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Programs Purchased
              </p>
            </div>
            <div className="text-center">
              <div 
                style={{ 
                  fontSize: 'var(--text-2xl)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-status-info)'
                }}
              >
                {summary.activePrograms}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Active Programs
              </p>
            </div>
            <div className="text-center">
              <div 
                style={{ 
                  fontSize: 'var(--text-2xl)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-status-success)'
                }}
              >
                {summary.completedPrograms}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Completed Programs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="receipt" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="receipt" size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>
                No transactions found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <div 
                    className={cn(
                      "flex items-center justify-between rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors",
                      isMobile ? "p-3" : "p-4"
                    )}
                    onClick={() => setSelectedTransaction(selectedTransaction?.id === transaction.id ? null : transaction)}
                    style={{
                      borderRadius: 'var(--ikan-component-border-radius)',
                      minHeight: isMobile ? 'var(--ikan-touch-target-preferred)' : 'auto'
                    }}
                  >
                    <div className={cn(
                      "flex items-center flex-1",
                      isMobile ? "gap-3" : "gap-4"
                    )}>
                      <div className={cn(
                        "flex items-center justify-center rounded-full bg-gray-100",
                        isMobile ? "w-8 h-8" : "w-10 h-10"
                      )}>
                        <Icon 
                          name={getStatusIcon(transaction.status)} 
                          size={isMobile ? 16 : 20} 
                          style={{ color: getStatusColor(transaction.status) }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h4 
                          style={{ 
                            fontSize: 'var(--text-base)', 
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          {transaction.programTitle}
                        </h4>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                          {formatDate(transaction.date)} • {transaction.paymentMethod}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div 
                          style={{ 
                            fontSize: 'var(--text-lg)', 
                            fontWeight: 'var(--font-weight-medium)',
                            color: transaction.type === 'purchase' ? 'var(--color-text-primary)' : 'var(--color-status-success)'
                          }}
                        >
                          {transaction.type === 'refund' ? '+' : ''}{formatAmount(transaction.amount, transaction.currency)}
                        </div>
                        <Badge 
                          variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          style={{ 
                            backgroundColor: transaction.status === 'completed' ? 'var(--color-status-success-light)' : 'var(--color-bg-muted)',
                            color: getStatusColor(transaction.status),
                            textTransform: 'capitalize'
                          }}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <Icon 
                      name={selectedTransaction?.id === transaction.id ? "chevronUp" : "chevronDown"} 
                      size={16} 
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  </div>

                  {/* Expanded Transaction Details */}
                  {selectedTransaction?.id === transaction.id && (
                    <div 
                      className="mt-2 p-4 bg-gray-50 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-bg-muted)' }}
                    >
                      <div className={cn(
                        "grid gap-4 mb-4",
                        isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                      )}>
                        <div>
                          <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                            Transaction ID
                          </h5>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                            {transaction.transactionId}
                          </p>
                        </div>
                        <div>
                          <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                            Program ID
                          </h5>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                            {transaction.programId}
                          </p>
                        </div>
                      </div>
                      
                      {transaction.description && (
                        <div className="mb-4">
                          <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                            Description
                          </h5>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                            {transaction.description}
                          </p>
                        </div>
                      )}
                      
                      <div className={cn(
                        "flex",
                        isMobile ? "flex-col gap-3" : "flex-row gap-2"
                      )}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReceipt(transaction)}
                          className="gap-2"
                          style={{
                            height: 'var(--ikan-component-button-height)',
                            borderRadius: 'var(--ikan-component-border-radius)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-medium)'
                          }}
                        >
                          <Icon name="download" size={14} />
                          Download Receipt
                        </Button>
                        
                        {transaction.status === 'completed' && transaction.type === 'purchase' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestRefund(transaction)}
                            className="gap-2"
                            style={{
                              height: 'var(--ikan-component-button-height)',
                              borderRadius: 'var(--ikan-component-border-radius)',
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--font-weight-medium)'
                            }}
                          >
                            <Icon name="rotateLeft" size={14} />
                            Request Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {index < transactions.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Icon name="help" size={20} style={{ color: 'var(--color-primary-default)' }} />
            <div>
              <h4 
                style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-1)'
                }}
              >
                Need Help with Payments?
              </h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-3)' }}>
                If you have questions about your payments or need assistance with refunds, our support team is here to help.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                <Icon name="messageCircle" size={14} />
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}