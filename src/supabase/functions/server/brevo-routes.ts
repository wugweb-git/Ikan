import * as kv from "./kv_dual_write.ts";
import { Hono } from "npm:hono";

// ─────────────────────────────────────────────────────────────────
// Brevo Communication Routes
//
// Unified communication API using Brevo (formerly Sendinblue)
// Supports: Transactional Email, SMS, and WhatsApp
// Docs: https://developers.brevo.com/reference
// ─────────────────────────────────────────────────────────────────

const BREVO_BASE_URL = "https://api.brevo.com/v3";

// ── Helpers ─────────────────────────────────────────────────────

function getBrevoApiKey(): string {
  const key = Deno.env.get("BREVO_API_KEY");
  if (!key) throw new Error("BREVO_API_KEY environment variable is not set");
  return key;
}

async function brevoRequest(endpoint: string, body: Record<string, unknown>): Promise<{ ok: boolean; status: number; data: any }> {
  const apiKey = getBrevoApiKey();
  const res = await fetch(`${BREVO_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ── Interfaces ──────────────────────────────────────────────────

interface EmailPayload {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  sender?: { name: string; email: string };
  replyTo?: { email: string; name?: string };
  templateId?: number;
  params?: Record<string, string>;
  tags?: string[];
}

interface SmsPayload {
  recipient: string;
  content: string;
  sender?: string;
  type?: "transactional" | "marketing";
  tag?: string;
}

interface WhatsAppPayload {
  senderNumber: string;
  recipientNumber: string;
  templateName: string;
  templateLanguage?: string;
  bodyVariables?: string[];
}

// ── Route Registration ──────────────────────────────────────────

export function registerBrevoRoutes(app: Hono, requireAdmin: any, requireAuth: any) {

  // ═══════════════════════════════════════════════════════════════
  // ADMIN: Configuration Management
  // ════════════════════════════════════════════════════════════════

  // GET /brevo/config — Fetch Brevo configuration
  app.get("/brevo/config", requireAdmin, async (c) => {
    try {
      const config = await kv.get("brevo-config");
      const hasApiKey = !!Deno.env.get("BREVO_API_KEY");

      return c.json({
        config: config || {
          email: { enabled: false, senderName: "iKan Health", senderEmail: "noreply@ikanhealth.in" },
          sms: { enabled: false, senderName: "iKan" },
          whatsapp: { enabled: false, senderNumber: "" },
        },
        apiKeyConfigured: hasApiKey,
      });
    } catch (err) {
      console.log(`Error fetching Brevo config: ${err}`);
      return c.json({ error: `Failed to fetch Brevo configuration: ${err}` }, 500);
    }
  });

  // POST /brevo/config — Save Brevo configuration
  app.post("/brevo/config", requireAdmin, async (c) => {
    try {
      const body = await c.req.json();
      const existing = (await kv.get("brevo-config")) || {};
      const updated = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };
      await kv.set("brevo-config", updated);
      console.log(`Brevo config updated`);
      return c.json({ success: true, config: updated });
    } catch (err) {
      console.log(`Error saving Brevo config: ${err}`);
      return c.json({ error: `Failed to save Brevo configuration: ${err}` }, 500);
    }
  });

  // GET /brevo/account — Verify Brevo account & API key
  app.get("/brevo/account", requireAdmin, async (c) => {
    try {
      const apiKey = getBrevoApiKey();
      const res = await fetch(`${BREVO_BASE_URL}/account`, {
        headers: {
          "api-key": apiKey,
          "Accept": "application/json",
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return c.json({ connected: false, error: `Brevo API error (${res.status}): ${JSON.stringify(data)}` }, 400);
      }
      return c.json({
        connected: true,
        account: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
          plan: data.plan?.[0] || null,
        },
      });
    } catch (err) {
      console.log(`Error verifying Brevo account: ${err}`);
      return c.json({ connected: false, error: `Failed to verify Brevo account: ${err}` }, 500);
    }
  });

  // ════════════════════════════════════════════════════════════════
  // SEND: Transactional Email
  // ════════════════════════════════════════════════════════════════

  app.post("/brevo/send/email", requireAuth, async (c) => {
    try {
      const payload: EmailPayload = await c.req.json();

      if (!payload.to || !Array.isArray(payload.to) || payload.to.length === 0) {
        return c.json({ error: "Missing or empty 'to' array with recipient email(s)" }, 400);
      }
      if (!payload.subject && !payload.templateId) {
        return c.json({ error: "Either 'subject' or 'templateId' is required" }, 400);
      }

      // Load sender defaults: brevo-config first, then settings:site fallback
      const config = await kv.get("brevo-config");
      const emailConfig = config?.email || {};
      let senderName = emailConfig.senderName;
      let senderEmail = emailConfig.senderEmail;

      if (!senderName || !senderEmail) {
        const siteSettings: any = await kv.get("settings:site");
        if (siteSettings) {
          senderName = senderName || siteSettings.smtpFromName;
          senderEmail = senderEmail || siteSettings.smtpFromEmail;
        }
      }

      const emailBody: Record<string, unknown> = {
        to: payload.to,
        sender: payload.sender || {
          name: senderName || "iKan Health",
          email: senderEmail || "noreply@ikanhealth.in",
        },
      };

      if (payload.templateId) {
        emailBody.templateId = payload.templateId;
        if (payload.params) emailBody.params = payload.params;
      } else {
        emailBody.subject = payload.subject;
        emailBody.htmlContent = payload.htmlContent || `<p>${payload.textContent || ""}</p>`;
        if (payload.textContent) emailBody.textContent = payload.textContent;
      }

      if (payload.replyTo) emailBody.replyTo = payload.replyTo;
      if (payload.tags) emailBody.tags = payload.tags;

      const result = await brevoRequest("/smtp/email", emailBody);

      if (!result.ok) {
        console.log(`Brevo email send failed (${result.status}): ${JSON.stringify(result.data)}`);
        return c.json({ error: `Brevo email failed: ${result.data?.message || JSON.stringify(result.data)}` }, result.status);
      }

      // Log the send
      await logCommunication("email", payload.to[0].email, payload.subject || `Template #${payload.templateId}`, true);

      console.log(`Brevo email sent to ${payload.to.map(t => t.email).join(", ")}`);
      return c.json({ success: true, messageId: result.data.messageId });
    } catch (err) {
      console.log(`Error sending Brevo email: ${err}`);
      return c.json({ error: `Failed to send email via Brevo: ${err}` }, 500);
    }
  });

  // ════════════════════════════════════════════════════════════════
  // SEND: Transactional SMS
  // ════════════════════════════════════════════════════════════════

  app.post("/brevo/send/sms", requireAuth, async (c) => {
    try {
      const payload: SmsPayload = await c.req.json();

      if (!payload.recipient) {
        return c.json({ error: "Missing 'recipient' phone number" }, 400);
      }
      if (!payload.content) {
        return c.json({ error: "Missing 'content' for SMS message" }, 400);
      }

      const config = await kv.get("brevo-config");
      const smsConfig = config?.sms || {};

      const smsBody: Record<string, unknown> = {
        recipient: payload.recipient,
        content: payload.content,
        sender: payload.sender || smsConfig.senderName || "iKan",
        type: payload.type || "transactional",
      };

      if (payload.tag) smsBody.tag = payload.tag;

      const result = await brevoRequest("/transactionalSMS/sms", smsBody);

      if (!result.ok) {
        console.log(`Brevo SMS send failed (${result.status}): ${JSON.stringify(result.data)}`);
        return c.json({ error: `Brevo SMS failed: ${result.data?.message || JSON.stringify(result.data)}` }, result.status);
      }

      await logCommunication("sms", payload.recipient, payload.content.substring(0, 50), true);

      console.log(`Brevo SMS sent to ${payload.recipient}`);
      return c.json({ success: true, messageId: result.data.reference });
    } catch (err) {
      console.log(`Error sending Brevo SMS: ${err}`);
      return c.json({ error: `Failed to send SMS via Brevo: ${err}` }, 500);
    }
  });

  // ════════════════════════════════════════════════════════════════
  // SEND: WhatsApp Message (template-based)
  // ════════════════════════════════════════════════════════════════

  app.post("/brevo/send/whatsapp", requireAuth, async (c) => {
    try {
      const payload: WhatsAppPayload = await c.req.json();

      if (!payload.recipientNumber) {
        return c.json({ error: "Missing 'recipientNumber'" }, 400);
      }
      if (!payload.templateName) {
        return c.json({ error: "Missing 'templateName' — WhatsApp requires pre-approved templates" }, 400);
      }

      const config = await kv.get("brevo-config");
      const waConfig = config?.whatsapp || {};

      const waBody: Record<string, unknown> = {
        senderNumber: payload.senderNumber || waConfig.senderNumber,
        recipientNumber: payload.recipientNumber,
        templateName: payload.templateName,
        templateLanguage: payload.templateLanguage || "en",
      };

      if (payload.bodyVariables && payload.bodyVariables.length > 0) {
        waBody.bodyVariables = payload.bodyVariables;
      }

      const result = await brevoRequest("/whatsapp/sendMessage", waBody);

      if (!result.ok) {
        console.log(`Brevo WhatsApp send failed (${result.status}): ${JSON.stringify(result.data)}`);
        return c.json({ error: `Brevo WhatsApp failed: ${result.data?.message || JSON.stringify(result.data)}` }, result.status);
      }

      await logCommunication("whatsapp", payload.recipientNumber, `Template: ${payload.templateName}`, true);

      console.log(`Brevo WhatsApp sent to ${payload.recipientNumber}`);
      return c.json({ success: true, messageId: result.data.messageId });
    } catch (err) {
      console.log(`Error sending Brevo WhatsApp: ${err}`);
      return c.json({ error: `Failed to send WhatsApp via Brevo: ${err}` }, 500);
    }
  });

  // ════════════════════════════════════════════════════════════════
  // ADMIN: Test Communication Channel
  // ════════════════════════════════════════════════════════════════

  app.post("/brevo/test", requireAdmin, async (c) => {
    try {
      const { channel, recipient } = await c.req.json();

      if (!channel || !recipient) {
        return c.json({ error: "Missing 'channel' (email|sms|whatsapp) and 'recipient'" }, 400);
      }

      let result: { ok: boolean; status: number; data: any };

      switch (channel) {
        case "email": {
          // Resolve sender: brevo-config > settings:site > fallback
          const config = await kv.get("brevo-config");
          const emailConfig = config?.email || {};
          let testSenderName = emailConfig.senderName;
          let testSenderEmail = emailConfig.senderEmail;

          if (!testSenderName || !testSenderEmail) {
            const siteSettings: any = await kv.get("settings:site");
            if (siteSettings) {
              testSenderName = testSenderName || siteSettings.smtpFromName;
              testSenderEmail = testSenderEmail || siteSettings.smtpFromEmail;
            }
          }

          result = await brevoRequest("/smtp/email", {
            to: [{ email: recipient }],
            sender: {
              name: testSenderName || "iKan Health",
              email: testSenderEmail || "noreply@ikanhealth.in",
            },
            subject: "iKan Communication Test",
            htmlContent: `
              <div style="font-family: Ubuntu, sans-serif; padding: 24px; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #2A2A2A; font-weight: 500;">Communication Test Successful</h2>
                <p style="color: #717182;">This is a test email from the iKan admin panel to verify your Brevo email integration is working correctly.</p>
                <hr style="border: none; border-top: 1px solid #E9EBEF; margin: 16px 0;" />
                <p style="color: #717182; font-size: 12px;">Sent via Brevo API &bull; ${new Date().toISOString()}</p>
              </div>
            `,
          });
          break;
        }
        case "sms": {
          const config = await kv.get("brevo-config");
          const smsConfig = config?.sms || {};
          result = await brevoRequest("/transactionalSMS/sms", {
            recipient,
            content: "iKan test: Your Brevo SMS integration is working correctly.",
            sender: smsConfig.senderName || "iKan",
            type: "transactional",
          });
          break;
        }
        case "whatsapp": {
          const config = await kv.get("brevo-config");
          const waConfig = config?.whatsapp || {};
          if (!waConfig.senderNumber) {
            return c.json({ error: "WhatsApp sender number not configured" }, 400);
          }
          if (!waConfig.testTemplateName) {
            return c.json({ error: "WhatsApp test template name not configured. Set it in Brevo config." }, 400);
          }
          result = await brevoRequest("/whatsapp/sendMessage", {
            senderNumber: waConfig.senderNumber,
            recipientNumber: recipient,
            templateName: waConfig.testTemplateName,
            templateLanguage: "en",
          });
          break;
        }
        default:
          return c.json({ error: `Unknown channel: ${channel}. Use 'email', 'sms', or 'whatsapp'.` }, 400);
      }

      if (!result.ok) {
        console.log(`Brevo test failed for ${channel} (${result.status}): ${JSON.stringify(result.data)}`);
        return c.json({
          success: false,
          error: result.data?.message || `Brevo returned ${result.status}`,
          details: result.data,
        }, result.status);
      }

      await logCommunication(channel, recipient, `[TEST] ${channel} test`, true);

      console.log(`Brevo ${channel} test sent to ${recipient}`);
      return c.json({ success: true, channel, recipient, messageId: result.data.messageId || result.data.reference });
    } catch (err) {
      console.log(`Error testing Brevo channel: ${err}`);
      return c.json({ error: `Failed to test Brevo ${(await c.req.json().catch(() => ({}))).channel || "channel"}: ${err}` }, 500);
    }
  });

  // ════════════════════════════════════════════════════════════════
  // ADMIN: Communication Logs
  // ════════════════════════════════════════════════════════════════

  app.get("/brevo/logs", requireAdmin, async (c) => {
    try {
      const logs = (await kv.get("brevo-logs")) || [];
      const limit = Number(c.req.query("limit") || "50");
      return c.json({ logs: logs.slice(-limit) });
    } catch (err) {
      console.log(`Error fetching Brevo logs: ${err}`);
      return c.json({ error: `Failed to fetch communication logs: ${err}` }, 500);
    }
  });

  // ════════════════════════════════════════════════════════════════
  // ADMIN: Brevo Email Templates (list from Brevo API)
  // ════════════════════════════════════════════════════════════════

  app.get("/brevo/templates", requireAdmin, async (c) => {
    try {
      const apiKey = getBrevoApiKey();
      const templateType = c.req.query("type") || "transactional";
      const limit = c.req.query("limit") || "50";
      const offset = c.req.query("offset") || "0";

      const res = await fetch(
        `${BREVO_BASE_URL}/smtp/templates?templateStatus=true&limit=${limit}&offset=${offset}&sort=desc`,
        {
          headers: {
            "api-key": apiKey,
            "Accept": "application/json",
          },
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return c.json({ error: `Failed to fetch templates: ${data?.message || res.status}` }, res.status);
      }

      return c.json({
        templates: data.templates || [],
        count: data.count || 0,
      });
    } catch (err) {
      console.log(`Error fetching Brevo templates: ${err}`);
      return c.json({ error: `Failed to fetch Brevo templates: ${err}` }, 500);
    }
  });

  // ════════════════════════════════════════════════════════════════
  // ADMIN: Contact/List Management
  // ════════════════════════════════════════════════════════════════

  // Get contacts from Brevo
  app.get("/brevo/contacts", requireAdmin, async (c) => {
    try {
      const apiKey = getBrevoApiKey();
      const limit = c.req.query("limit") || "50";
      const offset = c.req.query("offset") || "0";

      const res = await fetch(
        `${BREVO_BASE_URL}/contacts?limit=${limit}&offset=${offset}&sort=desc`,
        {
          headers: {
            "api-key": apiKey,
            "Accept": "application/json",
          },
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return c.json({ error: `Failed to fetch contacts: ${data?.message || res.status}` }, res.status);
      }

      return c.json({
        contacts: data.contacts || [],
        count: data.count || 0,
      });
    } catch (err) {
      console.log(`Error fetching Brevo contacts: ${err}`);
      return c.json({ error: `Failed to fetch Brevo contacts: ${err}` }, 500);
    }
  });

  // Create/update a contact in Brevo
  app.post("/brevo/contacts", requireAuth, async (c) => {
    try {
      const body = await c.req.json();

      if (!body.email) {
        return c.json({ error: "Missing 'email' for contact" }, 400);
      }

      const contactBody: Record<string, unknown> = {
        email: body.email,
        updateEnabled: true, // Update if exists
      };

      if (body.attributes) contactBody.attributes = body.attributes;
      if (body.listIds) contactBody.listIds = body.listIds;

      const result = await brevoRequest("/contacts", contactBody);

      if (!result.ok) {
        console.log(`Brevo contact create/update failed (${result.status}): ${JSON.stringify(result.data)}`);
        return c.json({ error: `Failed to create/update contact: ${result.data?.message || result.status}` }, result.status);
      }

      console.log(`Brevo contact created/updated: ${body.email}`);
      return c.json({ success: true, id: result.data.id });
    } catch (err) {
      console.log(`Error creating Brevo contact: ${err}`);
      return c.json({ error: `Failed to create contact via Brevo: ${err}` }, 500);
    }
  });
}

// ── Internal: Communication log helper ──────────────────────────

async function logCommunication(channel: string, recipient: string, subject: string, success: boolean) {
  try {
    const logs: any[] = (await kv.get("brevo-logs")) || [];
    logs.push({
      channel,
      recipient,
      subject,
      success,
      timestamp: new Date().toISOString(),
    });
    // Keep last 200 log entries
    const trimmed = logs.length > 200 ? logs.slice(-200) : logs;
    await kv.set("brevo-logs", trimmed);
  } catch (e) {
    console.log(`Warning: failed to log communication: ${e}`);
  }
}