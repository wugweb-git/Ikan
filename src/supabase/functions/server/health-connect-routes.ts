import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

// ─────────────────────────────────────────────────────────────────
// Health Connect Routes
//
// Server-side storage for Health Connect data. Because Health Connect
// is an Android on-device API (no REST endpoint), data is pushed to
// these endpoints by a companion native bridge / TWA wrapper.
// The PWA frontend reads from these endpoints.
// ─────────────────────────────────────────────────────────────────

interface HealthConnectStatus {
  connected: boolean;
  connectedAt: string | null;
  lastSyncAt: string | null;
  deviceName: string | null;
}

export function registerHealthConnectRoutes(app: Hono, requireAuth: any) {

  // ── GET /health-connect/status ────────────────────────────────
  // Check if the user has Health Connect linked
  app.get("/health-connect/status", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const status = await kv.get(`hc_status:${userId}`);
      if (!status) {
        return c.json({
          connected: false,
          connectedAt: null,
          lastSyncAt: null,
          deviceName: null,
        });
      }
      return c.json(status);
    } catch (err) {
      console.log(`Error fetching HC status for user: ${err}`);
      return c.json({ error: `Failed to fetch Health Connect status: ${err}` }, 500);
    }
  });

  // ── POST /health-connect/connect ──────────────────────────────
  // Mark the user as connected to Health Connect
  app.post("/health-connect/connect", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const body = await c.req.json().catch(() => ({}));
      const deviceName = body.deviceName || null;

      const status: HealthConnectStatus = {
        connected: true,
        connectedAt: new Date().toISOString(),
        lastSyncAt: null,
        deviceName,
      };
      await kv.set(`hc_status:${userId}`, status);
      console.log(`User ${userId} connected Health Connect`);
      return c.json({ success: true, status });
    } catch (err) {
      console.log(`Error connecting HC for user: ${err}`);
      return c.json({ error: `Failed to connect Health Connect: ${err}` }, 500);
    }
  });

  // ── POST /health-connect/disconnect ───────────────────────────
  // Remove Health Connect link and optionally purge stored data
  app.post("/health-connect/disconnect", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      await kv.del(`hc_status:${userId}`);
      await kv.del(`hc_data:${userId}`);
      await kv.del(`hc_history:${userId}`);
      console.log(`User ${userId} disconnected Health Connect`);
      return c.json({ success: true });
    } catch (err) {
      console.log(`Error disconnecting HC for user: ${err}`);
      return c.json({ error: `Failed to disconnect Health Connect: ${err}` }, 500);
    }
  });

  // ── GET /health-connect/data ──────────────────────────────────
  // Get the latest health data for the user
  app.get("/health-connect/data", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const status = await kv.get(`hc_status:${userId}`);
      if (!status?.connected) {
        return c.json({ connected: false, data: null });
      }

      const data = await kv.get(`hc_data:${userId}`);
      return c.json({
        connected: true,
        data: data || null,
        lastSyncAt: status.lastSyncAt,
      });
    } catch (err) {
      console.log(`Error fetching HC data for user: ${err}`);
      return c.json({ error: `Failed to fetch Health Connect data: ${err}` }, 500);
    }
  });

  // ── POST /health-connect/data ─────────────────────────────────
  // Receive health data from the native bridge / TWA / companion app.
  // This is the endpoint that the Android side POSTs real HC data to.
  app.post("/health-connect/data", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();

      if (!body || typeof body !== "object") {
        return c.json({ error: "Invalid health data payload" }, 400);
      }

      // Validate required top-level fields
      const requiredFields = ["steps", "activeMinutes", "calories", "sleepHours"];
      const missing = requiredFields.filter((f) => body[f] === undefined);
      if (missing.length > 0) {
        return c.json({ error: `Missing required fields: ${missing.join(", ")}` }, 400);
      }

      // Stamp with server timestamp
      const healthData = {
        ...body,
        receivedAt: new Date().toISOString(),
        source: "health-connect",
      };

      // Store current data
      await kv.set(`hc_data:${userId}`, healthData);

      // Update status with last sync time
      const status = await kv.get(`hc_status:${userId}`);
      if (status) {
        status.lastSyncAt = new Date().toISOString();
        await kv.set(`hc_status:${userId}`, status);
      }

      // Append to daily history (keep last 30 days)
      const today = new Date().toISOString().split("T")[0];
      let history: any[] = (await kv.get(`hc_history:${userId}`)) || [];
      const existingIdx = history.findIndex((h: any) => h.date === today);
      const historyEntry = { date: today, data: healthData };
      if (existingIdx >= 0) {
        history[existingIdx] = historyEntry;
      } else {
        history.push(historyEntry);
      }
      // Keep last 30 days
      if (history.length > 30) history = history.slice(-30);
      await kv.set(`hc_history:${userId}`, history);

      console.log(`Received HC data for user ${userId}: ${body.steps} steps, ${body.sleepHours}h sleep`);
      return c.json({ success: true, receivedAt: healthData.receivedAt });
    } catch (err) {
      console.log(`Error storing HC data for user: ${err}`);
      return c.json({ error: `Failed to store Health Connect data: ${err}` }, 500);
    }
  });

  // ── GET /health-connect/history ───────────────────────────────
  // Get the user's daily health history (up to 30 days)
  app.get("/health-connect/history", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const days = Number(c.req.query("days") || "7");
      const history: any[] = (await kv.get(`hc_history:${userId}`)) || [];
      const sliced = history.slice(-Math.min(days, 30));
      return c.json({ history: sliced });
    } catch (err) {
      console.log(`Error fetching HC history for user: ${err}`);
      return c.json({ error: `Failed to fetch Health Connect history: ${err}` }, 500);
    }
  });

  // ── POST /health-connect/manual-entry ─────────────────────────
  // Allow manual health data entry from the PWA (fallback when no
  // native bridge is available). Accepts partial data.
  app.post("/health-connect/manual-entry", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();

      if (!body || typeof body !== "object") {
        return c.json({ error: "Invalid entry payload" }, 400);
      }

      // Merge with existing data for today (partial update)
      const existing = (await kv.get(`hc_data:${userId}`)) || {};
      const merged = {
        ...existing,
        ...body,
        receivedAt: new Date().toISOString(),
        source: "manual-entry",
      };

      await kv.set(`hc_data:${userId}`, merged);

      // Ensure status is set
      let status = await kv.get(`hc_status:${userId}`);
      if (!status || !status.connected) {
        status = {
          connected: true,
          connectedAt: new Date().toISOString(),
          lastSyncAt: new Date().toISOString(),
          deviceName: "Manual Entry",
        };
      } else {
        status.lastSyncAt = new Date().toISOString();
      }
      await kv.set(`hc_status:${userId}`, status);

      // Update history
      const today = new Date().toISOString().split("T")[0];
      let history: any[] = (await kv.get(`hc_history:${userId}`)) || [];
      const existingIdx = history.findIndex((h: any) => h.date === today);
      const historyEntry = { date: today, data: merged };
      if (existingIdx >= 0) {
        history[existingIdx] = historyEntry;
      } else {
        history.push(historyEntry);
      }
      if (history.length > 30) history = history.slice(-30);
      await kv.set(`hc_history:${userId}`, history);

      console.log(`Manual health entry for user ${userId}`);
      return c.json({ success: true, data: merged });
    } catch (err) {
      console.log(`Error storing manual entry for user: ${err}`);
      return c.json({ error: `Failed to store manual entry: ${err}` }, 500);
    }
  });
}