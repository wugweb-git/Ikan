import { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Save,
  TestTube,
  CircleCheck,
  TrendingUp
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { AdminStatusBadge } from './AdminStatusBadge';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNotifications } from '../../contexts/NotificationContext';
import { AdminHeader } from './AdminHeader';
import { useIsMobile } from '../../hooks/useIsMobile';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { supabase } from '../../lib/supabase-client';

interface PaymentConfig {
  gateway: string;
  enabled: boolean;
  mode: 'test' | 'live';
  api_key?: string;
  secret_key?: string;
  merchant_id?: string;
  webhook_secret?: string;
  updated_at?: string;
}

interface Transaction {
  id: string;
  gateway: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  user_id: string;
  description: string;
  created_at: string;
}

export function AdminPaymentGateway() {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();

  // Razorpay configuration
  const [razorpayConfig, setRazorpayConfig] = useState<PaymentConfig>({
    gateway: 'razorpay',
    enabled: false,
    mode: 'test',
    api_key: '',
    secret_key: ''
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [testing, setTesting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = async (includeContentType = false) => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('Auth: getSession error in PaymentGateway:', error.message);
        const h: Record<string, string> = { 'Authorization': `Bearer ${publicAnonKey}` };
        if (includeContentType) h['Content-Type'] = 'application/json';
        return h;
      }
      const token = data.session?.access_token || publicAnonKey;
      const h: Record<string, string> = { 'Authorization': `Bearer ${token}` };
      if (includeContentType) h['Content-Type'] = 'application/json';
      return h;
    } catch (err) {
      console.warn('Auth: getAuthHeaders failed in PaymentGateway:', err);
      const h: Record<string, string> = { 'Authorization': `Bearer ${publicAnonKey}` };
      if (includeContentType) h['Content-Type'] = 'application/json';
      return h;
    }
  };

  useEffect(() => {
    loadConfigs();
    loadTransactions();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/payment/config`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        const configs = data.configs || [];
        configs.forEach((cfg: any) => {
          if (cfg.gateway === 'razorpay') setRazorpayConfig(cfg);
        });
      }
    } catch (error) {
      console.error('Failed to load payment configs:', error);
      setError('Failed to load payment configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/payment/transactions`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleSaveConfig = async (gateway: string, config: PaymentConfig) => {
    try {
      const headers = await getAuthHeaders(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/payment/config`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ gateway, config })
        }
      );

      if (response.ok) {
        showToast('success', 'Saved', `${gateway} configuration saved successfully`);
      } else {
        showToast('error', 'Error', 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      showToast('error', 'Error', 'Failed to save configuration');
    }
  };

  const handleTest = async (gateway: string, amount: number) => {
    setTesting(gateway);
    try {
      const headers = await getAuthHeaders(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/payment/test`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ gateway, amount })
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        showToast('success', 'Razorpay Order Created', `Order ${data.order_id} — ₹${data.amount}. Check your Razorpay dashboard.`);
        // Reload transactions to show the new pending test transaction
        loadTransactions();
      } else {
        showToast('error', 'Test Failed', data.error || data.hint || 'Failed to create Razorpay order');
      }
    } catch (error) {
      console.error('Error testing gateway:', error);
      showToast('error', 'Test Failed', 'Network error — could not reach the server');
    } finally {
      setTesting(null);
    }
  };

  const totalTransactions = transactions.length;
  const successfulTransactions = transactions.filter(t => t.status === 'success').length;
  const totalRevenue = transactions
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    {
      label: 'Gateway Status',
      value: razorpayConfig.enabled ? 'Active' : 'Inactive',
      icon: <CreditCard className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />
    },
    {
      label: 'Transactions',
      value: totalTransactions,
      icon: <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
    },
    {
      label: 'Success Rate',
      value: totalTransactions > 0 ? `${((successfulTransactions / totalTransactions) * 100).toFixed(1)}%` : '0%',
      icon: <CircleCheck className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />
    },
  ];

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: 'var(--color-bg-page)',
        padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)'
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          title="Payment Gateway — Razorpay"
          description="Configure Razorpay payment gateway and monitor transactions"
          stats={stats}
        />

        {/* Razorpay Configuration */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* Razorpay brand color — must remain as hex per brand guidelines */}
                <CreditCard className="w-6 h-6" style={{ color: '#3395FF' }} />
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Razorpay
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Popular payment gateway for India
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label>Enabled</Label>
                <Switch
                  checked={razorpayConfig.enabled}
                  onCheckedChange={(checked) => setRazorpayConfig({ ...razorpayConfig, enabled: checked })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Mode</Label>
                <Select 
                  value={razorpayConfig.mode} 
                  onValueChange={(mode: any) => setRazorpayConfig({ ...razorpayConfig, mode })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test Mode</SelectItem>
                    <SelectItem value="live">Live Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={razorpayConfig.api_key}
                  onChange={(e) => setRazorpayConfig({ ...razorpayConfig, api_key: e.target.value })}
                  placeholder="rzp_test_xxxxxxxxxxxxx"
                />
              </div>
              <div>
                <Label>Secret Key</Label>
                <Input
                  type="password"
                  value={razorpayConfig.secret_key}
                  onChange={(e) => setRazorpayConfig({ ...razorpayConfig, secret_key: e.target.value })}
                  placeholder="Secret Key"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleSaveConfig('razorpay', razorpayConfig)}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)',
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)'
                }}
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </Button>
              <Button
                variant="outline"
                onClick={() => handleTest('razorpay', 100)}
                disabled={!razorpayConfig.enabled || testing === 'razorpay'}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)'
                }}
              >
                <TestTube className="w-4 h-4" />
                {testing === 'razorpay' ? 'Testing...' : 'Test Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div>
            <h3 style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 'var(--spacing-4)'
            }}>
              Recent Transactions
            </h3>
            <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-0">
                {isMobile ? (
                  <div className="divide-y" style={{ borderColor: 'var(--color-border-default)' }}>
                    {transactions.slice(0, 10).map((txn) => (
                      <div key={txn.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                            {txn.currency} {txn.amount.toLocaleString()}
                          </span>
                          <AdminStatusBadge status={txn.status} />
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          {txn.id}
                        </div>
                        <div className="flex justify-between" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          <span style={{ textTransform: 'capitalize' }}>{txn.gateway}</span>
                          <span>{new Date(txn.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          Transaction ID
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          Gateway
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          Status
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map((txn, idx) => (
                        <tr 
                          key={txn.id}
                          style={{
                            borderBottom: idx < 9 ? '1px solid var(--color-border-default)' : 'none'
                          }}
                        >
                          <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', fontFamily: 'monospace' }}>
                            {txn.id}
                          </td>
                          <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>
                            {txn.gateway}
                          </td>
                          <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)' }}>
                            {txn.currency} {txn.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <AdminStatusBadge status={txn.status} />
                          </td>
                          <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                            {new Date(txn.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documentation */}
        <Card style={{ backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-3)' }}>
              Setup Documentation
            </h3>
            <div className="space-y-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              <p>
                <strong>Razorpay:</strong> Get API keys from{' '}
                <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-default)' }}>
                  Razorpay Dashboard
                </a>
              </p>
              <p style={{ marginTop: 'var(--spacing-2)' }}>
                <strong>Steps:</strong> 1. Create a Razorpay account → 2. Generate test API keys → 3. Enter keys above → 4. Test with a ₹1 payment → 5. Switch to live mode when ready.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}