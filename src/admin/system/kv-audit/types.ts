/** Shapes returned by the KV audit endpoints (`/admin/kv-audit`, `/admin/kv-schema`, trends). */

export type AuditData = {
  timestamp: string;
  totalKeys: number;
  categorized: Record<string, { count: number; samples: { key: string; valuePreview: string }[] }>;
  uncategorizedKeys: { key: string; value: string }[];
  uncategorizedCount: number;
  orphans: { key: string; reason: string; category: string }[];
  orphanCount: number;
  inconsistencies: { issue: string; keys: string[] }[];
  growthWarnings: { prefix: string; count: number; warning: string }[];
  softDeleted: string[];
  softDeletedCount: number;
  userDataFootprint: UserFootprint[];
  totalUsers: number;
};

export type UserFootprint = { userId: string; email?: string; keyCount: number; prefixes: Record<string, number> };

export type SchemaEntry = {
  prefix: string;
  description: string;
  owner: string;
  consumers: string[];
  category: string;
  orphanRisk: string;
  notes?: string;
};

export type SchemaRelation = {
  label: string;
  child: string;
  parent: string;
  joinFields: string[];
  childCount: number;
  parentCount: number;
  missingRef: number;
  exempt: number;
  dangling: number;
  healthy: boolean;
};

export type SchemaData = {
  schema: SchemaEntry[];
  totalPrefixes: number;
  relations: SchemaRelation[];
  liveCounts: Record<string, number>;
  unregisteredPrefixes: { prefix: string; count: number }[];
};

export type TrendSnapshot = { timestamp: string; score: number; totalKeys: number; orphanCount: number };

export type HealthScore = { score: number; label: string; variant: 'success' | 'warning' | 'danger' };

export function getHealthScore(audit: AuditData | null | undefined): HealthScore {
  if (!audit) return { score: 100, label: 'Unknown', variant: 'success' };
  let deductions = 0;
  if (audit.orphanCount > 0) deductions += Math.min(audit.orphanCount * 5, 30);
  if (audit.uncategorizedCount > 0) deductions += Math.min(audit.uncategorizedCount * 3, 15);
  if (audit.inconsistencies.length > 0) deductions += audit.inconsistencies.length * 10;
  if (audit.growthWarnings.length > 0) deductions += audit.growthWarnings.length * 5;
  if (audit.softDeletedCount > 0) deductions += Math.min(audit.softDeletedCount * 2, 10);
  const score = Math.max(0, 100 - deductions);
  return {
    score,
    label: score >= 90 ? 'Healthy' : score >= 70 ? 'Needs attention' : 'Action required',
    variant: score >= 90 ? 'success' : score >= 70 ? 'warning' : 'danger',
  };
}
