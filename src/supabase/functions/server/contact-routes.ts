import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

export function registerContactRoutes(app: Hono) {
  // POST /contact/submit - Public contact form
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
        subject: subject || '(No subject)',
        message,
        status: 'new',
        submitted_at: new Date().toISOString()
      };

      // Store by ID for direct access
      await kv.set(`contact_submission:${id}`, submission);

      // Store in chronological index for admin listing
      await kv.set(`contact_submissions:${submission.submitted_at}:${id}`, { id, email, subject: submission.subject, submitted_at: submission.submitted_at });

      console.log(`Contact form submission from ${email}: ${submission.subject}`);

      return c.json({ success: true, message: "Your message has been received. We'll get back to you within 24 hours." });
    } catch (error) {
      console.error("Contact form error:", error);
      return c.json({ error: "Failed to submit contact form" }, 500);
    }
  });

  // GET /admin/contact-submissions - Admin endpoint to list submissions
  app.get("/admin/contact-submissions", async (c) => {
    try {
      const submissions = await kv.getByPrefix('contact_submission:');
      const sorted = submissions.sort((a: any, b: any) =>
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      );
      return c.json({ submissions: sorted });
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      return c.json({ error: "Failed to fetch submissions" }, 500);
    }
  });
}
