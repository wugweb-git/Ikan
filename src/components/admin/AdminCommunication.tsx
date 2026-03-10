import React, { useState } from 'react';
import {
  Mail,
  Send,
  Users,
  MessageSquare,
  Bell,
  FileText,
  Plus,
  Eye
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { AdminStatusBadge, resolveStatusVariant } from './AdminStatusBadge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { useNotifications } from '../../contexts/NotificationContext';
import { AdminHeader } from './AdminHeader';
import { AdminCommunicationAPI } from './AdminCommunicationAPI';
import { useIsMobile } from '../../hooks/useIsMobile';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'welcome' | 'notification' | 'reminder' | 'marketing';
  created_at: string;
}

interface NotificationQueue {
  id: string;
  type: 'email' | 'push' | 'sms';
  recipient: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  scheduled_at: string;
}

export function AdminCommunication({ onBack: _onBack }: { onBack?: () => void }) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'templates' | 'api-config'>('templates');
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to iKan Mental Health',
      body: 'Dear {{name}},\n\nWelcome to iKan! We\'re here to support your mental wellness journey...',
      category: 'welcome',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Assessment Reminder',
      subject: 'Complete Your Weekly Assessment',
      body: 'Hi {{name}},\n\nIt\'s time for your weekly mental health check-in...',
      category: 'reminder',
      created_at: new Date().toISOString()
    }
  ]);

  const [queue, setQueue] = useState<NotificationQueue[]>([
    {
      id: '1',
      type: 'email',
      recipient: 'user@example.com',
      subject: 'Welcome Email',
      status: 'sent',
      scheduled_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      type: 'push',
      recipient: 'user-123',
      subject: 'Daily Mood Check-in',
      status: 'pending',
      scheduled_at: new Date(Date.now() + 3600000).toISOString()
    }
  ]);

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Broadcast form
  const [broadcastType, setBroadcastType] = useState<'email' | 'push' | 'sms'>('email');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState('all');

  const handleCreateTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: 'New Template',
      subject: '',
      body: '',
      category: 'notification',
      created_at: new Date().toISOString()
    };
    setSelectedTemplate(newTemplate);
    setIsTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      if (templates.find(t => t.id === selectedTemplate.id)) {
        setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? selectedTemplate : t));
      } else {
        setTemplates(prev => [...prev, selectedTemplate]);
      }
      showToast('success', 'Saved', 'Template saved successfully');
      setIsTemplateDialogOpen(false);
      setSelectedTemplate(null);
    }
  };

  const handleSendBroadcast = () => {
    const newNotification: NotificationQueue = {
      id: Date.now().toString(),
      type: broadcastType,
      recipient: broadcastAudience === 'all' ? 'all-users' : `segment-${broadcastAudience}`,
      subject: broadcastSubject,
      status: 'pending',
      scheduled_at: new Date().toISOString()
    };
    setQueue(prev => [newNotification, ...prev]);
    showToast('success', 'Queued', 'Broadcast message queued for delivery');
    setIsBroadcastDialogOpen(false);
    setBroadcastSubject('');
    setBroadcastBody('');
  };

  const stats = [
    {
      label: 'Templates',
      value: templates.length,
      icon: <FileText className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
    {
      label: 'Queued',
      value: queue.filter(n => n.status === 'pending').length,
      icon: <MessageSquare className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} />
    },
    {
      label: 'Sent Today',
      value: queue.filter(n => n.status === 'sent').length,
      icon: <Send className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />
    },
    {
      label: 'Failed',
      value: queue.filter(n => n.status === 'failed').length,
      icon: <Mail className="w-4 h-4" style={{ color: 'var(--color-danger-default)' }} />
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: 'var(--color-bg-page)',
        padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-8)'
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Tab Switcher */}
        <div className="flex items-center" style={{ gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'templates' ? 'var(--color-primary-default)' : 'var(--color-bg-muted)',
              color: activeTab === 'templates' ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
              transition: 'all 150ms ease',
            }}
          >
            Templates &amp; Queue
          </button>
          <button
            onClick={() => setActiveTab('api-config')}
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'api-config' ? 'var(--color-primary-default)' : 'var(--color-bg-muted)',
              color: activeTab === 'api-config' ? 'var(--color-primary-on)' : 'var(--color-text-muted)',
              transition: 'all 150ms ease',
            }}
          >
            Brevo API Config
          </button>
        </div>

        {activeTab === 'api-config' ? (
          <AdminCommunicationAPI />
        ) : (
        <>
        <AdminHeader
          title="Communication Center"
          description="Manage email templates, notifications, and broadcasts"
          stats={stats}
          actions={
            <>
              <Button
                variant="outline"
                onClick={handleCreateTemplate}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)'
                }}
              >
                <FileText className="w-4 h-4" />
                {!isMobile && 'New Template'}
              </Button>
              <Button
                onClick={() => setIsBroadcastDialogOpen(true)}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)',
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)'
                }}
              >
                <Send className="w-4 h-4" />
                {!isMobile && 'Send Broadcast'}
              </Button>
            </>
          }
        />

        {/* Email Templates */}
        <div>
          <h3 style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            marginBottom: 'var(--spacing-4)'
          }}>
            Email Templates
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map(template => (
              <Card 
                key={template.id}
                style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 style={{ 
                        fontSize: 'var(--text-base)', 
                        fontWeight: 'var(--font-weight-medium)',
                        marginBottom: 'var(--spacing-1)'
                      }}>
                        {template.name}
                      </h4>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        {template.subject}
                      </p>
                    </div>
                    <AdminStatusBadge status={resolveStatusVariant(template.category)} label={template.category} />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsTemplateDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Notification Queue */}
        <div>
          <h3 style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            marginBottom: 'var(--spacing-4)'
          }}>
            Notification Queue
          </h3>
          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Type
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Recipient
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Status
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Scheduled
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((item, idx) => (
                      <tr 
                        key={item.id}
                        style={{
                          borderBottom: idx < queue.length - 1 ? '1px solid var(--color-border-default)' : 'none'
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>
                              {item.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          {item.recipient}
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)' }}>
                          {item.subject}
                        </td>
                        <td className="px-4 py-3">
                          <AdminStatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                          {new Date(item.scheduled_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        </>
        )}
      </div>

      {/* Template Edit Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate?.name || 'New Template'}
            </DialogTitle>
            <DialogDescription>
              Create or edit email templates with dynamic placeholders
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={selectedTemplate.name}
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                  placeholder="e.g., Welcome Email"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select 
                  value={selectedTemplate.category} 
                  onValueChange={(v: any) => setSelectedTemplate({...selectedTemplate, category: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subject Line</Label>
                <Input
                  value={selectedTemplate.subject}
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                  placeholder="Email subject..."
                />
              </div>

              <div>
                <Label>Email Body</Label>
                <Textarea
                  value={selectedTemplate.body}
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                  placeholder="Use {{name}}, {{email}}, etc. for dynamic content..."
                  className="min-h-[200px]"
                />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
                  Available placeholders: {'{'}{'{'} name {'}'}{'}'}, {'{'}{'{'} email {'}'}{'}'}, {'{'}{'{'} date {'}'}{'}'} 
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Broadcast Dialog */}
      <Dialog open={isBroadcastDialogOpen} onOpenChange={setIsBroadcastDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Broadcast Message</DialogTitle>
            <DialogDescription>
              Send a message to multiple users at once
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Message Type</Label>
              <Select value={broadcastType} onValueChange={(v: any) => setBroadcastType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Audience</Label>
              <Select value={broadcastAudience} onValueChange={setBroadcastAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                  <SelectItem value="premium">Premium Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subject</Label>
              <Input
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                placeholder="Message subject..."
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                placeholder="Your message here..."
                className="min-h-[150px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBroadcastDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendBroadcast} disabled={!broadcastSubject || !broadcastBody}>
              <Send className="w-4 h-4 mr-2" />
              Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}