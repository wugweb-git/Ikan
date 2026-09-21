import { useMemo } from 'react';
import {
  Plus, Trash2, CircleAlert, Check, TriangleAlert, EyeOff, ArrowDownUp, Info,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { AdminStatusBadge } from './AdminStatusBadge';
import {
  achievableRange, computeCoverage, previewScore, validateBandTiling,
  resolveBandEdges, formatBandInterval,
  type AssessmentScore, type ScoringProfile,
} from '../../lib/scoring-engine';
import { buildScoringContext, type RawQuestion } from '../../lib/scoring-context';

/**
 * Wizard step 5 — Scoring Configuration.
 *
 * Everything shown here is computed from the questions and the linked profile,
 * never typed. That is the point: an achievable range you type is a denominator
 * that goes stale silently, and a stale denominator is invisible in the output.
 *
 * The coverage meter's denominator is every question with `is_scored !== false`
 * that is not retired; the numerator is those appearing in at least one score.
 * **Double assignment is legal and is not an error** — a PHQ-2 item legitimately
 * feeds both `depression` and `overall`. Only *zero* assignments count against
 * you. Excluding a question is a deliberate click that then shows up in the
 * excluded list; the difference between that and a silent omission is the whole
 * reason the meter exists.
 */

interface Props {
  questions: RawQuestion[];
  scores: AssessmentScore[];
  profiles: ScoringProfile[];
  onScoresChange: (scores: AssessmentScore[]) => void;
  onQuestionChange: (questionId: string, patch: Partial<RawQuestion>) => void;
}

/**
 * Items that look scoreable and are not part of their instrument's sum.
 *
 * Both are the PHQ/GAD **functional-impairment** question — "How difficult have
 * the above problems made it for you to do your work, take care of things at
 * home, or get along with other people?" It is administered with the scale but
 * is never summed into it.
 *
 * The coverage meter proves *assignment*, not *appropriateness*: assign one of
 * these to the total and the meter goes green on a wrong spec. These are the
 * only two places in the seven assessments where that distinction bites, so
 * they get named rather than left to reviewer memory.
 */
const NON_SUMMED_ITEMS: Record<string, string> = {
  'anxiety-q8': 'GAD-7 functional-impairment item — administered with the scale, never summed into it.',
  'depression-q10': 'PHQ-9 functional-impairment item — administered with the scale, never summed into it.',
};

const mutedText = {
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
  lineHeight: '1.5',
} as const;

const labelStyle = { fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' } as const;

export function AssessmentScoresEditor({
  questions, scores, profiles, onScoresChange, onQuestionChange,
}: Props) {
  const profileMap = useMemo(
    () => Object.fromEntries(profiles.map(p => [p.id, p])),
    [profiles],
  );

  const built = useMemo(
    () => buildScoringContext({ questions, scores, profiles: profileMap }),
    [questions, scores, profileMap],
  );

  const coverage = useMemo(() => computeCoverage(built.ctx), [built]);

  /**
   * Questions that are actually used by a score AND rely on a derived scale.
   * These block authoring — see BuiltContext.derivedScale.
   */
  const blockedItems = useMemo(() => {
    const assigned = new Set(scores.flatMap(s => (s.items ?? []).map(i => i.question_id)));
    return built.derivedScale.filter(id => assigned.has(id));
  }, [built, scores]);

  const questionText = useMemo(
    () => Object.fromEntries(questions.map(q => [q.id, q.text ?? q.id])),
    [questions],
  );

  const updateScore = (id: string, patch: Partial<AssessmentScore>) => {
    onScoresChange(scores.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addScore = () => {
    const n = scores.length + 1;
    onScoresChange([...scores, {
      id: `score-${Date.now()}`,
      label: `Score ${n}`,
      profile_id: profiles[0]?.id ?? '',
      items: [],
    }]);
  };

  const toggleItem = (score: AssessmentScore, questionId: string) => {
    const items = score.items ?? [];
    const exists = items.some(i => i.question_id === questionId);
    updateScore(score.id, {
      items: exists
        ? items.filter(i => i.question_id !== questionId)
        : [...items, { question_id: questionId }],
    });
  };

  const toggleReverse = (score: AssessmentScore, questionId: string) => {
    updateScore(score.id, {
      items: (score.items ?? []).map(i =>
        i.question_id === questionId ? { ...i, reverse: !i.reverse } : i),
    });
  };

  const meterColor =
    coverage.status === 'green' ? 'var(--color-status-success)'
      : coverage.status === 'amber' ? 'var(--color-status-warning)'
        : 'var(--color-status-danger)';

  const meterBg =
    coverage.status === 'green' ? 'var(--color-status-success-light)'
      : coverage.status === 'amber' ? 'var(--color-status-warning-light)'
        : 'var(--color-status-danger-light)';

  const pct = coverage.denominator > 0
    ? Math.round((coverage.numerator / coverage.denominator) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* ── Coverage meter ─────────────────────────────────────────────── */}
      <div
        className="p-5 rounded-xl space-y-3"
        style={{ backgroundColor: meterBg, border: `1px solid ${meterColor}` }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {coverage.status === 'green'
              ? <Check className="w-5 h-5" style={{ color: meterColor }} />
              : <CircleAlert className="w-5 h-5" style={{ color: meterColor }} />}
            <span style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
            }}>
              {coverage.numerator} of {coverage.denominator} scored questions assigned
            </span>
          </div>
          <AdminStatusBadge
            status={coverage.status === 'green' ? 'success' : coverage.status === 'amber' ? 'warning' : 'danger'}
            label={coverage.status === 'green' ? 'Complete' : coverage.status === 'amber' ? 'Incomplete' : 'Invalid'}
          />
        </div>

        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: meterColor }} />
        </div>

        {coverage.excluded.length > 0 && (
          <p style={mutedText}>
            {coverage.excluded.length} excluded —{' '}
            {coverage.excluded.map(e => e.questionId).join(', ')}
          </p>
        )}

        {coverage.unassigned.length > 0 && (
          <div className="space-y-1">
            <p style={{ ...mutedText, fontWeight: 'var(--font-weight-medium)' }}>
              Not assigned to any score:
            </p>
            {coverage.unassigned.map(u => (
              <div key={u.questionId} className="flex items-center justify-between gap-2">
                <span style={mutedText}>
                  <code>{u.questionId}</code> — {questionText[u.questionId] ?? ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 shrink-0"
                  onClick={() => onQuestionChange(u.questionId, { is_scored: false })}
                >
                  <EyeOff className="w-3 h-3" /> Exclude from scoring
                </Button>
              </div>
            ))}
          </div>
        )}

        {coverage.issues.length > 0 && (
          <div className="space-y-1">
            {coverage.issues.map((issue, i) => (
              <p key={i} style={mutedText}>
                <strong>{issue.severity === 'red' ? 'Error' : 'Warning'}:</strong> {issue.message}
              </p>
            ))}
          </div>
        )}

        {coverage.assigned.some(a => a.scoreIds.length > 1) && (
          <p style={mutedText}>
            Shared items (legal — one question can feed several scores):{' '}
            {coverage.assigned.filter(a => a.scoreIds.length > 1)
              .map(a => `${a.questionId} → ${a.scoreIds.join(', ')}`).join(' · ')}
          </p>
        )}
      </div>

      {/* ── Save gate: no spec on an inferred scale ────────────────────── */}
      {blockedItems.length > 0 && (
        <div
          className="p-4 rounded-xl flex items-start gap-3"
          style={{ backgroundColor: 'var(--color-status-danger-light)', border: '1px solid var(--color-status-danger)' }}
        >
          <CircleAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-status-danger)' }} />
          <div className="space-y-1">
            <p style={{ ...mutedText, fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
              Scoring cannot be saved yet — {blockedItems.length} scored item
              {blockedItems.length === 1 ? '' : 's'} have no declared scale.
            </p>
            <p style={mutedText}>
              Their option values are being inferred from the question's own options rather than
              read from a shared scale. That is fine for the preview above, but a stored result
              computed against an inferred scale has an inferred denominator, and nothing
              downstream can tell that apart from a declared one. Give these questions a
              <code> scale_ref</code> first:{' '}
              <code>{blockedItems.slice(0, 8).join(', ')}</code>
              {blockedItems.length > 8 && ` +${blockedItems.length - 8} more`}.
            </p>
          </div>
        </div>
      )}

      {/* ── Scale provenance ───────────────────────────────────────────── */}
      {built.indexDerived.length > 0 && (
        <div
          className="p-4 rounded-xl flex items-start gap-3"
          style={{ backgroundColor: 'var(--color-status-warning-light)', border: '1px solid var(--color-status-warning)' }}
        >
          <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-status-warning)' }} />
          <p style={mutedText}>
            {built.indexDerived.length} question{built.indexDerived.length === 1 ? '' : 's'} state no
            option values, so the position in the list is being used as the weight:{' '}
            <code>{built.indexDerived.slice(0, 6).join(', ')}</code>
            {built.indexDerived.length > 6 && ` +${built.indexDerived.length - 6} more`}.
            That assumption is what forced an <code>offset</code> onto instruments scored 1–5.
            Give each option an explicit value to remove it.
          </p>
        </div>
      )}

      {built.optionless.length > 0 && (
        <div
          className="p-4 rounded-xl flex items-start gap-3"
          style={{ backgroundColor: 'var(--color-status-danger-light)', border: '1px solid var(--color-status-danger)' }}
        >
          <CircleAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-status-danger)' }} />
          <p style={mutedText}>
            No options at all, so these cannot contribute to any score:{' '}
            <code>{built.optionless.join(', ')}</code>
          </p>
        </div>
      )}

      {profiles.length === 0 && (
        <div
          className="p-4 rounded-xl flex items-start gap-3"
          style={{ backgroundColor: 'var(--color-status-info-light)', border: '1px solid var(--color-status-info)' }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-status-info)' }} />
          <p style={mutedText}>
            No scoring profiles exist yet. A score needs one to supply its calculation,
            direction and bands — create one in <strong>Scoring Engine</strong> first.
          </p>
        </div>
      )}

      {/* ── Scores ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h3 style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
        }}>
          Scores
        </h3>
        <Button variant="outline" size="sm" onClick={addScore} className="gap-1">
          <Plus className="w-3 h-3" /> Add score
        </Button>
      </div>

      {scores.length === 0 && (
        <p style={mutedText}>
          No scores yet. A single-instrument assessment needs one score; a sectioned one
          (Burnout's four BAT sub-scales, General's five scales) needs one per scale.
        </p>
      )}

      {scores.map(score => {
        const profile = profileMap[score.profile_id];
        const { range, unresolved } = achievableRange(score.id, built.ctx);
        const preview = previewScore(score.id, built.ctx);
        const items = score.items ?? [];
        const tiling = profile
          ? validateBandTiling(profile.bands ?? [], range, profile.band_basis)
          : null;
        const resolvedBands = profile
          ? resolveBandEdges(profile.bands ?? [], profile.band_basis, range)
              .sort((a, b) => a.min - b.min)
          : [];

        return (
          <Card key={score.id} style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label style={labelStyle}>Score label</Label>
                  <Input
                    value={score.label}
                    onChange={e => updateScore(score.id, { label: e.target.value })}
                    placeholder="e.g. Exhaustion, Overall burnout risk"
                  />
                </div>
                <div className="space-y-1">
                  <Label style={labelStyle}>Scoring profile</Label>
                  <Select
                    value={score.profile_id || undefined}
                    onValueChange={v => updateScore(score.id, { profile_id: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Choose a profile" /></SelectTrigger>
                    <SelectContent>
                      {profiles.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name || p.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Achievable range — computed, never typed */}
              <div
                className="p-3 rounded-lg flex flex-wrap items-center gap-x-6 gap-y-2"
                style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}
              >
                <div>
                  <p style={mutedText}>Achievable range</p>
                  <p style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                  }}>
                    {unresolved.length > 0 ? '—' : `${range.min} to ${range.max}`}
                  </p>
                </div>
                <div>
                  <p style={mutedText}>Items</p>
                  <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                    {items.length}
                    {items.some(i => i.reverse) && ` (${items.filter(i => i.reverse).length} reversed)`}
                  </p>
                </div>
                {profile && (
                  <div>
                    <p style={mutedText}>Calculation</p>
                    <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                      {profile.calc}{profile.calc === 'sum_times_k' ? ` (k=${profile.k ?? '?'})` : ''}
                      {' · '}
                      {profile.direction === 'higher_is_better' ? 'higher is better' : 'higher is distress'}
                    </p>
                  </div>
                )}
              </div>

              {unresolved.length > 0 && (
                <div
                  className="p-3 rounded-lg flex items-start gap-2"
                  style={{ backgroundColor: 'var(--color-status-danger-light)', border: '1px solid var(--color-status-danger)' }}
                >
                  <CircleAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-status-danger)' }} />
                  <p style={mutedText}>
                    This score cannot be computed — unresolved: <code>{unresolved.join(', ')}</code>.
                    It renders as invalid rather than scoring the missing items as zero.
                  </p>
                </div>
              )}

              {/* All-min / all-max preview */}
              {preview && profile && unresolved.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {([['Everything at minimum', preview.atMin], ['Everything at maximum', preview.atMax]] as const).map(
                    ([caption, outcome]) => (
                      <div
                        key={caption}
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}
                      >
                        <p style={mutedText}>{caption}</p>
                        <p style={{
                          fontFamily: 'var(--font-family-base)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                        }}>
                          {outcome.value} →{' '}
                          {outcome.band
                            ? `${outcome.band.label} (${outcome.severity} · ${outcome.tier})`
                            : 'no band matches'}
                        </p>
                      </div>
                    ),
                  )}
                  <p style={{ ...mutedText, gridColumn: '1 / -1' }}>
                    {profile.direction === 'higher_is_better'
                      ? 'Higher is better, so the minimum should read as the most severe. If it does not, the bands are inverted.'
                      : 'Higher is distress, so the maximum should read as the most severe. If it does not, the bands are inverted.'}
                  </p>
                </div>
              )}

              {/* Band tiling against this score's real range */}
              {tiling && (
                <div
                  className="p-3 rounded-lg space-y-1"
                  style={{
                    backgroundColor: tiling.status === 'green' ? 'var(--color-status-success-light)' : tiling.status === 'amber' ? 'var(--color-status-warning-light)' : 'var(--color-status-danger-light)',
                    border: `1px solid ${tiling.status === 'green' ? 'var(--color-status-success)' : tiling.status === 'amber' ? 'var(--color-status-warning)' : 'var(--color-status-danger)'}`,
                  }}
                >
                  {tiling.status === 'green' ? (
                    <p style={mutedText}>
                      Bands tile {range.min} to {range.max} exactly.
                    </p>
                  ) : (
                    tiling.issues.map((issue, i) => (
                      <p key={i} style={mutedText}>
                        <strong>{issue.severity === 'red' ? 'Error' : 'Warning'}:</strong> {issue.message}
                      </p>
                    ))
                  )}
                  {resolvedBands.length > 0 && (
                    <p style={mutedText}>
                      {resolvedBands.map((b, i) =>
                        `${b.label}: ${formatBandInterval(b, i === resolvedBands.length - 1)}`).join('  ·  ')}
                    </p>
                  )}
                </div>
              )}

              {/* Item assignment */}
              <div>
                <Label style={labelStyle}>Items</Label>
                <div
                  className="mt-1 rounded-lg divide-y max-h-72 overflow-y-auto"
                  style={{ border: '1px solid var(--color-border-default)' }}
                >
                  {questions.map(q => {
                    const item = items.find(i => i.question_id === q.id);
                    const excluded = q.is_scored === false;
                    return (
                      <div key={q.id} className="flex items-center gap-3 p-2">
                        <Switch
                          checked={!!item}
                          onCheckedChange={() => toggleItem(score, q.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <p style={{
                            fontFamily: 'var(--font-family-base)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            <code>{q.id}</code> — {q.text ?? ''}
                          </p>
                          {excluded && (
                            <p style={mutedText}>Excluded from scoring</p>
                          )}
                          {item && NON_SUMMED_ITEMS[q.id] && (
                            <p style={{ ...mutedText, color: 'var(--color-status-warning)' }}>
                              ⚠ {NON_SUMMED_ITEMS[q.id]}
                            </p>
                          )}
                        </div>
                        {item && (
                          <Button
                            variant={item.reverse ? 'default' : 'outline'}
                            size="sm"
                            className="gap-1 shrink-0"
                            onClick={() => toggleReverse(score, q.id)}
                            title="Invert this item against its own scale before aggregating"
                          >
                            <ArrowDownUp className="w-3 h-3" />
                            {item.reverse ? 'Reversed' : 'Reverse'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  style={{ color: 'var(--color-status-danger)' }}
                  onClick={() => onScoresChange(scores.filter(s => s.id !== score.id))}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove score
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
