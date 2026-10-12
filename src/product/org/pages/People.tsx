import { useEffect, useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { orgApi, type InviteOutcome, type Member, type Organization } from '../api';

/**
 * The roster: invite, re-band, off-board.
 *
 * This is the one screen in the portal that shows individuals, and it is
 * legitimate — it is the list the organisation itself supplied, and it carries
 * no health data of any kind. HR already knows who works there; withholding
 * the roster would make the product unusable and protect nobody.
 *
 * Off-boarding ENDS a membership rather than deleting it, and the button says
 * "Remove" while the confirmation says what actually happens, because an admin
 * should not be told a row is gone when it is kept as the record of who was in
 * which team when.
 */

const STATUS = (m: Member) =>
  m.ended_at ? 'ended' : m.accepted_at ? 'active' : 'pending';

export function People({ org, canWrite }: { org: Organization; canWrite: boolean }) {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showEnded, setShowEnded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [bulk, setBulk] = useState('');
  const [department, setDepartment] = useState('');
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<InviteOutcome[] | null>(null);

  const load = async (includeEnded = showEnded) => {
    try {
      setError('');
      const { members } = await orgApi.members(org.id, includeEnded);
      setMembers(members);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the roster.');
    }
  };

  useEffect(() => {
    void load(showEnded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org.id, showEnded]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (members ?? []).filter(
      (m) => !q || m.email.toLowerCase().includes(q) || (m.department ?? '').toLowerCase().includes(q),
    );
  }, [members, query]);

  /* One address per line, so a paste out of a spreadsheet column works with
     no instructions. Commas and semicolons are accepted too, because people
     paste those as well and failing on it would be pedantry. */
  const parsed = useMemo(
    () =>
      Array.from(
        new Set(
          bulk
            .split(/[\s,;]+/)
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean),
        ),
      ),
    [bulk],
  );

  const invite = async () => {
    if (parsed.length === 0) return;
    setBusy(true);
    setOutcome(null);
    try {
      const { results } = await orgApi.invite(
        org.id,
        parsed.map((email) => ({ email, department: department.trim() || undefined })),
      );
      setOutcome(results);
      setBulk('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add those people.');
    } finally {
      setBusy(false);
    }
  };

  const endMembership = async (m: Member) => {
    const ok = window.confirm(
      `Remove ${m.email} from ${org.name}?\n\n` +
        'Their seat is freed immediately and they lose access. Their membership record is kept ' +
        'so past reports stay accurate — it is not deleted.',
    );
    if (!ok) return;
    try {
      await orgApi.endMembership(org.id, m.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove that person.');
    }
  };

  return (
    <div className="org-page">
      <h1 className="org-page__title">People</h1>
      <p className="org-page__lede">
        The roster your organisation provides. Nothing on this page reflects anyone&rsquo;s
        wellbeing, assessments or use of the app.
      </p>

      <div className="org-toolbar">
        <div className="org-search">
          <Search aria-hidden="true" style={{ position: 'absolute', left: 14, width: 16, height: 16, color: 'var(--muted-foreground)' }} />
          <label className="sr-only" htmlFor="org-people-search">Search people</label>
          <input
            id="org-people-search"
            type="search"
            placeholder="Search by email or department"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        <label className="org-tab" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showEnded}
            onChange={(e) => setShowEnded(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Show past members
        </label>

        {canWrite && (
          <button type="button" className="org-button" onClick={() => setAdding((v) => !v)}>
            <UserPlus aria-hidden="true" style={{ width: 16, height: 16 }} />
            Add people
          </button>
        )}
      </div>

      {adding && canWrite && (
        <section className="org-panel">
          <h2 className="org-panel__title">Invite by work email</h2>
          <p className="org-panel__body">
            One address per line, or paste a column from a spreadsheet.
            {(org.allowed_email_domains ?? []).length > 0 && (
              <> Addresses must be on {(org.allowed_email_domains ?? []).join(' or ')}.</>
            )}
          </p>

          <label className="org-field">
            <span>Email addresses</span>
            <textarea
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              placeholder={'asha@example.com\nrahul@example.com'}
            />
            <p className="org-field__hint">
              {parsed.length === 0
                ? 'Nothing to add yet'
                : `${parsed.length} address${parsed.length === 1 ? '' : 'es'} ready`}
            </p>
          </label>

          <label className="org-field">
            <span>Department (optional)</span>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Marketing"
            />
            <p className="org-field__hint">
              Applied to everyone in this batch. Departments are what later let you compare teams —
              and a team smaller than {org.min_group_size} will never be reported on.
            </p>
          </label>

          <div style={{ marginTop: 18 }}>
            <button type="button" className="org-button" disabled={busy || parsed.length === 0} onClick={invite}>
              {busy ? 'Adding…' : `Invite ${parsed.length || ''}`.trim()}
            </button>
          </div>

          {outcome && (
            <div className={`org-note ${outcome.some((r) => r.status === 'rejected') ? 'org-note--error' : 'org-note--ok'}`}>
              {(['invited', 'skipped', 'rejected'] as const).map((s) => {
                const rows = outcome.filter((r) => r.status === s);
                if (rows.length === 0) return null;
                return (
                  <p key={s} style={{ margin: '2px 0' }}>
                    <strong>{rows.length}</strong>{' '}
                    {s === 'invited' ? 'invited' : s === 'skipped' ? 'already on the roster' : 'not added'}
                    {s === 'rejected' && `: ${rows.map((r) => `${r.email} (${r.reason})`).join(', ')}`}
                  </p>
                );
              })}
            </div>
          )}
        </section>
      )}

      {error && <div className="org-note org-note--error" role="alert">{error}</div>}

      <div className="org-table-wrap">
        <table className="org-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              {canWrite && <th aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {members === null ? (
              <tr><td colSpan={5} className="org-empty">Loading…</td></tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={5} className="org-empty">
                  {query ? 'Nobody matches that search.' : 'No one has been added yet.'}
                </td>
              </tr>
            ) : (
              shown.map((m) => {
                const status = STATUS(m);
                return (
                  <tr key={m.id}>
                    <td className="org-table__email">{m.email}</td>
                    <td>{m.department || <span style={{ color: 'var(--muted-foreground)' }}>—</span>}</td>
                    <td>
                      {m.role === 'member' ? (
                        <span style={{ color: 'var(--muted-foreground)' }}>Member</span>
                      ) : (
                        <span className="org-pill org-pill--admin">
                          {m.role === 'admin' ? 'Admin' : 'Read only'}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`org-pill org-pill--${status}`}>
                        {status === 'active' ? 'Joined' : status === 'pending' ? 'Invited' : 'Past member'}
                      </span>
                    </td>
                    {canWrite && (
                      <td style={{ textAlign: 'right' }}>
                        {!m.ended_at && (
                          <button type="button" className="org-button org-button--danger" onClick={() => endMembership(m)}>
                            Remove
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
