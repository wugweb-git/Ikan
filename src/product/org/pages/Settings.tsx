import { useState } from 'react';
import { orgApi, type Organization } from '../api';

/**
 * Organisation settings an admin may change themselves.
 *
 * Seats and contract dates are NOT here: they are commercial terms, set by
 * iKAN, and an admin who could raise their own seat count would be writing
 * their own invoice. They are shown read-only so the admin can see what they
 * have without having to find the contract.
 *
 * `min_group_size` can be RAISED and never lowered. The server enforces that
 * too — this is a courtesy, not the control.
 */

export function Settings({ org, canWrite, onSaved }: {
  org: Organization;
  canWrite: boolean;
  onSaved: (o: Organization) => void;
}) {
  const [domains, setDomains] = useState((org.allowed_email_domains ?? []).join(', '));
  const [minGroup, setMinGroup] = useState(String(org.min_group_size ?? 10));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const next = Number.parseInt(minGroup, 10);
      if (!Number.isInteger(next) || next < org.min_group_size) {
        throw new Error(
          `The minimum group size can be raised above ${org.min_group_size}, not lowered.`,
        );
      }
      const { organization } = await orgApi.updateOrg(org.id, {
        allowed_email_domains: domains
          .split(/[\s,]+/)
          .map((d) => d.trim().replace(/^@/, '').toLowerCase())
          .filter(Boolean),
        min_group_size: next,
      });
      onSaved(organization);
      setMsg({ kind: 'ok', text: 'Saved.' });
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Could not save.' });
    } finally {
      setBusy(false);
    }
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="org-page">
      <h1 className="org-page__title">Settings</h1>
      <p className="org-page__lede">How people join {org.name}, and the privacy floor applied to
        every figure this portal will ever show you.</p>

      <section className="org-panel">
        <h2 className="org-panel__title">Contract</h2>
        <p className="org-panel__body">
          Set by iKAN. To change your seat count or renewal date, talk to us.
        </p>
        <div className="org-stats" style={{ marginTop: 18 }}>
          <div className="org-stat">
            <p className="org-stat__label">Seats</p>
            <p className="org-stat__value">{org.seats_purchased}</p>
          </div>
          <div className="org-stat">
            <p className="org-stat__label">Starts</p>
            <p className="org-stat__value" style={{ fontSize: 20 }}>{fmt(org.contract_start)}</p>
          </div>
          <div className="org-stat">
            <p className="org-stat__label">Renews</p>
            <p className="org-stat__value" style={{ fontSize: 20 }}>{fmt(org.contract_end)}</p>
          </div>
        </div>
      </section>

      <section className="org-panel">
        <h2 className="org-panel__title">Joining</h2>
        <p className="org-panel__body">
          Only addresses on these domains can be invited. Leave it empty to allow any address —
          useful if your people use personal email, though it also means a typo invites a stranger.
        </p>
        <label className="org-field">
          <span>Allowed email domains</span>
          <input
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            placeholder="example.com, example.co.in"
            disabled={!canWrite}
          />
          <p className="org-field__hint">Comma separated. The roster still decides who has a seat —
            a matching domain alone does not grant one.</p>
        </label>
      </section>

      <section className="org-panel">
        <h2 className="org-panel__title">Privacy floor</h2>
        <p className="org-panel__body">
          No figure is shown for a group smaller than this. It applies after every filter, so
          narrowing by department and date cannot be used to isolate a person. You can raise it;
          nobody can lower it.
        </p>
        <label className="org-field">
          <span>Minimum group size</span>
          <input
            type="number"
            min={org.min_group_size}
            value={minGroup}
            onChange={(e) => setMinGroup(e.target.value)}
            disabled={!canWrite}
          />
          <p className="org-field__hint">Currently {org.min_group_size}. A larger number means
            fewer figures and stronger protection for your people.</p>
        </label>
      </section>

      {msg && <div className={`org-note org-note--${msg.kind === 'ok' ? 'ok' : 'error'}`} role="status">{msg.text}</div>}

      {canWrite && (
        <div style={{ marginTop: 22 }}>
          <button type="button" className="org-button" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}
    </div>
  );
}
