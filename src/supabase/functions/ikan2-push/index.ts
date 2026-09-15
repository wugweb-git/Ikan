// ikan2 web push.
//
//   POST /test       (signed-in user) → sends a test notification to that account's devices
//   POST /reminders  (scheduler, x-cron-secret header) → daily mood reminders at each
//                    subscription's chosen local time, once per day
//
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, PUSH_CRON_SECRET.

import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("PUSH_CRON_SECRET") ?? "";

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:hello@ikanhealth.in",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

type Sub = {
  endpoint: string;
  user_id: string;
  p256dh: string;
  auth: string;
  reminder_time: string;
  time_zone: string;
  last_reminded_on: string | null;
};

/** Send one notification; subscriptions the browser has dropped are deleted. */
async function send(sub: Sub, payload: { title: string; body: string; url: string }) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 6, urgency: "normal" },
    );
    return "sent";
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      await admin.from("ikan2_push_subscriptions").delete().eq("endpoint", sub.endpoint);
      return "expired";
    }
    console.error("push failed", status, (e as Error).message);
    return "failed";
  }
}

/** Local date (yyyy-mm-dd) and minutes past midnight in a time zone. */
function localNow(timeZone: string) {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
  } catch {
    return localNow("Asia/Kolkata");
  }
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const route = new URL(req.url).pathname.split("/").pop();

  if (route === "test") {
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    const client = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
    const { data } = token ? await client.auth.getUser(token) : { data: { user: null } };
    if (!data.user) return json({ error: "sign_in_required" }, 401);
    const { data: subs } = await admin
      .from("ikan2_push_subscriptions")
      .select("*")
      .eq("user_id", data.user.id);
    const results = await Promise.all(
      (subs ?? []).map((s) =>
        send(s as Sub, {
          title: "Hello from iKAN",
          body: "This is how reminders will look.",
          url: "/settings",
        }),
      ),
    );
    return json({ devices: results.length, sent: results.filter((r) => r === "sent").length });
  }

  if (route === "reminders") {
    if (!CRON_SECRET || req.headers.get("x-cron-secret") !== CRON_SECRET)
      return json({ error: "forbidden" }, 403);
    const { data: subs, error } = await admin
      .from("ikan2_push_subscriptions")
      .select("endpoint,user_id,p256dh,auth,reminder_time,time_zone,last_reminded_on")
      .eq("mood_reminder", true);
    if (error) return json({ error: error.message }, 500);
    let sent = 0;
    for (const s of (subs ?? []) as Sub[]) {
      const now = localNow(s.time_zone);
      const [h, m] = s.reminder_time.split(":").map(Number);
      const due = now.minutes >= (h ?? 20) * 60 + (m ?? 30);
      // only within 3 hours of the chosen time, so a phone that was off doesn't get a late nudge
      const fresh = now.minutes - ((h ?? 20) * 60 + (m ?? 30)) < 180;
      if (!due || !fresh || s.last_reminded_on === now.date) continue;
      const result = await send(s, {
        title: "How are you feeling today?",
        body: "A 30-second check-in keeps your journal up to date.",
        url: "/journal",
      });
      if (result === "sent") {
        sent++;
        await admin
          .from("ikan2_push_subscriptions")
          .update({ last_reminded_on: now.date })
          .eq("endpoint", s.endpoint);
      }
    }
    return json({ checked: subs?.length ?? 0, sent });
  }

  return json({ error: "not_found" }, 404);
});
