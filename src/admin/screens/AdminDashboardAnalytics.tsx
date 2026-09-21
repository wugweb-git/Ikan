import { useState, useEffect } from 'react';
import { Users, BookOpen, Activity, Calendar, Stethoscope, Blocks } from 'lucide-react';
import { useNotifications } from '../../shared/contexts/NotificationContext';
import { apiClient } from '../../shared/api-client';
import { AdminHeader } from '../components/AdminHeader';
import { AdminSkeleton, AdminErrorState } from '../components/AdminErrorState';
import { Card, CardContent } from '../ui/card';

interface AdminDashboardAnalyticsProps {
  onBack?: () => void;
  embedded?: boolean;
}

interface AnalyticsData {
  totalUsers: number;
  totalResources: number;
  totalConsultants: number;
  totalPrograms: number;
  activeUsers: number;
  totalAssessments: number;
}

export function AdminDashboardAnalytics({ onBack, embedded }: AdminDashboardAnalyticsProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalResources: 0,
    totalConsultants: 0,
    totalPrograms: 0,
    activeUsers: 0,
    totalAssessments: 0,
  });

  useEffect(() => {
    const controller = new AbortController();
    loadAnalytics(controller.signal);
    return () => controller.abort();
  }, []);

  const loadAnalytics = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      
      const withTimeout = <T,>(p: Promise<T>, fallback: T): Promise<T> => {
        return Promise.race([
          p,
          new Promise<T>((resolve) => setTimeout(() => resolve(fallback), 12000))
        ]);
      };

      const [users, resources, consultants, programs, realAnalytics] = await Promise.all([
        withTimeout(apiClient.getUsers().catch(() => ({ users: [] })), { users: [] }),
        withTimeout(apiClient.getResources().catch(() => []), []),
        withTimeout(apiClient.get('/consultants').catch(() => ({ consultants: [] })), { consultants: [] }),
        withTimeout(apiClient.getEquipPrograms().catch(() => []), []),
        withTimeout(apiClient.getAggregatedAnalytics().catch(() => null), null)
      ]);

      if (signal?.aborted) return;

      const usersArray = Array.isArray(users) ? users : users.users || [];
      const resourcesArray = Array.isArray(resources) ? resources : [];
      const consultantsArray = Array.isArray(consultants) ? consultants : consultants.consultants || [];
      const programsArray = Array.isArray(programs) ? programs : [];

      const activeUsersCount = realAnalytics?.summary?.activeUsers7d || 0;

      setAnalytics({
        totalUsers: usersArray.length,
        totalResources: resourcesArray.length,
        totalConsultants: consultantsArray.length,
        totalPrograms: programsArray.length,
        activeUsers: activeUsersCount,
        totalAssessments: 0,
      });
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      setError('Failed to load analytics data');
      showToast('error', 'Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Users',
      value: analytics.totalUsers,
      icon: <Users className="w-5 h-5" />,
      color: '#2A2A2A',
    },
    {
      label: 'Active (7d)',
      value: analytics.activeUsers,
      icon: <Activity className="w-5 h-5" />,
      color: '#22C55E',
    },
    {
      label: 'Resources',
      value: analytics.totalResources,
      icon: <BookOpen className="w-5 h-5" />,
      color: '#3B82F6',
    },
    {
      label: 'Equip Programs',
      value: analytics.totalPrograms,
      icon: <Blocks className="w-5 h-5" />,
      color: '#8B5CF6',
    },
    {
      label: 'Consultants',
      value: analytics.totalConsultants,
      icon: <Stethoscope className="w-5 h-5" />,
      color: '#F59E0B',
    },
    {
      label: 'Engagement',
      value: analytics.totalUsers > 0 ? `${Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}%` : '0%',
      icon: <Calendar className="w-5 h-5" />,
      color: '#EC4899',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {!embedded && (
          <AdminHeader
            title="Platform Stats"
            description="Loading..."
          />
        )}
        <AdminSkeleton rows={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {!embedded && (
          <AdminHeader
            title="Platform Stats"
            description="Current platform metrics"
          />
        )}
        <AdminErrorState
          title="Stats Unavailable"
          message={error}
          onRetry={loadAnalytics}
        />
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-4" : "max-w-7xl mx-auto space-y-6"}>
      {!embedded && (
        <AdminHeader
          title="Platform Stats"
          description="Current platform metrics at a glance"
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, index) => (
          <Card
            key={index}
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${stat.color}12`,
                    color: stat.color
                  }}
                >
                  {stat.icon}
                </div>
              </div>
              <p
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-base)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.2,
                }}
              >
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)', marginTop: '2px' }}>
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
