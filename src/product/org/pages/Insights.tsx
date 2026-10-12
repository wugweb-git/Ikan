import { useEffect, useMemo, useState } from 'react';
import { Download, Lock, ShieldCheck } from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { orgApi, type Insights as InsightsData, type Organization, type Overview } from '../api';

/**
 * The aggregate dashboard — sections A to E of the HR brief.
 *
 * Every figure here arrives already suppressed: the server decides what may
 * be shown and this screen renders the answer, including the refusals. That
 * split is deliberate. If the threshold lived in the UI, the numbers would
 * still have crossed the wire, and a suppression rule you can read out of a
 * network tab is not one.
 *
 * Suppressed groups are shown rather than hidden. An HR buyer should see the
 * product declining to answer — it is the clearest possible statement of what
 * their people are protected from, and a silently shorter list just looks
 * like missing data.
 */

/*
 * iKAN 2's brand ramp, not invented hex. SVG presentation attributes resolve
 * CSS custom properties, so recharts takes these directly and the chart
 * follows the design system — including anywhere the tokens are redefined.
 */
const BAND_COLOURS = [
  'var(--brand-coral-ink)',   // struggling
  'var(--brand-amber-ink)',   // coping
  'var(--brand-teal-ink)',    // thriving
] as const;

const MONTH = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

export function Insights({ org, overview }: { org: Organization; overview: Overview | null }) {
  const [months, setMonths] = useState(6);
  const [department, setDepartment] = useState<string>('');
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    (async () => {
      try {
        const d = await orgApi.insights(org.id, { months, department: department || undefined });
        if (live) { setData(d); setError(''); }
      } catch (e) {
        if (live) setError(e instanceof Error ? e.message : 'Could not load insights.');
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [org.id, months, department]);

  const trendRows = useMemo(
    () => (data?.trend ?? []).filter((t) => !t.suppressed).map((t) => ({
      month: MONTH(t.period),
      score: t.avg_score!,
      people: t.n,
    })),
    [data],
  );

  const deptRows = useMemo(
    () => (data?.departments ?? []).filter((d) => !d.suppressed).map((d) => ({
      department: d.department,
      score: d.avg_score!,
      n: d.n,
    })),
    [data],
  );

  const suppressed = (data?.departments ?? []).filter((d) => d.suppressed);

  /* CSV of exactly what is on screen — suppressed groups included as
     suppressed, so an export cannot become the way round the floor. */
  const exportCsv = () => {
    if (!data) return;
    const rows: string[][] = [
      ['iKAN — aggregate report'],
      ['Organisation', org.name],
      ['Window', `${data.window.from} to ${data.window.to}`],
      ['Minimum group size', String(data.privacy.min_group_size)],
      [],
      ['Month', 'People with data', 'Average iKAN score'],
      ...(data.trend ?? []).map((t) =>
        t.suppressed
          ? [MONTH(t.period), String(t.n), 'Withheld — group below the minimum']
          : [MONTH(t.period), String(t.n), String(t.avg_score)]),
      [],
      ['Department', 'People with data', 'Average iKAN score', 'Assessments %', 'Journal %', 'Equip %'],
      ...(data.departments ?? []).map((d) =>
        d.suppressed
          ? [d.department, String(d.n), 'Withheld', '', '', '']
          : [d.department, String(d.n), String(d.avg_score),
             String(d.engagement!.assessments), String(d.engagement!.journal),
             String(d.engagement!.equip)]),
      [],
      ['Consultations (organisation only, never by team)',
       data.consultations.available ? `${data.consultations.pct}%` : 'Withheld'],
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ikan-${org.slug}-${data.window.from}-to-${data.window.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allDepartments = (data?.departments ?? []).map((d) => d.department);

  return (
    <div className="org-page">
      <h1 className="org-page__title">{org.name}</h1>
      <p className="org-page__lede">
        Adoption and wellbeing, in aggregate. Nothing on this page can be traced to a person,
        and groups smaller than {org.min_group_size} are not reported on at all.
      </p>

      {/* Seats first: it is the commercial fact an administrator acts on, and
          the denominator for everything below it. It was a tab of its own
          with four numbers on it, which is not a destination. */}
      {overview && (
        <section className="org-seats">
          <div className="org-seats__line">
            <p className="org-seats__value">
              {overview.seats.used}
              <span className="org-seats__of"> of {overview.seats.purchased} seats</span>
            </p>
            <p className="org-seats__note">
              {overview.onboarding.adoption_rate === null
                ? 'Set a seat count to measure adoption'
                : `${overview.onboarding.adoption_rate}% adoption`}
              {overview.onboarding.pending > 0 && ` · ${overview.onboarding.pending} invited, not yet joined`}
            </p>
          </div>
          <div className="org-meter">
            <div
              className={`org-meter__fill${overview.seats.remaining === 0 ? ' org-meter__fill--full' : ''}`}
              style={{
                width: `${overview.seats.purchased > 0
                  ? Math.min(100, Math.round((overview.seats.used / overview.seats.purchased) * 100))
                  : 0}%`,
              }}
            />
          </div>
        </section>
      )}

      {overview?.contract && !overview.contract.active && (
        <div className="org-note org-note--warn" role="status">
          <strong>Changes are paused.</strong>{' '}
          {overview.contract.ends
            ? `This organisation's contract ended on ${new Date(overview.contract.ends).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`
            : 'This organisation\u2019s contract is not currently active.'}{' '}
          Your reports stay available; adding people and spending seats resumes on renewal.
        </div>
      )}

      <div className="org-toolbar">
        <label className="org-field" style={{ margin: 0, minWidth: 170 }}>
          <span>Period</span>
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
        </label>

        <label className="org-field" style={{ margin: 0, minWidth: 190 }}>
          <span>Department</span>
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">Whole organisation</option>
            {allDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>

        <div style={{ flex: 1 }} />

        <button type="button" className="org-button org-button--quiet" onClick={exportCsv} disabled={!data}>
          <Download aria-hidden="true" style={{ width: 16, height: 16 }} />
          Export CSV
        </button>
      </div>

      {error && <div className="org-note org-note--error" role="alert">{error}</div>}
      {loading && !data && <p className="org-empty">Loading…</p>}

      {data?.headline && (
        <>
          {/* The organisation's score is what the whole page is about, so it
              is the one thing allowed to be large. Everything under it is
              context for reading it. */}
          <div className="org-lead">
            <p className="org-lead__value">{data.headline.avg_score}</p>
            <div className="org-lead__side">
              <p className="org-lead__label">
                average iKAN score, {MONTH(data.window.to)}
              </p>
              {data.headline.change !== null && (
                <p className={`org-lead__delta${data.headline.change < 0 ? ' org-lead__delta--down' : ''}`}>
                  {data.headline.change >= 0 ? '+' : ''}{data.headline.change} since {MONTH(data.window.from)}
                </p>
              )}
            </div>
          </div>

          <div className="org-facts">
            <div className="org-fact">
              <p className="org-fact__value">{data.headline.people}</p>
              <p className="org-fact__label">people with data this month</p>
            </div>
            <div className="org-fact">
              <p className="org-fact__value">
                {Math.round((data.headline.bands.high / Math.max(1, data.headline.people)) * 100)}%
              </p>
              <p className="org-fact__label">scoring 70 or above</p>
            </div>
            <div className="org-fact">
              <p className="org-fact__value">{data.headline.avg_active_days}</p>
              <p className="org-fact__label">active days a month, per person</p>
            </div>
          </div>
        </>
      )}

      {trendRows.length > 1 && (
        <section className="org-panel">
          <h2 className="org-panel__title">Wellbeing over time</h2>
          <p className="org-panel__body">
            Average iKAN score{department ? ` for ${department}` : ' across the organisation'}.
          </p>
          <div className="org-chart">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendRows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="orgScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-teal-ink)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--brand-teal-ink)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {/* The bands behind the line. A 0-100 axis with data sitting
                    at 60 is mostly air; shading the score bands makes that
                    space mean something, without truncating the axis and
                    overstating the movement. */}
                <ReferenceArea y1={0} y2={45} fill="var(--brand-coral)" fillOpacity={0.07} />
                <ReferenceArea y1={45} y2={70} fill="var(--brand-amber)" fillOpacity={0.07} />
                <ReferenceArea y1={70} y2={100} fill="var(--brand-teal)" fillOpacity={0.07} />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="color-mix(in oklab, var(--foreground) 10%, transparent)"
                />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} width={44} />
                <Tooltip formatter={(v: number) => [v, 'Average score']} />
                {/* A seven-point move on a hundred-point index is genuinely
                    small, and the axis stays at 0-100 rather than being
                    cropped to make it look dramatic. So the line carries the
                    weight instead: heavier stroke, and a dot per month so
                    each reading is a point you can actually read. */}
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--brand-teal-ink)"
                  strokeWidth={2.5}
                  fill="url(#orgScore)"
                  dot={{ r: 3.5, fill: 'var(--brand-teal-ink)', strokeWidth: 0 }}
                  activeDot={{ r: 5.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {data?.headline && (
        <section className="org-panel">
          <h2 className="org-panel__title">How people are distributed</h2>
          <p className="org-panel__body">
            Where your people sit, most recent month. Bands are the score ranges, not a diagnosis.
          </p>
          <div className="org-bands">
            {([
              ['Struggling', data.headline.bands.low, BAND_COLOURS[0], 'Below 45'],
              ['Coping', data.headline.bands.mid, BAND_COLOURS[1], '45 to 69'],
              ['Thriving', data.headline.bands.high, BAND_COLOURS[2], '70 and above'],
            ] as const).map(([label, count, colour, range]) => {
              const pct = Math.round((count / Math.max(1, data.headline!.people)) * 100);
              return (
                <div key={label} className="org-band">
                  <div className="org-band__head">
                    <span className="org-band__dot" style={{ background: colour }} />
                    <strong>{label}</strong>
                    <span className="org-band__range">{range}</span>
                  </div>
                  <p className="org-band__value">{pct}%</p>
                  <div className="org-meter">
                    <div className="org-meter__fill" style={{ width: `${pct}%`, background: colour }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {deptRows.length > 0 && (
        <section className="org-panel">
          <h2 className="org-panel__title">By department</h2>
          <p className="org-panel__body">
            Only departments with at least {data!.privacy.min_group_size} people who have data appear here.
          </p>
          <div className="org-chart">
            <ResponsiveContainer width="100%" height={Math.max(180, deptRows.length * 46)}>
              <BarChart data={deptRows} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 10 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="color-mix(in oklab, var(--foreground) 10%, transparent)"
                />
                <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} />
                <YAxis type="category" dataKey="department" width={96} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  formatter={(v, _name, item) => {
                    const n = (item as { payload?: { n?: number } })?.payload?.n;
                    return [`${v}${n ? ` (${n} people)` : ''}`, 'Average score'];
                  }}
                />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={18}>
                  {deptRows.map((r) => (
                    <Cell
                      key={r.department}
                      fill={r.score >= 70 ? BAND_COLOURS[2] : r.score >= 45 ? BAND_COLOURS[1] : BAND_COLOURS[0]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {suppressed.length > 0 && (
        <section className="org-panel">
          <h2 className="org-panel__title">
            <Lock aria-hidden="true" style={{ width: 15, height: 15, marginRight: 6, verticalAlign: '-2px' }} />
            Not reported
          </h2>
          <p className="org-panel__body">
            These groups are too small to report on without pointing at someone. This is by design
            and cannot be turned off.
          </p>
          <ul className="org-suppressed">
            {suppressed.map((d) => (
              <li key={d.department}>
                <strong>{d.department}</strong>
                <span>{d.n} {d.n === 1 ? 'person' : 'people'}</span>
                <p>{d.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data && deptRows.length > 0 && (
        <section className="org-panel">
          <h2 className="org-panel__title">Engagement by product</h2>
          <p className="org-panel__body">
            Share of people in each department who used each product in this window.
            Consultations are not broken down by team — see below.
          </p>
          <div className="org-table-wrap" style={{ marginTop: 16 }}>
            <table className="org-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>People</th>
                  <th>Assessments</th>
                  <th>Journal</th>
                  <th>Equip</th>
                </tr>
              </thead>
              <tbody>
                {data.departments.filter((d) => !d.suppressed).map((d) => (
                  <tr key={d.department}>
                    <td className="org-table__email">{d.department}</td>
                    <td>{d.n}</td>
                    <td>{d.engagement!.assessments}%</td>
                    <td>{d.engagement!.journal}%</td>
                    <td>{d.engagement!.equip}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {data?.consultations && (
        <section className="org-panel">
          <h2 className="org-panel__title">Consultations</h2>
          <p className="org-panel__body">
            Reported for the whole organisation and never by team. A department figure would
            clear the group threshold and still point at someone — in a team of eleven, one
            person is nine per cent — and whether a colleague is in therapy is not something an
            employer gets to infer.
          </p>
          {data.consultations.available ? (
            <div className="org-facts" style={{ borderTop: 0, marginTop: 14 }}>
              <div className="org-fact" style={{ paddingLeft: 0 }}>
                <p className="org-fact__value">{data.consultations.pct}%</p>
                <p className="org-fact__label">
                  of {data.consultations.people} people had at least one consultation
                </p>
              </div>
            </div>
          ) : (
            <p className="org-note org-note--warn" style={{ marginTop: 14 }}>
              {data.consultations.reason}
            </p>
          )}
        </section>
      )}

      <aside className="org-privacy">
        <ShieldCheck aria-hidden="true" />
        <p>
          <strong>You never see an individual&rsquo;s wellbeing data here.</strong> No scores, no
          assessment answers, no journal entries, no therapy attendance — not for any person, and
          not through any filter. The roster under People is the list you supplied, and carries
          nothing about anyone&rsquo;s health.{' '}
          <a href="/workplace-privacy">The page we give your people</a> says the same in their words.
        </p>
      </aside>
    </div>
  );
}
