import { Hono } from "npm:hono";
import * as kv from "./kv_dual_write.ts";
import { syncContactToBrevo, getBrevoApiKey } from "./brevo-helpers.ts";

export function registerNewsletterRoutes(app: Hono, requireAdmin?: any) {
  // POST /newsletter/signup — Public newsletter signup
  app.post("/newsletter/signup", async (c) => {
    try {
      const { email, name } = await c.req.json();

      if (!email) {
        return c.json({ error: "Email is required" }, 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return c.json({ error: "Invalid email format" }, 400);
      }

      // Check if already subscribed
      const existing = await kv.get(`newsletter:${email}`);
      if (existing) {
        return c.json({
          success: true,
          alreadySubscribed: true,
          message: "You are already subscribed to our newsletter.",
        });
      }

      const subscription = {
        email,
        name: name || "",
        subscribedAt: new Date().toISOString(),
        status: "active",
        source: "web",
      };

      // Store in KV
      await kv.set(`newsletter:${email}`, subscription);

      console.log(`Newsletter subscription: ${email}`);

      // Sync to Brevo (best-effort, non-blocking for the user)
      if (getBrevoApiKey()) {
        try {
          await syncContactToBrevo(
            email,
            { FIRSTNAME: name || "", NEWSLETTER: "true" }
          );
        } catch (brevoErr) {
          console.log(`Brevo sync failed for newsletter subscriber ${email}: ${brevoErr}`);
          // Don't fail the subscription — KV is the source of truth
        }
      }

      return c.json({ success: true, message: "Successfully subscribed to our newsletter!" });
    } catch (error) {
      console.error("Newsletter signup error:", error);
      return c.json({ error: "Failed to subscribe" }, 500);
    }
  });

  // GET /admin/newsletter-subscribers — Admin endpoint to list subscribers
  app.get("/admin/newsletter-subscribers", ...(requireAdmin ? [requireAdmin] : []), async (c) => {
    try {
      const subscribers = await kv.getByPrefix("newsletter:");
      const sorted = subscribers.sort((a: any, b: any) =>
        new Date(b.subscribedAt || 0).getTime() - new Date(a.subscribedAt || 0).getTime()
      );
      return c.json({ subscribers: sorted, total: sorted.length });
    } catch (error) {
      console.error("Error fetching newsletter subscribers:", error);
      return c.json({ error: "Failed to fetch subscribers" }, 500);
    }
  });
}