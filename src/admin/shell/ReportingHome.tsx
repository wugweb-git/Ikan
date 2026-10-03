import { AdminDashboardAnalytics } from '../analytics/AdminDashboardAnalytics';

/** The admin landing screen (/admin, /admin/reporting). */
export function ReportingHome() {
  return (
    <div className="space-y-6 admin-dashboard-header">
      <div>
        <h1 className="text-3xl font-medium text-[var(--color-text-primary)] mb-2">Reporting</h1>
        <p className="text-base text-[var(--color-text-muted)]">Platform metrics at a glance.</p>
      </div>
      <AdminDashboardAnalytics embedded />
    </div>
  );
}
