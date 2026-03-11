import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { sendTransactionalEmail, syncContactToBrevo, getBrevoApiKey } from "./brevo-helpers.ts";

export function registerContactRoutes(app: Hono, requireAdmin?: any) {
  // POST /contact/submit — Public contact form
  app.post("/contact/submit", async (c) => {
    try {
      const { name, email, subject, message } = await c.req.json();

      if (!name || !email || !message) {
        return c.json({ error: "Name, email, and message are required" }, 400);
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return c.json({ error: "Invalid email address" }, 400);
      }

      const id = crypto.randomUUID();
      const submission = {
        id,
        name,
        email,
        subject: subject || "(No subject)",
        message,
        status: "new",
        submitted_at: new Date().toISOString(),
      };

      // Store by ID for direct access
      await kv.set(`contact_submission:${id}`, submission);

      // Store chronological index for admin listing
      await kv.set(`contact_submissions:${submission.submitted_at}:${id}`, {
        id,
        email,
        subject: submission.subject,
        submitted_at: submission.submitted_at,
      });

      console.log(`Contact form submission from ${email}: ${submission.subject}`);

      // ── Brevo integration (best-effort) ──────────────────────
      if (getBrevoApiKey()) {
        try {
          // 1. Sync the contact to Brevo CRM
          await syncContactToBrevo(email, {
            FIRSTNAME: name,
            CONTACT_FORM: "true",
          });

          // 2. Send admin notification email
          const adminEmail = await getAdminNotificationEmail();
          if (adminEmail) {
            await sendTransactionalEmail({
              to: [{ email: adminEmail, name: "iKan Admin" }],
              subject: `[iKan Contact] ${submission.subject}`,
              htmlContent: buildAdminNotificationHtml(submission),
              replyTo: { email, name },
              tags: ["contact-form"],
            });
            console.log(`Admin notification sent to ${adminEmail} for contact from ${email}`);
          }

          // 3. Send confirmation email to the user
          await sendTransactionalEmail({
            to: [{ email, name }],
            subject: "We received your message — iKan Health",
            htmlContent: buildUserConfirmationHtml(name, submission.subject),
            tags: ["contact-form-ack"],
          });
        } catch (brevoErr) {
          // Don't fail the submission — KV is the source of truth
          console.log(`Brevo integration error for contact ${id}: ${brevoErr}`);
        }
      }

      return c.json({
        success: true,
        message: "Your message has been received. We'll get back to you within 24 hours.",
      });
    } catch (error) {
      console.error("Contact form error:", error);
      return c.json({ error: "Failed to submit contact form" }, 500);
    }
  });

  // GET /admin/contact-submissions — Admin endpoint to list submissions
  app.get("/admin/contact-submissions", ...(requireAdmin ? [requireAdmin] : []), async (c) => {
    try {
      const submissions = await kv.getByPrefix("contact_submission:");
      const sorted = submissions.sort(
        (a: any, b: any) =>
          new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      );
      return c.json({ submissions: sorted, total: sorted.length });
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      return c.json({ error: "Failed to fetch submissions" }, 500);
    }
  });

  // PATCH /admin/contact-submissions/:id — Update status (read, replied, archived)
  app.patch("/admin/contact-submissions/:id", ...(requireAdmin ? [requireAdmin] : []), async (c) => {
    try {
      const { id } = c.req.param();
      const { status, adminNotes } = await c.req.json();

      const existing: any = await kv.get(`contact_submission:${id}`);
      if (!existing) {
        return c.json({ error: "Submission not found" }, 404);
      }

      const updated = {
        ...existing,
        status: status || existing.status,
        adminNotes: adminNotes !== undefined ? adminNotes : existing.adminNotes,
        updated_at: new Date().toISOString(),
      };

      await kv.set(`contact_submission:${id}`, updated);
      console.log(`Contact submission ${id} updated to status: ${updated.status}`);

      return c.json({ success: true, submission: updated });
    } catch (error) {
      console.error("Error updating contact submission:", error);
      return c.json({ error: "Failed to update submission" }, 500);
    }
  });

  // DELETE /admin/contact-submissions/:id — Delete submission
  app.delete("/admin/contact-submissions/:id", ...(requireAdmin ? [requireAdmin] : []), async (c) => {
    try {
      const { id } = c.req.param();
      const existing: any = await kv.get(`contact_submission:${id}`);
      if (!existing) {
        return c.json({ error: "Submission not found" }, 404);
      }

      await kv.del(`contact_submission:${id}`);
      // Also clean up the chronological index
      if (existing.submitted_at) {
        await kv.del(`contact_submissions:${existing.submitted_at}:${id}`);
      }

      console.log(`Contact submission ${id} deleted`);
      return c.json({ success: true });
    } catch (error) {
      console.error("Error deleting contact submission:", error);
      return c.json({ error: "Failed to delete submission" }, 500);
    }
  });
}

// ── Helpers ──────────────────────────────────────────────────────

async function getAdminNotificationEmail(): Promise<string | null> {
  try {
    const settings: any = await kv.get("admin-settings");
    return settings?.contactEmail || settings?.smtpFromEmail || null;
  } catch {
    return null;
  }
}

function buildAdminNotificationHtml(submission: {
  name: string;
  email: string;
  subject: string;
  message: string;
  submitted_at: string;
}): string {
  return `
    <div style="font-family: Ubuntu, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2A2A2A; margin-bottom: 16px;">New Contact Form Submission</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 12px; font-weight: 500; color: #717182; width: 100px;">Name</td>
          <td style="padding: 8px 12px; color: #151515;">${escapeHtml(submission.name)}</td>
        </tr>
        <tr style="background: #F5F5F5;">
          <td style="padding: 8px 12px; font-weight: 500; color: #717182;">Email</td>
          <td style="padding: 8px 12px; color: #151515;"><a href="mailto:${escapeHtml(submission.email)}">${escapeHtml(submission.email)}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 500; color: #717182;">Subject</td>
          <td style="padding: 8px 12px; color: #151515;">${escapeHtml(submission.subject)}</td>
        </tr>
        <tr style="background: #F5F5F5;">
          <td style="padding: 8px 12px; font-weight: 500; color: #717182;">Date</td>
          <td style="padding: 8px 12px; color: #151515;">${new Date(submission.submitted_at).toLocaleString()}</td>
        </tr>
      </table>
      <div style="margin-top: 16px; padding: 16px; background: #F5F5F5; border-radius: 8px;">
        <p style="margin: 0 0 8px; font-weight: 500; color: #717182;">Message:</p>
        <p style="margin: 0; color: #151515; white-space: pre-wrap;">${escapeHtml(submission.message)}</p>
      </div>
      <p style="margin-top: 24px; font-size: 12px; color: #717182;">This email was sent by the iKan contact form system.</p>
    </div>
  `;
}

function buildUserConfirmationHtml(name: string, subject: string): string {
  return `
    <div style="font-family: Ubuntu, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2A2A2A; margin-bottom: 16px;">Thank you for reaching out, ${escapeHtml(name)}</h2>
      <p style="color: #151515; line-height: 1.6;">
        We have received your message regarding <strong>"${escapeHtml(subject)}"</strong> and our team will get back to you within 24 hours.
      </p>
      <p style="color: #151515; line-height: 1.6;">
        If your matter is urgent, please don't hesitate to reach out to us directly at
        <a href="mailto:support@ikan.health" style="color: #2A2A2A; font-weight: 500;">support@ikan.health</a>.
      </p>
      <hr style="border: none; border-top: 1px solid #E9EBEF; margin: 24px 0;" />
      <p style="font-size: 12px; color: #717182;">
        You are receiving this email because a message was submitted through the iKan Health contact form using this email address.
      </p>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}