import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronLeft, TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Eye, Play, Clock, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { apiClient } from '../../lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import { Skeleton } from '../ui/skeleton-loader';
import { cn } from '../ui/utils';
import { SectionReportCard } from '../player/SectionReportCard';
import type { SectionScoreResult } from '../../lib/assessment-sections';

// ── Design tokens ──
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  assessmentName?: string;
  score: number;
  maxScore: number;
  severity?: string;
  interpretation?: any;
  completedAt: string;
  responses?: Record<string, any>;
  // The per-scale breakdown. AssessmentResults renders this immediately after
  // completion; this screen never declared the field, so the breakdown
  // vanished the moment a user looked back at it. Stored as snake_case
  // `section_scores` in KV, camelCase through the offline-sync path.
  sectionScores?: SectionScoreResult;
  /**
   * Set on results that cannot be compared to current ones — they were scored
   * against a different item set or a different option scale, and carry
   * `scoring_provenance.excluded_from_trends`. They are still listed; they are
   * kept out of the chart and the trend.
   */
  excludedFromTrends?: boolean;
}

interface AssessmentHistoryDetailProps {
  assessmentId?: string;
  onBack?: () => void;
  onNavigate?: (route: string) => void;
}

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case 'low': return 'var(--color-status-success)';
    case 'moderate': return 'var(--color-status-warning)';
    case 'high': return 'var(--color-status-danger)';
    default: return 'var(--color-primary-default)';
  }
};

const getSeverityBg = (severity?: string) => {
  switch (severity) {
    case 'low': return 'var(--color-status-success-light)';
    case 'moderate': return 'var(--color-status-warning-light)';
    case 'high': return 'var(--color-status-danger-light)';
    default: return 'var(--color-bg-muted)';
  }
};

/**
 * Compares **percentage of the achievable range**, not raw score, and only
 * across comparable results.
 *
 * Raw scores are not comparable across a rescale: Sleep moved from 0-32 to 8-40
 * when its option values were declared, so a raw 18 means different things
 * either side of that. Results scored against a different item set are stamped
 * `excluded_from_trends` and are skipped entirely.
 *
 * Still assumes lower = better, which holds for every assessment that produces
 * an overall score. General has no overall, so it never reaches here.
 */
const getTrend = (attempts: AssessmentAttempt[]) => {
  const comparable = attempts.filter(a => !a.excludedFromTrends && a.maxScore > 0);
  if (comparable.length < 2) return 'stable';
  const pct = (a: AssessmentAttempt) => (a.score / a.maxScore) * 100;
  const latest = pct(comparable[0]);
  const previous = pct(comparable[1]);
  if (latest < previous) return 'improving';
  if (latest > previous) return 'worsening';
  return 'stable';
};

// ── Custom Tooltip ──
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const pct = data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <p style={f('xs', 500)}>{data.dateLabel}</p>
      <p style={{ ...f('lg', 500), marginTop: 2 }}>
        {pct}%<span style={f('xs', 400, 'var(--color-text-muted)')}> ({data.score}/{data.maxScore})</span>
      </p>
      {data.severity && (
        <span
          style={{
            display: 'inline-block',
            marginTop: 4,
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: getSeverityBg(data.severity),
            color: getSeverityColor(data.severity),
            ...f('xs', 500),
            textTransform: 'capitalize',
          }}
        >
          {data.severity}
        </span>
      )}
    </div>
  );
}

export function AssessmentHistoryDetail({ assessmentId, onBack, onNavigate }: AssessmentHistoryDetailProps) {
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [assessmentMeta, setAssessmentMeta] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);

  // Resolve assessmentId from props or URL
  const resolvedId = assessmentId || (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('id') || '';
    } catch { return ''; }
  })();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!resolvedId) {
        setError('No assessment ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch assessment metadata + user history in parallel
        const [metaRes, historyRes] = await Promise.all([
          apiClient.getAssessment(resolvedId).catch(() => null),
          apiClient.getUserAssessmentResponses().catch(() => ({ history: [] })),
        ]);

        if (!isMounted) return;

        if (metaRes) setAssessmentMeta(metaRes);

        // Compute maxScore from assessment definition questions
        let defMaxScore = 0;
        if (metaRes?.questions && Array.isArray(metaRes.questions)) {
          for (const q of metaRes.questions) {
            if (q.options && Array.isArray(q.options)) {
              let maxVal = 0;
              for (const opt of q.options) {
                const v = typeof opt === 'object' ? (opt.value ?? opt.score ?? 0) : 0;
                if (typeof v === 'number' && v > maxVal) maxVal = v;
              }
              defMaxScore += maxVal;
            }
          }
        }
        // Fall back to scoring ranges
        if (defMaxScore === 0 && metaRes?.scoring?.ranges?.length > 0) {
          const maxFromRanges = metaRes.scoring.ranges[metaRes.scoring.ranges.length - 1]?.max;
          if (maxFromRanges) defMaxScore = maxFromRanges;
        }

        // Parse history — extract attempts for THIS assessment
        const allHistory = (historyRes as any)?.history || (historyRes as any)?.responses || (historyRes as any)?.assessments || [];
        const relevantAttempts: AssessmentAttempt[] = [];

        if (Array.isArray(allHistory)) {
          allHistory.forEach((entry: any) => {
            const entryId = entry.assessmentId || entry.assessment_id;
            if (entryId === resolvedId) {
              relevantAttempts.push({
                id: entry.id || `${entryId}-${entry.completed_at || entry.completedAt || Date.now()}`,
                assessmentId: entryId,
                assessmentName: entry.assessmentTitle || entry.assessment_title || metaRes?.title || 'Assessment',
                score: entry.score ?? entry.calculated_score ?? 0,
                maxScore: entry.maxScore ?? entry.max_score ?? (defMaxScore > 0 ? defMaxScore : 21),
                severity: entry.severityHint || entry.severity_hint || entry.interpretation?.label?.toLowerCase() || undefined,
                interpretation: entry.interpretation,
                completedAt: entry.completed_at || entry.completedAt || new Date().toISOString(),
                responses: entry.responses,
                sectionScores: entry.section_scores ?? entry.sectionScores ?? undefined,
                excludedFromTrends: entry.scoring_provenance?.excluded_from_trends === true,
              });
            }
          });
        }

        // Sort newest first
        relevantAttempts.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        setAttempts(relevantAttempts);

      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load assessment history:', err);
          setError(err.message || 'Failed to load history');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [resolvedId]);

  // Chart data (chronological order)
  const chartData = useMemo(() => {
    // Percentage of each result's OWN achievable range, so a rescale does not
    // move the line. Incomparable results are dropped rather than plotted on a
    // scale they were never scored against.
    return [...attempts]
      .filter(a => !a.excludedFromTrends && a.maxScore > 0)
      .reverse().map((a, i) => ({
      index: i,
      score: a.score,
      maxScore: a.maxScore,
      percent: Math.round((a.score / a.maxScore) * 100),
      severity: a.severity,
      dateLabel: new Date(a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
      dateShort: new Date(a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [attempts]);

  const trend = getTrend(attempts);
  const latest = attempts[0];
  const assessmentTitle = latest?.assessmentName || assessmentMeta?.title || 'Assessment';

  // ── PDF Export ──
  const handleExportPDF = () => {
    if (attempts.length === 0) return;

    const dateStr = (iso: string) =>
      new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const attemptRows = attempts
      .map(
        (a, i) => {
          const aPct = a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0;
          return `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #E9EBEF;">${i === 0 ? 'Latest' : `#${attempts.length - i}`}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #E9EBEF;">${dateStr(a.completedAt)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #E9EBEF;font-weight:500;">${aPct}% <span style="color:#717182;font-weight:400">(${a.score}/${a.maxScore})</span></td>
          <td style="padding:10px 14px;border-bottom:1px solid #E9EBEF;text-transform:capitalize;">${a.severity || '—'}</td>
        </tr>`;
        }
      )
      .join('');

    const trendLabel = trend === 'improving' ? 'Improving ↓' : trend === 'worsening' ? 'Increasing ↑' : 'Stable →';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${assessmentTitle} — History Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Ubuntu, 'Segoe UI', system-ui, sans-serif; color: #151515; background: #fff; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
          .logo { font-size: 22px; font-weight: 500; color: #2A2A2A; }
          .report-date { font-size: 13px; color: #717182; }
          h1 { font-size: 24px; font-weight: 500; margin-bottom: 4px; }
          h2 { font-size: 16px; font-weight: 500; margin-bottom: 12px; color: #2A2A2A; }
          .subtitle { font-size: 14px; color: #717182; margin-bottom: 24px; }
          .summary { display: flex; gap: 24px; margin-bottom: 32px; }
          .stat { flex: 1; background: #F5F5F5; border-radius: 12px; padding: 16px; }
          .stat-label { font-size: 12px; color: #717182; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .stat-value { font-size: 28px; font-weight: 500; }
          .stat-sub { font-size: 13px; color: #717182; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
          th { text-align: left; padding: 10px 14px; font-size: 12px; font-weight: 500; color: #717182; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #2A2A2A; }
          td { font-size: 14px; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E9EBEF; font-size: 11px; color: #717182; text-align: center; }
          .disclaimer { font-size: 12px; color: #717182; line-height: 1.6; margin-top: 24px; padding: 12px 16px; background: #F5F5F5; border-radius: 8px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <span class="logo">iKan</span>
          </div>
          <span class="report-date">Generated ${dateStr(new Date().toISOString())}</span>
        </div>

        <h1>${assessmentTitle}</h1>
        <p class="subtitle">${attempts.length} attempt${attempts.length !== 1 ? 's' : ''} recorded</p>

        <div class="summary">
          <div class="stat">
            <div class="stat-label">Latest Score</div>
            <div class="stat-value">${latest.maxScore > 0 ? Math.round((latest.score / latest.maxScore) * 100) : 0}%<span style="font-size:14px;color:#717182;font-weight:400"> (${latest.score}/${latest.maxScore})</span></div>
            ${latest.severity ? `<div class="stat-sub" style="text-transform:capitalize">${latest.severity}</div>` : ''}
          </div>
          <div class="stat">
            <div class="stat-label">Trend</div>
            <div class="stat-value" style="font-size:18px">${trendLabel}</div>
            <div class="stat-sub">vs. previous attempt</div>
          </div>
          <div class="stat">
            <div class="stat-label">First Taken</div>
            <div class="stat-value" style="font-size:16px">${dateStr(attempts[attempts.length - 1].completedAt)}</div>
          </div>
        </div>

        <h2>All Attempts</h2>
        <table>
          <thead>
            <tr>
              <th>Attempt</th>
              <th>Date</th>
              <th>Score</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            ${attemptRows}
          </tbody>
        </table>

        <div class="disclaimer">
          <span style="font-weight: 500;">Note:</span> This report is for personal reference and does not constitute a clinical diagnosis.
          Scores from self-report assessments should be discussed with a qualified mental health professional
          for proper interpretation.
        </div>

        <div class="footer">
          iKan Mental Health — ikanhealth.in — Confidential Personal Report
        </div>
      </body>
      </html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      // Give fonts time to load
      setTimeout(() => {
        printWindow.print();
      }, 400);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <LoadingSpinner message="Loading history..." />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="text-center space-y-4 max-w-sm">
          <BarChart3 size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} />
          <h2 style={f('lg', 500)}>Could not load history</h2>
          <p style={f('sm', 400, 'var(--color-text-muted)')}>{error}</p>
          <Button onClick={onBack || (() => onNavigate?.('/assessment'))}>Go Back</Button>
        </div>
      </div>
    );
  }

  // ── Empty ──
  if (attempts.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-default)' }}>
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <button
              onClick={onBack || (() => onNavigate?.('/assessment'))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <ChevronLeft size={22} style={{ color: 'var(--color-text-primary)' }} />
            </button>
            <h1 style={f('base', 500)}>{assessmentTitle}</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'var(--color-bg-muted)', marginBottom: 16 }}
          >
            <BarChart3 size={28} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <h2 style={{ ...f('lg', 500), marginBottom: 8 }}>No history found</h2>
          <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), marginBottom: 24 }}>
            You haven't completed this assessment yet. Take it to see your results here.
          </p>
          <Button
            onClick={() => onNavigate?.(`/assessment-flow?id=${resolvedId}`)}
            style={{
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-text-inverse)',
              borderRadius: 'var(--radius-md)',
              height: 44,
              ...f('sm', 500, 'var(--color-text-inverse)'),
            }}
          >
            <Play size={16} className="mr-2" /> Take Assessment
          </Button>
        </div>
      </div>
    );
  }

  // ── Main View ──
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-default)' }}>
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <button
            onClick={onBack || (() => onNavigate?.('/assessment'))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <ChevronLeft size={22} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <div className="flex-1">
            <h1 style={f('base', 500)}>{assessmentTitle}</h1>
            <p style={f('xs', 400, 'var(--color-text-muted)')}>
              {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportPDF}
            style={{
              borderRadius: 'var(--radius-md)',
              borderColor: 'var(--color-border-default)',
              ...f('xs', 500),
              gap: 4,
            }}
          >
            <Download size={12} /> Export
          </Button>
          <Button
            size="sm"
            onClick={() => onNavigate?.(`/assessment-flow?id=${resolvedId}`)}
            style={{
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-text-inverse)',
              borderRadius: 'var(--radius-md)',
              ...f('xs', 500, 'var(--color-text-inverse)'),
              gap: 4,
            }}
          >
            <Play size={12} /> Retake
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Latest Score Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', overflow: 'hidden' }}>
            <CardContent style={{ padding: 24 }}>
              <div className="flex items-center gap-6">
                {/* Score circle */}
                <div className="relative flex-shrink-0">
                  <svg width={80} height={80} viewBox="0 0 80 80">
                    <circle cx={40} cy={40} r={34} fill="none" stroke="var(--color-bg-muted)" strokeWidth={8} />
                    <circle
                      cx={40} cy={40} r={34}
                      fill="none"
                      stroke={getSeverityColor(latest.severity)}
                      strokeWidth={8}
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - (latest.maxScore > 0 ? latest.score / latest.maxScore : 0))}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span style={f('xl', 500)}>{latest.maxScore > 0 ? Math.round((latest.score / latest.maxScore) * 100) : 0}%</span>
                    <span style={f('xs', 400, 'var(--color-text-muted)')}>{latest.score} / {latest.maxScore}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p style={f('xs', 400, 'var(--color-text-muted)')}>Latest Score</p>
                  {latest.severity && (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: getSeverityBg(latest.severity),
                        color: getSeverityColor(latest.severity),
                        ...f('sm', 500),
                        textTransform: 'capitalize',
                        marginTop: 4,
                      }}
                    >
                      {latest.severity} severity
                    </span>
                  )}
                  <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
                    {trend === 'improving' && (
                      <>
                        <TrendingDown size={14} style={{ color: 'var(--color-status-success)' }} />
                        <span style={f('xs', 500, 'var(--color-status-success)')}>Improving</span>
                      </>
                    )}
                    {trend === 'worsening' && (
                      <>
                        <TrendingUp size={14} style={{ color: 'var(--color-status-danger)' }} />
                        <span style={f('xs', 500, 'var(--color-status-danger)')}>Needs attention</span>
                      </>
                    )}
                    {trend === 'stable' && (
                      <>
                        <Minus size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <span style={f('xs', 500, 'var(--color-text-muted)')}>Stable</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Score Over Time Chart */}
        {chartData.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
              <CardContent style={{ padding: '20px 16px' }}>
                <h3 style={{ ...f('sm', 500), marginBottom: 16 }}>Score Over Time</h3>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary-default)" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="var(--color-primary-default)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" vertical={false} />
                      <XAxis
                        dataKey="dateShort"
                        tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                        axisLine={{ stroke: 'var(--color-border-default)' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={(v: number) => `${v}%`}
                        tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="percent"
                        stroke="var(--color-primary-default)"
                        strokeWidth={2.5}
                        fill="url(#scoreGradient)"
                        dot={{
                          r: 5,
                          fill: 'var(--color-bg-card)',
                          stroke: 'var(--color-primary-default)',
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 7,
                          fill: 'var(--color-primary-default)',
                          stroke: 'var(--color-bg-card)',
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All Attempts List */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ ...f('sm', 500), marginBottom: 12 }}>All Attempts</h3>
          <div className="space-y-3">
            {attempts.map((attempt, index) => {
              const isExpanded = expandedAttempt === attempt.id;
              const date = new Date(attempt.completedAt);
              const dateStr = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const timeStr = date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              });
              const pct = attempt.maxScore > 0 ? (attempt.score / attempt.maxScore) * 100 : 0;

              return (
                <Card
                  key={attempt.id}
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    border: `1px solid ${isExpanded ? 'var(--color-primary-default)' : 'var(--color-border-default)'}`,
                    overflow: 'hidden',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <button
                    onClick={() => setExpandedAttempt(isExpanded ? null : attempt.id)}
                    className="w-full text-left"
                    style={{
                      padding: '14px 18px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Attempt number */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: index === 0 ? getSeverityBg(attempt.severity) : 'var(--color-bg-muted)',
                        }}
                      >
                        <span style={f('xs', 500, index === 0 ? getSeverityColor(attempt.severity) : 'var(--color-text-muted)')}>
                          #{attempts.length - index}
                        </span>
                      </div>

                      {/* Date + score */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={f('sm', 500)}>{dateStr}</span>
                          {index === 0 && (
                            <span
                              style={{
                                ...f('xs', 500, 'var(--color-primary-default)'),
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: 'color-mix(in srgb, var(--color-primary-default) 10%, transparent)',
                              }}
                            >
                              Latest
                            </span>
                          )}
                        </div>
                        <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), marginTop: 1 }}>
                          <Clock size={10} className="inline mr-1" />{timeStr}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <span style={f('lg', 500)}>{Math.round(pct)}%</span>
                        <span style={f('xs', 400, 'var(--color-text-muted)')}> ({attempt.score}/{attempt.maxScore})</span>
                        {attempt.severity && (
                          <div
                            style={{
                              marginTop: 2,
                              padding: '1px 8px',
                              borderRadius: 'var(--radius-pill)',
                              backgroundColor: getSeverityBg(attempt.severity),
                              color: getSeverityColor(attempt.severity),
                              ...f('xs', 500),
                              textTransform: 'capitalize',
                              display: 'inline-block',
                            }}
                          >
                            {attempt.severity}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 18px 16px',
                        borderTop: '1px solid var(--color-border-default)',
                      }}
                    >
                      <div style={{ paddingTop: 14 }}>
                        {/* Score bar */}
                        <div className="space-y-2" style={{ marginBottom: 16 }}>
                          <div className="flex justify-between">
                            <span style={f('xs', 400, 'var(--color-text-muted)')}>Score</span>
                            <span style={f('xs', 500)}>{pct.toFixed(0)}%</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, backgroundColor: 'var(--color-bg-muted)', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${pct}%`,
                                borderRadius: 3,
                                backgroundColor: getSeverityColor(attempt.severity),
                                transition: 'width 0.3s',
                              }}
                            />
                          </div>
                        </div>

                        {/* Interpretation */}
                        {attempt.interpretation && (
                          <div
                            style={{
                              padding: '12px 14px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--color-bg-muted)',
                              marginBottom: 12,
                            }}
                          >
                            {attempt.interpretation.label && (
                              <p style={f('sm', 500)}>{attempt.interpretation.label}</p>
                            )}
                            {(attempt.interpretation.description || attempt.interpretation.interpretation) && (
                              <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), marginTop: 4, lineHeight: 1.5 }}>
                                {attempt.interpretation.description || attempt.interpretation.interpretation}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Per-scale breakdown, same component as the
                            post-completion screen so the two agree.

                            The `sections.length >= 2` gate is gone: it was the
                            old fork condition, removed from AssessmentResults
                            in the results rework but left here. A single-score
                            assessment stores `sections: []` with an `overall`,
                            so that gate hid the breakdown for Sleep, Stress and
                            Balance — the majority of stored results — on the
                            one screen whose job is showing them again.
                            SectionReportCard returns null when there is nothing
                            to render, so it needs no gate of its own. */}
                        {attempt.sectionScores?.sectioned && (
                          <div style={{ marginBottom: 12 }}>
                            <SectionReportCard result={attempt.sectionScores} />
                          </div>
                        )}

                        {/* Response count */}
                        {attempt.responses && (
                          <p style={f('xs', 400, 'var(--color-text-muted)')}>
                            {Object.keys(attempt.responses).length} question{Object.keys(attempt.responses).length !== 1 ? 's' : ''} answered
                          </p>
                        )}

                        {!attempt.interpretation && !attempt.responses && (
                          <p style={f('xs', 400, 'var(--color-text-muted)')}>
                            No detailed data available for this attempt.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}