import React, { useMemo, useState } from 'react';
import { Mail, Phone, ShieldAlert } from 'lucide-react';
import { DEFAULT_CMS_CONTENT } from '../content/cms-defaults';
import { submitContactMessage, CONTACT_LIMITS } from '../../../shared/api/ikan2-forms';
import { useNotifications } from '../../../shared/state/NotificationContext';
import { useSeo } from '../ui/hooks/useSeo';

/**
 * Contact, rebuilt as iKAN 2's `/contact`.
 *
 * Replaced rather than adapted. The order is the app's and it is deliberate:
 * the crisis card comes FIRST, before the contact methods and well before the
 * form. Someone in trouble should not have to scroll past a subject field to
 * find a helpline number. The old page put the form first and the crisis
 * information at the bottom.
 *
 * The submit path now posts to iKAN 2's `ikan2_contact_messages` table, which
 * is where the inbox lives — see `shared/api/ikan2-forms`. It used to go
 * through this repo's edge function, which wrote to the KV blob and mailed
 * through Brevo; nobody reads either any more.
 *
 * Content is `page-contact` from cms-defaults, which matches iKAN 2's `contact`
 * block on every field except `heroNote`, which exists only here.
 */

interface ContactUsProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

const METHOD_ICON: Record<string, typeof Mail> = { mail: Mail, phone: Phone };

export function ContactUs({ className, onNavigate }: ContactUsProps) {
  const { showToast } = useNotifications();

  const cms = useMemo(() => {
    const raw = DEFAULT_CMS_CONTENT['page-contact'];
    try {
      return raw?.content ? JSON.parse(raw.content) : null;
    } catch {
      return null;
    }
  }, []);

  useSeo({
    title: cms?.heroTitle || 'Contact us',
    description: cms?.heroSubtitle,
    canonicalPath: '/contact',
    type: 'website',
  });

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      showToast('error', 'Missing Fields', 'Please fill in your name, email, and message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setBusy(true);
    try {
      const result = await submitContactMessage(form);
      if (result.ok) {
        showToast('success', 'Message Sent', 'We will get back to you soon.');
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        showToast('error', 'Error', result.error || 'Failed to send message.');
      }
    } finally {
      setBusy(false);
    }
  };

  const crisis = cms?.crisisCard;
  const faq = cms?.faqCard;
  const methods = cms?.contactMethods ?? [];

  return (
    <div className={['ikan2-theme', 'info-page', 'site-page-below-nav', className].filter(Boolean).join(' ')}>
      <section className="info-band">
        <div className="info-band__inner">
          <p className="info-eyebrow">Contact</p>
          <h1 className="info-title">{cms?.heroTitle || 'Contact us'}</h1>
          {cms?.heroSubtitle ? <p className="info-subtitle">{cms.heroSubtitle}</p> : null}

          {/* First on the page, on purpose — see the note at the top. */}
          {crisis ? (
            <aside className="contact-crisis" aria-label="Urgent help">
              <ShieldAlert className="contact-crisis__icon" aria-hidden="true" />
              <div>
                <p className="contact-crisis__title">{crisis.title}</p>
                <p className="contact-crisis__body">{crisis.description}</p>
                <div className="contact-crisis__actions">
                  {(crisis.buttons ?? []).map((b: { label: string; action: string }) => (
                    <a key={b.label} href={b.action} className="contact-crisis__button">
                      <Phone aria-hidden="true" />
                      {b.label}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          ) : null}

          <div className="contact-methods">
            {methods.map((m: { icon: string; title: string; description: string; value: string; action: string }) => {
              const Icon = METHOD_ICON[m.icon] ?? Mail;
              return (
                <a key={m.title} href={m.action} className="contact-method">
                  <Icon aria-hidden="true" />
                  <p className="contact-method__title">{m.title}</p>
                  <p className="contact-method__desc">{m.description}</p>
                  <p className="contact-method__value">{m.value}</p>
                </a>
              );
            })}
          </div>

          <section className="contact-form-section">
            <h2 className="contact-form__title">{cms?.formTitle || 'Send us a message'}</h2>
            {cms?.formSubtitle ? <p className="contact-form__subtitle">{cms.formSubtitle}</p> : null}

            {sent ? (
              <p className="contact-sent" role="status">
                Thanks — your message is with us. We reply within 24 hours, to the address you gave.
              </p>
            ) : (
              <form className="contact-form" onSubmit={submit} noValidate>
                <label className="contact-field">
                  <span>Your name</span>
                  <input value={form.name} onChange={set('name')} autoComplete="name" maxLength={CONTACT_LIMITS.name} required />
                </label>
                <label className="contact-field">
                  <span>Email</span>
                  <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
                </label>
                <label className="contact-field contact-field--wide">
                  <span>Subject</span>
                  <input value={form.subject} onChange={set('subject')} placeholder="General enquiry" maxLength={CONTACT_LIMITS.subject} />
                </label>
                <label className="contact-field contact-field--wide">
                  <span>Message</span>
                  <textarea value={form.message} onChange={set('message')} rows={6} maxLength={CONTACT_LIMITS.message} required />
                </label>
                <button type="submit" className="info-button" disabled={busy}>
                  {busy ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </section>

          {faq ? (
            <section className="contact-faq">
              <p className="contact-faq__title">{faq.title}</p>
              <p className="contact-faq__body">{faq.description}</p>
              <button
                type="button"
                className="info-button"
                onClick={() => onNavigate?.(faq.buttonRoute || '/faq')}
              >
                {faq.buttonText}
              </button>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
