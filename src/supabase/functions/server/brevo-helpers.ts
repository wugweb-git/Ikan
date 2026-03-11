/**
 * Shared Brevo API helpers for use across route modules.
 * Centralises the API key lookup, base URL, and common request patterns.
 */

const BREVO_BASE_URL = "https://api.brevo.com/v3";

export function getBrevoApiKey(): string | null {
  return Deno.env.get("BREVO_API_KEY") || null;
}

/** Fire-and-forget POST to Brevo. Returns { ok, status, data }. */
export async function brevoPost(
  endpoint: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data: any }> {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    return { ok: false, status: 0, data: { message: "BREVO_API_KEY not configured" } };
  }

  const res = await fetch(`${BREVO_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/**
 * Create or update a contact in Brevo.
 * `updateEnabled: true` means it won't fail if the contact already exists.
 */
export async function syncContactToBrevo(
  email: string,
  attributes?: Record<string, string>,
  listIds?: number[]
): Promise<{ ok: boolean; error?: string }> {
  const payload: Record<string, unknown> = {
    email,
    updateEnabled: true,
  };
  if (attributes) payload.attributes = attributes;
  if (listIds && listIds.length) payload.listIds = listIds;

  const result = await brevoPost("/contacts", payload);
  if (!result.ok) {
    const msg = result.data?.message || `Brevo ${result.status}`;
    console.log(`Brevo contact sync failed for ${email}: ${msg}`);
    return { ok: false, error: msg };
  }
  console.log(`Brevo contact synced: ${email}`);
  return { ok: true };
}

/**
 * Send a transactional email via Brevo.
 */
export async function sendTransactionalEmail(opts: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  sender?: { name: string; email: string };
  replyTo?: { email: string; name?: string };
  tags?: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const sender = opts.sender || { name: "iKan Health", email: "noreply@ikan.health" };
  const result = await brevoPost("/smtp/email", {
    sender,
    to: opts.to,
    subject: opts.subject,
    htmlContent: opts.htmlContent,
    ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    ...(opts.tags?.length ? { tags: opts.tags } : {}),
  });

  if (!result.ok) {
    const msg = result.data?.message || `Brevo email ${result.status}`;
    console.log(`Brevo transactional email failed: ${msg}`);
    return { ok: false, error: msg };
  }
  return { ok: true };
}
