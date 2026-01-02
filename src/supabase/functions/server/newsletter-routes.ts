import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

export function registerNewsletterRoutes(app: Hono) {
  // Public newsletter signup
  app.post("/newsletter/signup", async (c) => {
    try {
      const { email, name } = await c.req.json();
      
      if (!email) {
        return c.json({ error: "Email is required" }, 400);
      }

      // Check if already subscribed
      const existing = await kv.get(`newsletter:${email}`);
      if (existing) {
        return c.json({ 
            success: true, 
            alreadySubscribed: true,
            message: "You are already subscribed to our newsletter." 
        });
      }

      const subscription = {
        email,
        name: name || '',
        subscribedAt: new Date().toISOString(),
        source: 'web'
      };

      // Store by email
      await kv.set(`newsletter:${email}`, subscription);
      
      console.log(`Newsletter subscription: ${email}`);

      return c.json({ success: true, message: "Successfully subscribed" });
    } catch (error) {
      console.error("Newsletter error:", error);
      return c.json({ error: "Failed to subscribe" }, 500);
    }
  });
}
