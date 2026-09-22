import { Users, BookOpen, Activity, Calendar, Stethoscope, Blocks } from 'lucide-react';
import { apiClient } from '../../shared/api/api';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { AdminSkeleton, AdminErrorState } from '../ui/kit/AdminErrorState';
import { useAdminResource } from '../ui/hooks/useAdminResource';
import { Card, CardContent } from '../ui/card';

interface AdminDashboardAnalyticsProps {
  /** Rendered inside ReportingHome: no page header/frame of its own. */
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

const EMPTY_ANALYTICS: AnalyticsData = {
  totalUsers: 0,
  totalResources: 0,
  totalConsultants: 0,
  totalPrograms: 0,
  activeUsers: 0,
  totalAssessments: 0,
};

/**
 * Every source falls back independently — to an empty value on error, or
 * after 12s — so one slow or failing endpoint never blanks the others.
 */
async function loadAnalytics(): Promise<AnalyticsData> {
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

  const usersArray = Array.isArray(users) ? users : users.users || [];
  const resourcesArray = Array.isArray(resources) ? resources : [];
  const consultantsArray = Array.isArray(consultants) ? consultants : consultants.consultants || [];
  const programsArray = Array.isArray(programs) ? programs : [];

  const activeUsersCount = realAnalytics?.summary?.activeUsers7d || 0;

  return {
    totalUsers: usersArray.length,
    totalResources: resourcesArray.length,
    totalConsultants: consultantsArray.length,
    totalPrograms: programsArray.length,
    activeUsers: activeUsersCount,
    totalAssessments: 0,
  };
}

export function AdminDashboardAnalytics({ embedded }: AdminDashboardAnalyticsProps) {
  const { data: analytics, loading, error, reload } = useAdminResource<AnalyticsData>(loadAnalytics, {
    initialData: EMPTY_ANALYTICS,
    errorTitle: 'Error',
    errorMessage: 'Failed to load analytics data',
  });

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

  const grid = (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border-default)]"
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
            <p className="text-2xl font-medium text-[var(--color-text-primary)] leading-[1.2]">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {stat.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (embedded) {
    if (loading) return <div className="space-y-6"><AdminSkeleton rows={3} /></div>;
    if (error) {
      return (
        <div className="space-y-6">
          <AdminErrorState title="Stats Unavailable" message={error} onRetry={reload} />
        </div>
      );
    }
    return <div className="space-y-4">{grid}</div>;
  }

  return (
    <AdminPageLayout
      title="Platform Stats"
      description={loading ? 'Loading...' : error ? 'Current platform metrics' : 'Current platform metrics at a glance'}
      loading={loading}
      loadingFallback={<AdminSkeleton rows={3} />}
      error={error}
      errorTitle="Stats Unavailable"
      onRetry={reload}
      maxWidth="2xl"
    >
      {grid}
    </AdminPageLayout>
  );
}
