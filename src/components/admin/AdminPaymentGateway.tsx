import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Save,
  TestTube,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { AdminStatusBadge, resolveStatusVariant } from './AdminStatusBadge';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNotifications } from '../../contexts/NotificationContext';
import { AdminHeader } from './AdminHeader';
import { AdminLoading } from './AdminLoading';
import { useIsMobile } from '../../hooks/useIsMobile';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

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

  // Stripe configuration
  const [stripeConfig, setStripeConfig] = useState<PaymentConfig>({
    gateway: 'stripe',
    enabled: false,
    mode: 'test',
    api_key: '',
    secret_key: '',
    webhook_secret: ''
  });

  // PayPal configuration
  const [paypalConfig, setPaypalConfig] = useState<PaymentConfig>({
    gateway: 'paypal',
    enabled: false,
    mode: 'test',
    api_key: '', // Client ID
    secret_key: '' // Secret
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
    loadTransactions();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/payment/config`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const configs = data.configs || [];
        configs.forEach((cfg: any) => {
          if (cfg.gateway === 'razorpay') setRazorpayConfig(cfg);
          if (cfg.gateway === 'stripe') setStripeConfig(cfg);
          if (cfg.gateway === 'paypal') setPaypalConfig(cfg);
        });
      }
    } catch (error) {
      console.error('Failed to load payment configs:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/payment/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/payment/config`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/payment/test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ gateway, amount })
        }
      );

      if (response.ok) {
        showToast('success', 'Test Transaction', `Test payment of ₹${amount} initiated`);
      } else {
        showToast('error', 'Test Failed', 'Failed to initiate test transaction');
      }
    } catch (error) {
      console.error('Error testing gateway:', error);
      showToast('error', 'Test Failed', 'Failed to test gateway');
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
      label: 'Active Gateways',
      value: [razorpayConfig.enabled, stripeConfig.enabled, paypalConfig.enabled].filter(Boolean).length,
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
      icon: <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />
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
          title="Payment Gateway Management"
          description="Configure payment gateways and monitor transactions"
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

        {/* Stripe Configuration */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* Stripe brand color — must remain as hex per brand guidelines */}
                <CreditCard className="w-6 h-6" style={{ color: '#635BFF' }} />
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Stripe
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Global payment processing platform
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label>Enabled</Label>
                <Switch
                  checked={stripeConfig.enabled}
                  onCheckedChange={(checked) => setStripeConfig({ ...stripeConfig, enabled: checked })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Mode</Label>
                <Select 
                  value={stripeConfig.mode} 
                  onValueChange={(mode: any) => setStripeConfig({ ...stripeConfig, mode })}
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
                <Label>Publishable Key</Label>
                <Input
                  type="password"
                  value={stripeConfig.api_key}
                  onChange={(e) => setStripeConfig({ ...stripeConfig, api_key: e.target.value })}
                  placeholder="pk_test_xxxxxxxxxxxxx"
                />
              </div>
              <div>
                <Label>Secret Key</Label>
                <Input
                  type="password"
                  value={stripeConfig.secret_key}
                  onChange={(e) => setStripeConfig({ ...stripeConfig, secret_key: e.target.value })}
                  placeholder="sk_test_xxxxxxxxxxxxx"
                />
              </div>
              <div>
                <Label>Webhook Secret</Label>
                <Input
                  type="password"
                  value={stripeConfig.webhook_secret}
                  onChange={(e) => setStripeConfig({ ...stripeConfig, webhook_secret: e.target.value })}
                  placeholder="whsec_xxxxxxxxxxxxx"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleSaveConfig('stripe', stripeConfig)}
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
                onClick={() => handleTest('stripe', 100)}
                disabled={!stripeConfig.enabled || testing === 'stripe'}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)'
                }}
              >
                <TestTube className="w-4 h-4" />
                {testing === 'stripe' ? 'Testing...' : 'Test Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PayPal Configuration */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* PayPal brand color — must remain as hex per brand guidelines */}
                <CreditCard className="w-6 h-6" style={{ color: '#0070BA' }} />
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    PayPal
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Trusted online payment system
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label>Enabled</Label>
                <Switch
                  checked={paypalConfig.enabled}
                  onCheckedChange={(checked) => setPaypalConfig({ ...paypalConfig, enabled: checked })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Mode</Label>
                <Select 
                  value={paypalConfig.mode} 
                  onValueChange={(mode: any) => setPaypalConfig({ ...paypalConfig, mode })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Sandbox Mode</SelectItem>
                    <SelectItem value="live">Live Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Client ID</Label>
                <Input
                  type="password"
                  value={paypalConfig.api_key}
                  onChange={(e) => setPaypalConfig({ ...paypalConfig, api_key: e.target.value })}
                  placeholder="Client ID"
                />
              </div>
              <div>
                <Label>Secret</Label>
                <Input
                  type="password"
                  value={paypalConfig.secret_key}
                  onChange={(e) => setPaypalConfig({ ...paypalConfig, secret_key: e.target.value })}
                  placeholder="Secret"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleSaveConfig('paypal', paypalConfig)}
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
                onClick={() => handleTest('paypal', 100)}
                disabled={!paypalConfig.enabled || testing === 'paypal'}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)'
                }}
              >
                <TestTube className="w-4 h-4" />
                {testing === 'paypal' ? 'Testing...' : 'Test Payment'}
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documentation */}
        <Card style={{ backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-3)' }}>
              📚 Setup Documentation
            </h3>
            <div className="space-y-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              <p>
                <strong>Razorpay:</strong> Get API keys from{' '}
                <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-default)' }}>
                  Razorpay Dashboard
                </a>
              </p>
              <p>
                <strong>Stripe:</strong> Get API keys from{' '}
                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-default)' }}>
                  Stripe Dashboard
                </a>
              </p>
              <p>
                <strong>PayPal:</strong> Get credentials from{' '}
                <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-default)' }}>
                  PayPal Developer Portal
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}