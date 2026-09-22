import { useState } from 'react';
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
import { AdminStatusBadge } from '../ui/kit/AdminStatusBadge';
import { AdminDataTable, type Column } from '../ui/kit/AdminDataTable';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNotifications } from '../../shared/state/NotificationContext';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { useAdminResource } from '../ui/hooks/useAdminResource';
import { apiClient, apiErrorBody } from '../../shared/api/api';

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

const DEFAULT_RAZORPAY_CONFIG: PaymentConfig = {
  gateway: 'razorpay',
  enabled: false,
  mode: 'test',
  api_key: '',
  secret_key: ''
};

const BUTTON_CLASS = 'h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)] font-medium gap-2';

const TRANSACTION_COLUMNS: Column<Transaction>[] = [
  { header: 'Transaction ID', render: (txn) => <span className="text-sm font-mono">{txn.id}</span> },
  { header: 'Gateway', render: (txn) => <span className="text-sm capitalize">{txn.gateway}</span> },
  { header: 'Amount', render: (txn) => <span className="text-sm">{txn.currency} {txn.amount.toLocaleString()}</span> },
  { header: 'Status', render: (txn) => <AdminStatusBadge status={txn.status} /> },
  {
    header: 'Date',
    render: (txn) => (
      <span className="text-sm text-[var(--color-text-muted)]">{new Date(txn.created_at).toLocaleString()}</span>
    ),
  },
];

export function AdminPaymentGateway() {
  const { showToast } = useNotifications();
  const [testing, setTesting] = useState<string | null>(null);

  // Razorpay configuration (loaded, then edited in place)
  const {
    data: razorpayConfig,
    setData: setRazorpayConfig,
    loading,
    error,
    reload,
  } = useAdminResource<PaymentConfig>(
    async () => {
      const data = await apiClient.getAdminPaymentConfigs();
      let config = DEFAULT_RAZORPAY_CONFIG;
      (data?.configs || []).forEach((cfg: PaymentConfig) => {
        if (cfg.gateway === 'razorpay') config = cfg;
      });
      return config;
    },
    {
      initialData: DEFAULT_RAZORPAY_CONFIG,
      errorMessage: 'Failed to load payment configuration',
      toastOnError: false,
    },
  );

  // Transactions are secondary: a failed load just leaves the list empty.
  const { data: transactions, reload: reloadTransactions } = useAdminResource<Transaction[]>(
    async () => {
      const data = await apiClient.getAdminPaymentTransactions();
      return data?.transactions || [];
    },
    { initialData: [], toastOnError: false },
  );

  const handleSaveConfig = async (gateway: string, config: PaymentConfig) => {
    // GET /admin/payment/config returns the stored keys MASKED ("***abcd"),
    // and POST /admin/payment/config REPLACES the whole stored config
    // (`kv.set(key, { ...config })`, no merge). So posting the form as loaded
    // overwrote the real keys with the mask — and omitting the fields instead
    // would blank them. Until the server merges, the only safe client-side
    // behaviour is to refuse the save until every masked key is re-entered.
    const isMasked = (v: unknown) => typeof v === 'string' && v.startsWith('***');
    const stillMasked = [
      isMasked(config.api_key) ? 'API Key' : null,
      isMasked(config.secret_key) ? 'Secret Key' : null,
      isMasked(config.webhook_secret) ? 'Webhook Secret' : null,
    ].filter(Boolean);
    if (stillMasked.length > 0) {
      showToast(
        'error',
        'Re-enter keys to save',
        `${stillMasked.join(' and ')} ${stillMasked.length > 1 ? 'are' : 'is'} shown masked. Re-enter ${stillMasked.length > 1 ? 'them' : 'it'} before saving — saving the masked value would overwrite the real key.`
      );
      return;
    }
    // Server stamps its own updated_at.
    const { updated_at: _ignored, ...configToSave } = config;

    try {
      await apiClient.saveAdminPaymentConfig(gateway, configToSave);
      showToast('success', 'Saved', `${gateway} configuration saved successfully`);
    } catch (err) {
      console.error('Error saving config:', err);
      showToast('error', 'Error', 'Failed to save configuration');
    }
  };

  const handleTest = async (gateway: string, amount: number) => {
    setTesting(gateway);
    try {
      const data = await apiClient.testAdminPaymentGateway(gateway, amount);
      if (data?.success) {
        showToast('success', 'Razorpay Order Created', `Order ${data.order_id} — ₹${data.amount}. Check your Razorpay dashboard.`);
        // Reload transactions to show the new pending test transaction
        void reloadTransactions();
      } else {
        showToast('error', 'Test Failed', data?.error || data?.hint || 'Failed to create Razorpay order');
      }
    } catch (err) {
      // A 4xx/5xx with a JSON body carries the server's reason; anything else
      // (unreachable, timeout, non-JSON reply) is reported as a network error.
      const body = apiErrorBody(err);
      if (body) {
        showToast('error', 'Test Failed', body.error || body.hint || 'Failed to create Razorpay order');
      } else {
        console.error('Error testing gateway:', err);
        showToast('error', 'Test Failed', 'Network error — could not reach the server');
      }
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
      icon: <CreditCard className="w-4 h-4 text-[var(--color-primary-default)]" />
    },
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-4 h-4 text-[var(--color-success-default)]" />
    },
    {
      label: 'Transactions',
      value: totalTransactions,
      icon: <TrendingUp className="w-4 h-4 text-[var(--color-info-default)]" />
    },
    {
      label: 'Success Rate',
      value: totalTransactions > 0 ? `${((successfulTransactions / totalTransactions) * 100).toFixed(1)}%` : '0%',
      icon: <CircleCheck className="w-4 h-4 text-[var(--color-success-default)]" />
    },
  ];

  return (
    <AdminPageLayout
      title="Payment Gateway — Razorpay"
      description="Configure Razorpay payment gateway and monitor transactions"
      stats={stats}
      loading={loading}
      error={error}
      onRetry={reload}
      maxWidth="2xl"
    >
      {/* Razorpay Configuration */}
      <Card className="bg-[var(--color-bg-card)] rounded-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Razorpay brand color — must remain as hex per brand guidelines */}
              <CreditCard className="w-6 h-6" style={{ color: '#3395FF' }} />
              <div>
                <h3 className="text-base font-medium">Razorpay</h3>
                <p className="text-sm text-[var(--color-text-muted)]">Popular payment gateway for India</p>
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
                onValueChange={(mode: PaymentConfig['mode']) => setRazorpayConfig({ ...razorpayConfig, mode })}
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
              className={`${BUTTON_CLASS} bg-[var(--color-primary-default)] text-[var(--color-primary-on)]`}
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </Button>
            <Button
              variant="outline"
              onClick={() => handleTest('razorpay', 100)}
              disabled={!razorpayConfig.enabled || testing === 'razorpay'}
              className={BUTTON_CLASS}
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
          <h3 className="text-base font-medium mb-4">Recent Transactions</h3>
          <AdminDataTable<Transaction>
            columns={TRANSACTION_COLUMNS}
            data={transactions.slice(0, 10)}
            showToolbar={false}
            paginate={false}
          />
        </div>
      )}

      {/* Documentation */}
      <Card className="bg-[var(--color-bg-muted)] rounded-lg">
        <CardContent className="p-6">
          <h3 className="text-base font-medium mb-3">Setup Documentation</h3>
          <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
            <p>
              <span className="font-medium">Razorpay:</span> Get API keys from{' '}
              <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary-default)]">
                Razorpay Dashboard
              </a>
            </p>
            <p className="mt-2">
              <span className="font-medium">Steps:</span> 1. Create a Razorpay account → 2. Generate test API keys → 3. Enter keys above → 4. Test with a ₹1 payment → 5. Switch to live mode when ready.
            </p>
          </div>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
