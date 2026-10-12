import { useEffect, useMemo, useState } from 'react';
import { Download, Lock } from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { orgApi, type Insights as InsightsData, type Organization } from '../api';

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

const BAND_COLOURS = ['#C2694F', '#E0B252', '#4F7A62'];

const MONTH = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

export function Insights({ org }: { org: Organization }) {
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
      ['Department', 'People with data', 'Average iKAN score', 'Assessments %', 'Journal %', 'Equip %', 'Consult %'],
      ...(data.departments ?? []).map((d) =>
        d.suppressed
          ? [d.department, String(d.n), 'Withheld', '', '', '', '']
          : [d.department, String(d.n), String(d.avg_score),
             String(d.engagement!.assessments), String(d.engagement!.journal),
             String(d.engagement!.equip), String(d.engagement!.consult)]),
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
      <h1 className="org-page__title">Insights</h1>
      <p className="org-page__lede">
        How your organisation is doing, in aggregate. Nothing on this page can be traced to a
        person, and groups smaller than {org.min_group_size} are not reported on at all.
      </p>

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
        <div className="org-stats">
          <div className="org-stat">
            <p className="org-stat__label">Organisation iKAN score</p>
            <p className="org-stat__value">{data.headline.avg_score}</p>
            <p className="org-stat__note">
              {data.headline.change === null
                ? 'This period'
                : `${data.headline.change >= 0 ? '+' : ''}${data.headline.change} since ${MONTH(data.window.from)}`}
            </p>
          </div>
          <div className="org-stat">
            <p className="org-stat__label">People with data</p>
            <p className="org-stat__value">{data.headline.people}</p>
            <p className="org-stat__note">In the most recent month</p>
          </div>
          <div className="org-stat">
            <p className="org-stat__label">Thriving</p>
            <p className="org-stat__value">
              {Math.round((data.headline.bands.high / Math.max(1, data.headline.people)) * 100)}%
            </p>
            <p className="org-stat__note">Scoring 70 or above</p>
          </div>
          <div className="org-stat">
            <p className="org-stat__label">Active days a month</p>
            <p className="org-stat__value">{data.headline.avg_active_days}</p>
            <p className="org-stat__note">Average per person</p>
          </div>
        </div>
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
                    <stop offset="0%" stopColor="#4F7A62" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#4F7A62" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} width={44} />
                <Tooltip formatter={(v: number) => [v, 'Average score']} />
                <Area type="monotone" dataKey="score" stroke="#4F7A62" strokeWidth={2} fill="url(#orgScore)" />
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
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.08)" />
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
                  <th>Consultations</th>
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
                    <td>{d.engagement!.consult}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
