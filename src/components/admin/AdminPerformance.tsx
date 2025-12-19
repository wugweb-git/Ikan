import React, { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  Database,
  Cpu,
  HardDrive,
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNotifications } from '../../contexts/NotificationContext';
import { AdminHeader } from './AdminHeader';
import { useIsMobile } from '../../hooks/useIsMobile';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: number;
  active_connections: number;
  requests_per_minute: number;
  avg_response_time: number;
  error_rate: number;
}

interface PerformanceHistory {
  timestamp: string;
  cpu: number;
  memory: number;
  response_time: number;
  requests: number;
}

export function AdminPerformance() {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_io: 0,
    active_connections: 0,
    requests_per_minute: 0,
    avg_response_time: 0,
    error_rate: 0
  });
  const [history, setHistory] = useState<PerformanceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      // In production, fetch from backend
      // For now, generate realistic mock data
      generateMockMetrics();
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockMetrics = () => {
    const newMetrics: PerformanceMetrics = {
      cpu_usage: Math.floor(Math.random() * 40) + 30,
      memory_usage: Math.floor(Math.random() * 30) + 50,
      disk_usage: Math.floor(Math.random() * 20) + 25,
      network_io: Math.floor(Math.random() * 50) + 10,
      active_connections: Math.floor(Math.random() * 50) + 20,
      requests_per_minute: Math.floor(Math.random() * 200) + 100,
      avg_response_time: Math.floor(Math.random() * 100) + 50,
      error_rate: Math.random() * 2
    };
    setMetrics(newMetrics);

    // Generate history data
    const dataPoints = timeRange === '1h' ? 12 : timeRange === '24h' ? 24 : 30;
    const historyData: PerformanceHistory[] = [];
    const now = Date.now();
    const interval = timeRange === '1h' ? 5 * 60 * 1000 : timeRange === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    for (let i = dataPoints - 1; i >= 0; i--) {
      const timestamp = new Date(now - i * interval);
      historyData.push({
        timestamp: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpu: Math.floor(Math.random() * 40) + 30,
        memory: Math.floor(Math.random() * 30) + 50,
        response_time: Math.floor(Math.random() * 100) + 50,
        requests: Math.floor(Math.random() * 200) + 100
      });
    }
    setHistory(historyData);
  };

  const handleRefresh = () => {
    loadMetrics();
    showToast('success', 'Refreshed', 'Performance metrics refreshed');
  };

  const getUsageColor = (value: number) => {
    if (value < 50) return 'var(--color-success-default)';
    if (value < 75) return 'var(--color-warning-default)';
    return 'var(--color-danger-default)';
  };

  const stats = [
    {
      label: 'CPU Usage',
      value: `${metrics.cpu_usage}%`,
      icon: <Cpu className="w-4 h-4" style={{ color: getUsageColor(metrics.cpu_usage) }} />
    },
    {
      label: 'Memory',
      value: `${metrics.memory_usage}%`,
      icon: <HardDrive className="w-4 h-4" style={{ color: getUsageColor(metrics.memory_usage) }} />
    },
    {
      label: 'Avg Response',
      value: `${metrics.avg_response_time}ms`,
      icon: <Clock className="w-4 h-4" style={{ color: 'var(--color-info-default)' }} />
    },
    {
      label: 'Req/Min',
      value: metrics.requests_per_minute,
      icon: <Activity className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />
    },
  ];

  if (loading && history.length === 0) {
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
            Loading performance metrics...
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
          title="Performance Monitor"
          description="Real-time system performance and resource utilization"
          stats={stats}
          actions={
            <>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger style={{ width: '120px', height: 'var(--ikan-component-button-height)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
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
            </>
          }
        />

        {/* Resource Gauges */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'CPU Usage', value: metrics.cpu_usage, icon: Cpu },
            { label: 'Memory Usage', value: metrics.memory_usage, icon: HardDrive },
            { label: 'Disk Usage', value: metrics.disk_usage, icon: Database },
            { label: 'Network I/O', value: metrics.network_io, icon: Zap }
          ].map((resource) => (
            <Card 
              key={resource.label}
              style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <resource.icon className="w-5 h-5" style={{ color: getUsageColor(resource.value) }} />
                    <span style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)'
                    }}>
                      {resource.label}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: 'var(--text-xl)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: getUsageColor(resource.value)
                  }}>
                    {resource.value}%
                  </span>
                </div>
                <Progress 
                  value={resource.value} 
                  className="h-2"
                  style={{
                    backgroundColor: 'var(--color-bg-muted)'
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Real-time Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-primary-default)' }} />
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>
                {metrics.active_connections}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Active Connections
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-success-default)' }} />
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>
                {metrics.requests_per_minute}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Requests/Minute
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-info-default)' }} />
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>
                {metrics.avg_response_time}ms
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Avg Response Time
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2" style={{ color: metrics.error_rate > 1 ? 'var(--color-danger-default)' : 'var(--color-success-default)' }} />
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>
                {metrics.error_rate.toFixed(2)}%
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Error Rate
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CPU & Memory Chart */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-6">
            <h3 style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 'var(--spacing-4)'
            }}>
              Resource Usage Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="var(--color-text-muted)"
                  style={{ fontSize: 'var(--text-xs)' }}
                />
                <YAxis 
                  stroke="var(--color-text-muted)"
                  style={{ fontSize: 'var(--text-xs)' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="var(--color-primary-default)" 
                  strokeWidth={2}
                  name="CPU %"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="var(--color-info-default)" 
                  strokeWidth={2}
                  name="Memory %"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time & Requests Chart */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent className="p-6">
              <h3 style={{ 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--spacing-4)'
              }}>
                Response Time Trend
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="var(--color-text-muted)"
                    style={{ fontSize: 'var(--text-xs)' }}
                  />
                  <YAxis 
                    stroke="var(--color-text-muted)"
                    style={{ fontSize: 'var(--text-xs)' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="response_time" 
                    stroke="var(--color-warning-default)" 
                    fill="var(--color-warning-default)"
                    fillOpacity={0.3}
                    name="Response Time (ms)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent className="p-6">
              <h3 style={{ 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--spacing-4)'
              }}>
                Request Volume
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="var(--color-text-muted)"
                    style={{ fontSize: 'var(--text-xs)' }}
                  />
                  <YAxis 
                    stroke="var(--color-text-muted)"
                    style={{ fontSize: 'var(--text-xs)' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  />
                  <Bar 
                    dataKey="requests" 
                    fill="var(--color-success-default)"
                    name="Requests"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
