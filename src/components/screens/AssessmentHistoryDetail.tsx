import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronLeft, TrendingUp, TrendingDown, Minus, BarChart3, Play, Clock, Download } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { apiClient } from '../../lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import { SectionReportCard } from '../player/SectionReportCard';
import type { SectionScoreResult } from '../../lib/assessment-sections';
import { severityOfResult, tonePresentation } from '../../lib/severity-presentation';
import { resolveResultPresentation, percentOfRange, type Tone } from '../../lib/result-presentation';
import { loadScoringProfiles, getLoadedScoringProfiles } from '../../lib/recommendation-engine';

/**
 * Percentage of the achievable range, or null when there is no real maximum.
 *
 * Null is the whole point: 42 of 101 stored results have no `max_score`, and
 * the previous code substituted 21 (GAD-7's maximum) for all of them. Callers
 * render a dash rather than a number computed against a denominator that was
 * never this instrument's.
 */
const pctOf = (score: number, maxScore: number | null, scaleMin = 0): number | null =>
  maxScore && maxScore > 0 ? percentOfRange(score, maxScore, scaleMin) : null;

/** Same, straight off an attempt, so the floor cannot be forgotten at a call site. */
const pctOfAttempt = (a: { score: number; maxScore: number | null; scaleMin?: number }) =>
  pctOf(a.score, a.maxScore, a.scaleMin ?? 0);

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
  /** Null when no real maximum resolved — do not substitute one. */
  maxScore: number | null;
  /**
   * The instrument's floor, from the profile that banded it. A stored result
   * keeps `max_score` and never recorded a minimum, so without this a Sleep
   * 24 of 8-40 reads 60% instead of 50%.
   */
  scaleMin?: number;
  /** Clinical severity term, or undefined. Never a band label. */
  severity?: string;
  /** Instrument copy for the band — "Poor Sleep". Display only. */
  /**
   * The band the score was PLACED in. Undefined renders "Not banded".
   *
   * Never the label the record carries: 89 of 104 hold `Completed`,
   * `Complete` or `New Category` there, and showing one of those where the
   * outcome belongs reads as a finding.
   */
  bandLabel?: string;
  /** Authored on the band. Drives colour; undefined renders neutral. */
  tone?: Tone;
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

// Colour comes from the band's authored tone, via the same helper the
// dashboard uses. Both maps here previously spoke the retired 3-term
// vocabulary, so four of the five real terms fell to a default; then they
// spoke the 5-term clinical one, which no stored result actually carries.
// `tone` is the vocabulary that is written on the data.
const getSeverityColor = (tone?: Tone) => tonePresentation(tone).color;
const getSeverityBg = (tone?: Tone) => tonePresentation(tone).background;

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
const getTrend = (attempts: AssessmentAttempt[]): 'improving' | 'worsening' | 'stable' | null => {
  const comparable = attempts.filter(a => !a.excludedFromTrends && pctOfAttempt(a) !== null);
  // NOT 'stable'. Fewer than two comparable results means there is no trend to
  // report, and "Stable" is a claim about change over a set the page has just
  // said cannot be compared. Null renders no trend row at all.
  if (comparable.length < 2) return null;
  const pct = (a: AssessmentAttempt) => pctOfAttempt(a)!;
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
            backgroundColor: getSeverityBg(data.tone),
            color: getSeverityColor(data.tone),
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
        // The module places a score against the instrument's own bands, which
        // live on scoring-profile records rather than on the definition.
        await loadScoringProfiles().catch(() => { /* rows render unbanded */ });
        const scoringProfiles = getLoadedScoringProfiles() ?? {};

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
              // Resolved once. It was called twice per entry, once for the
              // band label and once for the tone, doing the same profile
              // lookup and band placement both times.
              const placement = resolveResultPresentation(entry, metaRes, scoringProfiles);
              relevantAttempts.push({
                id: entry.id || `${entryId}-${entry.completed_at || entry.completedAt || Date.now()}`,
                assessmentId: entryId,
                assessmentName: entry.assessmentTitle || entry.assessment_title || metaRes?.title || 'Assessment',
                score: entry.score ?? entry.calculated_score ?? 0,
                // No invented denominator. `?? 21` was GAD-7's maximum applied
                // to everything — 42 of 101 stored results have no max_score,
                // so Burnout's 115 was being divided by 21. A percentage
                // without a real max is not a smaller number, it is a wrong
                // one; callers must handle null and refuse to render.
                maxScore: entry.maxScore ?? entry.max_score ?? (defMaxScore > 0 ? defMaxScore : null),
                // The clinical severity, from the band the score fell in.
                // `severity_hint` is the BAND LABEL ("Poor Sleep", "Completed")
                // — 76 of 101 results carry one that is not a severity term, so
                // lower-casing it produced `poor-sleep` and coloured by default.
                severity: severityOfResult(entry) ?? undefined,
                // One view model, shared with the dashboard, so the two screens
                // cannot disagree about the same result again.
                bandLabel: placement.band?.label ?? undefined,
                tone: placement.band?.tone ?? undefined,
                // The profile's own floor. Its bands tile the whole achievable
                // range, so the lowest edge is the minimum a person can score.
                scaleMin: placement.scale?.min,
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

  /**
   * Why the chart is not showing, when it is not showing.
   *
   * The card was gated on `chartData.length >= 2` and simply disappeared
   * otherwise, while the list beneath it went on saying "15 attempts". After
   * the 2026-09-08 revision every stress result is `pre-spec`, so the account
   * with the richest history in the product lost its chart with nothing on
   * screen accounting for it. A chart that quietly shows less than the list
   * below it is the same defect as a band that quietly shows a status word.
   */
  const chartAbsence = useMemo(() => {
    const olderVersion = attempts.filter(a => a.excludedFromTrends).length;
    const noDenominator = attempts.filter(a => !a.excludedFromTrends && pctOfAttempt(a) === null).length;
    return { olderVersion, noDenominator, total: attempts.length };
  }, [attempts]);

  // Chart data (chronological order)
  const chartData = useMemo(() => {
    // Percentage of each result's OWN achievable range, so a rescale does not
    // move the line. Incomparable results are dropped rather than plotted on a
    // scale they were never scored against.
    return [...attempts]
      .filter(a => !a.excludedFromTrends && pctOfAttempt(a) !== null)
      .reverse().map((a, i) => ({
      index: i,
      score: a.score,
      maxScore: a.maxScore,
      percent: pctOfAttempt(a)!,
      severity: a.severity,
      dateLabel: new Date(a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
      dateShort: new Date(a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [attempts]);

  const trend = getTrend(attempts);
  const latest = attempts[0];
  /**
   * The newest result is not necessarily a current one.
   *
   * After the 2026-09-08 revision every stress result is `pre-spec`, including
   * the most recent. The header was still rendering it as "Latest Score" with a
   * percentage, a progress ring and a severity chip — and that chip comes from
   * the retired band table, on an instrument that no longer exists at that
   * length. A 14/28 on a 7-item stress scale presented as current, four lines
   * above a card explaining it cannot be compared to anything.
   */
  const latestIsStale = !!latest?.excludedFromTrends;
  const assessmentTitle = latest?.assessmentName || assessmentMeta?.title || 'Assessment';

  // ── PDF Export ──
  const handleExportPDF = () => {
    if (attempts.length === 0) return;

    const dateStr = (iso: string) =>
      new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const attemptRows = attempts
      .map(
        (a, i) => {
          const aPct = pctOfAttempt(a);
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

    // Null trend prints a dash, not "Stable" — the export must not assert a
    // comparison the page itself refuses to make.
    const trendLabel = trend === 'improving' ? 'Improving ↓'
      : trend === 'worsening' ? 'Increasing ↑'
      : trend === 'stable' ? 'Stable →' : '—';

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
            <div class="stat-label">${latestIsStale ? 'Most recent result' : 'Latest Score'}</div>
            <div class="stat-value">${pctOfAttempt(latest) ?? '—'}%<span style="font-size:14px;color:#717182;font-weight:400"> (${latest.score}/${latest.maxScore ?? '—'})</span></div>
            ${latestIsStale
              ? `<div class="stat-sub">Scored under an older version</div>`
              : (latest.severity ? `<div class="stat-sub" style="text-transform:capitalize">${latest.severity}</div>` : '')}
          </div>
          <div class="stat">
            <div class="stat-label">Trend</div>
            <div class="stat-value" style="font-size:18px">${trendLabel}</div>
            <div class="stat-sub">${trend ? 'vs. previous attempt' : 'no comparable attempts'}</div>
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
                      stroke={latestIsStale ? 'var(--color-text-muted)' : getSeverityColor(latest.tone)}
                      strokeWidth={8}
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - (pctOfAttempt(latest) ?? 0) / 100)}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* A dash, not 0%. Without a real maximum there is no
                        percentage — showing 0% reads as a perfect score. */}
                    <span style={f('xl', 500)}>{pctOfAttempt(latest) !== null ? `${pctOfAttempt(latest)}%` : '—'}</span>
                    <span style={f('xs', 400, 'var(--color-text-muted)')}>{latest.score} / {latest.maxScore ?? '—'}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p style={f('xs', 400, 'var(--color-text-muted)')}>
                    {latestIsStale ? 'Most recent result' : 'Latest Score'}
                  </p>
                  {latestIsStale && (
                    <span
                      style={{
                        display: 'inline-block', padding: '3px 12px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'var(--color-bg-muted)',
                        ...f('sm', 500, 'var(--color-text-muted)'),
                        marginTop: 4,
                      }}
                    >
                      Scored under an older version
                    </span>
                  )}
                  {!latestIsStale && latest.severity && (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: getSeverityBg(latest.tone),
                        color: getSeverityColor(latest.tone),
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

        {/* Why there is no chart. Rendered only when there are attempts to
            account for — a first-ever result needs no explanation. */}
        {chartData.length < 2 && attempts.length > 0 && (chartAbsence.olderVersion > 0 || attempts.length > 1) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
              <CardContent style={{ padding: '20px 16px' }}>
                <h3 style={{ ...f('sm', 500), margin: '0 0 6px' }}>Score over time</h3>
                <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: 0, lineHeight: 1.5 }}>
                  {chartAbsence.olderVersion > 0 ? (
                    <>
                      {/* Never "earlier": when the newest result is excluded too,
                          nothing here is earlier than anything. */}
                      {chartAbsence.olderVersion === chartAbsence.total
                        ? (chartAbsence.total === 1
                            ? 'Your result was'
                            : `All ${chartAbsence.total} of your results were`)
                        : (chartAbsence.olderVersion === 1
                            ? 'One of your results was'
                            : `${chartAbsence.olderVersion} of your results were`)}
                      {' '}scored under an older version of this assessment, so
                      {chartAbsence.olderVersion === 1 ? ' it cannot' : ' they cannot'} be compared with each other.
                      {' '}{chartAbsence.olderVersion === 1 ? 'It is' : 'They are'} still listed below.
                    </>
                  ) : chartAbsence.noDenominator > 0 ? (
                    <>Your earlier results did not record a comparable maximum, so they cannot be plotted on one scale. They are still listed below.</>
                  ) : (
                    <>The chart appears once you have two comparable results.</>
                  )}
                </p>
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
              const pct = pctOfAttempt(attempt);

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
                          backgroundColor: index === 0 ? getSeverityBg(attempt.tone) : 'var(--color-bg-muted)',
                        }}
                      >
                        <span style={f('xs', 500, index === 0 ? getSeverityColor(attempt.tone) : 'var(--color-text-muted)')}>
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
                        <span style={f('lg', 500)}>{pct !== null ? `${Math.round(pct)}%` : '—'}</span>
                        <span style={f('xs', 400, 'var(--color-text-muted)')}> ({attempt.score}/{attempt.maxScore ?? '—'})</span>
                        {attempt.bandLabel && (
                          <div
                            style={{
                              marginTop: 2,
                              padding: '1px 8px',
                              borderRadius: 'var(--radius-pill)',
                              backgroundColor: getSeverityBg(attempt.tone),
                              color: getSeverityColor(attempt.tone),
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
                            <span style={f('xs', 500)}>{pct !== null ? `${pct.toFixed(0)}%` : '—'}</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, backgroundColor: 'var(--color-bg-muted)', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${pct}%`,
                                borderRadius: 3,
                                backgroundColor: getSeverityColor(attempt.tone),
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