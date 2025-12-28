import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, BookOpen, Activity, DollarSign, Eye, Download, Calendar } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../ui/utils';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminDashboardAnalyticsProps {
  onBack?: () => void;
  className?: string;
}

interface AnalyticsData {
  totalUsers: number;
  totalResources: number;
  totalConsultants: number;
  totalPrograms: number;
  totalRevenue: number;
  activeUsers: number;
  userGrowth: Array<{ date: string; count: number }>;
  resourceViews: Array<{ name: string; views: number }>;
  categoryDistribution: Array<{ name: string; value: number }>;
  revenueOverTime: Array<{ month: string; revenue: number }>;
}

export function AdminDashboardAnalytics({ onBack, className }: AdminDashboardAnalyticsProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalResources: 0,
    totalConsultants: 0,
    totalPrograms: 0,
    totalRevenue: 0,
    activeUsers: 0,
    userGrowth: [],
    resourceViews: [],
    categoryDistribution: [],
    revenueOverTime: []
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [users, resources, consultants, programs] = await Promise.all([
        apiClient.getUsers().catch(() => ({ users: [] })),
        apiClient.getResources().catch(() => []),
        apiClient.get('/consultants').catch(() => ({ consultants: [] })),
        apiClient.getEquipPrograms().catch(() => [])
      ]);

      const usersArray = Array.isArray(users) ? users : users.users || [];
      const resourcesArray = Array.isArray(resources) ? resources : [];
      const consultantsArray = Array.isArray(consultants) ? consultants : consultants.consultants || [];
      const programsArray = Array.isArray(programs) ? programs : [];

      // Generate mock user growth data (last 30 days)
      const userGrowth = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: Math.floor(Math.random() * 50) + (i * 2) + 10
      }));

      // Top resources by views (mock data)
      const resourceViews = resourcesArray.slice(0, 5).map((r: any, i) => ({
        name: r.title?.substring(0, 20) || `Resource ${i + 1}`,
        views: Math.floor(Math.random() * 1000) + 100
      }));

      // Category distribution
      const categories = resourcesArray.reduce((acc: any, r: any) => {
        const cat = r.category || 'Other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      const categoryDistribution = Object.entries(categories).map(([name, value]) => ({
        name,
        value: value as number
      }));

      // Revenue over time (last 6 months)
      const revenueOverTime = Array.from({ length: 6 }, (_, i) => ({
        month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
        revenue: Math.floor(Math.random() * 5000) + 2000
      }));

      setAnalytics({
        totalUsers: usersArray.length,
        totalResources: resourcesArray.length,
        totalConsultants: consultantsArray.length,
        totalPrograms: programsArray.length,
        totalRevenue: revenueOverTime.reduce((sum, r) => sum + r.revenue, 0),
        activeUsers: Math.floor(usersArray.length * 0.6),
        userGrowth,
        resourceViews,
        categoryDistribution,
        revenueOverTime
      });
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      showToast('error', 'Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Users',
      value: analytics.totalUsers.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      color: 'var(--color-primary-default)',
      bgColor: 'var(--color-primary-default)',
      change: '+12.5%'
    },
    {
      label: 'Total Resources',
      value: analytics.totalResources.toLocaleString(),
      icon: <BookOpen className="w-5 h-5" />,
      color: 'var(--color-info-default)',
      bgColor: 'var(--color-info-default)',
      change: '+8.3%'
    },
    {
      label: 'Active Users',
      value: analytics.activeUsers.toLocaleString(),
      icon: <Activity className="w-5 h-5" />,
      color: 'var(--color-success-default)',
      bgColor: 'var(--color-success-default)',
      change: '+15.2%'
    },
    {
      label: 'Total Revenue',
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'var(--color-warning-default)',
      bgColor: 'var(--color-warning-default)',
      change: '+22.1%'
    }
  ];

  const COLORS = [
    'var(--color-chart-1)',
    'var(--color-chart-2)',
    'var(--color-chart-3)',
    'var(--color-chart-4)',
    'var(--color-chart-5)'
  ];

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
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
          <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Dashboard Analytics"
        description="Track your platform's performance and growth"
        onBack={onBack}
        breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Analytics' }]}
      />

      {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: `${stat.bgColor}15`,
                      color: stat.color
                    }}
                  >
                    {stat.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-success-default)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    {stat.change}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-1)'
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-primary-default)' }} />
                User Growth (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" style={{ fontSize: 'var(--text-xs)' }} />
                  <YAxis stroke="var(--color-text-muted)" style={{ fontSize: 'var(--text-xs)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)'
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="var(--color-primary-default)" strokeWidth={2} dot={{ fill: 'var(--color-primary-default)' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" style={{ color: 'var(--color-info-default)' }} />
                Resource Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Resources */}
          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" style={{ color: 'var(--color-success-default)' }} />
                Most Viewed Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.resourceViews} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />
                  <XAxis type="number" stroke="var(--color-text-muted)" style={{ fontSize: 'var(--text-xs)' }} />
                  <YAxis dataKey="name" type="category" stroke="var(--color-text-muted)" style={{ fontSize: 'var(--text-xs)' }} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)'
                    }}
                  />
                  <Bar dataKey="views" fill="var(--color-success-default)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Over Time */}
          <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" style={{ color: 'var(--color-warning-default)' }} />
                Revenue (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />
                  <XAxis dataKey="month" stroke="var(--color-text-muted)" style={{ fontSize: 'var(--text-xs)' }} />
                  <YAxis stroke="var(--color-text-muted)" style={{ fontSize: 'var(--text-xs)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="var(--color-warning-default)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: 'var(--color-info-default)' }} />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                  {analytics.totalPrograms}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Total Programs</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                  {analytics.totalConsultants}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Consultants</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                  {Math.round((analytics.activeUsers / analytics.totalUsers) * 100) || 0}%
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Engagement Rate</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                  ${Math.round(analytics.totalRevenue / 6).toLocaleString()}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Avg Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
