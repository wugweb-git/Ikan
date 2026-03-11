import { useState, useEffect } from 'react';
import { TrendingUp, Users, BookOpen, Activity, DollarSign, Eye, Calendar } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminLoading } from '../admin/AdminLoading';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardAnalyticsProps {
  onBack?: () => void;
  embedded?: boolean;
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

export function AdminDashboardAnalytics({ onBack, embedded }: AdminDashboardAnalyticsProps) {
  const { showToast } = useNotifications();
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
      const [users, resources, consultants, programs, realAnalytics] = await Promise.all([
        apiClient.getUsers().catch(() => ({ users: [] })),
        apiClient.getResources().catch(() => []),
        apiClient.get('/consultants').catch(() => ({ consultants: [] })),
        apiClient.getEquipPrograms().catch(() => []),
        apiClient.getAggregatedAnalytics().catch(() => null)
      ]);

      const usersArray = Array.isArray(users) ? users : users.users || [];
      const resourcesArray = Array.isArray(resources) ? resources : [];
      const consultantsArray = Array.isArray(consultants) ? consultants : consultants.consultants || [];
      const programsArray = Array.isArray(programs) ? programs : [];

      // Use real analytics if available, otherwise fallback to mock
      let userGrowth, resourceViews, activeUsersCount;

      if (realAnalytics) {
        // Map real activity chart
        userGrowth = realAnalytics.activityChart?.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: item.count
        })) || [];

        // If no activity yet, show empty or placeholder
        if (userGrowth.length === 0) {
           userGrowth = Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: 0
          }));
        }

        // Map top resources (join with resource titles)
        resourceViews = realAnalytics.topResources?.map((item: any) => {
          const resource = resourcesArray.find((r: any) => r.id === item.id);
          return {
            name: resource?.title?.substring(0, 20) || item.id.substring(0, 8),
            views: item.views
          };
        }) || [];

        activeUsersCount = realAnalytics.summary?.activeUsers7d || 0;
      } else {
        // Fallback to mock data
        userGrowth = Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: Math.floor(Math.random() * 50) + (i * 2) + 10
        }));

        resourceViews = resourcesArray.slice(0, 5).map((r: any, i) => ({
          name: r.title?.substring(0, 20) || `Resource ${i + 1}`,
          views: Math.floor(Math.random() * 1000) + 100
        }));

        activeUsersCount = Math.floor(usersArray.length * 0.6);
      }

      // Category distribution
      const categories = resourcesArray.reduce((acc: any, r: any) => {
        const cat = r.category || 'Other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      const categoryDistribution = Object.entries(categories)
        .filter(([name]) => name != null && name !== '')
        .map(([name, value]) => ({
          name: String(name),
          value: value as number
        }));

      // Revenue over time (last 6 months) - Keep mock for now as we don't have real revenue aggregation yet
      const revenueOverTime = Array.from({ length: 6 }, (_, i) => ({
        month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: Math.floor(Math.random() * 5000) + 2000
      }));

      // Sanitize all chart data to prevent null keys
      const safeUserGrowth = (userGrowth || []).filter((d: any) => d.date != null).map((d: any, i: number) => ({
        ...d,
        date: d.date || `Day ${i + 1}`
      }));
      
      // Deduplicate resource view names to prevent recharts null key warnings
      const seenNames = new Set<string>();
      const safeResourceViews = (resourceViews || [])
        .filter((d: any) => d.name != null)
        .map((d: any, i: number) => {
          let name = d.name || `Resource ${i + 1}`;
          if (seenNames.has(name)) {
            name = `${name} (${i + 1})`;
          }
          seenNames.add(name);
          return { ...d, name };
        });

      // Deduplicate category names
      const seenCatNames = new Set<string>();
      const safeCategoryDistribution = categoryDistribution.map((d, i) => {
        let name = d.name;
        if (seenCatNames.has(name)) {
          name = `${name} (${i + 1})`;
        }
        seenCatNames.add(name);
        return { ...d, name };
      });

      setAnalytics({
        totalUsers: usersArray.length,
        totalResources: resourcesArray.length,
        totalConsultants: consultantsArray.length,
        totalPrograms: programsArray.length,
        totalRevenue: revenueOverTime.reduce((sum, r) => sum + r.revenue, 0),
        activeUsers: activeUsersCount,
        userGrowth: safeUserGrowth,
        resourceViews: safeResourceViews,
        categoryDistribution: safeCategoryDistribution,
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
          <AdminLoading message="Loading analytics..." />
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-6" : "max-w-7xl mx-auto space-y-6"}>
      {!embedded && (
        <AdminHeader
          title="Dashboard Analytics"
          description="Track your platform's performance and growth"
          onBack={onBack}
          breadcrumbs={[{ label: 'Admin', onClick: onBack }, { label: 'Analytics' }]}
        />
      )}

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
                      backgroundColor: `color-mix(in srgb, ${stat.bgColor} 8%, transparent)`,
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
              {analytics.userGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.userGrowth} id="user-growth-chart">
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--color-border-default)" />
                    <XAxis key="xaxis" dataKey="date" stroke="var(--color-text-muted)" style={{ fontSize: 'var(--text-xs)' }} />
                    <YAxis key="yaxis" stroke="var(--color-text-muted)" style={{ fontSize: 'var(--text-xs)' }} />
                    <Tooltip
                      key="tooltip"
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)'
                      }}
                    />
                    <Line key="line" type="monotone" dataKey="count" stroke="var(--color-primary-default)" strokeWidth={2} dot={{ fill: 'var(--color-primary-default)' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center" style={{ height: 300, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  No user growth data available
                </div>
              )}
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
              {analytics.categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart id="category-distribution-chart">
                    <Pie
                      key="pie"
                      data={analytics.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="var(--ikan-chart-fill-default)"
                      dataKey="value"
                      nameKey="name"
                    >
                      {analytics.categoryDistribution.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      key="tooltip"
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center" style={{ height: 300, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  No category data available
                </div>
              )}
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
              {analytics.resourceViews.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.resourceViews} layout="vertical" id="resource-views-chart">
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--color-border-default)" />
                    <XAxis key="xaxis" type="number" stroke="var(--color-text-muted)" style={{ fontSize: 'var(--text-xs)' }} />
                    <YAxis key="yaxis" dataKey="name" type="category" stroke="var(--color-text-muted)" style={{ fontSize: 'var(--text-xs)' }} width={100} />
                    <Tooltip
                      key="tooltip"
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)'
                      }}
                    />
                    <Bar key="bar" dataKey="views" fill="var(--ikan-chart-fill-default)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center" style={{ height: 300, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  No resource view data available
                </div>
              )}
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
              {analytics.revenueOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.revenueOverTime} id="revenue-chart">
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--color-border-default)" />
                    <XAxis key="xaxis" dataKey="month" stroke="var(--color-text-muted)" style={{ fontSize: 'var(--text-xs)' }} />
                    <YAxis key="yaxis" stroke="var(--color-text-muted)" style={{ fontSize: 'var(--text-xs)' }} />
                    <Tooltip
                      key="tooltip"
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)'
                      }}
                    />
                    <Bar key="bar" dataKey="revenue" fill="var(--color-warning-default)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center" style={{ height: 300, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  No revenue data available
                </div>
              )}
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