import { useRef, useState } from 'react';
import { orgApi, type Organization } from '../api';

/**
 * Organisation settings.
 *
 * Three things an org admin owns — who they are, who looks after the account,
 * and how people join — plus two they do not.
 *
 * Seats, contract dates and status are read-only: they are commercial terms,
 * and an admin who could raise their own seat count would be writing their own
 * invoice. `min_group_size` can be raised and never lowered; the server
 * enforces that too, so the control here is a courtesy rather than the
 * guarantee.
 */

type Draft = Pick<
  Organization,
  | 'name' | 'website' | 'industry' | 'address' | 'city' | 'country'
  | 'primary_contact_name' | 'primary_contact_role'
  | 'primary_contact_email' | 'primary_contact_phone'
>;

const DRAFT_FIELDS: Array<keyof Draft> = [
  'name', 'website', 'industry', 'address', 'city', 'country',
  'primary_contact_name', 'primary_contact_role',
  'primary_contact_email', 'primary_contact_phone',
];

const toDraft = (org: Organization): Draft =>
  Object.fromEntries(DRAFT_FIELDS.map((f) => [f, org[f] ?? ''])) as unknown as Draft;

export function Settings({ org, canWrite, onSaved }: {
  org: Organization;
  canWrite: boolean;
  onSaved: (o: Organization) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(org));
  const [domains, setDomains] = useState((org.allowed_email_domains ?? []).join(', '));
  const [minGroup, setMinGroup] = useState(String(org.min_group_size ?? 10));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));

  const field = (k: keyof Draft, label: string, props: Record<string, unknown> = {}) => (
    <label className="org-field">
      <span>{label}</span>
      <input value={(draft[k] as string) ?? ''} onChange={set(k)} disabled={!canWrite} {...props} />
    </label>
  );

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const next = Number.parseInt(minGroup, 10);
      if (!Number.isInteger(next) || next < org.min_group_size) {
        throw new Error(`The minimum group size can be raised above ${org.min_group_size}, not lowered.`);
      }
      const { organization } = await orgApi.updateOrg(org.id, {
        ...draft,
        min_group_size: next,
        allowed_email_domains: domains
          .split(/[\s,]+/)
          .map((d) => d.trim().replace(/^@/, '').toLowerCase())
          .filter(Boolean),
      });
      onSaved(organization);
      setMsg({ kind: 'ok', text: 'Saved.' });
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Could not save.' });
    } finally {
      setBusy(false);
    }
  };

  const pickLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      const { organization } = await orgApi.uploadLogo(org.id, file);
      onSaved(organization);
      setMsg({ kind: 'ok', text: 'Logo updated.' });
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Could not upload that logo.' });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="org-page">
      <h1 className="org-page__title">Settings</h1>
      <p className="org-page__lede">
        Your organisation&rsquo;s details, who looks after the account, how people join, and the
        privacy floor applied to every figure this portal will ever show you.
      </p>

      <section className="org-panel">
        <h2 className="org-panel__title">Logo</h2>
        <p className="org-panel__body">
          Shown beside your name here. A square image reads best — under 2MB.
        </p>
        <div className="org-logo-row">
          {org.logo_url ? (
            <img className="org-logo-preview" src={org.logo_url} alt="" />
          ) : (
            <span className="org-logo-preview org-logo-preview--empty" aria-hidden="true">
              {org.name.charAt(0)}
            </span>
          )}
          {canWrite && (
            <div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={pickLogo}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="org-button org-button--quiet"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
              >
                {uploading ? 'Uploading…' : org.logo_url ? 'Replace logo' : 'Upload logo'}
              </button>
              <p className="org-field__hint" style={{ marginTop: 8 }}>
                PNG, JPG or SVG. Without one, the first letter of your name is used.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="org-panel">
        <h2 className="org-panel__title">Organisation</h2>
        {field('name', 'Name')}
        {field('industry', 'Industry', { placeholder: 'Technology, Manufacturing, Education…' })}
        {field('website', 'Website', { type: 'url', placeholder: 'https://' })}
        {field('address', 'Address')}
        <div className="org-grid-2">
          {field('city', 'City')}
          {field('country', 'Country')}
        </div>
      </section>

      <section className="org-panel">
        <h2 className="org-panel__title">Who looks after this account</h2>
        <p className="org-panel__body">
          Our point of contact for the contract and anything needing a decision. They do not have
          to be an administrator here — a finance or procurement contact who never signs in is fine.
        </p>
        {field('primary_contact_name', 'Name')}
        {field('primary_contact_role', 'Role', { placeholder: 'Head of People' })}
        <div className="org-grid-2">
          {field('primary_contact_email', 'Email', { type: 'email' })}
          {field('primary_contact_phone', 'Phone', { type: 'tel' })}
        </div>
      </section>

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
          <p className="org-field__hint">
            Comma separated. The roster still decides who has a seat — a matching domain alone
            does not grant one.
          </p>
        </label>
      </section>

      <section className="org-panel">
        <h2 className="org-panel__title">Privacy floor</h2>
        <p className="org-panel__body">
          No figure is shown for a group smaller than this, and it applies after every filter — so
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
          <p className="org-field__hint">
            Currently {org.min_group_size}. A larger number means fewer figures and stronger
            protection for your people.
          </p>
        </label>
      </section>

      {msg && (
        <div className={`org-note org-note--${msg.kind === 'ok' ? 'ok' : 'error'}`} role="status">
          {msg.text}
        </div>
      )}

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
