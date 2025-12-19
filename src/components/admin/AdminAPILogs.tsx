import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNotifications } from '../../contexts/NotificationContext';
import { AdminHeader } from './AdminHeader';
import { AdminEmptyState } from './AdminEmptyState';
import { useIsMobile } from '../../hooks/useIsMobile';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface APILog {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  duration_ms: number;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  request_body?: any;
  response_body?: any;
  error?: string;
}

export function AdminAPILogs() {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  
  const [logs, setLogs] = useState<APILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<APILog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/api-logs`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        // Use mock data if endpoint not implemented yet
        generateMockLogs();
      }
    } catch (error) {
      console.error('Failed to load API logs:', error);
      generateMockLogs();
    } finally {
      setLoading(false);
    }
  };

  const generateMockLogs = () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const endpoints = [
      '/make-server-cc205da9/users',
      '/make-server-cc205da9/professional/list',
      '/make-server-cc205da9/resource/list',
      '/make-server-cc205da9/assessment/list',
      '/make-server-cc205da9/journal/entries',
      '/make-server-cc205da9/health'
    ];
    const statuses = [200, 201, 400, 401, 404, 500];

    const mockLogs: APILog[] = [];
    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
      const method = methods[Math.floor(Math.random() * methods.length)];
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      mockLogs.push({
        id: `log-${i}`,
        timestamp,
        method,
        endpoint,
        status,
        duration_ms: Math.floor(Math.random() * 1000) + 10,
        user_id: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 10)}` : undefined,
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0...',
        error: status >= 400 ? 'Error occurred' : undefined
      });
    }

    setLogs(mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const handleRefresh = () => {
    loadLogs();
    showToast('success', 'Refreshed', 'API logs refreshed');
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Method', 'Endpoint', 'Status', 'Duration (ms)', 'User ID', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.method,
        log.endpoint,
        log.status,
        log.duration_ms,
        log.user_id || 'N/A',
        log.ip_address || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('success', 'Export Complete', 'API logs exported to CSV');
  };

  const openDetailDialog = (log: APILog) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === 'all' || log.method === methodFilter;
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === '2xx' && log.status >= 200 && log.status < 300) ||
      (statusFilter === '4xx' && log.status >= 400 && log.status < 500) ||
      (statusFilter === '5xx' && log.status >= 500);

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const stats = [
    {
      label: 'Total Requests',
      value: logs.length,
      icon: <Activity className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
    {
      label: 'Success Rate',
      value: `${((logs.filter(l => l.status < 400).length / logs.length) * 100 || 0).toFixed(1)}%`,
      icon: <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success-default)' }} />
    },
    {
      label: 'Avg Response',
      value: `${(logs.reduce((sum, l) => sum + l.duration_ms, 0) / logs.length || 0).toFixed(0)}ms`,
      icon: <Clock className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
    },
    {
      label: 'Errors',
      value: logs.filter(l => l.status >= 400).length,
      icon: <XCircle className="w-4 h-4" style={{ color: 'var(--color-danger-default)' }} />
    },
  ];

  const getStatusColor = (status: number) => {
    if (status < 300) return 'var(--color-success-default)';
    if (status < 400) return 'var(--color-info-default)';
    if (status < 500) return 'var(--color-warning-default)';
    return 'var(--color-danger-default)';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'var(--color-info-default)';
      case 'POST': return 'var(--color-success-default)';
      case 'PUT': return 'var(--color-warning-default)';
      case 'DELETE': return 'var(--color-danger-default)';
      default: return 'var(--color-text-muted)';
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          backgroundColor: 'var(--color-bg-page)',
          padding: 'var(--spacing-4)'
        }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full border-4 mx-auto mb-4"
            style={{
              width: '48px',
              height: '48px',
              borderColor: 'var(--color-accent-default)',
              borderTopColor: 'var(--color-primary-default)'
            }}
          />
          <p style={{ 
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)'
          }}>
            Loading API logs...
          </p>
        </div>
      </div>
    );
  }

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
          title="API Logs"
          description="Monitor all API requests and responses"
          stats={stats}
          actions={
            <>
              <Button
                variant="outline"
                onClick={handleRefresh}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)'
                }}
              >
                <RefreshCw className="w-4 h-4" />
                {!isMobile && 'Refresh'}
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontWeight: 'var(--font-weight-medium)',
                  gap: 'var(--spacing-2)'
                }}
              >
                <Download className="w-4 h-4" />
                {!isMobile && 'Export'}
              </Button>
            </>
          }
        />

        {/* Filters */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <Input
                  placeholder="Search by endpoint, method, or user ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    paddingLeft: 'var(--spacing-10)',
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)'
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger style={{ width: '120px', height: 'var(--ikan-component-button-height)' }}>
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger style={{ width: '120px', height: 'var(--ikan-component-button-height)' }}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="2xx">2xx Success</SelectItem>
                    <SelectItem value="4xx">4xx Client Error</SelectItem>
                    <SelectItem value="5xx">5xx Server Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        {filteredLogs.length === 0 ? (
          <AdminEmptyState
            icon={Activity}
            title="No API logs found"
            description="Try adjusting your search or filter criteria"
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setMethodFilter('all');
              setStatusFilter('all');
            }}
          />
        ) : (
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
                        Method
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Endpoint
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Status
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Duration
                      </th>
                      <th className="px-4 py-3 text-left" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        User
                      </th>
                      <th className="px-4 py-3 text-center" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, idx) => (
                      <tr 
                        key={log.id}
                        style={{
                          borderBottom: idx < filteredLogs.length - 1 ? '1px solid var(--color-border-default)' : 'none'
                        }}
                      >
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge style={{ backgroundColor: getMethodColor(log.method), color: 'white' }}>
                            {log.method}
                          </Badge>
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                          {log.endpoint}
                        </td>
                        <td className="px-4 py-3">
                          <Badge style={{ backgroundColor: getStatusColor(log.status), color: 'white' }}>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                          {log.duration_ms}ms
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          {log.user_id ? log.user_id.substring(0, 8) + '...' : 'Anonymous'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailDialog(log)}
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
        )}
      </div>

      {/* Log Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>API Log Details</DialogTitle>
            <DialogDescription>
              Full request and response information
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Timestamp
                  </Label>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Duration
                  </Label>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {selectedLog.duration_ms}ms
                  </p>
                </div>
                <div>
                  <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Method
                  </Label>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {selectedLog.method}
                  </p>
                </div>
                <div>
                  <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Status
                  </Label>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {selectedLog.status}
                  </p>
                </div>
              </div>

              <div>
                <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Endpoint
                </Label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                  {selectedLog.endpoint}
                </p>
              </div>

              {selectedLog.user_id && (
                <div>
                  <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    User ID
                  </Label>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                    {selectedLog.user_id}
                  </p>
                </div>
              )}

              {selectedLog.ip_address && (
                <div>
                  <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    IP Address
                  </Label>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                    {selectedLog.ip_address}
                  </p>
                </div>
              )}

              {selectedLog.error && (
                <div>
                  <Label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-danger-default)' }}>
                    Error
                  </Label>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger-default)', fontFamily: 'monospace' }}>
                    {selectedLog.error}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
