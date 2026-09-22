import { useState } from 'react';
import { Mail, Send, MessageSquare, Phone, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { useConfirm } from '../ui/kit/ConfirmDialog';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { cn } from '../ui/utils';
import { AdminCommunicationAPI } from './AdminCommunicationAPI';
import { TemplateEditor } from './TemplateEditor';
import { TemplateList } from './TemplateList';
import { BroadcastForm, QueueTable } from './QueuePanel';
import { useCommunicationData } from './useCommunicationData';
import {
  BTN_PRIMARY, BTN_SM, duplicateTemplate, newTemplate,
  type BroadcastInput, type Channel, type NotifTemplate,
} from './communication-types';

type Tab = 'templates' | 'queue' | 'api-config';

const TABS: { id: Tab; label: string }[] = [
  { id: 'templates', label: 'Templates' },
  { id: 'queue', label: 'Queue' },
  { id: 'api-config', label: 'Brevo API' },
];

const EMPTY_BROADCAST: BroadcastInput = { type: 'email', audience: 'all', subject: '', body: '' };

export function AdminCommunication() {
  const isMobile = useIsMobile();
  const confirm = useConfirm();
  const { templates, queue, saving, saveTemplate, deleteTemplate, sendBroadcast } = useCommunicationData();

  const [activeTab, setActiveTab] = useState<Tab>('templates');
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all');
  const [editingTemplate, setEditingTemplate] = useState<NotifTemplate | null>(null);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcast, setBroadcast] = useState<BroadcastInput>(EMPTY_BROADCAST);

  const templateList = templates.data;
  const pendingCount = queue.data.filter(q => q.status === 'pending').length;

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    if (await saveTemplate(editingTemplate)) setEditingTemplate(null);
  };

  const handleDeleteTemplate = async (id: string) => {
    const ok = await confirm({
      title: 'Delete this template?',
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    if (await deleteTemplate(id)) {
      setEditingTemplate(prev => (prev?.id === id ? null : prev));
    }
  };

  const handleSendBroadcast = async () => {
    if (await sendBroadcast(broadcast)) {
      setIsBroadcastOpen(false);
      setBroadcast(prev => ({ ...prev, subject: '', body: '' }));
    }
  };

  const stats = [
    { label: 'Email', value: templateList.filter(t => t.channel === 'email').length, icon: <Mail className="w-4 h-4 text-[var(--color-primary-default)]" /> },
    { label: 'SMS', value: templateList.filter(t => t.channel === 'sms').length, icon: <Phone className="w-4 h-4 text-[var(--color-status-warning)]" /> },
    { label: 'WhatsApp', value: templateList.filter(t => t.channel === 'whatsapp').length, icon: <MessageSquare className="w-4 h-4 text-[var(--color-status-success)]" /> },
    { label: 'Queued', value: pendingCount, icon: <Send className="w-4 h-4 text-[var(--color-text-muted)]" /> },
  ];

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mb-4">
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setEditingTemplate(null); }}
              className={cn(
                'px-4 py-2 rounded-md border-none cursor-pointer text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[var(--color-primary-default)] text-[var(--color-primary-on)]'
                  : 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]',
              )}
            >
              {tab.label}
              {tab.id === 'queue' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-px rounded-[var(--radius-pill)] text-xs font-medium bg-[var(--color-status-warning-light)] text-[var(--color-status-warning)]">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* API Config tab */}
      {activeTab === 'api-config' && <AdminCommunicationAPI />}

      {/* Templates tab */}
      {activeTab === 'templates' && (editingTemplate ? (
        <TemplateEditor
          template={editingTemplate}
          onChange={updates => setEditingTemplate({ ...editingTemplate, ...updates })}
          onSave={handleSaveTemplate}
          onCancel={() => setEditingTemplate(null)}
          saving={saving}
        />
      ) : (
        <AdminPageLayout
          title="Notification Templates"
          description="Create and manage email, SMS, and WhatsApp notification templates"
          stats={stats}
          maxWidth="none"
          loading={templates.loading}
          error={templates.error}
          onRetry={templates.reload}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { void templates.reload(); }} className={cn(BTN_SM, 'text-[var(--color-text-primary)]')}>
                <RefreshCw size={14} />
                {!isMobile && 'Refresh'}
              </Button>
              <Button size="sm" onClick={() => setEditingTemplate(newTemplate('email'))} className={BTN_PRIMARY}>
                <Plus size={14} />
                New Template
              </Button>
            </div>
          }
        >
          <div>
            <TemplateList
              templates={templateList}
              channelFilter={channelFilter}
              onChannelFilter={setChannelFilter}
              onNew={(ch) => setEditingTemplate(newTemplate(ch))}
              onEdit={setEditingTemplate}
              onDuplicate={(t) => setEditingTemplate(duplicateTemplate(t))}
              onDelete={handleDeleteTemplate}
            />
          </div>
        </AdminPageLayout>
      ))}

      {/* Queue tab */}
      {activeTab === 'queue' && (
        <AdminPageLayout
          title="Notification Queue"
          description="Track broadcast messages and their delivery status"
          maxWidth="none"
          loading={queue.loading}
          error={queue.error}
          onRetry={queue.reload}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { void queue.reload(); }} className={cn(BTN_SM, 'text-[var(--color-text-primary)]')}>
                <RefreshCw size={14} /> Refresh
              </Button>
              <Button size="sm" onClick={() => setIsBroadcastOpen(true)} className={BTN_PRIMARY}>
                <Send size={14} /> Send Broadcast
              </Button>
            </div>
          }
        >
          <div>
            <QueueTable queue={queue.data} />
            {isBroadcastOpen && (
              <BroadcastForm
                draft={broadcast}
                onDraftChange={updates => setBroadcast(prev => ({ ...prev, ...updates }))}
                onSend={handleSendBroadcast}
                onClose={() => setIsBroadcastOpen(false)}
              />
            )}
          </div>
        </AdminPageLayout>
      )}
    </div>
  );
}
