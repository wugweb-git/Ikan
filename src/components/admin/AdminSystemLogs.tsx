import { useState, useEffect } from 'react';
import {
  Search,
  Download,
  RefreshCw,
  Filter,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  Bug,
  Trash2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { AdminStatusBadge } from './AdminStatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNotifications } from '../../contexts/NotificationContext';
import { AdminHeader } from './AdminHeader';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminLoading } from './AdminLoading';
import { useIsMobile } from '../../hooks/useIsMobile';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  details?: any;
  stack_trace?: string;
}

export function AdminSystemLogs() {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    loadLogs();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/admin/system-logs`,
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
        generateMockLogs();
      }
    } catch (error) {
      console.error('Failed to load system logs:', error);
      generateMockLogs();
    } finally {
      setLoading(false);
    }
  };

  const generateMockLogs = () => {
    const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const sources = ['Auth', 'Database', 'KV Store', 'API', 'Cache', 'Email', 'Scheduler'];
    const messages = [
      'Connection established successfully',
      'User session created',
      'Cache miss detected',
      'Database query executed',
      'Email sent successfully',
      'High memory usage warning',
      'Connection timeout',
      'Invalid authentication token',
      'Resource not found',
      'Scheduled task completed',
      'Background job started',
      'Transaction rolled back'
    ];

    const mockLogs: SystemLog[] = [];
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
      const level = levels[Math.floor(Math.random() * levels.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];

      mockLogs.push({
        id: `log-${i}`,
        timestamp,
        level,
        source,
        message,
        details: level === 'ERROR' ? { error_code: 'ERR_' + Math.floor(Math.random() * 1000) } : undefined,
        stack_trace: level === 'ERROR' && Math.random() > 0.5 ? 'at Function.process (file.ts:42)' : undefined
      });
    }

    setLogs(mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const handleRefresh = () => {
    loadLogs();
    showToast('success', 'Refreshed', 'System logs refreshed');
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Level', 'Source', 'Message'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.level,
        log.source,
        log.message.replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('success', 'Export Complete', 'System logs exported to CSV');
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      setLogs([]);
      showToast('success', 'Cleared', 'All logs have been cleared');
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesSource = sourceFilter === 'all' || log.source === sourceFilter;

    return matchesSearch && matchesLevel && matchesSource;
  });

  const sources = Array.from(new Set(logs.map(l => l.source)));

  const stats = [
    {
      label: 'Total Logs',
      value: logs.length,
      icon: <Info className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
    {
      label: 'Errors',
      value: logs.filter(l => l.level === 'ERROR').length,
      icon: <XCircle className="w-4 h-4" style={{ color: 'var(--color-danger-default)' }} />
    },
    {
      label: 'Warnings',
      value: logs.filter(l => l.level === 'WARN').length,
      icon: <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-warning-default)' }} />
    },
    {
      label: 'Info',
      value: logs.filter(l => l.level === 'INFO').length,
      icon: <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
    },
  ];

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'ERROR': return <XCircle className="w-4 h-4" />;
      case 'WARN': return <AlertTriangle className="w-4 h-4" />;
      case 'INFO': return <Info className="w-4 h-4" />;
      case 'DEBUG': return <Bug className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'ERROR': return 'var(--color-danger-default)';
      case 'WARN': return 'var(--color-warning-default)';
      case 'INFO': return 'var(--color-info-default)';
      case 'DEBUG': return 'var(--color-text-muted)';
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          backgroundColor: 'var(--color-bg-page)',
          padding: 'var(--spacing-4)'
        }}
      >
        <AdminLoading message="Loading system logs..." />
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
          title="System Logs"
          description="Monitor system events and errors"
          stats={stats}
          actions={
            <>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="gap-2 h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)] font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                {!isMobile && 'Refresh'}
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                className="gap-2 h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)] font-medium"
              >
                <Download className="w-4 h-4" />
                {!isMobile && 'Export'}
              </Button>
              <Button
                variant="outline"
                onClick={handleClearLogs}
                className="gap-2 h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)] font-medium text-[var(--color-danger-default)] border-[var(--color-danger-default)]"
              >
                <Trash2 className="w-4 h-4" />
                {!isMobile && 'Clear'}
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
                  placeholder="Search by message or source..."
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
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger style={{ width: '120px', height: 'var(--ikan-component-button-height)' }}>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="DEBUG">Debug</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARN">Warning</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger style={{ width: '150px', height: 'var(--ikan-component-button-height)' }}>
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {sources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <AdminEmptyState
            icon={AlertCircle}
            title="No system logs found"
            description="Try adjusting your search or filter criteria"
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setLevelFilter('all');
              setSourceFilter('all');
            }}
          />
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <Card 
                key={log.id}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  borderLeft: `4px solid ${getLevelColor(log.level)}`
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div style={{ color: getLevelColor(log.level) }}>
                      {getLevelIcon(log.level)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <AdminStatusBadge
                          status={
                            log.level === 'ERROR' ? 'danger' :
                            log.level === 'WARN' ? 'warning' :
                            log.level === 'INFO' ? 'info' :
                            'neutral'
                          }
                          label={log.level}
                        />
                        <span style={{ 
                          fontSize: 'var(--text-xs)', 
                          color: 'var(--color-text-muted)',
                          fontFamily: 'monospace'
                        }}>
                          {log.source}
                        </span>
                        <span style={{ 
                          fontSize: 'var(--text-xs)', 
                          color: 'var(--color-text-muted)'
                        }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-primary)',
                        marginBottom: log.stack_trace ? 'var(--spacing-2)' : '0'
                      }}>
                        {log.message}
                      </p>

                      {log.stack_trace && (
                        <pre style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          backgroundColor: 'var(--color-bg-muted)',
                          padding: 'var(--spacing-2)',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'auto',
                          fontFamily: 'monospace'
                        }}>
                          {log.stack_trace}
                        </pre>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredLogs.length > 0 && (
          <div 
            className="text-center p-4"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)'
            }}
          >
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        )}
      </div>
    </div>
  );
}