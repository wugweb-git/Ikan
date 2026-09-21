import { useState, useEffect } from 'react';
import { Users, Activity, CircleCheck, X, Target } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../shared/api-client';
import { AdminHeader } from '../components/AdminHeader';
import { AdminLoading } from '../components/AdminLoading';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../ui/utils';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminStatusBadge } from '../components/AdminStatusBadge';
import { Progress } from '../ui/progress';

interface AdminEquipAnalyticsProps {
  onBack?: () => void;
  className?: string;
}

interface EquipEnrollment {
  id: string;
  user_id: string;
  program_id: string;
  program_title: string;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  current_day: number;
  total_days: number;
  status: 'enrolled' | 'in-progress' | 'completed' | 'dropped';
  completion_percentage: number;
  onboarding_responses?: Record<string, any>;
  daily_progress?: Array<{
    day: number;
    completed: boolean;
    activities_completed: number;
    total_activities: number;
    completed_at?: string;
  }>;
}

interface ProgramAnalytics {
  program_id: string;
  program_title: string;
  total_enrollments: number;
  active_users: number;
  completed_users: number;
  dropped_users: number;
  avg_completion_rate: number;
  avg_time_to_complete: number; // in days
  most_common_drop_day: number;
}

const COLORS = ['var(--ikan-chart-1)', 'var(--ikan-chart-2)', 'var(--ikan-chart-3)', 'var(--ikan-chart-4)', 'var(--ikan-chart-5)', 'var(--ikan-chart-6)'];

export function AdminEquipAnalytics({ onBack, className }: AdminEquipAnalyticsProps) {
  const { showToast } = useNotifications();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EquipEnrollment[]>([]);
  const [programAnalytics, setProgramAnalytics] = useState<ProgramAnalytics[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch enrollments and programs
      const [enrollmentsData, programsData] = await Promise.all([
        apiClient.getEquipEnrollments(),
        apiClient.getEquipPrograms().catch(() => [])
      ]);

      const enrollmentsArray = Array.isArray(enrollmentsData) ? enrollmentsData : [];
      const programsArray = Array.isArray(programsData) ? programsData : [];

      // Calculate analytics per program
      const analytics: ProgramAnalytics[] = programsArray.map((program: any) => {
        const programEnrollments = enrollmentsArray.filter((e: any) => e.program_id === program.id);
        
        const totalEnrollments = programEnrollments.length;
        const activeUsers = programEnrollments.filter((e: any) => e.status === 'in-progress').length;
        const completedUsers = programEnrollments.filter((e: any) => e.status === 'completed').length;
        const droppedUsers = programEnrollments.filter((e: any) => e.status === 'dropped').length;
        
        const avgCompletionRate = totalEnrollments > 0
          ? (completedUsers / totalEnrollments) * 100
          : 0;

        // Calculate average time to complete
        const completedEnrollments = programEnrollments.filter((e: any) => e.completed_at && e.started_at);
        const avgTimeToComplete = completedEnrollments.length > 0
          ? completedEnrollments.reduce((sum: number, e: any) => {
              const start = new Date(e.started_at).getTime();
              const end = new Date(e.completed_at).getTime();
              return sum + (end - start) / (1000 * 60 * 60 * 24);
            }, 0) / completedEnrollments.length
          : 0;

        // Find most common drop day
        const dropDays = programEnrollments
          .filter((e: any) => e.status === 'dropped')
          .map((e: any) => e.current_day);
        const mostCommonDropDay = dropDays.length > 0
          ? dropDays.sort((a: number, b: number) => 
              dropDays.filter(v => v === a).length - dropDays.filter(v => v === b).length
            ).pop() || 0
          : 0;

        return {
          program_id: program.id,
          program_title: program.title,
          total_enrollments: totalEnrollments,
          active_users: activeUsers,
          completed_users: completedUsers,
          dropped_users: droppedUsers,
          avg_completion_rate: Math.round(avgCompletionRate),
          avg_time_to_complete: Math.round(avgTimeToComplete),
          most_common_drop_day: mostCommonDropDay
        };
      });

      setEnrollments(enrollmentsArray);
      setProgramAnalytics(analytics);
      
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load Equip analytics:', error);
      // Fallback to empty data to avoid infinite loading
      setEnrollments([]);
      setProgramAnalytics([]);
      setLoading(false);
      showToast('error', 'Analytics Error', 'Failed to load analytics data');
    }
  };

  const getTotalStats = () => {
    return {
      totalEnrollments: programAnalytics.reduce((sum, p) => sum + p.total_enrollments, 0),
      totalActive: programAnalytics.reduce((sum, p) => sum + p.active_users, 0),
      totalCompleted: programAnalytics.reduce((sum, p) => sum + p.completed_users, 0),
      totalDropped: programAnalytics.reduce((sum, p) => sum + p.dropped_users, 0),
      avgCompletionRate: programAnalytics.length > 0
        ? Math.round(programAnalytics.reduce((sum, p) => sum + p.avg_completion_rate, 0) / programAnalytics.length)
        : 0
    };
  };

  const getEnrollmentTrend = () => {
    // Group enrollments by month
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        enrollments: 0
      };
    });

    enrollments.forEach(enrollment => {
      const enrollDate = new Date(enrollment.enrolled_at);
      const monthIndex = 5 - (new Date().getMonth() - enrollDate.getMonth());
      if (monthIndex >= 0 && monthIndex < 6) {
        last6Months[monthIndex].enrollments++;
      }
    });

    return last6Months;
  };

  const getStatusDistribution = () => {
    const stats = getTotalStats();
    return [
      { name: 'Active', value: stats.totalActive, color: 'var(--ikan-chart-1)' },
      { name: 'Completed', value: stats.totalCompleted, color: 'var(--ikan-chart-2)' },
      { name: 'Dropped', value: stats.totalDropped, color: 'var(--ikan-chart-4)' },
      { name: 'Enrolled', value: stats.totalEnrollments - stats.totalActive - stats.totalCompleted - stats.totalDropped, color: 'var(--ikan-chart-neutral)' }
    ].filter(item => item.value > 0);
  };

  const getCompletionRateByProgram = () => {
    return programAnalytics.map(p => ({
      name: p.program_title.length > 20 ? p.program_title.substring(0, 20) + '...' : p.program_title,
      rate: p.avg_completion_rate
    }));
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className={cn('w-full h-screen flex items-center justify-center', className)}>
        <AdminLoading />
      </div>
    );
  }

  return (
    <div className={cn('w-full min-h-screen', className)} style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <AdminHeader
        title="Equip Program Analytics"
        subtitle="Track enrollment, completion rates, and user progress"
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Total Enrollments</p>
                  <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', marginTop: 'var(--spacing-1)' }}>
                    {stats.totalEnrollments}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--ikan-chart-1-light)' }}>
                  <Users size={24} style={{ color: 'var(--ikan-chart-1-dark)' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Active Users</p>
                  <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', marginTop: 'var(--spacing-1)' }}>
                    {stats.totalActive}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--ikan-chart-1-muted)' }}>
                  <Activity size={24} style={{ color: 'var(--ikan-chart-1)' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Completed</p>
                  <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', marginTop: 'var(--spacing-1)' }}>
                    {stats.totalCompleted}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--ikan-chart-2-light)' }}>
                  <CircleCheck size={24} style={{ color: 'var(--ikan-chart-2-dark)' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Dropped Off</p>
                  <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', marginTop: 'var(--spacing-1)' }}>
                    {stats.totalDropped}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--ikan-chart-4-light)' }}>
                  <X size={24} style={{ color: 'var(--ikan-chart-4-dark)' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Avg Completion</p>
                  <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', marginTop: 'var(--spacing-1)' }}>
                    {stats.avgCompletionRate}%
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--ikan-chart-5-light)' }}>
                  <Target size={24} style={{ color: 'var(--ikan-chart-5-dark)' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trend (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getEnrollmentTrend()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" style={{ fontSize: 'var(--text-xs)' }} />
                  <YAxis style={{ fontSize: 'var(--text-xs)' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="enrollments" stroke="var(--ikan-chart-1)" strokeWidth={2} name="Enrollments" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getStatusDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="var(--ikan-chart-fill-default)"
                    dataKey="value"
                  >
                    {getStatusDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Completion Rate by Program */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate by Program</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCompletionRateByProgram()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" style={{ fontSize: 'var(--text-xs)' }} />
                <YAxis style={{ fontSize: 'var(--text-xs)' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="rate" fill="var(--ikan-chart-2)" name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Program Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Program Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                    <th className="text-left p-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>Program</th>
                    <th className="text-center p-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>Enrollments</th>
                    <th className="text-center p-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>Active</th>
                    <th className="text-center p-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>Completed</th>
                    <th className="text-center p-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>Dropped</th>
                    <th className="text-center p-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>Completion Rate</th>
                    <th className="text-center p-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>Avg Days</th>
                    <th className="text-center p-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>Drop Day</th>
                  </tr>
                </thead>
                <tbody>
                  {programAnalytics.map((program, index) => (
                    <tr key={`program-${program.program_id}-${index}`} style={{ borderBottom: index < programAnalytics.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}>
                      <td className="p-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>{program.program_title}</td>
                      <td className="text-center p-3">{program.total_enrollments}</td>
                      <td className="text-center p-3">
                        <AdminStatusBadge status="info" label={String(program.active_users)} />
                      </td>
                      <td className="text-center p-3">
                        <AdminStatusBadge status="success" label={String(program.completed_users)} />
                      </td>
                      <td className="text-center p-3">
                        <AdminStatusBadge status="danger" label={String(program.dropped_users)} />
                      </td>
                      <td className="text-center p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Progress value={program.avg_completion_rate} className="w-20" />
                          <span>{program.avg_completion_rate}%</span>
                        </div>
                      </td>
                      <td className="text-center p-3">{program.avg_time_to_complete}</td>
                      <td className="text-center p-3">Day {program.most_common_drop_day}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrollments.slice(0, 10).map((enrollment, index) => (
                <div
                  key={enrollment.id || index}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}
                >
                  <div className="flex-1">
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      {enrollment.program_title}
                    </h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-0-5)' }}>
                      User: {enrollment.user_id} • Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Progress</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        {enrollment.current_day}/{enrollment.total_days}
                      </p>
                    </div>
                    <AdminStatusBadge 
                      status={
                        enrollment.status === 'completed' ? 'success' :
                        enrollment.status === 'in-progress' ? 'info' :
                        enrollment.status === 'dropped' ? 'danger' : 'neutral'
                      }
                      label={enrollment.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}