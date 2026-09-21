import { useState, useEffect } from 'react';
import { clearEngineConfigCache } from '../../../shared/engine/recommendation-engine';
import { Trash2, Plus, Save, BookOpen, FileText, ClipboardList, Sparkles, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../../shared/contexts/NotificationContext';
import { AdminHeader } from '../AdminHeader';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { apiClient } from '../../../shared/api-client';
import { useMetadata } from '../../../shared/hooks/useMetadata';

// ── Types ────────────────────────────────────────────────────
interface RecommendationRule {
  id: string;
  assessment_category: string;
  min_severity: string;
  recommendation_type: 'equip' | 'resource' | 'assessment';
  target_id: string;
  priority: number;
  rationale: string;
  /**
   * The card's copy. Without these three the engine renders
   * `primaryAction.type: "none"` — a matched rule with nothing to show — which
   * is why every result stored that state regardless of what matched.
   * `rationale` is the internal note for whoever authored the rule; it is not
   * user-facing copy.
   */
  title: string;
  body: string;
  cta: string;
  /** A rule can be parked without deleting it. Absent means enabled. */
  enabled: boolean;
}

interface TargetItem {
  id: string;
  title: string;
  type: 'equip' | 'resource' | 'assessment';
}

export function RecommendationRulesManager({ onBack }: { onBack: () => void }) {
  const [rules, setRules] = useState<RecommendationRule[]>([]);
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deduplicating, setDeduplicating] = useState(false);
  const { showToast } = useNotifications();

  // Metadata from KV — single source of truth
  const { categories: metaCategories, severityLevels: kvSeverityLevels } = useMetadata();

  /**
   * The five clinical terms, and only those.
   *
   * This list offered seven, including `low` and `high` — which belong to
   * `RESPONSE_TIERS`, a different vocabulary that no comparator ranks. A rule
   * saved against either **can never fire**, and nothing told the author: the
   * option sat in the dropdown looking exactly as valid as `moderate`. That is
   * the tier/severity collision reaching the authoring surface, which is the
   * worst place for it.
   *
   * The KV list is filtered too, not just the fallback. A catalog row is
   * editable, so constraining only the fallback would leave the same hole open
   * one edit away.
   */
  const CLINICAL_SEVERITIES = ['minimal', 'mild', 'moderate', 'moderately-severe', 'severe'];

  const FALLBACK_SEVERITY_LEVELS = [
    { value: 'minimal', label: 'Minimal' },
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'moderately-severe', label: 'Moderately Severe' },
    { value: 'severe', label: 'Severe' },
  ];

  const severityLevels = (kvSeverityLevels.length > 0
    ? kvSeverityLevels.map(s => ({ value: s.value, label: s.label }))
    : FALLBACK_SEVERITY_LEVELS
  ).filter(s => CLINICAL_SEVERITIES.includes(s.value));

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all three target types in parallel
      const [equips, resources, assessments, rulesData] = await Promise.all([
        apiClient.getEquipPrograms().catch(() => []),
        apiClient.getResources().catch(() => []),
        apiClient.getAssessments().catch(() => []),
        apiClient.request('/admin/recommendations/rules', { method: 'GET' }, true, 0).catch(() => ({ rules: [] })),
      ]);

      // Normalize targets
      const equipList = (Array.isArray(equips) ? equips : equips.programs || []).map((e: any) => ({
        id: e.equip_id || e.id,
        title: e.title || e.name || 'Untitled',
        type: 'equip' as const,
      }));
      const resourceList = (Array.isArray(resources) ? resources : resources.resources || []).map((r: any) => ({
        id: r.resource_id || r.id,
        title: r.title || 'Untitled',
        type: 'resource' as const,
      }));
      const assessmentList = (Array.isArray(assessments) ? assessments : assessments.assessments || []).map((a: any) => ({
        id: a.assessment_id || a.id,
        title: a.title || 'Untitled',
        type: 'assessment' as const,
      }));

      setTargets([...equipList, ...resourceList, ...assessmentList]);

      // Map rules — support legacy field names
      const loadedRules = (rulesData.rules || []).map((r: any) => ({
        id: r.id,
        assessment_category: r.assessment_category || r.assessment_type || '',
        min_severity: r.min_severity || r.min_score_severity || 'moderate',
        recommendation_type: r.recommendation_type || 'equip',
        target_id: r.target_id || r.equip_id || '',
        priority: r.priority || 10,
        rationale: r.rationale || r.reason || '',
        title: r.title || '',
        body: r.body || '',
        cta: r.cta || '',
        // Absent means enabled: the 18 existing rows predate the field and were
        // all live. Only an explicit false parks a rule.
        enabled: r.enabled !== false,
      }));
      setRules(loadedRules);
    } catch (e) {
      console.error('Failed to load rules data:', e);
      showToast('error', 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const handleDeduplicate = async () => {
    setDeduplicating(true);
    try {
      const rulesData = await apiClient.request('/admin/recommendations/rules', { method: 'GET' }, true, 0);
      const allRules = rulesData.rules || [];

      const uniqueMap = new Map<string, string>();
      const toDelete: string[] = [];

      allRules.forEach((rule: any) => {
        const key = `${rule.assessment_category}-${rule.min_severity}-${rule.recommendation_type || 'equip'}-${rule.target_id || rule.equip_id}`;
        if (uniqueMap.has(key)) {
          toDelete.push(rule.id);
        } else {
          uniqueMap.set(key, rule.id);
        }
      });

      if (toDelete.length === 0) {
        showToast('success', 'No duplicates found.');
        setDeduplicating(false);
        return;
      }

      let deletedCount = 0;
      for (const id of toDelete) {
        await apiClient.request(`/admin/recommendations/rules/${id}`, { method: 'DELETE' }, true, 0);
        deletedCount++;
      }

      showToast('success', `Cleaned up ${deletedCount} duplicate rules.`);
      loadData();
    } catch (e: any) {
      console.error(e);
      showToast('error', `Cleanup failed: ${e.message}`);
    } finally {
      setDeduplicating(false);
    }
  };

  const handleAddRule = () => {
    setRules([...rules, {
      id: `temp-${Date.now()}`,
      assessment_category: metaCategories[0]?.value || '',
      min_severity: 'moderate',
      recommendation_type: 'equip',
      target_id: '',
      priority: 10,
      rationale: '',
      // Copy is authored or the card does not render. A default here is a
      // slogan nobody chose, shown to someone who just completed a
      // mental-health assessment.
      title: '',
      body: '',
      cta: '',
      // A new rule is parked until it has copy and a target.
      enabled: false,
    }]);
  };

  /**
   * Refuse to save a rule that cannot work. Returns the reason, or null.
   *
   * There was no validation at all: `handleAddRule` creates a row with
   * `target_id: ''` and it POSTed successfully, producing a rule that matches
   * and then renders a card pointing at nothing.
   */
  const ruleProblem = (rule: RecommendationRule): string | null => {
    if (!rule.assessment_category) return 'Pick the assessment this rule responds to.';
    if (!CLINICAL_SEVERITIES.includes(rule.min_severity)) {
      return `"${rule.min_severity}" is not a clinical severity, so this rule could never fire. Use one of: ${CLINICAL_SEVERITIES.join(', ')}.`;
    }
    if (!rule.target_id) return 'Pick what this rule recommends.';
    if (!targets.some(t => t.id === rule.target_id && t.type === rule.recommendation_type)) {
      return 'That target no longer exists. Pick another.';
    }
    // An assessment rule that points at its own assessment recommends retaking
    // the thing just completed.
    if (rule.recommendation_type === 'assessment') {
      const self = targets.find(t => t.id === rule.target_id);
      if (self && self.title && rule.assessment_category &&
          self.id === rule.target_id && rule.assessment_category === (self as any).category) {
        return 'A rule cannot recommend the assessment it responds to.';
      }
    }
    // Copy is NOT required. A card renders the target record's own title and
    // description; `title`/`body`/`cta` override them when an author wants
    // different words for this particular result. Requiring them made copy a
    // precondition for matching, which is why all 18 rules were dead.
    return null;
  };

  const handleSaveRule = async (rule: RecommendationRule) => {
    const problem = ruleProblem(rule);
    if (problem) { showToast('error', 'Not saved', problem); return; }
    try {
      const payload = {
        assessment_category: rule.assessment_category,
        min_severity: rule.min_severity,
        recommendation_type: rule.recommendation_type,
        target_id: rule.target_id,
        priority: rule.priority,
        rationale: rule.rationale,
        title: rule.title,
        body: rule.body,
        cta: rule.cta,
        enabled: rule.enabled,
      };

      if (rule.id.startsWith('temp-')) {
        const { ...data } = payload;
        const res = await apiClient.request('/admin/recommendations/rules', {
          method: 'POST',
          body: JSON.stringify(data),
        }, true, 0);
        setRules(rules.map(r => r.id === rule.id ? { ...rule, id: res.rule?.id || rule.id } : r));
      } else {
        await apiClient.request(`/admin/recommendations/rules/${rule.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        }, true, 0);
      }
      showToast('success', 'Rule saved');
      clearEngineConfigCache();
    } catch (e) {
      showToast('error', 'Failed to save rule');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (id.startsWith('temp-')) {
      setRules(rules.filter(r => r.id !== id));
      return;
    }
    try {
      await apiClient.request(`/admin/recommendations/rules/${id}`, { method: 'DELETE' }, true, 0);
      setRules(rules.filter(r => r.id !== id));
      showToast('success', 'Rule deleted');
    } catch (e) {
      showToast('error', 'Failed to delete rule');
    }
  };

  const updateLocalRule = (id: string, updates: Partial<RecommendationRule>) => {
    setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  // Get filtered targets by type
  const getTargetsByType = (type: 'equip' | 'resource' | 'assessment') =>
    targets.filter(t => t.type === type);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'equip': return <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--color-status-info)' }} />;
      case 'resource': return <FileText className="w-3.5 h-3.5" style={{ color: 'var(--color-status-success)' }} />;
      case 'assessment': return <ClipboardList className="w-3.5 h-3.5" style={{ color: 'var(--color-status-warning)' }} />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const stats = [
    {
      label: 'Total Rules',
      value: rules.length,
      icon: <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary-default)' }} />,
    },
    {
      label: 'Equip Rules',
      value: rules.filter(r => r.recommendation_type === 'equip').length,
      icon: <BookOpen className="w-4 h-4" style={{ color: 'var(--color-status-info)' }} />,
    },
    {
      label: 'Resource Rules',
      value: rules.filter(r => r.recommendation_type === 'resource').length,
      icon: <FileText className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} />,
    },
    {
      label: 'Assessment Rules',
      value: rules.filter(r => r.recommendation_type === 'assessment').length,
      icon: <ClipboardList className="w-4 h-4" style={{ color: 'var(--color-status-warning)' }} />,
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader title="Rules Engine" description="Loading rules..." />
        <Card style={{ borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse space-y-3">
              <div className="h-8 w-full rounded" style={{ backgroundColor: 'var(--color-bg-muted)' }} />
              <div className="h-12 w-full rounded" style={{ backgroundColor: 'var(--color-bg-muted)' }} />
              <div className="h-12 w-full rounded" style={{ backgroundColor: 'var(--color-bg-muted)' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader
        title="Rules Engine"
        description="Configure assessment-to-recommendation mapping. Rules can recommend programs, resources, or follow-up assessments based on severity."
        stats={stats}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleDeduplicate} disabled={deduplicating} className="gap-2">
              <AlertTriangle className="w-4 h-4" /> {deduplicating ? 'Cleaning...' : 'Deduplicate'}
            </Button>
            <Button onClick={handleAddRule} className="gap-2" style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
              <Plus className="w-4 h-4" /> Add Rule
            </Button>
          </div>
        }
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          {getTypeIcon('equip')}
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>Equip Program</span>
        </div>
        <div className="flex items-center gap-1.5">
          {getTypeIcon('resource')}
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>Resource</span>
        </div>
        <div className="flex items-center gap-1.5">
          {getTypeIcon('assessment')}
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>Assessment</span>
        </div>
      </div>

      {rules.length === 0 ? (
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border-default)' }}>
          <CardContent className="p-8 text-center">
            <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
            <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
              No Recommendation Rules
            </p>
            <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>
              Create rules to automatically recommend content based on assessment severity scores.
            </p>
            <Button onClick={handleAddRule} className="gap-2" style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}>
              <Plus className="w-4 h-4" /> Create First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ minWidth: 140 }}>Assessment Category</TableHead>
                    <TableHead style={{ minWidth: 130 }}>Severity ≥</TableHead>
                    <TableHead style={{ minWidth: 120 }}>Type</TableHead>
                    <TableHead style={{ minWidth: 200 }}>Recommend</TableHead>
                    <TableHead style={{ minWidth: 80 }}>Priority</TableHead>
                    <TableHead style={{ minWidth: 200 }}>Rationale</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      {/* Assessment Category — from Meta Manager */}
                      <TableCell>
                        <Select
                          value={rule.assessment_category}
                          onValueChange={(val) => updateLocalRule(rule.id, { assessment_category: val })}
                        >
                          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
                          <SelectContent>
                            {metaCategories.length > 0 ? (
                              metaCategories.map(c => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>No categories in KV</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Severity Level */}
                      <TableCell>
                        <Select
                          value={rule.min_severity}
                          onValueChange={(val) => updateLocalRule(rule.id, { min_severity: val })}
                        >
                          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {severityLevels.map(s => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Recommendation Type */}
                      <TableCell>
                        <Select
                          value={rule.recommendation_type}
                          onValueChange={(val: any) => updateLocalRule(rule.id, { recommendation_type: val, target_id: '' })}
                        >
                          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equip">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5" /> Equip
                              </div>
                            </SelectItem>
                            <SelectItem value="resource">
                              <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> Resource
                              </div>
                            </SelectItem>
                            <SelectItem value="assessment">
                              <div className="flex items-center gap-2">
                                <ClipboardList className="w-3.5 h-3.5" /> Assessment
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Target Content */}
                      <TableCell>
                        <Select
                          value={rule.target_id}
                          onValueChange={(val) => updateLocalRule(rule.id, { target_id: val })}
                        >
                          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select content" /></SelectTrigger>
                          <SelectContent>
                            {getTargetsByType(rule.recommendation_type).map(t => (
                              <SelectItem key={t.id} value={t.id}>
                                <span className="truncate">{t.title}</span>
                              </SelectItem>
                            ))}
                            {getTargetsByType(rule.recommendation_type).length === 0 && (
                              <SelectItem value="" disabled>No {rule.recommendation_type}s available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Priority */}
                      <TableCell>
                        <Input
                          type="number"
                          className="w-20"
                          value={rule.priority}
                          onChange={(e) => updateLocalRule(rule.id, { priority: parseInt(e.target.value) || 0 })}
                        />
                      </TableCell>

                      {/* Card copy + internal note.
                          `rationale` is the author's own note; title/body/cta
                          are what the person who finished the assessment reads.
                          They were not authorable at all, which is why every
                          result stored primaryAction.type "none". */}
                      <TableCell>
                        <div className="flex flex-col gap-1.5" style={{ minWidth: 260 }}>
                          <Input
                            value={rule.title}
                            onChange={(e) => updateLocalRule(rule.id, { title: e.target.value })}
                            placeholder="Card heading, e.g. Unburn"
                          />
                          <Input
                            value={rule.body}
                            onChange={(e) => updateLocalRule(rule.id, { body: e.target.value })}
                            placeholder="One or two lines saying why this helps"
                          />
                          <Input
                            value={rule.cta}
                            onChange={(e) => updateLocalRule(rule.id, { cta: e.target.value })}
                            placeholder="Button text, e.g. Start program"
                          />
                          <Input
                            value={rule.rationale}
                            onChange={(e) => updateLocalRule(rule.id, { rationale: e.target.value })}
                            placeholder="Internal note — not shown to the user"
                            style={{ fontSize: 'var(--text-xs)' }}
                          />
                          <label className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={(e) => updateLocalRule(rule.id, { enabled: e.target.checked })}
                            />
                            Enabled
                          </label>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleSaveRule(rule)} title="Save rule">
                            <Save className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteRule(rule.id)} title="Delete rule">
                            <Trash2 className="w-4 h-4" style={{ color: 'var(--color-status-danger)' }} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
        <CardContent className="p-4">
          <h5 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
            How Rules Work
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                <strong style={{ fontWeight: 'var(--font-weight-medium)' }}>1. Assessment Category</strong><br />
                Categories come from the Meta Manager (KV). When a user completes an assessment tagged with this category...
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                <strong style={{ fontWeight: 'var(--font-weight-medium)' }}>2. Severity Threshold</strong><br />
                ...and their score maps to this severity level or higher (via the Scoring Engine)...
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                <strong style={{ fontWeight: 'var(--font-weight-medium)' }}>3. Recommendation</strong><br />
                ...they are recommended this program, resource, or follow-up assessment. Higher priority rules appear first.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}