import { useCallback, useState } from 'react';
import { apiClient, apiErrorMessage, type ApiHttpError } from '../../shared/api/api';
import { useNotifications } from '../../shared/state/NotificationContext';
import { useAdminAction, useAdminResource } from '../ui/hooks/useAdminResource';

export type BrevoChannel = 'email' | 'sms' | 'whatsapp';

export interface BrevoConfig {
  email: {
    enabled: boolean;
    senderName: string;
    senderEmail: string;
  };
  sms: {
    enabled: boolean;
    senderName: string;
  };
  whatsapp: {
    enabled: boolean;
    senderNumber: string;
    testTemplateName: string;
  };
  updatedAt?: string;
}

export interface BrevoAccount {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  plan: { type?: string; credits?: number } | null;
}

export interface LogEntry {
  channel: string;
  recipient: string;
  subject: string;
  success: boolean;
  timestamp: string;
}

const DEFAULT_CONFIG: BrevoConfig = {
  email: { enabled: false, senderName: 'iKan Health', senderEmail: 'noreply@ikanhealth.in' },
  sms: { enabled: false, senderName: 'iKan' },
  whatsapp: { enabled: false, senderNumber: '', testTemplateName: '' },
};

/**
 * Brevo config / account / logs. The three loads run in parallel and a failed
 * one just becomes null (the page still renders with what did load).
 */
export function useBrevoData() {
  const { showToast } = useNotifications();
  const [config, setConfig] = useState<BrevoConfig>(DEFAULT_CONFIG);
  const [account, setAccount] = useState<BrevoAccount | null>(null);
  const [accountConnected, setAccountConnected] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testing, setTesting] = useState<BrevoChannel | null>(null);
  const { run: runSave, busy: saving } = useAdminAction();

  const { loading, reload } = useAdminResource(
    (signal) => Promise.all([
      apiClient.getBrevoConfig(signal).catch(() => null),
      apiClient.getBrevoAccount(signal).catch(() => null),
      apiClient.getBrevoLogs(20, signal).catch(() => null),
    ]),
    {
      toastOnError: false,
      onSuccess: ([configRes, accountRes, logsRes]) => {
        if (configRes?.config) setConfig(configRes.config);
        if (configRes?.apiKeyConfigured !== undefined) setApiKeyConfigured(configRes.apiKeyConfigured);
        if (accountRes?.connected) {
          setAccountConnected(true);
          setAccount(accountRes.account);
        } else {
          setAccountConnected(false);
          setAccount(null);
        }
        if (logsRes?.logs) setLogs(logsRes.logs);
      },
    },
  );

  const saveConfig = useCallback(() => runSave(() => apiClient.saveBrevoConfig(config), {
    success: ['Saved', 'Brevo configuration saved successfully'],
    errorTitle: 'Error',
    errorMessage: (err) => apiErrorMessage(err, 'Failed to save configuration'),
  }), [runSave, config]);

  const testChannel = useCallback(async (channel: BrevoChannel, recipient: string) => {
    if (!recipient) {
      showToast('error', 'Missing Recipient', `Enter a ${channel === 'email' ? 'email address' : 'phone number'} to test`);
      return;
    }
    setTesting(channel);
    try {
      const data = await apiClient.testBrevoChannel(channel, recipient);
      if (data?.success) {
        showToast('success', 'Test Sent', `Test ${channel} sent to ${recipient}`);
        // Refresh logs
        const logsRes = await apiClient.getBrevoLogs(20).catch(() => null);
        if (logsRes?.logs) setLogs(logsRes.logs);
      } else {
        showToast('error', 'Test Failed', data?.error || `Failed to send test ${channel}`);
      }
    } catch (err) {
      // An HTTP error carries the server's message; anything else is the network.
      const isHttpError = typeof (err as Partial<ApiHttpError>)?.status === 'number';
      console.error(`Error testing ${channel}:`, err);
      showToast('error', 'Test Failed', isHttpError
        ? apiErrorMessage(err, `Failed to send test ${channel}`)
        : `Network error testing ${channel}`);
    } finally {
      setTesting(null);
    }
  }, [showToast]);

  return {
    loading,
    reload,
    config,
    setConfig,
    account,
    accountConnected,
    apiKeyConfigured,
    logs,
    testing,
    saving,
    saveConfig,
    testChannel,
  };
}
