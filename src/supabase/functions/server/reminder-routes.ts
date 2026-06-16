/**
 * Program Reminder Routes
 * 
 * Checks for stale enrollments (user hasn't been active in N days)
 * and sends gentle reminder emails via Brevo SMTP.
 * 
 * KV keys used:
 *   reminder:last:<userId>:<programId>  — ISO timestamp of last reminder sent
 *   enrollment:<programId>:<userId>     — enrollment data with progress
 */

import { Hono } from "npm:hono";
import * as kv from "./kv_dual_write.ts";
import { sendTransactionalEmail } from "./brevo-helpers.ts";

const REMINDER_COOLDOWN_HOURS = 72; // Don't re-send within 72 hours
const STALE_THRESHOLD_DAYS = 3;     // Consider stale after 3 days of inactivity

interface ReminderResult {
  userId: string;
  email: string;
  programTitle: string;
  sent: boolean;
  reason?: string;
}

// ── HTML email template ─────────────────────────────────────────
function buildReminderEmail(userName: string, programTitle: string, currentDay: number, totalDays: number): string {
  const progress = totalDays > 0 ? Math.round((currentDay / totalDays) * 100) : 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Ubuntu, 'Segoe UI', sans-serif; background-color: #F5F5F5;">
  <div style="max-width: 480px; margin: 0 auto; padding: 32px 24px;">
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 32px;">
      <span style="font-size: 24px; font-weight: 500; color: #2A2A2A;">iKan</span>
    </div>

    <!-- Card -->
    <div style="background: #FFFFFF; border-radius: 16px; padding: 32px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
      <h2 style="color: #2A2A2A; font-weight: 500; font-size: 20px; margin: 0 0 8px;">
        Hey${userName ? ` ${userName}` : ''}, your journey awaits
      </h2>
      <p style="color: #717182; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        You've been making great progress with <strong style="color: #2A2A2A; font-weight: 500;">${programTitle}</strong>.
        You're on Day ${currentDay} of ${totalDays} — just a few minutes a day keeps the momentum going.
      </p>

      <!-- Progress bar -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 13px; color: #717182;">Your progress</span>
          <span style="font-size: 13px; font-weight: 500; color: #2A2A2A;">${progress}%</span>
        </div>
        <div style="height: 8px; background: #E9EBEF; border-radius: 4px; overflow: hidden;">
          <div style="height: 100%; width: ${progress}%; background: #2A2A2A; border-radius: 4px;"></div>
        </div>
      </div>

      <!-- CTA -->
      <a href="https://ikanhealth.in/dashboard" 
         style="display: block; text-align: center; padding: 14px 24px; background: #2A2A2A; color: #FFFFFF; text-decoration: none; border-radius: 12px; font-weight: 500; font-size: 15px;">
        Continue Your Journey
      </a>
    </div>

    <!-- Footer -->
    <p style="text-align: center; color: #717182; font-size: 12px; margin-top: 24px; line-height: 1.5;">
      You're receiving this because you enrolled in a program on iKan.<br>
      <a href="https://ikanhealth.in/account" style="color: #717182;">Manage notification preferences</a>
    </p>
  </div>
</body>
</html>`;
}

export function registerReminderRoutes(app: Hono, requireAuth: any, requireAdmin: any, supabase: any) {

  // ════════════════════════════════════════════════════════════════
  // POST /reminders/check — Check & send reminders for stale enrollments
  // Called by frontend on dashboard load (debounced, max once per session)
  // ════════════════════════════════════════════════════════════════
  app.post("/reminders/check", requireAuth, async (c) => {
    const userId = c.get("userId");

    try {
      // 1. Get user profile for email + name
      const profile: any = await kv.get(`user:${userId}`);
      if (!profile?.email) {
        return c.json({ checked: true, reminders: [], message: "No email on profile" });
      }

      // 2. Find active enrollments for this user
      const enrollmentKeys = await kv.getByPrefix(`enrollment:`);
      const userEnrollments = (Array.isArray(enrollmentKeys) ? enrollmentKeys : []).filter(
        (e: any) => e?.user_id === userId && e?.status === "active"
      );

      if (userEnrollments.length === 0) {
        return c.json({ checked: true, reminders: [], message: "No active enrollments" });
      }

      const results: ReminderResult[] = [];
      const now = Date.now();

      for (const enrollment of userEnrollments) {
        const programId = enrollment.program_id || enrollment.programId;
        if (!programId) continue;

        // 3. Check cooldown
        const lastReminderKey = `reminder:last:${userId}:${programId}`;
        const lastReminder = await kv.get(lastReminderKey);
        if (lastReminder) {
          const lastSentAt = new Date(lastReminder as string).getTime();
          const hoursSince = (now - lastSentAt) / (1000 * 60 * 60);
          if (hoursSince < REMINDER_COOLDOWN_HOURS) {
            results.push({
              userId, email: profile.email, programTitle: programId,
              sent: false, reason: `Cooldown: ${Math.round(REMINDER_COOLDOWN_HOURS - hoursSince)}h remaining`,
            });
            continue;
          }
        }

        // 4. Check staleness — last activity date
        const lastActivity = enrollment.last_activity_at || enrollment.updated_at;
        if (lastActivity) {
          const daysSince = (now - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince < STALE_THRESHOLD_DAYS) {
            results.push({
              userId, email: profile.email, programTitle: programId,
              sent: false, reason: `Active recently (${daysSince.toFixed(1)} days ago)`,
            });
            continue;
          }
        }

        // 5. Fetch program for title + total days
        let programTitle = enrollment.program_title || "your program";
        let totalDays = enrollment.total_days || 30;
        try {
          // Try user-facing key first, then admin key
          const prog: any = await kv.get(`equip_program:${programId}`) || await kv.get(`equip:${programId}`);
          if (prog) {
            programTitle = prog.title || programTitle;
            totalDays = prog.daily_content?.length || totalDays;
          }
        } catch { /* fallback to enrollment data */ }

        const currentDay = enrollment.current_day || 1;

        // 6. Send reminder email
        const emailResult = await sendTransactionalEmail({
          to: [{ email: profile.email, name: profile.name || profile.full_name }],
          subject: `Continue your journey: ${programTitle}`,
          htmlContent: buildReminderEmail(
            profile.name || profile.full_name || "",
            programTitle,
            currentDay,
            totalDays
          ),
          tags: ["program-reminder"],
        });

        if (emailResult.ok) {
          // Record last-sent timestamp
          await kv.set(lastReminderKey, new Date().toISOString());
          results.push({ userId, email: profile.email, programTitle, sent: true });
          console.log(`Reminder sent to ${profile.email} for "${programTitle}"`);
        } else {
          results.push({
            userId, email: profile.email, programTitle,
            sent: false, reason: emailResult.error || "Brevo send failed",
          });
          console.log(`Reminder failed for ${profile.email}: ${emailResult.error}`);
        }
      }

      return c.json({ checked: true, reminders: results });
    } catch (err) {
      console.log(`Error checking reminders for user ${userId}: ${err}`);
      return c.json({ error: `Reminder check failed: ${err}` }, 500);
    }
  });

  // ════════════════════════════════════════════════════════════════
  // POST /reminders/admin/bulk — Admin-triggered bulk reminder check
  // ════════════════════════════════════════════════════════════════
  app.post("/reminders/admin/bulk", requireAdmin, async (c) => {
    try {
      const enrollments = await kv.getByPrefix("enrollment:");
      const activeEnrollments = (Array.isArray(enrollments) ? enrollments : []).filter(
        (e: any) => e?.status === "active"
      );

      const now = Date.now();
      let sent = 0;
      let skipped = 0;

      for (const enrollment of activeEnrollments) {
        const userId = enrollment.user_id;
        const programId = enrollment.program_id || enrollment.programId;
        if (!userId || !programId) { skipped++; continue; }

        // Check staleness
        const lastActivity = enrollment.last_activity_at || enrollment.updated_at;
        if (lastActivity) {
          const daysSince = (now - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince < STALE_THRESHOLD_DAYS) { skipped++; continue; }
        }

        // Check cooldown
        const lastReminderKey = `reminder:last:${userId}:${programId}`;
        const lastReminder = await kv.get(lastReminderKey);
        if (lastReminder) {
          const hoursSince = (now - new Date(lastReminder as string).getTime()) / (1000 * 60 * 60);
          if (hoursSince < REMINDER_COOLDOWN_HOURS) { skipped++; continue; }
        }

        // Get user email
        const profile: any = await kv.get(`user:${userId}`);
        if (!profile?.email) { skipped++; continue; }

        // Get program title
        let programTitle = enrollment.program_title || "your program";
        let totalDays = 30;
        try {
          // Try user-facing key first, then admin key
          const prog: any = await kv.get(`equip_program:${programId}`) || await kv.get(`equip:${programId}`);
          if (prog) {
            programTitle = prog.title || programTitle;
            totalDays = prog.daily_content?.length || totalDays;
          }
        } catch { /* ignore */ }

        const emailResult = await sendTransactionalEmail({
          to: [{ email: profile.email, name: profile.name || profile.full_name }],
          subject: `Continue your journey: ${programTitle}`,
          htmlContent: buildReminderEmail(
            profile.name || profile.full_name || "",
            programTitle,
            enrollment.current_day || 1,
            totalDays
          ),
          tags: ["program-reminder", "admin-bulk"],
        });

        if (emailResult.ok) {
          await kv.set(lastReminderKey, new Date().toISOString());
          sent++;
        } else {
          skipped++;
        }
      }

      return c.json({ success: true, sent, skipped, total: activeEnrollments.length });
    } catch (err) {
      console.log(`Error in bulk reminder check: ${err}`);
      return c.json({ error: `Bulk reminder failed: ${err}` }, 500);
    }
  });
}