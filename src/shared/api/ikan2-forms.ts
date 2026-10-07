/**
 * Contact messages and newsletter sign-ups, posted straight to iKAN 2's tables.
 *
 * This site is becoming static marketing pages, and iKAN 2 now owns both
 * inboxes. Until 2026-10-07 each form went through this repo's edge function
 * (`/contact/submit`, `/newsletter/signup`), which wrote to the KV blob and
 * mailed through Brevo — whose secrets are gone. The rows landed somewhere
 * nobody reads any more.
 *
 * So the forms post directly to the REST API instead. There is no edge
 * function in the path and nothing to deploy on this side: PostgREST is the
 * endpoint, the anon key is the credential, and row-level security on
 * `ikan2_contact_messages` / `ikan2_newsletter_subscribers` is what makes an
 * insert-only public form safe.
 *
 * `Prefer: return=minimal` means a success is **201 with an empty body** — do
 * not try to parse one. The only other status that is not a failure is **409**
 * on the newsletter: the unique index on `email` rejecting a repeat, which is
 * a person being told they are already on the list, not an error to apologise
 * for.
 *
 * Validation here mirrors the table's own constraints rather than trusting
 * them to produce a readable message. A `400` from PostgREST reads like
 * `violates check constraint "…_message_check"`, which is not something to put
 * in front of someone writing in about their mental health.
 */
import { projectId, publicAnonKey } from './supabase-info';

const REST = `https://${projectId}.supabase.co/rest/v1`;

/** Every row from this site is tagged, so iKAN 2 can tell the sources apart. */
const SOURCE = 'website';

/** The limits the tables enforce. Kept in one place so the two agree. */
export const CONTACT_LIMITS = { name: 120, subject: 200, message: 2000 } as const;

export interface FormResult {
  ok: boolean;
  /** Set when `ok` is false — safe to show to the person who submitted. */
  error?: string;
  /** Newsletter only: the address was already subscribed (HTTP 409). */
  alreadySubscribed?: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function headers(): HeadersInit {
  return {
    apikey: publicAnonKey,
    Authorization: `Bearer ${publicAnonKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  };
}

/**
 * Shared tail of both posts. Treats anything other than the statuses the
 * caller names as a failure, and never surfaces the response body: a
 * PostgREST error is for the console, not for the page.
 */
async function post(
  table: string,
  body: Record<string, string>,
  onConflict?: () => FormResult,
): Promise<FormResult> {
  let res: Response;
  try {
    res = await fetch(`${REST}/${table}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(`[${table}] network error:`, err);
    return { ok: false, error: 'Network error. Please check your connection and try again.' };
  }

  if (res.status === 201) return { ok: true };
  if (res.status === 409 && onConflict) return onConflict();

  console.error(`[${table}] HTTP ${res.status}:`, await res.text().catch(() => ''));
  return { ok: false, error: 'Something went wrong on our side. Please try again in a moment.' };
}

export interface ContactMessage {
  name: string;
  email: string;
  /** Optional on the form; an empty one is sent as "General enquiry". */
  subject?: string;
  message: string;
}

export async function submitContactMessage(input: ContactMessage): Promise<FormResult> {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  /* The field's own placeholder, promoted to the value. The table requires at
     least one character, and "General enquiry" is true of a blank one. */
  const subject = input.subject?.trim() || 'General enquiry';

  if (!name || name.length > CONTACT_LIMITS.name)
    return { ok: false, error: `Please give a name of up to ${CONTACT_LIMITS.name} characters.` };
  if (!EMAIL.test(email)) return { ok: false, error: 'Please enter a valid email address.' };
  if (subject.length > CONTACT_LIMITS.subject)
    return { ok: false, error: `Please keep the subject under ${CONTACT_LIMITS.subject} characters.` };
  if (!message || message.length > CONTACT_LIMITS.message)
    return {
      ok: false,
      error: `Please write a message of up to ${CONTACT_LIMITS.message} characters.`,
    };

  return post('ikan2_contact_messages', { name, email, subject, message, source: SOURCE });
}

export async function subscribeToNewsletter(rawEmail: string, rawName?: string): Promise<FormResult> {
  const email = rawEmail.trim();
  if (!EMAIL.test(email)) return { ok: false, error: 'Please enter a valid email address.' };

  const body: Record<string, string> = { email, source: SOURCE };
  const name = rawName?.trim();
  if (name) body.name = name;

  return post('ikan2_newsletter_subscribers', body, () => ({
    ok: true,
    alreadySubscribed: true,
  }));
}
