import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  Activity,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { AdminStatusBadge, resolveStatusVariant } from './AdminStatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNotifications } from '../../contexts/NotificationContext';
import { AdminHeader } from './AdminHeader';
import { AdminLoading } from './AdminLoading';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ActiveSession {
  id: string;
  user_id: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  started_at: string;
  last_activity: string;
}

interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address?: string;
  user_id?: string;
  timestamp: string;
  resolved: boolean;
}

interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource: string;
  ip_address: string;
  timestamp: string;
}

export function AdminSecurity() {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();

  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);

  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    // Mock active sessions
    const mockSessions: ActiveSession[] = [];
    for (let i = 0; i < 10; i++) {
      mockSessions.push({
        id: `session-${i}`,
        user_id: `user-${i}`,
        user_email: `user${i}@example.com`,
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0...',
        started_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        last_activity: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString()
      });
    }
    setSessions(mockSessions);

    // Mock security alerts
    const alertTypes: SecurityAlert['type'][] = ['failed_login', 'suspicious_activity', 'data_breach', 'unauthorized_access'];
    const severities: SecurityAlert['severity'][] = ['low', 'medium', 'high', 'critical'];
    const mockAlerts: SecurityAlert[] = [];
    for (let i = 0; i < 15; i++) {
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      mockAlerts.push({
        id: `alert-${i}`,
        type,
        severity,
        description: `${type.replace('_', ' ')} detected from ${i % 2 === 0 ? 'unknown location' : 'suspicious IP'}`,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_id: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 10)}` : undefined,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        resolved: Math.random() > 0.3
      });
    }
    setAlerts(mockAlerts);

    // Mock audit logs
    const actions = ['login', 'logout', 'view_user', 'edit_user', 'delete_resource', 'create_assessment'];
    const mockAudit: AuditLog[] = [];
    for (let i = 0; i < 50; i++) {
      mockAudit.push({
        id: `audit-${i}`,
        user_id: `user-${Math.floor(Math.random() * 5)}`,
        user_email: `admin${Math.floor(Math.random() * 3)}@example.com`,
        action: actions[Math.floor(Math.random() * actions.length)],
        resource: `resource-${Math.floor(Math.random() * 100)}`,
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    setAuditLogs(mockAudit.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast('success', 'Session Terminated', 'User session has been terminated');
    setIsSessionDialogOpen(false);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? {...a, resolved: true} : a));
    showToast('success', 'Alert Resolved', 'Security alert marked as resolved');
  };

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = unresolvedAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  const stats = [
    {
      label: 'Active Sessions',
      value: sessions.length,
      icon: <Users className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
    {
      label: 'Unresolved Alerts',
      value: unresolvedAlerts.length,
      icon: <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} />
    },
    {
      label: 'Critical Issues',
      value: criticalAlerts.length,
      icon: <XCircle className="w-4 h-4" style={{ color: 'var(--color-danger-default)' }} />
    },
    {
      label: 'Audit Entries',
      value: auditLogs.length,
      icon: <Activity className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'var(--color-danger-default)';
      case 'high': return 'var(--color-warning-default)';
      case 'medium': return 'var(--color-info-default)';
      case 'low': return 'var(--color-success-default)';
      default: return 'var(--color-text-muted)';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Activity className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
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
        <AdminHeader
          title="Security Dashboard"
          description="Monitor security alerts, active sessions, and audit logs"
          stats={stats}
        />

        {/* Security Alerts */}
        <div>
          <h3 style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            marginBottom: 'var(--spacing-4)'
          }}>
            Security Alerts ({unresolvedAlerts.length} Unresolved)
          </h3>
          <div className="space-y-3">
            {alerts.filter(a => !a.resolved).slice(0, 5).map(alert => (
              <Card 
                key={alert.id}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div style={{ color: getSeverityColor(alert.severity) }}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <AdminStatusBadge status={resolveStatusVariant(alert.severity)} label={alert.severity.toUpperCase()} />
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {alert.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
                        {alert.description}
                      </p>

                      {alert.ip_address && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          IP: {alert.ip_address}
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <h3 style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            marginBottom: 'var(--spacing-4)'
          }}>
            Active Sessions ({sessions.length})
          </h3>
          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        User
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        IP Address
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Started
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Last Activity
                      </th>
                      <th className="px-4 py-3 text-center" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 10).map((session, idx) => (
                      <tr 
                        key={session.id}
                        style={{
                          borderBottom: idx < 9 ? '1px solid var(--color-border-default)' : 'none'
                        }}
                      >
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)' }}>
                          {session.user_email}
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                          {session.ip_address}
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                          {new Date(session.started_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                          {new Date(session.last_activity).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSession(session);
                              setIsSessionDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Audit Logs */}
        <div>
          <h3 style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            marginBottom: 'var(--spacing-4)'
          }}>
            Recent Audit Logs
          </h3>
          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        User
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Action
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Resource
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.slice(0, 15).map((log, idx) => (
                      <tr 
                        key={log.id}
                        style={{
                          borderBottom: idx < 14 ? '1px solid var(--color-border-default)' : 'none'
                        }}
                      >
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)' }}>
                          {log.user_email}
                        </td>
                        <td className="px-4 py-3">
                          <AdminStatusBadge status="neutral" label={log.action} />
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          {log.resource}
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          {log.ip_address}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Session Detail Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              View and manage active user session
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  {selectedSession.user_email}
                </p>
              </div>
              <div>
                <Label>IP Address</Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                  {selectedSession.ip_address}
                </p>
              </div>
              <div>
                <Label>Session Started</Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  {new Date(selectedSession.started_at).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Last Activity</Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  {new Date(selectedSession.last_activity).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSessionDialogOpen(false)}>
              Close
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedSession && handleTerminateSession(selectedSession.id)}
              style={{ backgroundColor: 'var(--color-danger-default)', color: 'white' }}
            >
              Terminate Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}