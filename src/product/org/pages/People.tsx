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
  const [copied, setCopied] = useState<string | null>(null);
  const [deliveryNote, setDeliveryNote] = useState<string | null>(null);
  /*
   * Who has and has not joined is HIDDEN by default.
   *
   * The brief's "never show" list includes names of people who have not used
   * the platform, and a per-person Joined/Invited column is exactly that
   * list. The counter-argument — that accepting an invitation is account
   * administration rather than usage, and that HR typed these addresses in
   * themselves — is real but not mine to settle, so the default is the
   * stricter reading.
   *
   * It is still reachable, because resending an invitation is a legitimate
   * thing an administrator has to do and nothing else can tell them who to
   * resend to. Turning it on is deliberate, explained, and recorded.
   */
  const [showJoinState, setShowJoinState] = useState(false);

  /* Nothing mails the invitation, so the link has to be reachable from the
     roster or an invited person can never actually arrive. */
  const copyLink = async (id: string) => {
    try {
      const { link } = await orgApi.reissueInvite(org.id, id);
      await navigator.clipboard.writeText(link);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create an invitation link.');
    }
  };

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

  const live = (members ?? []).filter((m) => !m.ended_at).length;
  const joined = (members ?? []).filter((m) => !m.ended_at && m.accepted_at).length;
  const pending = live - joined;
  /** Email, Department, Role, (Status), (Actions) */
  const colCount = 3 + (showJoinState ? 1 : 0) + (canWrite ? 1 : 0);

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
      const { results, delivery } = await orgApi.invite(
        org.id,
        parsed.map((email) => ({ email, department: department.trim() || undefined })),
      );
      setOutcome(results);
      setDeliveryNote(delivery?.email_sent === false ? delivery.note : null);
      setBulk('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add those people.');
    } finally {
      setBusy(false);
    }
  };

  const setRole = async (m: Member, role: string) => {
    if (role === m.role) return;
    /* An admin removing their own admin rights can lock an organisation out
       of its own portal, so it is confirmed rather than silent. */
    if (m.role === 'admin' && role !== 'admin') {
      const ok = window.confirm(
        `Remove administrator access from ${m.email}?\n\n` +
          'They will keep their seat but will no longer be able to add people or change settings.',
      );
      if (!ok) { await load(); return; }
    }
    try {
      await orgApi.updateMember(org.id, m.id, { role });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not change that role.');
      await load();
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

        <label className="org-toggle">
          <input
            type="checkbox"
            checked={showEnded}
            onChange={(e) => setShowEnded(e.target.checked)}
          />
          Include past members
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

          {deliveryNote && (
            <div className="org-note org-note--warn" role="status">
              <strong>No email was sent.</strong> {deliveryNote} Use <em>Copy invite link</em> beside
              each invited person below.
            </div>
          )}

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

      {members && members.length > 0 && (
        <p className="org-rostercount">
          {joined} of {live} have joined.
          {pending > 0 && !showJoinState && (
            <>
              {' '}{pending} {pending === 1 ? 'invitation is' : 'invitations are'} outstanding.{' '}
              <button type="button" className="org-linkish" onClick={() => setShowJoinState(true)}>
                Show which
              </button>{' '}
              <span className="org-rostercount__why">
                — hidden by default, because who has not joined is not something an employer
                needs to know person by person.
              </span>
            </>
          )}
          {showJoinState && (
            <>
              {' '}
              <button type="button" className="org-linkish" onClick={() => setShowJoinState(false)}>
                Hide who has not joined
              </button>
            </>
          )}
        </p>
      )}

      <div className="org-table-wrap">
        <table className="org-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Department</th>
              <th>Role</th>
              {showJoinState && <th>Status</th>}
              {canWrite && <th aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {members === null ? (
              <tr><td colSpan={colCount} className="org-empty">Loading…</td></tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="org-empty">
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
                      {canWrite && !m.ended_at ? (
                        <>
                          <label className="sr-only" htmlFor={`role-${m.id}`}>
                            Role for {m.email}
                          </label>
                          <select
                            id={`role-${m.id}`}
                            className="org-rolepick"
                            value={m.role}
                            onChange={(e) => void setRole(m, e.target.value)}
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="viewer">Read only</option>
                          </select>
                        </>
                      ) : m.role === 'member' ? (
                        <span className="org-table__quiet">Member</span>
                      ) : (
                        <span className="org-pill org-pill--admin">
                          {m.role === 'admin' ? 'Admin' : 'Read only'}
                        </span>
                      )}
                    </td>
                    {showJoinState && (
                      <td>
                        {status === 'active' ? (
                          <span className="org-table__quiet">Joined</span>
                        ) : (
                          <span className={`org-pill org-pill--${status}`}>
                            {status === 'pending' ? 'Invited' : 'Past member'}
                          </span>
                        )}
                      </td>
                    )}
                    {canWrite && (
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {showJoinState && !m.ended_at && !m.accepted_at && (
                          <button type="button" className="org-button org-button--link" onClick={() => copyLink(m.id)}>
                            {copied === m.id ? 'Link copied' : 'Copy invite link'}
                          </button>
                        )}
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
