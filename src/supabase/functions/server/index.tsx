import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_dual_write.ts";
import { mirrorJournalEntryToTable } from "./journal-mirror.ts";

// Import monitoring utilities
import { getAPILogs } from "./logging.tsx";
import { getPerformanceMetrics, getMetricsHistory } from "./performance.tsx";
import { getSystemLogs } from "./system-logger.tsx";
import { 
  getActiveSessions, 
  terminateSession, 
  getAuditLogs, 
  getSecurityAlerts,
  resolveAlert 
} from "./security.tsx";

// Import validation utilities
import { 
  validateProfileUpdate, 
  sanitizeProfileUpdate, 
  validatePassword,
  hashPassword,
  verifyPassword,
  validateEmail
} from "./validation.tsx";

import { RecommendationService } from "./recommendation-service.ts";

import { registerEquipRoutes } from './equip-routes.ts';
import { registerProgressRoutes } from './progress-routes.ts';
import { registerRecommendationRoutes } from './recommendation-routes.ts';
import { registerAdminRoutes } from './admin-routes.ts';
import { registerAssessmentRoutes } from './assessment-routes.ts';
import { registerMoodRoutes } from './mood-routes.ts';
import { registerNewsletterRoutes } from './newsletter-routes.ts';
import { registerResourceRoutes } from './resource-routes.ts';
import { registerContactRoutes } from './contact-routes.ts';
import { registerScalesRoutes } from './scales-routes.ts';
import { registerHealthConnectRoutes } from './health-connect-routes.ts';
import { registerBrevoRoutes } from './brevo-routes.ts';
import { registerCorporateRoutes } from './corporate-routes.ts';
import { registerKVAuditRoutes } from './kv-audit-routes.ts';
import { registerCheckinTemplateRoutes } from './checkin-template-routes.ts';
import { registerHeroBannerRoutes } from './hero-banner-routes.ts';
import { registerIkanScoreRoutes } from './ikan-score-routes.ts';
import { registerReminderRoutes } from './reminder-routes.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Layer 0: Centralized connection-closed error detection
// ─────────────────────────────────────────────────────────────────────────────
function isConnectionClosedError(err: unknown): boolean {
  if (!err) return false;
  const name = (err as any)?.name;
  const msg = String(err).toLowerCase();
  return (
    name === 'Http' ||
    (name === 'TypeError' && msg.includes('response')) ||
    msg.includes('connection closed') ||
    msg.includes('connection reset') ||
    msg.includes('broken pipe') ||
    msg.includes('aborted') ||
    msg.includes('respondwith') ||
    msg.includes('network socket disconnected') ||
    msg.includes('message completed')
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layer 0b: Console filter — last-resort suppression for connection-closed
// errors that Deno's runtime logs directly to stderr BEFORE dispatching the
// unhandledrejection / error events. Without this, the error surfaces in
// dashboard logs even though it is non-fatal and fully handled.
// ─────────────────────────────────────────────────────────────────────────────
const _origConsoleError = console.error;
console.error = (...args: any[]) => {
  // Fast-path: error object with name "Http"
  const first = args[0];
  if (first && typeof first === 'object' && (first as any)?.name === 'Http') return;
  // String scan for known patterns
  const joined = args.map(String).join(' ').toLowerCase();
  if (
    joined.includes('connection closed before message completed') ||
    joined.includes('respondwith') ||
    (joined.includes('http') && joined.includes('connection closed'))
  ) return;
  _origConsoleError.apply(console, args);
};

// ���────────────────────────────────────────────────────────────────────────────
// Layer 1: GLOBAL unhandledrejection listener
//
// This error fires inside Deno's internal `respondWith()` → `mapped()` chain
// (ext:runtime/http.js) AFTER our handler has already returned a Response.
// It occurs when a client disconnects mid-response (navigation, hot-reload,
// AbortController.abort()). It is non-fatal — the server keeps running — but
// Deno's default unhandled-rejection handler logs it to stderr, which surfaces
// as a noisy error in the dashboard.
//
// Because it fires *below* both Hono's app.onError and Deno.serve's onError,
// the ONLY way to suppress it is a global unhandledrejection listener.
// ─────────────────────────────────────────────────────────────────────────────
globalThis.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  if (isConnectionClosedError(event.reason)) {
    event.preventDefault();
    return;
  }
  // Check if the rejection reason's cause is a connection error (nested errors)
  const cause = (event.reason as any)?.cause;
  if (cause && isConnectionClosedError(cause)) {
    event.preventDefault();
    return;
  }
  // All other unhandled rejections: let Deno's default handler log them.
});

// ─────────────────────────────────────────────────────────────────────────────
// Layer 2: GLOBAL error listener (uncaught exceptions)
// ─────────────────────────────────────────────────────────────────────────────
globalThis.addEventListener("error", (event: ErrorEvent) => {
  if (isConnectionClosedError(event.error ?? event.message)) {
    event.preventDefault();
    return;
  }
});

const app = new Hono().basePath('/make-server-cc205da9');

// ────────────────────────────────────────────────────────────���────────────────
// Layer 3: Hono app.onError — return raw Response instead of c.json()
//
// c.json() tries to write to the socket, which re-throws if the client already
// disconnected. Using `new Response(null, ...)` avoids that second explosion.
// ─────────────────���───────────────────────────────────────────────────────────
app.onError((err, c) => {
  if (isConnectionClosedError(err)) {
    console.log('Client disconnected before response completed (non-fatal)');
    return new Response(null, { status: 499 });
  }
  console.error('Unhandled server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods.
// Locks to ALLOWED_ORIGIN when set (ported from main's security audit), else "*"
// to preserve current behavior until the origin is configured in edge secrets.
app.use(
  "/*",
  cors({
    origin: Deno.env.get("ALLOWED_ORIGIN") ?? "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint (Public)
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString(), version: "2.1" }));

// Auth middleware for protected routes
async function requireAuth(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Authorization token required' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) {
    console.log('Authorization error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', user.id);
  c.set('user', user);
  await next();
}

// Admin middleware for admin-only routes
async function requireAdmin(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Authorization token required' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) {
    console.log('Authorization error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Check if user is admin
  const userProfile = await kv.get(`user:${user.id}`);

  // Super-admin override: admin@wugweb.com is ALWAYS admin (top of chain)
  const SUPER_ADMIN_EMAIL = 'admin@wugweb.com';
  const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

  if (isSuperAdmin && (!userProfile || !userProfile.is_admin)) {
    // Auto-repair: ensure super admin always has the flag set in KV
    const repaired = {
      ...(userProfile || {}),
      user_id: user.id,
      email: user.email,
      is_admin: true,
      is_super_admin: true,
      updated_at: new Date().toISOString(),
    };
    await kv.set(`user:${user.id}`, repaired);
    console.log(`🔧 Auto-repaired super admin flag for ${SUPER_ADMIN_EMAIL}`);
  }

  if (!isSuperAdmin && !userProfile?.is_admin) {
    console.log(`🚫 Non-admin user ${user.id} attempted to access admin endpoint`);
    return c.json({ error: 'Admin access required' }, 403);
  }

  c.set('userId', user.id);
  c.set('user', user);
  c.set('isAdmin', true);
  await next();
}

// Register modules
registerEquipRoutes(app, requireAuth);
registerProgressRoutes(app, requireAuth);
registerRecommendationRoutes(app, requireAuth);
registerAdminRoutes(app, requireAuth, requireAdmin);
registerAssessmentRoutes(app, requireAuth);
registerMoodRoutes(app, requireAuth);
registerNewsletterRoutes(app, requireAdmin);
registerContactRoutes(app, requireAdmin);
registerResourceRoutes(app, requireAuth);
registerScalesRoutes(app, requireAdmin);
registerHealthConnectRoutes(app, requireAuth);
registerBrevoRoutes(app, requireAdmin, requireAuth);
registerCorporateRoutes(app);
registerKVAuditRoutes(app, requireAuth);
registerCheckinTemplateRoutes(app, requireAuth);
registerHeroBannerRoutes(app, requireAuth);
registerIkanScoreRoutes(app, requireAuth);
registerReminderRoutes(app, requireAuth, requireAdmin, supabase);

  // CMS Public Routes
  app.get("/cms/pages/:slug", async (c) => {
    try {
      const slug = c.req.param("slug");
      
      // Attempt 1: Check if there is a direct mapping (if we implemented it)
      const pageId = await kv.get(`page_slug:${slug}`);
      
      let page;
      if (pageId) {
         page = await kv.get(`page:${pageId}`);
      } 
      
      // Attempt 2: Check standard CMS pages (hardcoded blocks) directly
      // This avoids scanning all pages for common requests
      if (!page) {
        page = await kv.get(`cms_page:${slug}`);
      }

      // Attempt 2b: If slug starts with 'page-', resolve to the base page manager slug
      // e.g. 'page-faq' → 'faq', 'page-contact' → 'contact', 'page-about-us' → 'about'
      if (!page && slug.startsWith('page-')) {
        const PAGE_SLUG_ALIASES: Record<string, string> = {
          'page-about-us': 'about',
          'page-faq': 'faq',
          'page-contact': 'contact',
          'page-sitemap': 'sitemap',
          'page-not-found': 'not-found',
        };
        const baseSlug = PAGE_SLUG_ALIASES[slug] || slug.replace(/^page-/, '');
        const basePage = await kv.get(`cms_page:${baseSlug}`);
        if (basePage) {
          page = basePage;
        }
      }

      // Attempt 3: Fallback scan of all pages (only if not found yet)
      if (!page) {
         try {
           const pages = await kv.getByPrefix("page:");
           if (Array.isArray(pages)) {
             page = pages.find((p: any) => p.slug === slug);
           }
         } catch (e) {
           console.warn(`KV Scan skipped for ${slug}:`, e);
         }
      }
      
      // No hardcoded defaults — if KV is empty, return 404.
      // Admins should create pages via Admin → Page Manager.
      if (!page) {
        return c.json({ error: "Page not found" }, 404);
      }
      
      // Only return published pages for public API
      // Legacy CMS pages might not have the published flag, treat them as published
      if (page.published === false) {
        return c.json({ error: "Page not found" }, 404);
      }

      return c.json({ page });
    } catch (error) {
      console.error("CMS Error:", error);
      return c.json({ error: "Failed to fetch page" }, 500);
    }
  });

// User signup endpoint
app.post("/auth/signup", async (c) => {
  try {
    const { email, password, name, phone, corporate_user } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone, corporate_user: corporate_user || false },
      // Create the user UNCONFIRMED so the project's "Confirm email" setting governs
      // verification. The client triggers the native confirmation email when needed.
      email_confirm: false
    });

    if (error) {
      // Handle "already registered" — update the existing user's password instead of failing.
      // This keeps the prototype-friendly behavior where any email + password combination works.
      if (error.message?.includes('already been registered')) {
        console.log(`User ${email} already exists — updating password for prototype access`);
        try {
          // Find the existing user by email
          const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
          if (listError) throw listError;
          const existingUser = listData.users.find(
            (u: any) => u.email?.toLowerCase() === email.toLowerCase()
          );
          if (!existingUser) {
            console.log(`Could not find existing user ${email} to update`);
            return c.json({ error: 'User exists but could not be resolved' }, 400);
          }

          // Update the user's password
          const { data: updatedData, error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password, user_metadata: { name, phone, corporate_user: corporate_user || false } }
          );
          if (updateError) {
            console.log(`Failed to update password for ${email}:`, updateError);
            return c.json({ error: updateError.message }, 400);
          }

          // Ensure KV profile exists
          const existingProfile = await kv.get(`user:${existingUser.id}`);
          if (!existingProfile) {
            await kv.set(`user:${existingUser.id}`, {
              user_id: existingUser.id,
              email,
              name,
              phone: phone || null,
              avatar_url: null,
              corporate_user: corporate_user || false,
              bio: null,
              dateOfBirth: null,
              gender: null,
              location: null,
              emergencyContactName: null,
              emergencyContactPhone: null,
              emergencyContactRelationship: null,
              googleConnected: false,
              googleEmail: null,
              googleConnectedAt: null,
              linkedinConnected: false,
              linkedinEmail: null,
              linkedinConnectedAt: null,
              is_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }

          console.log(`✅ Password updated for ${email} — prototype auto-fix`);
          return c.json({ user: updatedData.user });
        } catch (upsertError) {
          console.log('Upsert fallback failed:', upsertError);
          return c.json({ error: 'User already exists and password update failed' }, 400);
        }
      }

      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      user_id: data.user.id,
      email,
      name,
      phone: phone || null,
      avatar_url: null,
      corporate_user: corporate_user || false,
      bio: null,
      dateOfBirth: null,
      gender: null,
      location: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      emergencyContactRelationship: null,
      googleConnected: false,
      googleEmail: null,
      googleConnectedAt: null,
      linkedinConnected: false,
      linkedinEmail: null,
      linkedinConnectedAt: null,
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get user profile
app.get("/users/profile", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const profile = await kv.get(`user:${userId}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    return c.json({ profile });
  } catch (error) {
    console.log('Get profile error:', error);
    return c.json({ error: 'Failed to retrieve profile' }, 500);
  }
});

// Admin Get All Users
app.get("/admin/users", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);
    
    const users = await kv.getByPrefix('user:');
    return c.json({ users });
  } catch (error) {
    return c.json({ error: 'Failed to list users' }, 500);
  }
});

// Update user profile
app.put("/users/profile", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const updates = await c.req.json();
    
    // Validate input
    const validation = validateProfileUpdate(updates);
    if (!validation.isValid) {
      return c.json({ 
        error: 'Validation failed', 
        errors: validation.errors 
      }, 400);
    }
    
    const currentProfile = await kv.get(`user:${userId}`);
    if (!currentProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    // Sanitize input
    const sanitizedUpdates = sanitizeProfileUpdate(updates);
    
    // Build updated profile
    const updatedProfile: any = {
      ...currentProfile,
      updated_at: new Date().toISOString()
    };

    // Update basic fields from sanitized data
    if (sanitizedUpdates.name !== undefined) updatedProfile.name = sanitizedUpdates.name;
    if (sanitizedUpdates.phone !== undefined) updatedProfile.phone = sanitizedUpdates.phone;
    if (sanitizedUpdates.bio !== undefined) updatedProfile.bio = sanitizedUpdates.bio;
    if (sanitizedUpdates.dateOfBirth !== undefined) updatedProfile.dateOfBirth = sanitizedUpdates.dateOfBirth;
    if (sanitizedUpdates.gender !== undefined) updatedProfile.gender = sanitizedUpdates.gender;
    if (sanitizedUpdates.location !== undefined) updatedProfile.location = sanitizedUpdates.location;
    if (sanitizedUpdates.avatar_url !== undefined) updatedProfile.avatar_url = sanitizedUpdates.avatar_url;
    if (updates.zipCode !== undefined) updatedProfile.zipCode = updates.zipCode;
    
    // Update emergency contact fields
    if (sanitizedUpdates.emergencyContactName !== undefined) {
      updatedProfile.emergencyContactName = sanitizedUpdates.emergencyContactName;
      updatedProfile.emergencyContactPhone = sanitizedUpdates.emergencyContactPhone;
      updatedProfile.emergencyContactRelationship = sanitizedUpdates.emergencyContactRelationship;
    }
    
    // Update corporate/organisation fields
    if (updates.corporate_designation !== undefined) updatedProfile.corporate_designation = updates.corporate_designation;
    if (updates.corporate_email !== undefined) updatedProfile.corporate_email = updates.corporate_email;
    if (updates.corporate_phone !== undefined) updatedProfile.corporate_phone = updates.corporate_phone;
    if (updates.corporate_department !== undefined) updatedProfile.corporate_department = updates.corporate_department;
    if (updates.corporate_employee_id !== undefined) updatedProfile.corporate_employee_id = updates.corporate_employee_id;

    // Update preferences
    if (sanitizedUpdates.preferences !== undefined) {
      updatedProfile.preferences = sanitizedUpdates.preferences;
    }
    
    // Update notification settings
    if (updates.notification_settings !== undefined) {
      updatedProfile.notification_settings = updates.notification_settings;
    }
    
    // Update privacy settings
    if (updates.privacy_settings !== undefined) {
      updatedProfile.privacy_settings = updates.privacy_settings;
    }
    
    // Update security settings
    if (updates.security_settings !== undefined) {
      updatedProfile.security_settings = updates.security_settings;
    }
    
    await kv.set(`user:${userId}`, updatedProfile);
    
    // Create audit log
    await kv.set(`audit:profile:${userId}:${Date.now()}`, {
      action: 'update_profile',
      userId,
      timestamp: new Date().toISOString(),
      changes: Object.keys(sanitizedUpdates)
    });
    
    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Social Account Connection Endpoints
app.post("/user/connect-social/:provider", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const provider = c.req.param('provider') as 'google' | 'linkedin';
    
    if (!['google', 'linkedin'].includes(provider)) {
      return c.json({ error: 'Invalid provider. Must be google or linkedin' }, 400);
    }

    const currentProfile = await kv.get(`user:${userId}`);
    if (!currentProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // In a real implementation, this would initiate OAuth flow
    // For now, we'll simulate a successful connection
    const providerField = provider === 'google' ? 'googleConnected' : 'linkedinConnected';
    const emailField = provider === 'google' ? 'googleEmail' : 'linkedinEmail';
    const connectedAtField = provider === 'google' ? 'googleConnectedAt' : 'linkedinConnectedAt';

    const updatedProfile = {
      ...currentProfile,
      [providerField]: true,
      [emailField]: currentProfile.email, // Use user's primary email as demo
      [connectedAtField]: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, updatedProfile);
    return c.json({ 
      success: true, 
      message: `Successfully connected to ${provider}`,
      profile: updatedProfile 
    });
  } catch (error) {
    console.log('Social connect error:', error);
    return c.json({ error: 'Failed to connect social account' }, 500);
  }
});

app.post("/user/disconnect-social/:provider", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const provider = c.req.param('provider') as 'google' | 'linkedin';
    
    if (!['google', 'linkedin'].includes(provider)) {
      return c.json({ error: 'Invalid provider. Must be google or linkedin' }, 400);
    }

    const currentProfile = await kv.get(`user:${userId}`);
    if (!currentProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const providerField = provider === 'google' ? 'googleConnected' : 'linkedinConnected';
    const emailField = provider === 'google' ? 'googleEmail' : 'linkedinEmail';
    const connectedAtField = provider === 'google' ? 'googleConnectedAt' : 'linkedinConnectedAt';

    const updatedProfile = {
      ...currentProfile,
      [providerField]: false,
      [emailField]: null,
      [connectedAtField]: null,
      updated_at: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, updatedProfile);
    return c.json({ 
      success: true, 
      message: `Successfully disconnected from ${provider}`,
      profile: updatedProfile 
    });
  } catch (error) {
    console.log('Social disconnect error:', error);
    return c.json({ error: 'Failed to disconnect social account' }, 500);
  }
});

// Password Change Endpoint
app.put("/users/password", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { currentPassword, newPassword } = await c.req.json();
    
    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Current and new password are required' }, 400);
    }
    
    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return c.json({ error: passwordError.message }, 400);
    }
    
    // Get current profile
    const currentProfile = await kv.get(`user:${userId}`);
    if (!currentProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    // Verify current password (if stored)
    if (currentProfile.password_hash) {
      const isValid = await verifyPassword(currentPassword, currentProfile.password_hash);
      if (!isValid) {
        return c.json({ error: 'Current password is incorrect' }, 401);
      }
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    
    // Update profile with new password
    const updatedProfile = {
      ...currentProfile,
      password_hash: newPasswordHash,
      password_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`user:${userId}`, updatedProfile);
    
    // Create audit log
    await kv.set(`audit:password:${userId}:${Date.now()}`, {
      action: 'change_password',
      userId,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ User ${userId} changed password successfully`);
    
    return c.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    return c.json({ error: 'Failed to change password' }, 500);
  }
});

// Email Change Request Endpoint
app.post("/users/email/request-change", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { newEmail } = await c.req.json();
    
    if (!newEmail) {
      return c.json({ error: 'New email is required' }, 400);
    }
    
    // Validate email
    const emailError = validateEmail(newEmail);
    if (emailError) {
      return c.json({ error: emailError.message }, 400);
    }
    
    // Check if email already exists
    const users = await kv.getByPrefix('user:');
    const emailExists = users.some((u: any) => u.email === newEmail);
    if (emailExists) {
      return c.json({ error: 'Email already in use' }, 409);
    }
    
    // Generate verification token
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store email change request
    await kv.set(`email-change:${userId}`, {
      userId,
      newEmail,
      verificationToken,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    });
    
    // In production, send verification email here
    console.log(`📧 Email change requested for user ${userId}`);
    console.log(`Verification token: ${verificationToken}`);
    
    return c.json({ 
      success: true, 
      message: 'Verification email sent. Please check your inbox.',
      // For demo purposes, return the token (remove in production!)
      verificationToken 
    });
  } catch (error) {
    console.error('Email change request error:', error);
    return c.json({ error: 'Failed to request email change' }, 500);
  }
});

// Email Change Verification Endpoint
app.post("/users/email/verify-change", async (c) => {
  try {
    const { token } = await c.req.json();
    
    if (!token) {
      return c.json({ error: 'Verification token is required' }, 400);
    }
    
    // Find email change request with this token
    const requests = await kv.getByPrefix('email-change:');
    const request = requests.find((r: any) => r.verificationToken === token);
    
    if (!request) {
      return c.json({ error: 'Invalid verification token' }, 404);
    }
    
    // Check if expired
    if (new Date(request.expiresAt) < new Date()) {
      await kv.del(`email-change:${request.userId}`);
      return c.json({ error: 'Verification token expired' }, 410);
    }
    
    // Update user email
    const currentProfile = await kv.get(`user:${request.userId}`);
    if (!currentProfile) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const updatedProfile = {
      ...currentProfile,
      email: request.newEmail,
      email_verified: true,
      email_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`user:${request.userId}`, updatedProfile);
    await kv.del(`email-change:${request.userId}`);
    
    // Create audit log
    await kv.set(`audit:email:${request.userId}:${Date.now()}`, {
      action: 'change_email',
      userId: request.userId,
      oldEmail: currentProfile.email,
      newEmail: request.newEmail,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ User ${request.userId} changed email to ${request.newEmail}`);
    
    return c.json({ success: true, message: 'Email changed successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return c.json({ error: 'Failed to verify email change' }, 500);
  }
});

// Data Export Endpoint
app.post("/users/export-data", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    // Get user profile
    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    // Get journal entries
    const journalEntries = await kv.getByPrefix(`journal:${userId}:`);
    
    // Get tracker entries
    const trackerEntries = await kv.getByPrefix(`tracker:${userId}:`);
    
    // Get assessment results
    const assessmentResults = await kv.getByPrefix(`assessment-result:${userId}:`);
    
    // Get program progress
    const programProgress = await kv.getByPrefix(`program-progress:${userId}:`);
    
    // Build export data
    const exportData = {
      profile: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        location: profile.location,
        createdAt: profile.created_at
      },
      journalEntries: journalEntries.map((entry: any) => ({
        date: entry.date,
        mood: entry.mood_rating,
        content: entry.freehand_text_content,
        createdAt: entry.created_at
      })),
      trackerEntries: trackerEntries.map((entry: any) => ({
        date: entry.date,
        moodRating: entry.mood_rating,
        stressLevel: entry.stress_level,
        sleepHours: entry.sleep_hours,
        exerciseMinutes: entry.exercise_minutes,
        createdAt: entry.created_at
      })),
      assessmentResults: assessmentResults.map((result: any) => ({
        assessmentId: result.assessment_id,
        completedAt: result.completed_at,
        score: result.score,
        severity: result.severity
      })),
      programProgress: programProgress.map((progress: any) => ({
        programId: progress.program_id,
        currentDay: progress.current_day,
        completedDays: progress.completed_days,
        startedAt: progress.started_at
      })),
      exportedAt: new Date().toISOString()
    };
    
    // Create audit log
    await kv.set(`audit:export:${userId}:${Date.now()}`, {
      action: 'export_data',
      userId,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ User ${userId} exported their data`);
    
    // Return JSON data (in production, send via email or generate downloadable file)
    return c.json({ 
      success: true, 
      data: exportData,
      message: 'Data exported successfully. In production, this would be sent to your email.'
    });
  } catch (error) {
    console.error('Data export error:', error);
    return c.json({ error: 'Failed to export data' }, 500);
  }
});

// Avatar Upload Endpoint — accepts JSON { avatarUrl }
app.post("/users/avatar", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { avatarUrl } = await c.req.json();
    
    if (!avatarUrl) {
      return c.json({ error: 'Avatar URL is required' }, 400);
    }
    
    const currentProfile = await kv.get(`user:${userId}`);
    if (!currentProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    const updatedProfile = {
      ...currentProfile,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`user:${userId}`, updatedProfile);
    
    await kv.set(`audit:avatar:${userId}:${Date.now()}`, {
      action: 'update_avatar',
      userId,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ User ${userId} updated avatar`);
    return c.json({ success: true, avatarUrl, profile: updatedProfile });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return c.json({ error: 'Failed to upload avatar' }, 500);
  }
});

// Avatar File Upload — accepts multipart/form-data, stores in Supabase Storage
app.post("/users/avatar/upload", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const bucketName = 'make-cc205da9-avatars';

    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}` }, 400);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File too large. Maximum size is 5MB.' }, 400);
    }

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false });
      console.log(`Created storage bucket: ${bucketName}`);
    }

    // Generate unique file path
    const ext = file.name?.split('.').pop() || 'jpg';
    const filePath = `${userId}/avatar-${Date.now()}.${ext}`;

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return c.json({ error: `Storage upload failed: ${uploadError.message}` }, 500);
    }

    // Generate a signed URL (valid for 1 year)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 365 * 24 * 60 * 60);

    if (signedError) {
      console.error('Signed URL error:', signedError);
      return c.json({ error: 'Failed to generate avatar URL' }, 500);
    }

    const avatarUrl = signedData.signedUrl;

    // Update user profile
    const currentProfile = await kv.get(`user:${userId}`);
    const updatedProfile = {
      ...(currentProfile || {}),
      user_id: userId,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, updatedProfile);

    await kv.set(`audit:avatar:${userId}:${Date.now()}`, {
      action: 'upload_avatar',
      userId,
      filePath,
      fileSize: file.size,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ User ${userId} uploaded avatar: ${filePath} (${file.size} bytes)`);
    return c.json({ success: true, avatarUrl, profile: updatedProfile });
  } catch (error) {
    console.error('Avatar file upload error:', error);
    return c.json({ error: `Failed to upload avatar: ${error}` }, 500);
  }
});

// Delete User Account Endpoint
app.delete("/users/me", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    // 1. Get user profile to check if exists
    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // 2. Delete user data from KV store
    
    // Delete profile
    await kv.del(`user:${userId}`);
    
    // Delete journal entries
    const journalEntries = await kv.getByPrefix(`journal_by_user:${userId}`);
    for (const entry of journalEntries) {
      if (entry.journal_entry_id) {
        await kv.del(`journal:${entry.journal_entry_id}`);
      }
      await kv.del(`journal_by_user:${userId}:${entry.date}`);
    }
    
    // Delete enrollments
    const enrollments = await kv.getByPrefix(`user_enrollment:${userId}`);
    for (const enrollment of enrollments) {
      if (enrollment.enrollmentId) {
        await kv.del(`enrollment:${enrollment.enrollmentId}`);
      }
      await kv.del(`user_enrollment:${userId}:${enrollment.programId}`);
    }
    
    // Delete assessment responses
    const assessmentResponses = await kv.getByPrefix(`assessment_response_by_user:${userId}`);
    // Note: We might want to keep these for research, but anonymized. For now, we delete.
    for (const response of assessmentResponses) {
      if (response.response_id) {
         await kv.del(`assessment_response:${response.response_id}`);
      }
    }
    // Also delete the "latest" keys which are not in the list returned by getByPrefix on the user prefix if strict
    // But our structure is `assessment_response_by_user:${userId}:${assessmentId}:latest` so they should be included
    
    // Delete iKAN score snapshots
    const ikanScores = await kv.getByPrefix(`ikan_score:${userId}:`);
    for (const s of ikanScores) {
      if (s?.date) await kv.del(`ikan_score:${userId}:${s.date}`);
    }

    // Delete payments/transactions
    const payments = await kv.getByPrefix(`payment:${userId}`);
    for (const payment of payments) {
      if (payment.id) {
         await kv.del(`payment:${userId}:${payment.id}`);
      }
    }

    // 3. Delete from Supabase Auth (Admin only can do this usually, but we have service role key)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authDeleteError) {
      console.error('Failed to delete user from Auth:', authDeleteError);
      // Continue anyway as we deleted data
    }
    
    // Create audit log
    await kv.set(`audit:delete_account:${userId}:${Date.now()}`, {
      action: 'delete_account',
      userId,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ User account deleted: ${userId}`);
    
    return c.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return c.json({ error: 'Failed to delete account' }, 500);
  }
});

// Get User Payments Endpoint
app.get("/users/payments", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    const payments = await kv.getByPrefix(`payment:${userId}`);
    
    // Sort by date descending
    const sortedPayments = payments.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return c.json({ payments: sortedPayments });
  } catch (error) {
    console.error('Get payments error:', error);
    return c.json({ error: 'Failed to retrieve payments' }, 500);
  }
});

// Record Payment Endpoint (Internal use or admin)
app.post("/users/payments", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { 
      programId, 
      programTitle, 
      amount, 
      currency = 'INR', 
      paymentMethod, 
      transactionId, 
      status = 'completed',
      description 
    } = await c.req.json();
    
    if (!amount || !programId) {
      return c.json({ error: 'Amount and Program ID are required' }, 400);
    }
    
    const id = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payment = {
      id,
      userId,
      type: 'purchase',
      programId,
      programTitle,
      amount,
      currency,
      status,
      paymentMethod,
      transactionId: transactionId || `txn_${Date.now()}`,
      date: new Date().toISOString(),
      description,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`payment:${userId}:${id}`, payment);
    
    return c.json({ payment });
  } catch (error) {
    console.error('Record payment error:', error);
    return c.json({ error: 'Failed to record payment' }, 500);
  }
});

// Purchase Equip Program Endpoint
app.post("/equip/purchase/:equipId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const equipId = c.req.param('equipId');
    const { onboarding_data, payment_method } = await c.req.json();
    
    // 1. Verify program exists
    let program = await kv.get(`equip_program:${equipId}`);
    if (!program) {
       // Try by slug
       program = await kv.get(`equip_program_by_slug:${equipId}`);
    }
    
    if (!program) {
      return c.json({ error: 'Program not found' }, 404);
    }
    
    const programId = program.id || program.equip_id;
    
    // 2. Create Enrollment
    const enrollmentId = `enrollment-${userId}-${programId}-${Date.now()}`;
    const enrollment = {
      enrollmentId,
      userId,
      programId,
      programTitle: program.title,
      onboardingData: onboarding_data,
      startDate: new Date().toISOString(),
      progress: [],
      completedDays: [],
      currentDay: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`enrollment:${enrollmentId}`, enrollment);
    await kv.set(`user_enrollment:${userId}:${programId}`, enrollment);
    
    // 3. Record Payment
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payment = {
      id: paymentId,
      userId,
      type: 'purchase',
      programId,
      programTitle: program.title,
      amount: program.price || 49900, // Default to 499.00 if no price
      currency: program.currency || 'INR',
      status: 'completed',
      paymentMethod: payment_method || 'Credit Card',
      transactionId: `txn_${Date.now()}`,
      date: new Date().toISOString(),
      description: `Purchase of ${program.title}`,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`payment:${userId}:${paymentId}`, payment);
    
    console.log(`✅ Program purchased: ${program.title} by ${userId}`);
    
    return c.json({ 
      success: true, 
      enrollment,
      payment,
      message: 'Program purchased successfully' 
    });
    
  } catch (error) {
    console.error('Purchase program error:', error);
    return c.json({ error: 'Failed to purchase program' }, 500);
  }
});
app.post("/journal/entries", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { date, mood_rating, freehand_text_content, associated_tracker_entry_id, emotions, energy } = await c.req.json();
    
    if (!date) {
      return c.json({ error: 'Date is required' }, 400);
    }

    const entryId = `${userId}-${date}`;
    const entry = {
      journal_entry_id: entryId,
      user_id: userId,
      timestamp: new Date().toISOString(),
      date,
      mood_rating: mood_rating || null,
      freehand_text_content: freehand_text_content || null,
      associated_tracker_entry_id: associated_tracker_entry_id || null,
      emotions: emotions || [],
      energy: energy || null,
      status: 'present'
    };

    await kv.set(`journal:${entryId}`, entry);
    await kv.set(`journal_by_user:${userId}:${date}`, entry);

    // Second journal write path — must mirror to user_journal_entries too,
    // otherwise entries created here only reach the table via the self-heal
    // on GET /user/journal. Best-effort: KV above stays the source of truth.
    await mirrorJournalEntryToTable(entry, `journal:${entryId}`);

    return c.json({ entry });
  } catch (error) {
    console.log('Create journal entry error:', error);
    return c.json({ error: 'Failed to create journal entry' }, 500);
  }
});

app.get("/journal/entries", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { startDate, endDate, limit = 50 } = c.req.query();
    
    const entries = await kv.getByPrefix(`journal_by_user:${userId}`);
    let filteredEntries = entries;
    
    if (startDate && endDate) {
      filteredEntries = entries.filter(entry => 
        entry.date >= startDate && entry.date <= endDate
      );
    }
    
    // Sort by date descending and limit
    filteredEntries = filteredEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, parseInt(limit));
    
    return c.json({ entries: filteredEntries });
  } catch (error) {
    console.log('Get journal entries error:', error);
    return c.json({ error: 'Failed to retrieve journal entries' }, 500);
  }
});

app.get("/journal/entries/:date", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const date = c.req.param('date');
    
    const entry = await kv.get(`journal_by_user:${userId}:${date}`);
    
    if (!entry) {
      return c.json({ entry: null });
    }
    
    return c.json({ entry });
  } catch (error) {
    console.log('Get journal entry error:', error);
    return c.json({ error: 'Failed to retrieve journal entry' }, 500);
  }
});

// ─── DEAD INLINE ASSESSMENT ROUTES REMOVED ─────────────────────
// GET/POST/PUT/DELETE /assessments/* and /assessments/:id/responses
// were removed — they were shadowed by assessment-routes.ts
// (registered first via registerAssessmentRoutes) and admin-routes.ts.
// Assessment CRUD is now solely handled by:
//   • assessment-routes.ts  → GET /assessments, GET /assessments/:id,
//                              POST /user/assessments, GET /user/assessments/history
//   • admin-routes.ts       → POST/PUT/DELETE /admin/assessments/:id
// ────────────────────────────────────────────────────────────────

// ========================================
// EQUIP PROGRAMS LIST ENDPOINT
// ========================================

// Get all Equip Programs (Public Endpoint)
app.get("/equip-programs", async (c) => {
  try {
    // Get all equip programs — merge both prefixes for backward compat
    const equip1 = await kv.getByPrefix('equip_program:');
    const equip2 = await kv.getByPrefix('equip:');
    const allPrograms = [...equip1, ...equip2];

    // Filter out null/undefined entries — require at least a slug or title to be a real program
    const validPrograms = allPrograms.filter((p: any) => p && (p.id || p.equip_id) && (p.slug || p.title));
    
    // Deduplicate by ID (equip_id or id)
    const uniquePrograms = Array.from(
      new Map(
        validPrograms.map((p: any) => [p.equip_id || p.id, p])
      ).values()
    );
    
    // ✅ FILTER OUT UNPUBLISHED/DRAFT PROGRAMS - Only return published programs
    const publishedPrograms = uniquePrograms.filter((p: any) => p.published !== false);

    // ✅ Compute enrollment counts from KV (real data, not hardcoded)
    // NOTE: Two enrollment systems exist with different field names:
    //   1. /equip/purchase stores: { programId } (index.tsx)
    //   2. ProgressService stores: { equip_id } (progress-service.ts)
    const allEnrollments = await kv.getByPrefix('enrollment:');
    const enrollmentCountMap: Record<string, number> = {};
    for (const enrollment of allEnrollments) {
      if (!enrollment) continue;
      const eid = enrollment.equip_id || enrollment.programId;
      if (!eid) continue;
      enrollmentCountMap[eid] = (enrollmentCountMap[eid] || 0) + 1;
    }

    // Attach enrollment counts to each program
    const programsWithCounts = publishedPrograms.map((p: any) => ({
      ...p,
      enrollmentCount: enrollmentCountMap[p.equip_id || p.id] || 0,
    }));
    
    console.log(`✅ Returning ${programsWithCounts.length} published equip programs (${uniquePrograms.length} total)`);
    return c.json({ programs: programsWithCounts });
  } catch (error) {
    console.error('❌ Get equip programs error:', error);
    return c.json({ error: 'Failed to retrieve equip programs', programs: [] }, 500);
  }
});

// Get Single Equip Program by ID (Public Endpoint)
app.get("/equip/:programId", async (c) => {
  try {
    const programId = c.req.param('programId');
    console.log(`🔍 Looking up equip program: ${programId}`);
    
    // Try direct lookup first
    let program = await kv.get(`equip_program:${programId}`);
    
    // If not found, search through all programs by ID or slug
    if (!program) {
      console.log(`⚠️ Program not found by key, searching by ID/slug...`);
      const allPrograms = await kv.getByPrefix('equip_program:');
      program = allPrograms.find((p: any) => 
        p && (p.id === programId || p.slug === programId || p.equip_id === programId)
      );
    }
    
    if (!program) {
      console.log(`❌ Equip program not found: ${programId}`);
      return c.json({ error: 'Program not found' }, 404);
    }
    
    // Compute enrollment count for this specific program
    const programId2 = program.equip_id || program.id;
    const allEnrollmentsForProgram = await kv.getByPrefix('enrollment:');
    const enrollmentCount = allEnrollmentsForProgram.filter(
      (e: any) => e && e.equip_id === programId2
    ).length;
    
    console.log(`✅ Equip program found: ${programId2} (${enrollmentCount} enrollments)`);
    return c.json({ program: { ...program, enrollmentCount } });
  } catch (error) {
    console.error('❌ Get equip program error:', error);
    return c.json({ error: 'Failed to retrieve program' }, 500);
  }
});

// ========================================
// RECOMMENDATION ENDPOINTS
// ========================================

app.get("/recommendations", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const recommendations = await RecommendationService.getRecommendations(userId);
    return c.json({ recommendations });
  } catch (error: any) {
    console.log('Get recommendations error:', error);
    return c.json({ error: 'Failed to generate recommendations', details: error.message }, 500);
  }
});







// ─── DEAD INLINE LIBRARY/RESOURCE ROUTES REMOVED ───────────────
// GET /library/resources, GET /library/resources/:resourceId
// were removed — shadowed by resource-routes.ts (registered first
// via registerResourceRoutes). Resource CRUD is now solely handled
// by resource-routes.ts.
// ────────────────────────────────────────────────────────────────

// ============================================================================
// CONSULTANTS ENDPOINTS
// ============================================================================

// Get all consultants
app.get("/consultants", async (c) => {
  try {
    let consultants = await kv.getByPrefix('consultant:');
    
    // Filter out null/undefined entries
    consultants = consultants.filter((c: any) => c && c.id);
    
    // Apply filters if provided
    const category = c.req.query('category');
    const expertise = c.req.query('expertise');
    const sessionMode = c.req.query('sessionMode');
    
    let filtered = consultants;
    
    if (category) {
      filtered = filtered.filter(c => c.category === category);
    }
    
    if (expertise) {
      filtered = filtered.filter(c => 
        c.expertises?.some((e: string) => e.toLowerCase().includes(expertise.toLowerCase()))
      );
    }
    
    if (sessionMode) {
      filtered = filtered.filter(c => 
        c.sessionModes?.includes(sessionMode)
      );
    }
    
    // Sort by rating
    const sorted = filtered.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    
    console.log(`✅ Returning ${sorted.length} consultants`);
    return c.json({ consultants: sorted });
  } catch (error) {
    console.error('❌ Get consultants error:', error);
    return c.json({ error: 'Failed to retrieve consultants', consultants: [] }, 500);
  }
});

// Get consultant by ID
app.get("/consultants/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const consultant = await kv.get(`consultant:${id}`);
    
    if (!consultant) {
      return c.json({ error: 'Consultant not found' }, 404);
    }
    
    console.log(`👨‍⚕️ Fetched consultant: ${consultant.name}`);
    return c.json({ consultant });
  } catch (error) {
    console.error('Get consultant error:', error);
    return c.json({ error: 'Failed to retrieve consultant' }, 500);
  }
});

// ========================================
// BOOKINGS ENDPOINTS
// ========================================

app.post("/bookings", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const data = await c.req.json();
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const booking = { id: bookingId, user_id: userId, consultant_id: data.consultant_id, consultant_name: data.consultant_name || '', date: data.date, time: data.time, mode: data.mode || 'video', status: 'pending', created_at: new Date().toISOString() };
    await kv.set(`booking:${userId}:${bookingId}`, booking);
    console.log(`📅 Booking created: ${bookingId}`);
    return c.json({ booking });
  } catch (error) { console.error('Create booking error:', error); return c.json({ error: 'Failed to create booking' }, 500); }
});

app.get("/bookings", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const bookings = await kv.getByPrefix(`booking:${userId}:`);
    const sorted = bookings.filter((b: any) => b?.id).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return c.json({ bookings: sorted });
  } catch (error) { console.error('Get bookings error:', error); return c.json({ error: 'Failed to get bookings' }, 500); }
});

// ─── DEAD INLINE ADMIN RESOURCE ROUTES REMOVED ─────────────────
// GET/POST/PUT/DELETE /admin/resources were removed — shadowed by
// resource-routes.ts (registered first via registerResourceRoutes).
// ────────────────────────────────────────────────────────────────

// Set user as admin endpoint (for initial admin setup)
app.post("/admin/set-admin/:userId", requireAuth, async (c) => {
  try {
    const requestingUser = c.get('user');
    const targetUserId = c.req.param('userId');
    
    // Check if requesting user is already admin or is setting themselves as first admin
    const requestingProfile = await kv.get(`user:${requestingUser.id}`);
    
    // Allow first admin setup if no admins exist yet
    const allUsers = await kv.getByPrefix('user:');
    const hasAdmins = allUsers.some(u => u.is_admin);
    
    if (!requestingProfile?.is_admin && hasAdmins) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const targetProfile = await kv.get(`user:${targetUserId}`);
    if (!targetProfile) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const updatedProfile = {
      ...targetProfile,
      is_admin: true,
      admin_since: new Date().toISOString()
    };
    
    await kv.set(`user:${targetUserId}`, updatedProfile);
    
    console.log(`✅ User ${targetUserId} set as admin`);
    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log('Set admin error:', error);
    return c.json({ error: 'Failed to set admin status' }, 500);
  }
});

// Debug Endpoint - Check and Fix Admin Status
app.get("/admin/debug/check-status", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    
    console.log('🔍 Debug check for user:', user.id);
    console.log('User profile:', userProfile);
    
    return c.json({ 
      userId: user.id,
      email: user.email,
      profile: userProfile,
      isAdmin: userProfile?.is_admin || false,
      message: userProfile?.is_admin ? 'User is admin' : 'User is NOT admin'
    });
  } catch (error) {
    console.error('Debug check error:', error);
    return c.json({ error: 'Failed to check status' }, 500);
  }
});

app.post("/admin/debug/make-admin", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    let userProfile = await kv.get(`user:${user.id}`);
    
    if (!userProfile) {
      // Create profile if it doesn't exist
      userProfile = {
        user_id: user.id,
        email: user.email,
        name: user.email.split('@')[0],
        is_admin: true,
        corporate_user: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else {
      // Update existing profile
      userProfile.is_admin = true;
      userProfile.updated_at = new Date().toISOString();
    }
    
    await kv.set(`user:${user.id}`, userProfile);
    
    console.log(`✅ User ${user.id} promoted to admin`);
    
    return c.json({ 
      success: true,
      message: 'User promoted to admin successfully',
      profile: userProfile
    });
  } catch (error) {
    console.error('Make admin error:', error);
    return c.json({ error: 'Failed to promote user to admin' }, 500);
  }
});

// Admin User Management Endpoints
app.get("/admin/users", requireAdmin, async (c) => {
  try {
    // Get all users
    let users = await kv.getByPrefix('user:');
    
    // Filter out null/undefined entries
    users = users.filter((u: any) => u && u.user_id && u.email);
    
    console.log(`✅ Admin fetched ${users.length} users`);
    
    // Sort by created_at descending
    const sortedUsers = users.sort((a: any, b: any) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    
    return c.json({ users: sortedUsers });
  } catch (error) {
    console.error('❌ Get admin users error:', error);
    return c.json({ error: 'Failed to retrieve users', users: [] }, 500);
  }
});

// Admin - Create User Manually
app.post("/admin/users", requireAdmin, async (c) => {
  try {
    const { email, password, name, phone, is_admin, corporate_user } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }
    
    // Create user via Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server not configured
      user_metadata: { name }
    });
    
    if (error) {
      console.error('Failed to create user in Supabase:', error);
      return c.json({ error: error.message || 'Failed to create user' }, 400);
    }
    
    if (!data.user) {
      return c.json({ error: 'User creation failed' }, 500);
    }
    
    // Create user profile in KV store
    const userProfile = {
      user_id: data.user.id,
      email,
      name,
      phone: phone || null,
      is_admin: is_admin || false,
      corporate_user: corporate_user || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`user:${data.user.id}`, userProfile);
    
    console.log(`✅ Admin manually created user: ${email} (${data.user.id})`);
    
    return c.json({ user: userProfile, message: 'User created successfully' });
  } catch (error) {
    console.error('Admin create user error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Admin - Get Single User
app.get("/admin/users/:userId", requireAuth, async (c) => {
  try {
    const adminUser = c.get('user');
    const userId = c.req.param('userId');
    
    // Check if requesting user is admin
    const adminProfile = await kv.get(`user:${adminUser.id}`);
    if (!adminProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json(userProfile);
  } catch (error) {
    console.log('Admin get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

// Admin - Update User
app.put("/admin/users/:userId", requireAuth, async (c) => {
  try {
    const adminUser = c.get('user');
    const userId = c.req.param('userId');
    const updates = await c.req.json();
    
    // Check if requesting user is admin
    const adminProfile = await kv.get(`user:${adminUser.id}`);
    if (!adminProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const currentProfile = await kv.get(`user:${userId}`);
    if (!currentProfile) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Protect super admin from demotion
    const SUPER_ADMIN_EMAIL = 'admin@wugweb.com';
    if (currentProfile.email?.toLowerCase() === SUPER_ADMIN_EMAIL && updates.is_admin === false) {
      return c.json({ error: 'Cannot demote the system super admin (admin@wugweb.com)' }, 403);
    }
    
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      user_id: userId, // Prevent changing user ID
      updated_at: new Date().toISOString()
    };
    
    // Ensure super admin always keeps admin + super_admin flags
    if (currentProfile.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
      updatedProfile.is_admin = true;
      updatedProfile.is_super_admin = true;
    }
    
    await kv.set(`user:${userId}`, updatedProfile);
    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log('Admin update user error:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Admin - Delete User
app.delete("/admin/users/:userId", requireAuth, async (c) => {
  try {
    const adminUser = c.get('user');
    const userId = c.req.param('userId');
    
    // Check if requesting user is admin
    const adminProfile = await kv.get(`user:${adminUser.id}`);
    if (!adminProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    // Prevent deleting self
    if (userId === adminUser.id) {
      return c.json({ error: 'Cannot delete your own account' }, 400);
    }
    
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      // Fallback: scan user profiles to find matching user_id
      const allUsers = await kv.getByPrefix('user:');
      const matchedUser = allUsers.find((u: any) => u?.user_id === userId);
      if (!matchedUser) {
        return c.json({ error: 'User not found' }, 404);
      }
      await kv.del(`user:${matchedUser.user_id}`);
    } else {
      await kv.del(`user:${userId}`);
    }
    
    // Clean up related data (best-effort)
    try {
      const enrollments = await kv.getByPrefix(`user_enrollment:${userId}:`);
      for (const enrollment of enrollments) {
        if (enrollment?.id) await kv.del(`enrollment:${enrollment.id}`);
      }
    } catch (cleanupErr) {
      console.log('Non-critical cleanup error during user deletion:', cleanupErr);
    }
    
    return c.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.log('Admin delete user error:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// Admin - Get User Mood Entries
app.get("/admin/users/:userId/mood-entries", requireAuth, async (c) => {
  try {
    const adminUser = c.get('user');
    const userId = c.req.param('userId');
    const adminProfile = await kv.get(`user:${adminUser.id}`);
    if (!adminProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const journalEntries = await kv.getByPrefix(`journal_by_user:${userId}:`);
    const moodEntries = await kv.getByPrefix(`mood:${userId}:`);
    
    // Also check journal: prefix (entries stored as journal:{entryId} with userId inside)
    const allJournals = await kv.getByPrefix('journal:');
    const userJournals = allJournals.filter((j: any) => j?.user_id === userId);
    
    // Merge and deduplicate
    const seen = new Set<string>();
    const entries: any[] = [];
    for (const entry of [...journalEntries, ...moodEntries, ...userJournals]) {
      if (!entry) continue;
      const id = entry.id || entry.date || JSON.stringify(entry);
      if (!seen.has(id)) { seen.add(id); entries.push(entry); }
    }
    entries.sort((a, b) => (b.date || b.created_at || '').localeCompare(a.date || a.created_at || ''));
    return c.json({ entries });
  } catch (error) {
    console.log('Admin get user mood entries error:', error);
    return c.json({ error: 'Failed to fetch user mood entries' }, 500);
  }
});

// Admin - Get User Enrollments
app.get("/admin/users/:userId/enrollments", requireAuth, async (c) => {
  try {
    const adminUser = c.get('user');
    const userId = c.req.param('userId');
    const adminProfile = await kv.get(`user:${adminUser.id}`);
    if (!adminProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const userEnrollments = await kv.getByPrefix(`user_enrollment:${userId}:`);
    const allEnrollments = await kv.getByPrefix('enrollment:');
    const matchedEnrollments = allEnrollments.filter((e: any) => e?.user_id === userId);
    
    const seen = new Set<string>();
    const enrollments: any[] = [];
    for (const e of [...userEnrollments, ...matchedEnrollments]) {
      if (!e) continue;
      const id = e.id || e.program_id || JSON.stringify(e);
      if (!seen.has(id)) { seen.add(id); enrollments.push(e); }
    }
    return c.json({ enrollments });
  } catch (error) {
    console.log('Admin get user enrollments error:', error);
    return c.json({ error: 'Failed to fetch user enrollments' }, 500);
  }
});

// Admin - Get User Consultations
app.get("/admin/users/:userId/consultations", requireAuth, async (c) => {
  try {
    const adminUser = c.get('user');
    const userId = c.req.param('userId');
    const adminProfile = await kv.get(`user:${adminUser.id}`);
    if (!adminProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const bookings = await kv.getByPrefix(`booking:${userId}:`);
    return c.json({ consultations: bookings || [] });
  } catch (error) {
    console.log('Admin get user consultations error:', error);
    return c.json({ error: 'Failed to fetch user consultations' }, 500);
  }
});

// Admin - Get User Assessment Responses
app.get("/admin/users/:userId/assessments", requireAuth, async (c) => {
  try {
    const adminUser = c.get('user');
    const userId = c.req.param('userId');
    const adminProfile = await kv.get(`user:${adminUser.id}`);
    if (!adminProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const results1 = await kv.getByPrefix(`assessment_result:${userId}:`);
    const results2 = await kv.getByPrefix(`assessment-result:${userId}:`);
    const responses = await kv.getByPrefix(`assessment_response_by_user:${userId}:`);
    
    return c.json({ history: [...(results1 || []), ...(results2 || [])], responses: responses || [] });
  } catch (error) {
    console.log('Admin get user assessments error:', error);
    return c.json({ error: 'Failed to fetch user assessment data' }, 500);
  }
});

// Consultation/Professional Endpoints
app.get("/consultation/professionals", async (c) => {
  try {
    const { specialty, location, limit = 50 } = c.req.query();
    
    // Get from both professional: and consultant: prefixes for compatibility
    let professionals = await kv.getByPrefix('professional:');
    const consultants = await kv.getByPrefix('consultant:');
    professionals = [...professionals, ...consultants];
    
    // Filter out null/undefined entries
    professionals = professionals.filter((p: any) => p && p.id);
    
    // Filter by specialty if provided
    if (specialty) {
      professionals = professionals.filter((professional: any) => 
        (professional.specialties && professional.specialties.includes(specialty)) ||
        (professional.expertises && professional.expertises.includes(specialty))
      );
    }
    
    // Filter by location if provided
    if (location) {
      professionals = professionals.filter((professional: any) => 
        professional.location && professional.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Limit results
    professionals = professionals.slice(0, parseInt(limit));
    
    console.log(`✅ Returning ${professionals.length} professionals/consultants`);
    return c.json({ professionals });
  } catch (error) {
    console.error('❌ Get professionals error:', error);
    return c.json({ error: 'Failed to retrieve professionals', professionals: [] }, 500);
  }
});

app.get("/consultation/professionals/:professionalId", async (c) => {
  try {
    const professionalId = c.req.param('professionalId');
    
    // Try both prefixes
    let professional = await kv.get(`professional:${professionalId}`);
    if (!professional) {
      professional = await kv.get(`consultant:${professionalId}`);
    }
    
    if (!professional) {
      return c.json({ error: 'Professional not found' }, 404);
    }
    
    console.log(`👨‍⚕️ Fetched professional: ${professional.name || professional.id}`);
    return c.json({ professional });
  } catch (error) {
    console.log('Get professional error:', error);
    return c.json({ error: 'Failed to retrieve professional' }, 500);
  }
});

// Admin Professional Endpoints
app.get("/admin/professionals", requireAdmin, async (c) => {
  try {
    // Get all professionals
    let professionals = await kv.getByPrefix('professional:');
    
    // Filter out null/undefined entries
    professionals = professionals.filter((p: any) => p && p.id);
    
    console.log(`✅ Admin fetched ${professionals.length} professionals`);
    
    // Sort by created_at descending
    const sortedProfessionals = professionals.sort((a: any, b: any) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    
    return c.json({ professionals: sortedProfessionals });
  } catch (error) {
    console.error('❌ Get admin professionals error:', error);
    return c.json({ error: 'Failed to retrieve professionals', professionals: [] }, 500);
  }
});

app.post("/admin/professionals", requireAdmin, async (c) => {
  try {
    const user = c.get('user');
    
    const professionalData = await c.req.json();
    // Use professional_id if provided, otherwise use id, otherwise generate new
    const professionalId = professionalData.professional_id || professionalData.id || `prof-${Date.now()}`;
    
    const newProfessional = {
      ...professionalData,
      id: professionalId,
      professional_id: professionalId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`professional:${professionalId}`, newProfessional);
    
    console.log(`✅ Professional created: ${professionalId}`);
    return c.json({ professional: newProfessional });
  } catch (error) {
    console.log('Create professional error:', error);
    return c.json({ error: 'Failed to create professional' }, 500);
  }
});

app.put("/admin/professionals/:professionalId", requireAdmin, async (c) => {
  try {
    const user = c.get('user');
    const professionalId = c.req.param('professionalId');
    
    const updates = await c.req.json();
    const existingProfessional = await kv.get(`professional:${professionalId}`);
    
    if (!existingProfessional) {
      return c.json({ error: 'Professional not found' }, 404);
    }
    
    const updatedProfessional = {
      ...existingProfessional,
      ...updates,
      id: professionalId,
      professional_id: professionalId,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`professional:${professionalId}`, updatedProfessional);
    
    console.log(`✅ Professional updated: ${professionalId}`);
    return c.json({ professional: updatedProfessional });
  } catch (error) {
    console.log('Update professional error:', error);
    return c.json({ error: 'Failed to update professional' }, 500);
  }
});

app.delete("/admin/professionals/:professionalId", requireAdmin, async (c) => {
  try {
    const professionalId = c.req.param('professionalId');
    
    const existingProfessional = await kv.get(`professional:${professionalId}`);
    if (!existingProfessional) {
      return c.json({ error: 'Professional not found' }, 404);
    }
    
    await kv.del(`professional:${professionalId}`);
    
    console.log(`✅ Professional deleted: ${professionalId}`);
    return c.json({ success: true, message: 'Professional deleted successfully' });
  } catch (error) {
    console.log('Delete professional error:', error);
    return c.json({ error: 'Failed to delete professional' }, 500);
  }
});

// CMS Page Endpoints
// Get all pages (for admin manager)
app.get("/cms/pages", requireAuth, async (c) => {
  try {
    console.log('📄 CMS request for all pages');
    
    // Get all pages from KV store
    const pagesData = await kv.getByPrefix('cms_page:');
    
    // Filter out null/invalid entries and get valid pages
    // getByPrefix returns values directly, not {key, value} pairs
    // Only require slug; name/title can be backfilled if missing
    const validPages = (pagesData || [])
      .filter(page => page && page.slug)
      .map(page => ({
        ...page,
        id: page.id || page.slug,
        name: page.name || page.title || page.slug,
        title: page.title || page.name || page.slug,
      }));

    // NOTE: We no longer auto-create missing system pages on GET.
    // Use "Sync System Pages" in Admin → Page Manager to deliberately
    // create any missing pages. This prevents CRUD side-effects on reads.
    
    console.log(`✅ Returning ${validPages.length} CMS pages`);
    return c.json({ pages: validPages });
  } catch (error) {
    console.log('Get CMS pages error:', error);
    return c.json({ error: 'Failed to retrieve pages' }, 500);
  }
});



// Create new page
app.post("/cms/pages", requireAuth, async (c) => {
  try {
    const data = await c.req.json();
    console.log('📄 Create page request received:', { slug: data.slug, name: data.name, title: data.title });
    
    // Validate required fields
    if (!data.slug || !data.name || !data.title) {
      console.log('❌ Validation failed - missing required fields:', { 
        hasSlug: !!data.slug, 
        hasName: !!data.name, 
        hasTitle: !!data.title 
      });
      return c.json({ error: 'Missing required fields: slug, name, and title are required' }, 400);
    }
    
    // Check if page with this slug already exists
    const existing = await kv.get(`cms_page:${data.slug}`);
    if (existing) {
      console.log(`❌ Page with slug '${data.slug}' already exists`);
      return c.json({ error: `Page with slug '${data.slug}' already exists` }, 409);
    }
    
    const newPage = {
      id: data.slug, // Use slug as ID for consistency
      name: data.name,
      title: data.title,
      slug: data.slug,
      published: data.published || false,
      content: data.content || '',
      // Include all optional fields from the form
      featuredImage: data.featuredImage || '',
      heroImage: data.heroImage || '',
      heroVideoUrl: data.heroVideoUrl || '',
      // Hero section structured fields
      heroEnabled: data.heroEnabled || false,
      heroTitle: data.heroTitle || '',
      heroSubtitle: data.heroSubtitle || '',
      heroCtaText: data.heroCtaText || '',
      heroCtaLink: data.heroCtaLink || '',
      heroOverlayOpacity: data.heroOverlayOpacity ?? 40,
      // SEO fields
      ogImage: data.ogImage || '',
      metaDescription: data.metaDescription || '',
      metaKeywords: data.metaKeywords || '',
      ogTitle: data.ogTitle || '',
      ogDescription: data.ogDescription || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store using slug as key for consistency
    await kv.set(`cms_page:${newPage.slug}`, newPage);
    console.log(`✅ Created CMS page: ${newPage.slug}`);
    return c.json(newPage);
  } catch (error) {
    console.log('Create CMS page error:', error);
    return c.json({ error: 'Failed to create page' }, 500);
  }
});

// Update existing page
app.put("/cms/pages/:pageId", requireAuth, async (c) => {
  try {
    const pageId = c.req.param('pageId');
    const updates = await c.req.json();
    
    // Get existing page
    const existingPage = await kv.get(`cms_page:${pageId}`);
    
    const updatedPage = {
      ...(existingPage || {}),
      ...updates,
      id: pageId,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`cms_page:${pageId}`, updatedPage);
    console.log(`✅ Updated CMS page: ${pageId}`);
    return c.json(updatedPage);
  } catch (error) {
    console.log('Update CMS page error:', error);
    return c.json({ error: 'Failed to update page content' }, 500);
  }
});

// Delete page
app.delete("/cms/pages/:pageId", requireAuth, async (c) => {
  try {
    const pageId = c.req.param('pageId');
    await kv.del(`cms_page:${pageId}`);
    console.log(`✅ Deleted CMS page: ${pageId}`);
    return c.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    console.log('Delete CMS page error:', error);
    return c.json({ error: 'Failed to delete page' }, 500);
  }
});

// NOTE: createDefaultCMSContent removed — KV is sole source of truth.
// The old function (~930 lines of hardcoded HTML) has been deleted.
// If a CMS page doesn't exist in KV, the GET handler returns 404.


// Newsletter signup is handled by newsletter-routes.ts (registerNewsletterRoutes)

// ============================================================================
// ACTIVITY LOG (captures user and admin actions for system logs)
// ============================================================================

app.post("/activity-log", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { action, metadata, timestamp } = await c.req.json();
    const now = timestamp || new Date().toISOString();
    const logId = `actlog_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const record = { id: logId, user_id: userId, action, metadata, created_at: now };
    await kv.set(`activity_log:${logId}`, JSON.stringify(record));
    return c.json({ success: true });
  } catch (error) {
    console.log('Activity log error:', error);
    return c.json({ success: true }); // Non-critical — don't fail requests
  }
});

app.get("/admin/activity-logs", requireAuth, async (c) => {
  try {
    const raw = await kv.getByPrefix('activity_log:');
    const logs = raw
      .map((r: any) => { try { return typeof r === 'string' ? JSON.parse(r) : r; } catch { return null; } })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 200); // Last 200 entries
    return c.json({ logs });
  } catch (error) {
    console.log('Get activity logs error:', error);
    return c.json({ logs: [] });
  }
});

// ============================================================================
// BADGE COUNTS (notification badges for mobile bottom nav)
// ============================================================================

app.get("/badge-counts", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const today = new Date().toISOString().split('T')[0];
    const badges: Record<string, number> = {};

    // 1. Journal: 1 if user hasn't logged today
    try {
      const todayEntries = await kv.getByPrefix(`journal:${userId}:${today}`);
      if (!todayEntries || todayEntries.length === 0) {
        badges['/mood-journal'] = 1;
      }
    } catch { /* silent */ }

    // 2. Equip: count active enrollments with uncompleted today-days
    try {
      const enrollments = await kv.getByPrefix(`enrollment:${userId}:`);
      let newDays = 0;
      for (const enrollment of enrollments) {
        const e = typeof enrollment === 'string' ? JSON.parse(enrollment) : enrollment;
        if (e.status === 'active' && e.current_day !== undefined) {
          const dayKey = `day_progress:${userId}:${e.program_id || e.equip_id}:${e.current_day}`;
          const dayProgress = await kv.get(dayKey);
          if (!dayProgress) newDays++;
        }
      }
      if (newDays > 0) badges['/equip'] = newDays;
    } catch { /* silent */ }

    // 3. Consultation: count upcoming scheduled bookings
    try {
      const bookings = await kv.getByPrefix(`booking:${userId}:`);
      let upcoming = 0;
      for (const booking of bookings) {
        const b = typeof booking === 'string' ? JSON.parse(booking) : booking;
        if (b.status === 'scheduled' && b.appointment_date >= today) {
          upcoming++;
        }
      }
      if (upcoming > 0) badges['/consultation'] = upcoming;
    } catch { /* silent */ }

    return c.json(badges);
  } catch (error) {
    console.log('Badge counts error:', error);
    return c.json({});
  }
});

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

/**
 * Track user engagement analytics
 * Stores analytics data for resource interactions (views, reads, shares, etc.)
 */
app.post("/analytics/engagement", async (c) => {
  try {
    const analyticsData = await c.req.json();
    
    // Validate required fields
    if (!analyticsData.resource_id || !analyticsData.action) {
      return c.json({ error: 'resource_id and action are required' }, 400);
    }

    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const analyticsId = `eng_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Store analytics data in daily bucket (not individual keys)
    const analyticsRecord = {
      ...analyticsData,
      tracked_at: now.toISOString(),
      id: analyticsId
    };

    const dailyKey = `analytics:daily:${dateKey}`;
    const dailyBucket: any[] = (await kv.get(dailyKey)) || [];
    dailyBucket.push(analyticsRecord);
    await kv.set(dailyKey, dailyBucket);
    
    // Update per-resource counter (lightweight — just a count + last action)
    const resourceCounterKey = `analytics:counter:${analyticsData.resource_id}`;
    const counter = (await kv.get(resourceCounterKey)) || { views: 0, reads: 0, shares: 0, total: 0 };
    counter.total = (counter.total || 0) + 1;
    const act = analyticsData.action;
    if (act === 'view' || act === 'resource_view_started' || act === 'resource_loaded') counter.views = (counter.views || 0) + 1;
    else if (act === 'read') counter.reads = (counter.reads || 0) + 1;
    else if (act === 'share') counter.shares = (counter.shares || 0) + 1;
    counter.last_action = now.toISOString();
    await kv.set(resourceCounterKey, counter);
    
    console.log(`Analytics tracked: ${analyticsData.action} on resource ${analyticsData.resource_id}`);
    
    return c.json({ 
      success: true,
      message: 'Analytics tracked successfully',
      id: analyticsId
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't fail the request if analytics fails - it's not critical
    return c.json({ 
      success: false,
      message: 'Analytics tracking failed but request continued' 
    }, 200);
  }
});

/**
 * Mark resource as read by user
 * Tracks user reading activity for personalization and progress
 */
app.post("/user-activity/mark-read", async (c) => {
  try {
    const readData = await c.req.json();
    
    // Validate required fields
    if (!readData.resource_id) {
      return c.json({ error: 'resource_id is required' }, 400);
    }

    // Generate unique activity ID
    const activityId = `activity:read:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store read activity with timestamp
    const activityRecord = {
      ...readData,
      activity_type: 'read',
      tracked_at: new Date().toISOString(),
      id: activityId
    };

    await kv.set(activityId, activityRecord);
    
    // Also store by user ID if available for easy querying
    if (readData.user_id) {
      const userActivityKey = `activity:user:${readData.user_id}:reads`;
      const existingReads = await kv.get(userActivityKey) || [];
      existingReads.push(activityId);
      await kv.set(userActivityKey, existingReads);
    }
    
    console.log(`📖 Read activity tracked: resource ${readData.resource_id}`);
    
    return c.json({ 
      success: true,
      message: 'Read activity tracked successfully',
      id: activityId
    });
  } catch (error) {
    console.error('Read activity tracking error:', error);
    // Don't fail the request if tracking fails - it's not critical
    return c.json({ 
      success: false,
      message: 'Read activity tracking failed but request continued' 
    }, 200);
  }
});

// ============================================================================
// ADMIN MONITORING ENDPOINTS
// ============================================================================

/**
 * Get API logs for admin panel
 */
app.get("/admin/api-logs", requireAdmin, async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '100');
    const logs = await getAPILogs(limit);
    return c.json({ logs });
  } catch (error) {
    console.error('Error fetching API logs:', error);
    return c.json({ error: 'Failed to fetch API logs' }, 500);
  }
});

/**
 * Get system logs for admin panel
 */
app.get("/admin/system-logs", requireAdmin, async (c) => {
  try {
    const level = c.req.query('level') as any;
    const source = c.req.query('source');
    const limit = parseInt(c.req.query('limit') || '200');
    
    const logs = await getSystemLogs(level, source, limit);
    return c.json({ logs });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return c.json({ error: 'Failed to fetch system logs' }, 500);
  }
});

/**
 * Get current performance metrics
 */
app.get("/admin/performance/current", requireAdmin, async (c) => {
  try {
    const metrics = await getPerformanceMetrics();
    return c.json({ metrics });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return c.json({ error: 'Failed to fetch performance metrics' }, 500);
  }
});

/**
 * Get performance metrics history
 */
app.get("/admin/performance/history", requireAdmin, async (c) => {
  try {
    const hours = parseInt(c.req.query('hours') || '1');
    const history = await getMetricsHistory(hours);
    return c.json({ history });
  } catch (error) {
    console.error('Error fetching metrics history:', error);
    return c.json({ error: 'Failed to fetch metrics history' }, 500);
  }
});

/**
 * Get active sessions
 */
app.get("/admin/security/sessions", requireAdmin, async (c) => {
  try {
    const sessions = await getActiveSessions();
    return c.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return c.json({ error: 'Failed to fetch sessions' }, 500);
  }
});

/**
 * Terminate a user session
 */
app.delete("/admin/security/sessions/:userId", requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId');
    await terminateSession(userId);
    return c.json({ success: true, message: 'Session terminated' });
  } catch (error) {
    console.error('Error terminating session:', error);
    return c.json({ error: 'Failed to terminate session' }, 500);
  }
});

/**
 * Get audit logs
 */
app.get("/admin/security/audit", requireAdmin, async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '200');
    const logs = await getAuditLogs(limit);
    return c.json({ logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return c.json({ error: 'Failed to fetch audit logs' }, 500);
  }
});

/**
 * Get security alerts
 */
app.get("/admin/security/alerts", requireAdmin, async (c) => {
  try {
    const includeResolved = c.req.query('resolved') === 'true';
    const alerts = await getSecurityAlerts(includeResolved);
    return c.json({ alerts });
  } catch (error) {
    console.error('Error fetching security alerts:', error);
    return c.json({ error: 'Failed to fetch security alerts' }, 500);
  }
});

/**
 * Resolve a security alert
 */
app.post("/admin/security/alerts/:alertId/resolve", requireAdmin, async (c) => {
  try {
    const alertId = c.req.param('alertId');
    const { resolved_by } = await c.req.json();
    await resolveAlert(alertId, resolved_by);
    return c.json({ success: true, message: 'Alert resolved' });
  } catch (error) {
    console.error('Error resolving alert:', error);
    return c.json({ error: 'Failed to resolve alert' }, 500);
  }
});

// ============================================================================
// COMMUNICATION API CONFIGURATION ENDPOINTS
// ============================================================================

/**
 * Get communication API configurations (Admin Only)
 */
app.get("/admin/communication/config", requireAdmin, async (c) => {
  try {
    const configs = await kv.getByPrefix('comm-config:');
    return c.json({ configs });
  } catch (error) {
    console.error('Error fetching communication configs:', error);
    return c.json({ error: 'Failed to fetch configs' }, 500);
  }
});

/**
 * Save communication API configuration (Admin Only)
 */
app.post("/admin/communication/config", requireAdmin, async (c) => {
  try {
    const { provider, config } = await c.req.json();
    const key = `comm-config:${provider}`;
    await kv.set(key, { ...config, updated_at: new Date().toISOString() });
    return c.json({ success: true, message: 'Configuration saved' });
  } catch (error) {
    console.error('Error saving communication config:', error);
    return c.json({ error: 'Failed to save configuration' }, 500);
  }
});

/**
 * Test communication API (Admin Only)
 * Delegates to Brevo /brevo/test endpoint for actual delivery
 */
app.post("/admin/communication/test", requireAdmin, async (c) => {
  try {
    const { provider, recipient, message } = await c.req.json();

    // Map legacy provider names to Brevo channels
    const channelMap: Record<string, string> = {
      email: "email", sendgrid: "email",
      sms: "sms", twilio: "sms",
      whatsapp: "whatsapp", "twilio-whatsapp": "whatsapp",
    };
    const channel = channelMap[provider] || provider;

    // Call Brevo API directly
    const BREVO_BASE = "https://api.brevo.com/v3";
    const apiKey = Deno.env.get("BREVO_API_KEY");

    if (!apiKey) {
      return c.json({ error: "BREVO_API_KEY not configured. Please set it in environment secrets." }, 500);
    }

    if (channel === "email") {
      const config = await kv.get("brevo-config");
      const emailCfg = config?.email || {};
      const res = await fetch(`${BREVO_BASE}/smtp/email`, {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          to: [{ email: recipient }],
          sender: { name: emailCfg.senderName || "iKan Health", email: emailCfg.senderEmail || "noreply@ikanhealth.in" },
          subject: "iKan Communication Test",
          htmlContent: `<div style="font-family:Ubuntu,sans-serif;padding:24px"><h2 style="color:#2A2A2A;font-weight:500">Test Successful</h2><p style="color:#717182">${message || "Your Brevo email integration is working."}</p></div>`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return c.json({ success: false, error: data?.message || `Brevo returned ${res.status}` }, res.status);
      return c.json({ success: true, message: `Test email sent to ${recipient}`, messageId: data.messageId });
    }

    if (channel === "sms") {
      const config = await kv.get("brevo-config");
      const smsCfg = config?.sms || {};
      const res = await fetch(`${BREVO_BASE}/transactionalSMS/sms`, {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          recipient,
          content: message || "iKan test: Brevo SMS integration is working.",
          sender: smsCfg.senderName || "iKan",
          type: "transactional",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return c.json({ success: false, error: data?.message || `Brevo returned ${res.status}` }, res.status);
      return c.json({ success: true, message: `Test SMS sent to ${recipient}`, reference: data.reference });
    }

    if (channel === "whatsapp") {
      const config = await kv.get("brevo-config");
      const waCfg = config?.whatsapp || {};
      if (!waCfg.senderNumber) return c.json({ error: "WhatsApp sender number not configured" }, 400);
      if (!waCfg.testTemplateName) return c.json({ error: "WhatsApp test template not configured" }, 400);
      const res = await fetch(`${BREVO_BASE}/whatsapp/sendMessage`, {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          senderNumber: waCfg.senderNumber,
          recipientNumber: recipient,
          templateName: waCfg.testTemplateName,
          templateLanguage: "en",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return c.json({ success: false, error: data?.message || `Brevo returned ${res.status}` }, res.status);
      return c.json({ success: true, message: `Test WhatsApp sent to ${recipient}`, messageId: data.messageId });
    }

    return c.json({ error: `Unknown channel: ${channel}` }, 400);
  } catch (error) {
    console.log(`Error testing communication API: ${error}`);
    return c.json({ error: `Failed to test API: ${error}` }, 500);
  }
});

// ============================================================================
// EMAIL TEMPLATE CRUD ENDPOINTS
// ============================================================================

/**
 * List all notification templates — email, sms, whatsapp (Admin Only)
 */
app.get("/admin/communication/templates", requireAdmin, async (c) => {
  try {
    const templates = await kv.getByPrefix('notif-template:');
    // Also migrate any old email-template: entries
    const legacyTemplates = await kv.getByPrefix('email-template:');
    const all = [...(templates || [])];
    for (const lt of (legacyTemplates || [])) {
      if (!all.find((t: any) => t.id === lt.id)) {
        all.push({ ...lt, channel: lt.channel || 'email' });
      }
    }
    return c.json({ templates: all });
  } catch (error) {
    console.log(`Error fetching notification templates: ${error}`);
    return c.json({ error: `Failed to fetch templates: ${error}` }, 500);
  }
});

/**
 * Save/update a notification template (Admin Only)
 */
app.post("/admin/communication/templates", requireAdmin, async (c) => {
  try {
    const template = await c.req.json();
    if (!template.id) {
      template.id = `tpl_${Date.now()}`;
    }
    if (!template.channel) {
      template.channel = 'email';
    }
    template.updated_at = new Date().toISOString();
    if (!template.created_at) {
      template.created_at = template.updated_at;
    }
    const key = `notif-template:${template.id}`;
    await kv.set(key, template);
    // Clean up legacy key if it exists
    await kv.del(`email-template:${template.id}`);
    return c.json({ success: true, template });
  } catch (error) {
    console.log(`Error saving notification template: ${error}`);
    return c.json({ error: `Failed to save template: ${error}` }, 500);
  }
});

/**
 * Delete a notification template (Admin Only)
 */
app.delete("/admin/communication/templates/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`notif-template:${id}`);
    await kv.del(`email-template:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting notification template: ${error}`);
    return c.json({ error: `Failed to delete template: ${error}` }, 500);
  }
});

/**
 * List notification queue items (Admin Only)
 */
app.get("/admin/communication/queue", requireAdmin, async (c) => {
  try {
    const items = await kv.getByPrefix('notif-queue:');
    return c.json({ queue: items || [] });
  } catch (error) {
    console.log(`Error fetching notification queue: ${error}`);
    return c.json({ error: 'Failed to fetch queue' }, 500);
  }
});

/**
 * Queue a broadcast notification (Admin Only)
 */
app.post("/admin/communication/queue", requireAdmin, async (c) => {
  try {
    const item = await c.req.json();
    item.id = `bcast_${Date.now()}`;
    item.status = 'pending';
    item.scheduled_at = new Date().toISOString();
    const key = `notif-queue:${item.id}`;
    await kv.set(key, item);
    return c.json({ success: true, item });
  } catch (error) {
    console.log(`Error queuing broadcast: ${error}`);
    return c.json({ error: 'Failed to queue broadcast' }, 500);
  }
});

// ============================================================================
// PAYMENT GATEWAY CONFIGURATION ENDPOINTS
// ============================================================================

/**
 * Get payment gateway configurations (Admin Only)
 */
app.get("/admin/payment/config", requireAdmin, async (c) => {
  try {
    const configs = await kv.getByPrefix('payment-config:');
    // Mask sensitive keys
    const masked = configs.map((cfg: any) => ({
      ...cfg,
      api_key: cfg.api_key ? '***' + cfg.api_key.slice(-4) : null,
      secret_key: cfg.secret_key ? '***' + cfg.secret_key.slice(-4) : null
    }));
    return c.json({ configs: masked });
  } catch (error) {
    console.error('Error fetching payment configs:', error);
    return c.json({ error: 'Failed to fetch configs' }, 500);
  }
});

/**
 * Save payment gateway configuration (Admin Only)
 */
app.post("/admin/payment/config", requireAdmin, async (c) => {
  try {
    const { gateway, config } = await c.req.json();
    const key = `payment-config:${gateway}`;
    await kv.set(key, { ...config, updated_at: new Date().toISOString() });
    return c.json({ success: true, message: 'Payment gateway configured' });
  } catch (error) {
    console.error('Error saving payment config:', error);
    return c.json({ error: 'Failed to save configuration' }, 500);
  }
});

/**
 * Test payment gateway — creates a real Razorpay order (Admin Only)
 */
app.post("/admin/payment/test", requireAdmin, async (c) => {
  try {
    const { gateway, amount } = await c.req.json();
    if (gateway !== 'razorpay') return c.json({ error: `Gateway '${gateway}' not supported` }, 400);

    const config = await kv.get('payment-config:razorpay');
    if (!config?.enabled) return c.json({ error: 'Razorpay not enabled. Save configuration first.' }, 400);

    const razorpayKeyId = config.api_key;
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeyId || !razorpayKeySecret) return c.json({ error: 'API key or RAZORPAY_KEY_SECRET not configured.' }, 400);

    const amountInPaise = Math.round((amount || 100) * 100);
    const rRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`) },
      body: JSON.stringify({ amount: amountInPaise, currency: 'INR', receipt: `test_${Date.now()}`, notes: { type: 'test' } })
    });

    if (!rRes.ok) {
      const err = await rRes.text();
      console.error('Razorpay test order failed:', rRes.status, err);
      return c.json({ error: `Razorpay API error (${rRes.status}): ${err}`, hint: rRes.status === 401 ? 'Check API key/secret.' : undefined }, 400);
    }

    const order = await rRes.json();
    const txnId = `txn_test_${Date.now()}`;
    await kv.set(`transaction:${txnId}`, { id: txnId, gateway: 'razorpay', razorpay_order_id: order.id, amount: amount || 100, currency: 'INR', status: 'pending', type: 'test', description: `Test ₹${amount || 100}`, created_at: new Date().toISOString() });

    console.log(`✅ Razorpay test order: ${order.id} for ₹${amount || 100}`);
    return c.json({ success: true, order_id: order.id, amount: amount || 100, key_id: razorpayKeyId, message: `Order ${order.id} created for ₹${amount || 100}` });
  } catch (error) {
    console.error('Error testing gateway:', error);
    return c.json({ error: `Failed to test gateway: ${error}` }, 500);
  }
});

/**
 * Create a payment order for user-facing purchases (Authenticated)
 */
app.post("/payment/create-order", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { amount, currency = 'INR', description, metadata } = await c.req.json();
    if (!amount || amount <= 0) return c.json({ error: 'Invalid amount' }, 400);

    const config = await kv.get('payment-config:razorpay');
    if (!config?.enabled) return c.json({ error: 'Payment gateway not configured' }, 503);

    const razorpayKeyId = config.api_key;
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeyId || !razorpayKeySecret) return c.json({ error: 'Payment credentials unavailable' }, 503);

    const receipt = `order_${userId.slice(0, 8)}_${Date.now()}`;
    const rRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`) },
      body: JSON.stringify({ amount: Math.round(amount * 100), currency, receipt, notes: { user_id: userId, description: description || '', ...(metadata || {}) } })
    });

    if (!rRes.ok) { const e = await rRes.text(); console.error('Order creation failed:', e); return c.json({ error: 'Failed to create order' }, 500); }
    const order = await rRes.json();

    const txnId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await kv.set(`transaction:${txnId}`, { id: txnId, gateway: 'razorpay', razorpay_order_id: order.id, user_id: userId, amount, currency, status: 'pending', description: description || '', metadata: metadata || {}, created_at: new Date().toISOString() });

    return c.json({ order_id: order.id, amount: Math.round(amount * 100), currency, key_id: razorpayKeyId, transaction_id: txnId });
  } catch (error) { console.error('Error creating order:', error); return c.json({ error: `Order creation failed: ${error}` }, 500); }
});

/**
 * Verify payment after Razorpay checkout (Authenticated)
 */
app.post("/payment/verify", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transaction_id } = await c.req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return c.json({ error: 'Missing verification params' }, 400);

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeySecret) return c.json({ error: 'Verification unavailable' }, 503);

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(razorpayKeySecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${razorpay_order_id}|${razorpay_payment_id}`));
    const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (expected !== razorpay_signature) {
      if (transaction_id) { const t = await kv.get(`transaction:${transaction_id}`); if (t) await kv.set(`transaction:${transaction_id}`, { ...t, status: 'failed', failed_reason: 'signature_mismatch', updated_at: new Date().toISOString() }); }
      return c.json({ error: 'Signature mismatch' }, 400);
    }

    if (transaction_id) { const t = await kv.get(`transaction:${transaction_id}`); if (t) await kv.set(`transaction:${transaction_id}`, { ...t, status: 'success', razorpay_payment_id, verified_at: new Date().toISOString() }); }
    console.log(`✅ Payment verified: ${razorpay_payment_id}`);
    return c.json({ success: true, payment_id: razorpay_payment_id });
  } catch (error) { console.error('Verify error:', error); return c.json({ error: `Verification failed: ${error}` }, 500); }
});

/**
 * Check if user has purchased a specific program (Authenticated)
 */
app.get("/payment/check-purchase/:programId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const programId = c.req.param('programId');

    // Check payments by prefix for this user
    const payments = await kv.getByPrefix(`payment:${userId}`);
    const match = payments.find((p: any) => p.programId === programId && p.status === 'completed');
    
    if (match) {
      return c.json({ purchased: true, payment: match });
    }

    // Also check enrollment — if user is already enrolled, they've "purchased"
    const enrollment = await kv.get(`user_enrollment:${userId}:${programId}`);
    if (enrollment && enrollment.status !== 'cancelled') {
      return c.json({ purchased: true, enrollment });
    }

    return c.json({ purchased: false });
  } catch (error) {
    console.error('Check purchase error:', error);
    return c.json({ purchased: false, error: 'Check failed' });
  }
});

/**
 * Get payment transactions (Admin Only)
 */
app.get("/admin/payment/transactions", requireAdmin, async (c) => {
  try {
    const transactions = await kv.getByPrefix('transaction:');
    const sorted = transactions.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return c.json({ transactions: sorted });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return c.json({ error: 'Failed to fetch transactions' }, 500);
  }
});

// ============================================================================
// FILE UPLOAD ENDPOINT (Media Library)
// ============================================================================

// Upload file to Supabase Storage — admin only
app.post("/upload", requireAdmin, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'make-cc205da9-media';

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      console.log(`📦 Creating bucket: ${bucket}`);
      const { error: bucketError } = await supabase.storage.createBucket(bucket, {
        public: false,
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (bucketError) {
        console.error('Bucket creation error:', bucketError);
        return c.json({ error: 'Failed to create storage bucket' }, 500);
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Generate signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds

    if (!signedUrlData) {
      console.error('Failed to generate signed URL');
      return c.json({ error: 'Failed to generate file URL' }, 500);
    }

    // Store file metadata in KV for media library
    const fileMetadata = {
      id: `${timestamp}-${randomStr}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath,
      bucket,
      url: signedUrlData.signedUrl,
      uploadedAt: new Date().toISOString()
    };

    await kv.set(`media:${fileMetadata.id}`, fileMetadata);

    console.log(`📤 File uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    
    return c.json({
      success: true,
      url: signedUrlData.signedUrl,
      metadata: fileMetadata
    });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Upload image - Alias for /upload endpoint — admin only
app.post("/upload-image", requireAdmin, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'make-cc205da9-images';

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate image type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400);
    }

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      console.log(`📦 Creating image bucket: ${bucket}`);
      const { error: bucketError } = await supabase.storage.createBucket(bucket, {
        public: false,
        fileSizeLimit: 10485760 // 10MB for images
      });
      
      if (bucketError) {
        console.error('Bucket creation error:', bucketError);
        return c.json({ error: 'Failed to create storage bucket' }, 500);
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `assessments/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Generate signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds

    if (!signedUrlData) {
      console.error('Failed to generate signed URL');
      return c.json({ error: 'Failed to generate file URL' }, 500);
    }

    console.log(`🖼️  Image uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    
    return c.json({
      success: true,
      url: signedUrlData.signedUrl,
      fileName: file.name,
      fileSize: file.size,
      filePath
    });
  } catch (error) {
    console.error('Image upload endpoint error:', error);
    return c.json({ error: 'Image upload failed' }, 500);
  }
});

// Get all media files (for media library) — admin only
app.get("/media", requireAdmin, async (c) => {
  try {
    const files = await kv.getByPrefix('media:');
    
    // Sort by upload date (newest first)
    const sorted = files.sort((a, b) => 
      new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
    );
    
    console.log(`📁 Fetched ${sorted.length} media files`);
    return c.json({ files: sorted });
  } catch (error) {
    console.error('Get media error:', error);
    return c.json({ error: 'Failed to retrieve media files' }, 500);
  }
});

// Delete media file — admin only
app.delete("/media/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const fileMetadata = await kv.get(`media:${id}`);
    
    if (!fileMetadata) {
      return c.json({ error: 'File not found' }, 404);
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from(fileMetadata.bucket)
      .remove([fileMetadata.filePath]);

    if (error) {
      console.error('Storage deletion error:', error);
    }

    // Delete metadata from KV
    await kv.del(`media:${id}`);

    console.log(`🗑️ Deleted media file: ${fileMetadata.fileName}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

// Rename / update media file metadata — admin only
app.patch("/media/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const fileMetadata = await kv.get(`media:${id}`);
    
    if (!fileMetadata) {
      return c.json({ error: 'File not found' }, 404);
    }

    // Only allow updating fileName (rename) and any future metadata fields
    const updated = {
      ...fileMetadata,
      fileName: body.fileName ?? fileMetadata.fileName,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`media:${id}`, updated);

    console.log(`✏️ Renamed media file: ${fileMetadata.fileName} → ${updated.fileName}`);
    return c.json({ success: true, file: updated });
  } catch (error) {
    console.error('Rename media error:', error);
    return c.json({ error: 'Failed to rename file' }, 500);
  }
});

// ============================================================================
// SETTINGS ENDPOINTS
// ============================================================================

// Get site settings
app.get("/settings", async (c) => {
  try {
    const settings = await kv.get('settings:site');
    console.log('⚙️ Fetched site settings');
    return c.json({ settings: settings || {} });
  } catch (error) {
    console.error('Get settings error:', error);
    return c.json({ error: 'Failed to retrieve settings' }, 500);
  }
});

// Update site settings — admin only
app.put("/settings", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    await kv.set('settings:site', body);
    console.log('⚙️ Updated site settings');
    return c.json({ success: true, settings: body });
  } catch (error) {
    console.error('Update settings error:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// ========================================
// CATEGORY MANAGEMENT ENDPOINTS
// ========================================

app.get("/categories", async (c) => {
  try {
    const categories = await kv.getByPrefix('category:');
    const validCategories = categories.filter((cat: any) => cat && cat.id);
    console.log(`✅ Returning ${validCategories.length} categories`);
    return c.json({ categories: validCategories });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    return c.json({ error: 'Failed to retrieve categories', categories: [] }, 500);
  }
});

app.post("/categories", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const categoryData = await c.req.json();
    const categoryId = categoryData.id || `cat-${Date.now()}`;
    
    const newCategory = {
      ...categoryData,
      id: categoryId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`category:${categoryId}`, newCategory);
    console.log(`✅ Category created: ${categoryId}`);
    return c.json({ category: newCategory });
  } catch (error) {
    console.error('Create category error:', error);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

app.put("/categories/:categoryId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const categoryId = c.req.param('categoryId');
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const updates = await c.req.json();
    const existingCategory = await kv.get(`category:${categoryId}`);
    
    if (!existingCategory) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    const updatedCategory = {
      ...existingCategory,
      ...updates,
      id: categoryId,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`category:${categoryId}`, updatedCategory);
    console.log(`✅ Category updated: ${categoryId}`);
    return c.json({ category: updatedCategory });
  } catch (error) {
    console.error('Update category error:', error);
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

app.delete("/categories/:categoryId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const categoryId = c.req.param('categoryId');
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const existingCategory = await kv.get(`category:${categoryId}`);
    if (!existingCategory) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    await kv.del(`category:${categoryId}`);
    console.log(`✅ Category deleted: ${categoryId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

// Bulk sync metadata items (admin-initiated, idempotent – skips items whose slug+type already exist)
app.post("/categories/sync", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const { items, updateExisting } = await c.req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return c.json({ error: 'items array is required' }, 400);
    }

    // Load existing — build a map by type::slug → existing entry
    const existing = await kv.getByPrefix('category:');
    const existingMap = new Map<string, any>();
    for (const e of existing) {
      if (e?.type && e?.slug) {
        existingMap.set(`${e.type}::${e.slug}`, e);
      }
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    for (const item of items) {
      const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const key = `${item.type}::${slug}`;
      const existingEntry = existingMap.get(key);

      if (existingEntry) {
        // If updateExisting flag is set, update icon/color/description on existing items
        if (updateExisting) {
          const needsUpdate =
            (item.icon && existingEntry.icon !== item.icon) ||
            (item.color && existingEntry.color !== item.color) ||
            (item.description && !existingEntry.description && item.description);

          if (needsUpdate) {
            const merged = {
              ...existingEntry,
              icon: item.icon || existingEntry.icon || 'tag',
              color: item.color || existingEntry.color || '#2A2A2A',
              description: item.description || existingEntry.description || '',
              updated_at: now,
            };
            await kv.set(`category:${existingEntry.id}`, merged);
            updated++;
            continue;
          }
        }
        skipped++;
        continue;
      }

      const id = item.id || `cat-${item.type}-${slug}`;
      const entry = {
        id,
        name: item.name,
        slug,
        type: item.type,
        icon: item.icon || 'tag',
        color: item.color || '#2A2A2A',
        description: item.description || '',
        created_at: now,
        updated_at: now,
      };
      await kv.set(`category:${id}`, entry);
      existingMap.set(key, entry);
      created++;
    }

    console.log(`✅ Metadata sync complete: ${created} created, ${updated} updated, ${skipped} unchanged`);
    return c.json({ success: true, created, updated, skipped, total: items.length });
  } catch (error) {
    console.error('❌ Metadata sync error:', error);
    return c.json({ error: 'Failed to sync metadata' }, 500);
  }
});

// ========================================
// ACTIVITY LOG & ANALYTICS ENDPOINTS
// ========================================

// --- Constants for activity log retention ---
const USER_ACTIVITY_CAP = 200;       // Max events per user rolling log

// Log activity (login, resource view, etc.)
app.post("/analytics/activity", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const { type, resourceId, metadata } = await c.req.json();
    
    if (!type) {
      return c.json({ error: 'Activity type is required' }, 400);
    }

    const now = new Date();
    const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const activity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: user.id,
      type, // 'login', 'resource_view', 'program_start', etc.
      resourceId: resourceId || null,
      metadata: metadata || {},
      timestamp: now.toISOString()
    };

    // 1. Append to per-user rolling log (capped array)
    const userKey = `user_activity:${user.id}`;
    const userLog: any[] = (await kv.get(userKey)) || [];
    userLog.push(activity);
    // Trim to keep only the most recent entries
    const trimmed = userLog.length > USER_ACTIVITY_CAP
      ? userLog.slice(userLog.length - USER_ACTIVITY_CAP)
      : userLog;
    await kv.set(userKey, trimmed);

    // 2. Append to daily global bucket (for admin analytics)
    const dailyKey = `activity:daily:${dateKey}`;
    const dailyLog: any[] = (await kv.get(dailyKey)) || [];
    dailyLog.push(activity);
    await kv.set(dailyKey, dailyLog);

    console.log(`Activity logged: ${type} for user ${user.id}`);
    return c.json({ success: true, activity });
  } catch (error) {
    console.error('Log activity error:', error);
    return c.json({ error: 'Failed to log activity' }, 500);
  }
});

// Get aggregated activity analytics
app.get("/analytics/aggregated", requireAdmin, async (c) => {
  try {
    // Fetch daily activity buckets (new format: activity:daily:YYYY-MM-DD = array)
    const dailyBuckets = await kv.getByPrefix('activity:daily:');
    
    // Initialize counters
    const stats = {
      totalLogins: 0,
      totalResourceViews: 0,
      activeUsers24h: new Set<string>(),
      activeUsers7d: new Set<string>(),
      resourceViews: {} as Record<string, number>,
      dailyActivity: {} as Record<string, number>
    };

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const bucket of dailyBuckets) {
      // Each bucket is an array of activity objects
      const activities = Array.isArray(bucket) ? bucket : [bucket];
      for (const act of activities) {
        if (!act || !act.timestamp) continue;
        
        const date = new Date(act.timestamp);
        const dateStr = date.toISOString().split('T')[0];

        // Daily Activity Count
        stats.dailyActivity[dateStr] = (stats.dailyActivity[dateStr] || 0) + 1;

        // Active Users
        if (date > oneDayAgo && act.userId) stats.activeUsers24h.add(act.userId);
        if (date > sevenDaysAgo && act.userId) stats.activeUsers7d.add(act.userId);

        // Type-specific stats
        if (act.type === 'login') {
          stats.totalLogins++;
        } else if (act.type === 'resource_view') {
          stats.totalResourceViews++;
          if (act.resourceId) {
            stats.resourceViews[act.resourceId] = (stats.resourceViews[act.resourceId] || 0) + 1;
          }
        }
      }
    }

    // Sort resource views
    const topResources = Object.entries(stats.resourceViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id, views]) => ({ id, views }));

    // Sort user growth/activity chart
    const activityChart = Object.entries(stats.dailyActivity)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, count]) => ({ date, count }));

    return c.json({
      summary: {
        activeUsers24h: stats.activeUsers24h.size,
        activeUsers7d: stats.activeUsers7d.size,
        totalLogins: stats.totalLogins,
        totalResourceViews: stats.totalResourceViews
      },
      topResources,
      activityChart
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    return c.json({ error: 'Failed to retrieve analytics' }, 500);
  }
});

// ========================================
// USER ACTIVITY & GOALS ENDPOINTS
// ========================================

// Get weekly goals progress
app.get("/user-activity/goals", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userId = user.id;
    
    // Calculate start of week (Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekStr = startOfWeek.toISOString();

    // 1. Mood Logs Progress
    // We can query journal entries for this week
    const journalEntries = await kv.getByPrefix(`journal_by_user:${userId}`);
    const weeklyMoodLogs = journalEntries.filter((entry: any) => 
      entry.date && new Date(entry.date) >= startOfWeek
    ).length;

    // 2. Assessments Progress
    // Query assessment responses for this week
    const assessmentResponses = await kv.getByPrefix(`assessment_response_by_user:${userId}`);
    const weeklyAssessments = assessmentResponses.filter((resp: any) => 
      resp.started_at && new Date(resp.started_at) >= startOfWeek
    ).length;

    // 3. Articles/Resources Read Progress
    // Query activity logs for 'resource_view' or 'read' type in this week
    // Note: This might be heavy if we scan all activities. 
    // Optimization: We stored user specific activity in `user_activity:${userId}:${timestamp}`
    // But getByPrefix might return a lot. Let's try to get recent ones.
    // Ideally, we should index this better, but for KV store, we'll scan recent keys or 
    // use the specific `activity:user:${userId}:reads` list if we implemented it (we did in mark-read endpoint).
    
    let weeklyResourcesRead = 0;
    
    // Read from the capped per-user activity array
    const userActivities: any[] = (await kv.get(`user_activity:${userId}`)) || [];
    weeklyResourcesRead = userActivities.filter((act: any) => 
      (act.type === 'resource_view' || act.type === 'read') && 
      act.timestamp && new Date(act.timestamp) >= startOfWeek
    ).length;

    return c.json({
      goals: [
        { label: 'Mood Logs', current: weeklyMoodLogs, total: 7, color: '#EF4444' },     // Daily
        { label: 'Assessments', current: weeklyAssessments, total: 1, color: '#8B5CF6' }, // Weekly check-in
        { label: 'Articles', current: weeklyResourcesRead, total: 5, color: '#10B981' }   // Learning goal
      ],
      weekStart: startOfWeekStr
    });
  } catch (error) {
    console.error('Get weekly goals error:', error);
    return c.json({ error: 'Failed to retrieve goals' }, 500);
  }
});

// Get recently viewed resources
app.get("/user-activity/history", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const limit = parseInt(c.req.query('limit') || '5');
    
    // Get user activity from capped rolling array
    const activities: any[] = (await kv.get(`user_activity:${user.id}`)) || [];
    
    // Filter for resource views and sort by timestamp descending
    const resourceViews = activities
      .filter((act: any) => act.type === 'resource_view' && act.resourceId)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Deduplicate by resourceId
    const seenResources = new Set();
    const uniqueViews = [];
    
    for (const view of resourceViews) {
      if (!seenResources.has(view.resourceId)) {
        seenResources.add(view.resourceId);
        uniqueViews.push(view);
        if (uniqueViews.length >= limit) break;
      }
    }

    // Hydrate with resource details
    // We need to fetch the actual resource titles/images
    const hydratedHistory = [];
    for (const view of uniqueViews) {
      // Try library prefix first, then legacy
      let resource = await kv.get(`library:resource:${view.resourceId}`);
      if (!resource) resource = await kv.get(`resource:${view.resourceId}`);
      
      // If found, add to list
      if (resource) {
        hydratedHistory.push({
          id: resource.id,
          title: resource.title,
          category: resource.category,
          image: resource.thumbnail || resource.image || resource.heroImage,
          viewedAt: view.timestamp
        });
      }
    }

    return c.json({ history: hydratedHistory });
  } catch (error) {
    console.error('Get activity history error:', error);
    return c.json({ error: 'Failed to retrieve history' }, 500);
  }
});

// Get comprehensive activity feed for dashboard (all activity types)
app.get("/user-activity/feed", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userId = user.id;
    const limit = parseInt(c.req.query('limit') || '10');

    const feed: any[] = [];

    // Pre-fetch assessment & equip definitions for name resolution
    const assessmentDefs = await kv.getByPrefix('assessment_def:');
    const assessmentNameMap = new Map<string, string>();
    const assessmentMaxScoreMap = new Map<string, number>();
    for (const def of (assessmentDefs || [])) {
      if (def && (def.id || def.slug)) {
        const title = def.title || def.name || '';
        if (title) {
          assessmentNameMap.set(def.id, title);
          if (def.slug) assessmentNameMap.set(def.slug, title);
        }
        // Resolve max score: prefer computing from questions, fall back to scoring ranges
        let computedMax = 0;
        if (def.questions && Array.isArray(def.questions) && def.questions.length > 0) {
          for (const q of def.questions) {
            if (q.options && Array.isArray(q.options)) {
              let maxVal = 0;
              for (const opt of q.options) {
                const v = typeof opt === 'object' ? (opt.value ?? opt.score ?? 0) : 0;
                if (typeof v === 'number' && v > maxVal) maxVal = v;
              }
              computedMax += maxVal;
            }
          }
        }
        if (computedMax === 0 && def.scoring?.ranges?.length > 0) {
          const maxFromRanges = def.scoring.ranges[def.scoring.ranges.length - 1]?.max;
          if (maxFromRanges) computedMax = maxFromRanges;
        }
        if (computedMax > 0) {
          assessmentMaxScoreMap.set(def.id, computedMax);
          if (def.slug) assessmentMaxScoreMap.set(def.slug, computedMax);
        }
      }
    }
    const equipDefs = await kv.getByPrefix('equip:');
    const equipNameMap = new Map<string, string>();
    for (const def of (equipDefs || [])) {
      if (def && def.id) {
        const title = def.title || def.name || '';
        if (title) equipNameMap.set(def.id, title);
      }
    }

    const resolveAssessmentName = (r: any): string => {
      const id = r.assessment_id || r.assessmentId || '';
      if (assessmentNameMap.has(id)) return assessmentNameMap.get(id)!;
      const stored = r.assessment_name || r.assessmentName || r.title || '';
      if (stored && /[a-zA-Z]/.test(stored) && !stored.startsWith('asm_') && !stored.startsWith('checkin_') && stored.includes(' ')) return stored;
      return id.replace(/^asm_\d+_/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (ch: string) => ch.toUpperCase()) || 'Assessment';
    };

    const resolveEquipName = (equipId: string, fallback?: string): string => {
      if (equipNameMap.has(equipId)) return equipNameMap.get(equipId)!;
      if (fallback && fallback.includes(' ') && !fallback.startsWith('equip_')) return fallback;
      return equipId.replace(/[-_]/g, ' ').replace(/\b\w/g, (ch: string) => ch.toUpperCase()) || 'Program';
    };

    // 1. Activity log entries (resource views, logins, etc.)
    const activities: any[] = (await kv.get(`user_activity:${userId}`)) || [];
    for (const act of activities) {
      feed.push({
        type: act.type || 'activity',
        label: act.type === 'resource_view' ? 'Read an article' : act.type === 'login' ? 'Logged in' : act.type || 'Activity',
        detail: act.resourceTitle || act.metadata?.title || '',
        timestamp: act.timestamp,
        route: act.type === 'resource_view' && act.resourceId ? `/resource-detail?id=${act.resourceId}` : '/dashboard',
      });
    }

    // 2. Assessment completions
    const assessmentResults = await kv.getByPrefix(`assessment_result:${userId}:`);
    const seenAssessmentIds = new Set<string>();
    for (const r of assessmentResults) {
      if (!r || !r.id || seenAssessmentIds.has(r.id)) continue;
      seenAssessmentIds.add(r.id);
      if (r.completed_at || r.status === 'completed') {
        const assessmentId = r.assessment_id || r.assessmentId || '';
        if (assessmentId.startsWith('checkin_') || assessmentId.startsWith('checkin-')) continue;
        const resolvedName = resolveAssessmentName(r);
        const resolvedMax = r.max_score || r.maxScore || assessmentMaxScoreMap.get(assessmentId) || null;
        const pctStr = (r.score !== undefined && resolvedMax) ? `${Math.round((r.score / resolvedMax) * 100)}% (${r.score}/${resolvedMax})` : '';
        feed.push({
          type: 'assessment_completed',
          label: resolvedName,
          detail: pctStr,
          timestamp: r.completed_at || r.created_at,
          route: '/assessment',
          assessmentId,
          assessmentName: resolvedName,
          score: r.score,
          maxScore: resolvedMax,
        });
      }
    }

    // 3. Journal / mood entries
    const journals = await kv.getByPrefix(`journal:${userId}:`);
    for (const j of journals) {
      if (!j) continue;
      feed.push({
        type: 'mood_logged',
        label: 'Logged mood',
        detail: j.mood ? `Feeling ${j.mood}` : 'Mood check-in',
        timestamp: j.date || j.created_at,
        route: '/mood-journal',
      });
    }

    // 4. Program progress (day completions)
    const progressEntries = await kv.getByPrefix(`progress:${userId}:`);
    for (const p of progressEntries) {
      if (!p || !p.day_completed) continue;
      const eTitle = resolveEquipName(p.equip_id || '', p.equip_title);
      feed.push({
        type: 'program_day_completed',
        label: `Completed Day ${p.day_number || '?'}`,
        detail: eTitle,
        timestamp: p.completed_at || p.updated_at,
        route: p.equip_id ? `/equip-program-flow?id=${p.equip_id}` : '/equip',
        equipName: eTitle,
      });
    }

    // 5. Enrollments
    const enrollments = await kv.getByPrefix(`enrollment:${userId}:`);
    for (const e of enrollments) {
      if (!e) continue;
      const eTitle = resolveEquipName(e.equip_id || '', e.equip_title);
      feed.push({
        type: e.status === 'completed' ? 'program_completed' : 'enrolled',
        label: e.status === 'completed' ? `Completed ${eTitle}` : `Enrolled in ${eTitle}`,
        detail: eTitle,
        timestamp: e.status === 'completed' ? (e.completed_at || e.updated_at) : e.enrolled_at,
        route: e.equip_id ? `/equip-program-flow?id=${e.equip_id}` : '/equip',
        equipName: eTitle,
      });
    }

    // Sort by timestamp descending, deduplicate, and limit
    feed.sort((a, b) => {
      const tsA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tsB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tsB - tsA;
    });

    return c.json({ feed: feed.slice(0, limit) });
  } catch (error) {
    console.error('Get activity feed error:', error);
    return c.json({ error: 'Failed to retrieve activity feed' }, 500);
  }
});

// ========================================
// ACTIVITY & ANALYTICS PURGE ENDPOINTS
// ========================================

/**
 * Purge legacy per-event activity/analytics keys (Admin Only)
 * Migrates data from old per-event keys into the new capped-array format,
 * then deletes the orphaned keys.
 *
 * Old patterns being cleaned:
 *   user_activity:{userId}:{timestamp}  → merged into user_activity:{userId} (array)
 *   activity:{timestamp}:{userId}       → merged into activity:daily:{date} (array)
 *   analytics:{timestamp}-{random}      → merged into analytics:daily:{date} (array)
 */
app.post("/admin/purge-activity-keys", requireAdmin, async (c) => {
  try {
    const { dryRun = true } = await c.req.json().catch(() => ({ dryRun: true }));

    // Direct DB access to get keys (kv.getByPrefix only returns values)
    const { data: allKeys, error: qErr } = await supabase
      .from('kv_store_cc205da9')
      .select('key, value')
      .or(
        'key.like.user_activity:%:%,' +       // old per-event user activity
        'key.like.activity:1%,' +               // old per-event global activity (starts with timestamp)
        'key.like.analytics:1%'                 // old per-event analytics (starts with timestamp)
      )
      .limit(5000);

    if (qErr) {
      console.log(`Purge query error: ${qErr.message}`);
      return c.json({ error: `DB query failed: ${qErr.message}` }, 500);
    }

    // Filter out the new format keys (daily buckets, counters, resource indices)
    const legacyKeys = (allKeys || []).filter((row: any) => {
      const k = row.key;
      // Keep new-format keys: activity:daily:*, analytics:daily:*, analytics:counter:*, analytics:resource:*
      if (k.startsWith('activity:daily:')) return false;
      if (k.startsWith('analytics:daily:')) return false;
      if (k.startsWith('analytics:counter:')) return false;
      if (k.startsWith('analytics:resource:')) return false;
      // user_activity:{userId} (no second colon after userId) is the new array key — keep it
      // user_activity:{userId}:{timestamp} has 3+ colon-segments — purge it
      if (k.startsWith('user_activity:')) {
        const parts = k.split(':');
        return parts.length >= 3; // old format has userId:timestamp
      }
      return true;
    });

    // --- Migration: merge old data into new buckets before deleting ---
    const userActivityMerge: Record<string, any[]> = {};
    const dailyActivityMerge: Record<string, any[]> = {};
    const dailyAnalyticsMerge: Record<string, any[]> = {};

    for (const row of legacyKeys) {
      const k = row.key;
      const v = row.value;
      if (!v) continue;

      if (k.startsWith('user_activity:')) {
        const parts = k.split(':');
        const userId = parts[1];
        if (!userActivityMerge[userId]) userActivityMerge[userId] = [];
        userActivityMerge[userId].push(v);
      } else if (k.startsWith('activity:')) {
        const dateStr = v.timestamp ? new Date(v.timestamp).toISOString().split('T')[0] : 'unknown';
        if (!dailyActivityMerge[dateStr]) dailyActivityMerge[dateStr] = [];
        dailyActivityMerge[dateStr].push(v);
      } else if (k.startsWith('analytics:')) {
        const dateStr = v.tracked_at ? new Date(v.tracked_at).toISOString().split('T')[0] : 'unknown';
        if (!dailyAnalyticsMerge[dateStr]) dailyAnalyticsMerge[dateStr] = [];
        dailyAnalyticsMerge[dateStr].push(v);
      }
    }

    const keysToDelete = legacyKeys.map((r: any) => r.key);

    if (dryRun) {
      return c.json({
        dryRun: true,
        legacyKeysFound: keysToDelete.length,
        breakdown: {
          userActivity: Object.keys(userActivityMerge).length + ' users',
          dailyActivity: Object.keys(dailyActivityMerge).length + ' days',
          dailyAnalytics: Object.keys(dailyAnalyticsMerge).length + ' days',
        },
        sampleKeys: keysToDelete.slice(0, 20),
        message: 'Set dryRun: false to execute migration + deletion'
      });
    }

    // Merge user activity into capped arrays
    for (const [userId, events] of Object.entries(userActivityMerge)) {
      const existingKey = `user_activity:${userId}`;
      const existing: any[] = (await kv.get(existingKey)) || [];
      const merged = [...existing, ...events]
        .sort((a: any, b: any) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime())
        .slice(-USER_ACTIVITY_CAP);
      await kv.set(existingKey, merged);
    }

    // Merge global activity into daily buckets
    for (const [dateStr, events] of Object.entries(dailyActivityMerge)) {
      if (dateStr === 'unknown') continue;
      const dailyKey = `activity:daily:${dateStr}`;
      const existing: any[] = (await kv.get(dailyKey)) || [];
      await kv.set(dailyKey, [...existing, ...events]);
    }

    // Merge analytics into daily buckets
    for (const [dateStr, events] of Object.entries(dailyAnalyticsMerge)) {
      if (dateStr === 'unknown') continue;
      const dailyKey = `analytics:daily:${dateStr}`;
      const existing: any[] = (await kv.get(dailyKey)) || [];
      await kv.set(dailyKey, [...existing, ...events]);
    }

    // Delete old keys in batches of 100
    for (let i = 0; i < keysToDelete.length; i += 100) {
      const batch = keysToDelete.slice(i, i + 100);
      await kv.mdel(batch);
    }

    console.log(`Purge complete: migrated + deleted ${keysToDelete.length} legacy keys`);
    return c.json({
      success: true,
      deleted: keysToDelete.length,
      merged: {
        userActivityUsers: Object.keys(userActivityMerge).length,
        dailyActivityDays: Object.keys(dailyActivityMerge).length,
        dailyAnalyticsDays: Object.keys(dailyAnalyticsMerge).length,
      }
    });
  } catch (error) {
    console.log(`Purge error: ${error}`);
    return c.json({ error: `Purge failed: ${error}` }, 500);
  }
});

// ========================================
// HEALTH DATA (Legacy — see health-connect-routes.ts for new endpoints)
// ========================================

// Store health data
app.post("/health-data", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const data = await c.req.json();
    
    // Validate basic structure
    if (!data || typeof data !== 'object') {
      return c.json({ error: 'Invalid data format' }, 400);
    }

    const timestamp = new Date().toISOString();
    const dateKey = timestamp.split('T')[0]; // YYYY-MM-DD

    // Store daily snapshot
    await kv.set(`health:${user.id}:${dateKey}`, {
      ...data,
      updated_at: timestamp
    });

    // Store latest snapshot for quick access
    await kv.set(`health:${user.id}:latest`, {
      ...data,
      updated_at: timestamp
    });

    console.log(`💪 Health data updated for user ${user.id}`);
    return c.json({ success: true, message: 'Health data synced' });
  } catch (error) {
    console.error('Save health data error:', error);
    return c.json({ error: 'Failed to save health data' }, 500);
  }
});

// Get health data
app.get("/health-data", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const date = c.req.query('date');
    
    if (date) {
        // Get specific date
        const data = await kv.get(`health:${user.id}:${date}`);
        return c.json({ data: data || null });
    } else {
        // Get latest
        const data = await kv.get(`health:${user.id}:latest`);
        return c.json({ data: data || null });
    }
  } catch (error) {
    console.error('Get health data error:', error);
    return c.json({ error: 'Failed to retrieve health data' }, 500);
  }
});

// ========================================
// MOOD TYPE MANAGEMENT ENDPOINTS
// ========================================

app.get("/moods", async (c) => {
  try {
    const moods = await kv.getByPrefix('mood:');
    const validMoods = moods.filter((mood: any) => mood && mood.id);
    
    if (validMoods.length > 0) {
      console.log(`Returning ${validMoods.length} mood types`);
      return c.json({ moods: validMoods });
    }

    // No moods in KV — the /scales/moods lazy-init handles seeding.
    // Return empty here; frontend loadCustomScales() hits /scales/moods for init.
    console.log('No mood types found in KV, returning empty');
    return c.json({ moods: [] });
  } catch (error) {
    console.error('Get moods error:', error);
    return c.json({ error: 'Failed to retrieve mood types', moods: [] }, 500);
  }
});

app.post("/moods", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const moodData = await c.req.json();
    const moodId = moodData.id || `mood-${Date.now()}`;
    
    const newMood = {
      ...moodData,
      id: moodId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`mood:${moodId}`, newMood);
    console.log(`✅ Mood type created: ${moodId}`);
    return c.json({ mood: newMood });
  } catch (error) {
    console.error('Create mood error:', error);
    return c.json({ error: 'Failed to create mood type' }, 500);
  }
});

app.put("/moods/:moodId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const moodId = c.req.param('moodId');
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const updates = await c.req.json();
    const existingMood = await kv.get(`mood:${moodId}`);
    
    if (!existingMood) {
      return c.json({ error: 'Mood type not found' }, 404);
    }
    
    const updatedMood = {
      ...existingMood,
      ...updates,
      id: moodId,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`mood:${moodId}`, updatedMood);
    console.log(`✅ Mood type updated: ${moodId}`);
    return c.json({ mood: updatedMood });
  } catch (error) {
    console.error('Update mood error:', error);
    return c.json({ error: 'Failed to update mood type' }, 500);
  }
});

app.delete("/moods/:moodId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const moodId = c.req.param('moodId');
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const existingMood = await kv.get(`mood:${moodId}`);
    if (!existingMood) {
      return c.json({ error: 'Mood type not found' }, 404);
    }
    
    await kv.del(`mood:${moodId}`);
    console.log(`✅ Mood type deleted: ${moodId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete mood error:', error);
    return c.json({ error: 'Failed to delete mood type' }, 500);
  }
});

// ========================================
// WEEK/DAILY STRUCTURE MANAGEMENT ENDPOINTS
// ========================================

app.get("/equip-programs/:programId/weeks", async (c) => {
  try {
    const programId = c.req.param('programId');
    const weeks = await kv.getByPrefix(`week:${programId}:`);
    const validWeeks = weeks.filter((week: any) => week && week.id);
    
    for (const week of validWeeks) {
      const dailyContent = await kv.getByPrefix(`day:${week.id}:`);
      week.daily_content = dailyContent.filter((day: any) => day && day.id);
    }
    
    console.log(`✅ Returning ${validWeeks.length} weeks for program ${programId}`);
    return c.json({ weeks: validWeeks });
  } catch (error) {
    console.error('❌ Get weeks error:', error);
    return c.json({ error: 'Failed to retrieve weeks', weeks: [] }, 500);
  }
});

app.post("/equip-programs/:programId/weeks", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const programId = c.req.param('programId');
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const weekData = await c.req.json();
    const weekId = `week-${Date.now()}`;
    
    const newWeek = {
      ...weekData,
      id: weekId,
      program_id: programId,
      daily_content: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`week:${programId}:${weekId}`, newWeek);
    console.log(`✅ Week created: ${weekId} for program ${programId}`);
    return c.json({ week: newWeek });
  } catch (error) {
    console.error('Create week error:', error);
    return c.json({ error: 'Failed to create week' }, 500);
  }
});

app.put("/weeks/:weekId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const weekId = c.req.param('weekId');
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const updates = await c.req.json();
    const allWeeks = await kv.getByPrefix('week:');
    const existingWeek = allWeeks.find((w: any) => w && w.id === weekId);
    
    if (!existingWeek) {
      return c.json({ error: 'Week not found' }, 404);
    }
    
    const updatedWeek = {
      ...existingWeek,
      ...updates,
      id: weekId,
      program_id: existingWeek.program_id,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`week:${existingWeek.program_id}:${weekId}`, updatedWeek);
    console.log(`✅ Week updated: ${weekId}`);
    return c.json({ week: updatedWeek });
  } catch (error) {
    console.error('Update week error:', error);
    return c.json({ error: 'Failed to update week' }, 500);
  }
});

app.delete("/weeks/:weekId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const weekId = c.req.param('weekId');
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const allWeeks = await kv.getByPrefix('week:');
    const existingWeek = allWeeks.find((w: any) => w && w.id === weekId);
    
    if (!existingWeek) {
      return c.json({ error: 'Week not found' }, 404);
    }
    
    const dailyContent = await kv.getByPrefix(`day:${weekId}:`);
    for (const day of dailyContent) {
      if (day && day.id) {
        await kv.del(`day:${weekId}:${day.id}`);
      }
    }
    
    await kv.del(`week:${existingWeek.program_id}:${weekId}`);
    console.log(`✅ Week and its daily content deleted: ${weekId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete week error:', error);
    return c.json({ error: 'Failed to delete week' }, 500);
  }
});

app.post("/weeks/:weekId/days", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const weekId = c.req.param('weekId');
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const dayData = await c.req.json();
    const dayId = `day-${Date.now()}`;
    
    const newDay = {
      ...dayData,
      id: dayId,
      week_id: weekId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`day:${weekId}:${dayId}`, newDay);
    console.log(`✅ Daily content created: ${dayId} for week ${weekId}`);
    return c.json({ day: newDay });
  } catch (error) {
    console.error('Create daily content error:', error);
    return c.json({ error: 'Failed to create daily content' }, 500);
  }
});

app.put("/days/:dayId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const dayId = c.req.param('dayId');
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const updates = await c.req.json();
    const allDays = await kv.getByPrefix('day:');
    const existingDay = allDays.find((d: any) => d && d.id === dayId);
    
    if (!existingDay) {
      return c.json({ error: 'Daily content not found' }, 404);
    }
    
    const updatedDay = {
      ...existingDay,
      ...updates,
      id: dayId,
      week_id: existingDay.week_id,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`day:${existingDay.week_id}:${dayId}`, updatedDay);
    console.log(`✅ Daily content updated: ${dayId}`);
    return c.json({ day: updatedDay });
  } catch (error) {
    console.error('Update daily content error:', error);
    return c.json({ error: 'Failed to update daily content' }, 500);
  }
});

app.delete("/days/:dayId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const dayId = c.req.param('dayId');
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const allDays = await kv.getByPrefix('day:');
    const existingDay = allDays.find((d: any) => d && d.id === dayId);
    
    if (!existingDay) {
      return c.json({ error: 'Daily content not found' }, 404);
    }
    
    await kv.del(`day:${existingDay.week_id}:${dayId}`);
    console.log(`✅ Daily content deleted: ${dayId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete daily content error:', error);
    return c.json({ error: 'Failed to delete daily content' }, 500);
  }
});

// =====================================================
// CATEGORY MANAGEMENT ENDPOINTS
// =====================================================

// Get all categories
app.get('/categories', async (c) => {
  try {
    const categories = await kv.getByPrefix('category:');
    const validCategories = categories.filter((cat: any) => cat && cat.id);
    console.log(`✅ Returning ${validCategories.length} categories`);
    return c.json(validCategories);
  } catch (error) {
    console.error('Get categories error:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// Get single category
app.get('/categories/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const category = await kv.get(`category:${id}`);
    
    if (!category) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    return c.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    return c.json({ error: 'Failed to fetch category' }, 500);
  }
});

// Create category (admin only)
app.post('/categories', requireAdmin, async (c) => {
  try {
    const data = await c.req.json();
    const id = data.id || `cat-${Date.now()}`;
    
    const category = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`category:${id}`, category);
    console.log(`✅ Category created: ${id}`);
    return c.json(category, 201);
  } catch (error) {
    console.error('Create category error:', error);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

// Update category (admin only)
app.put('/categories/:id', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`category:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    const category = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`category:${id}`, category);
    console.log(`✅ Category updated: ${id}`);
    return c.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

// Delete category (admin only)
app.delete('/categories/:id', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`category:${id}`);
    console.log(`✅ Category deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

// =====================================================
// MOOD MANAGEMENT ENDPOINTS
// =====================================================

// Get all moods — REMOVED duplicate; canonical handler is in MOOD TYPE MANAGEMENT section above

// Get single mood
app.get('/moods/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const mood = await kv.get(`mood:${id}`);
    
    if (!mood) {
      return c.json({ error: 'Mood not found' }, 404);
    }
    
    return c.json(mood);
  } catch (error) {
    console.error('Get mood error:', error);
    return c.json({ error: 'Failed to fetch mood' }, 500);
  }
});

// Create mood (admin only)
app.post('/moods', requireAdmin, async (c) => {
  try {
    const data = await c.req.json();
    const id = data.id || `mood-${Date.now()}`;
    
    const mood = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`mood:${id}`, mood);
    console.log(`✅ Mood created: ${id}`);
    return c.json(mood, 201);
  } catch (error) {
    console.error('Create mood error:', error);
    return c.json({ error: 'Failed to create mood' }, 500);
  }
});

// Update mood (admin only)
app.put('/moods/:id', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`mood:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Mood not found' }, 404);
    }
    
    const mood = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`mood:${id}`, mood);
    console.log(`✅ Mood updated: ${id}`);
    return c.json(mood);
  } catch (error) {
    console.error('Update mood error:', error);
    return c.json({ error: 'Failed to update mood' }, 500);
  }
});

// Delete mood (admin only)
app.delete('/moods/:id', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`mood:${id}`);
    console.log(`✅ Mood deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete mood error:', error);
    return c.json({ error: 'Failed to delete mood' }, 500);
  }
});

// ============================================================================
// CONTENT API (PHASE 1)
// ============================================================================

// Public Content API
app.get("/content", async (c) => {
  try {
    const { status = 'published', category, type, limit = 50, offset = 0 } = c.req.query();
    
    // 1. Fetch all content items
    let items = await kv.getByPrefix('content:');
    
    // 2. Filter by Status (default: published)
    if (status !== 'all') { // 'all' is internal/admin use usually, but if exposed be careful
        items = items.filter((item: any) => item.status === status);
    }

    // 3. Filter by Category
    if (category) {
      items = items.filter((item: any) => item.category === category);
    }

    // 4. Filter by Type (blog, resource, guide, article)
    if (type) {
      items = items.filter((item: any) => item.content_type === type);
    }

    // 5. Sort by Published Date (descending)
    items.sort((a: any, b: any) => {
      const dateA = new Date(a.published_at || a.created_at).getTime();
      const dateB = new Date(b.published_at || b.created_at).getTime();
      return dateB - dateA;
    });

    // 6. Pagination
    const start = parseInt(offset);
    const end = start + parseInt(limit);
    const paginatedItems = items.slice(start, end);

    return c.json({ 
      items: paginatedItems,
      total: items.length,
      page: Math.floor(start / parseInt(limit)) + 1,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Content API error:', error);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

// Get Content by Slug or ID
app.get("/content/:idOrSlug", async (c) => {
  try {
    const idOrSlug = c.req.param('idOrSlug');
    
    // Try direct lookup by ID
    let item = await kv.get(`content:${idOrSlug}`);
    
    // If not found, it might be a slug. Scan all (KV limitation)
    if (!item) {
      const allItems = await kv.getByPrefix('content:');
      item = allItems.find((i: any) => i.slug === idOrSlug);
    }

    if (!item) {
      return c.json({ error: 'Content not found' }, 404);
    }

    return c.json({ item });
  } catch (error) {
    console.error('Get content item error:', error);
    return c.json({ error: 'Failed to fetch content item' }, 500);
  }
});

// Admin Content Management
app.post("/admin/content", requireAdmin, async (c) => {
  try {
    const content = await c.req.json();
    const id = content.id || crypto.randomUUID();
    const now = new Date().toISOString();

    // Enforce Schema (Minimal)
    const newItem = {
      ...content,
      id,
      slug: content.slug || id, // Fallback slug
      created_at: now,
      updated_at: now
    };

    await kv.set(`content:${id}`, newItem);
    console.log(`✅ Content created: ${newItem.title} (${id})`);
    
    return c.json({ item: newItem });
  } catch (error) {
    console.error('Create content error:', error);
    return c.json({ error: 'Failed to create content' }, 500);
  }
});

app.put("/admin/content/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`content:${id}`);
    if (!existing) {
      return c.json({ error: 'Content not found' }, 404);
    }

    const updatedItem = {
      ...existing,
      ...updates,
      id, // Immutable
      updated_at: new Date().toISOString()
    };

    await kv.set(`content:${id}`, updatedItem);
    console.log(`✅ Content updated: ${id}`);
    
    return c.json({ item: updatedItem });
  } catch (error) {
    console.error('Update content error:', error);
    return c.json({ error: 'Failed to update content' }, 500);
  }
});

app.delete("/admin/content/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`content:${id}`);
    console.log(`✅ Content deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete content error:', error);
    return c.json({ error: 'Failed to delete content' }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC PROFESSIONAL APPLICATION (Universal Link)
// ═══════════════════════════════════════════════════════════════════════════════

app.post("/public/professional-application", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.name || !body.bio || !body.credentials) {
      return c.json({ error: 'Name, credentials, and bio are required' }, 400);
    }

    const applicationId = `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const application = {
      ...body,
      id: applicationId,
      professional_id: applicationId,
      status: 'pending_review',
      available: false,
      published: false,
      rating: 0,
      reviewCount: 0,
      reviews: [],
      faqs: (body.clientFAQs || []).map((faq: any) => ({ question: faq.question || faq.q, answer: faq.answer || faq.a })),
      approaches: body.therapeuticApproaches || [],
      concernsICanHelp: body.expertises || [],
      topExpertises: (body.expertises || []).slice(0, 3),
      availability: [],
      nextAvailableSlot: '',
      qas: [],
      articles: [],
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(`professional:pending-${applicationId}`, application);
    await kv.set(`professional_application:${applicationId}`, {
      id: applicationId,
      name: body.name,
      credentials: body.credentials,
      category: body.category || 'therapist',
      location: body.location || '',
      yearsExperience: body.yearsExperience || 0,
      expertises: (body.expertises || []).slice(0, 5),
      languages: body.languages || [],
      status: 'pending_review',
      submitted_at: new Date().toISOString(),
    });

    // Queue admin notification about new application
    const notifId = `notif-${Date.now()}`;
    await kv.set(`admin_notification:${notifId}`, {
      id: notifId,
      type: 'professional_application',
      title: 'New Professional Application',
      message: `${body.name} (${body.credentials}) has applied to join as a ${body.category || 'therapist'}. Location: ${body.location || 'Not specified'}.`,
      applicationId,
      read: false,
      created_at: new Date().toISOString(),
    });

    // Attempt to send email notification if email provider is configured
    try {
      const emailConfig = await kv.get('comm-config:email');
      if (emailConfig?.enabled && emailConfig?.api_key) {
        await kv.set(`email_queue:${notifId}`, {
          id: notifId,
          to: emailConfig.sender_id || 'admin@ikanhealth.in',
          subject: `[iKan] New Professional Application: ${body.name}`,
          body: `A new professional has applied to join iKan.\n\nName: ${body.name}\nCredentials: ${body.credentials}\nCategory: ${body.category || 'Therapist'}\nLocation: ${body.location || 'Not specified'}\nExperience: ${body.yearsExperience || 0} years\nLanguages: ${(body.languages || []).join(', ') || 'Not specified'}\n\nPlease review in Admin Dashboard > Consultation Manager > Applications tab.`,
          status: 'queued',
          created_at: new Date().toISOString(),
        });
        console.log(`📧 Admin email notification queued for new application: ${body.name}`);
      }
    } catch (emailErr) {
      console.log('Email notification skipped (not configured):', emailErr);
    }

    console.log(`📋 New professional application: ${body.name} (${applicationId})`);
    return c.json({ success: true, applicationId, message: 'Application submitted successfully. Our team will review it shortly.' });
  } catch (error) {
    console.error('Professional application error:', error);
    return c.json({ error: 'Failed to submit application' }, 500);
  }
});

app.get("/admin/professional-applications", requireAdmin, async (c) => {
  try {
    const applications = await kv.getByPrefix('professional_application:');
    const sorted = (applications || []).filter((a: any) => a && a.id)
      .sort((a: any, b: any) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime());
    return c.json({ applications: sorted });
  } catch (error) {
    console.error('Get applications error:', error);
    return c.json({ error: 'Failed to get applications', applications: [] }, 500);
  }
});

app.post("/admin/professional-applications/:id/approve", requireAdmin, async (c) => {
  try {
    const appId = c.req.param('id');
    const pendingData = await kv.get(`professional:pending-${appId}`);
    if (!pendingData) return c.json({ error: 'Application not found' }, 404);

    const activeProfessional = { ...pendingData, id: appId, professional_id: appId, status: 'active', available: true, published: true, approved_at: new Date().toISOString() };
    await kv.set(`professional:${appId}`, activeProfessional);
    await kv.del(`professional:pending-${appId}`);

    const tracker = await kv.get(`professional_application:${appId}`);
    if (tracker) await kv.set(`professional_application:${appId}`, { ...tracker, status: 'approved' });

    console.log(`✅ Application approved: ${pendingData.name}`);
    return c.json({ success: true, professional: activeProfessional });
  } catch (error) {
    console.error('Approve application error:', error);
    return c.json({ error: 'Failed to approve application' }, 500);
  }
});

app.post("/admin/professional-applications/:id/reject", requireAdmin, async (c) => {
  try {
    const appId = c.req.param('id');
    const { reason } = await c.req.json().catch(() => ({ reason: '' }));
    const pendingData = await kv.get(`professional:pending-${appId}`);
    if (!pendingData) return c.json({ error: 'Application not found' }, 404);

    const rejectedData = { ...pendingData, status: 'rejected', rejected_at: new Date().toISOString(), rejection_reason: reason || 'Not specified' };
    await kv.set(`professional:pending-${appId}`, rejectedData);

    const tracker = await kv.get(`professional_application:${appId}`);
    if (tracker) await kv.set(`professional_application:${appId}`, { ...tracker, status: 'rejected', rejection_reason: reason || 'Not specified' });

    console.log(`❌ Application rejected: ${pendingData.name}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Reject application error:', error);
    return c.json({ error: 'Failed to reject application' }, 500);
  }
});

app.get("/admin/professional-applications/:id", requireAdmin, async (c) => {
  try {
    const appId = c.req.param('id');
    const fullData = await kv.get(`professional:pending-${appId}`);
    if (!fullData) return c.json({ error: 'Application not found' }, 404);
    return c.json({ application: fullData });
  } catch (error) {
    console.error('Get application detail error:', error);
    return c.json({ error: 'Failed to get application' }, 500);
  }
});

app.get("/admin/notifications", requireAdmin, async (c) => {
  try {
    const notifications = await kv.getByPrefix('admin_notification:');
    const sorted = (notifications || []).filter((n: any) => n && n.id)
      .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 50);
    return c.json({ notifications: sorted });
  } catch (error) {
    return c.json({ error: 'Failed to get notifications' }, 500);
  }
});

app.post("/admin/notifications/:id/read", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const notif = await kv.get(`admin_notification:${id}`);
    if (notif) await kv.set(`admin_notification:${id}`, { ...notif, read: true });
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to update notification' }, 500);
  }
});

// ═════════════════��═════════════════════════════════════════════════════════════
// SUPABASE STORAGE: File Uploads for Professionals
// ═══════════════════════════════════════════════════════════════════════════════

const UPLOAD_BUCKET = 'make-cc205da9-professional-uploads';
let bucketInitialized = false;

async function ensureBucket() {
  if (bucketInitialized) return;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b: any) => b.name === UPLOAD_BUCKET);
    if (!exists) {
      await supabase.storage.createBucket(UPLOAD_BUCKET, { public: false });
      console.log(`📦 Created storage bucket: ${UPLOAD_BUCKET}`);
    }
    bucketInitialized = true;
  } catch (err) {
    console.error('Bucket init error:', err);
  }
}

app.post("/upload/professional-file", async (c) => {
  try {
    await ensureBucket();
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    const professionalId = formData.get('professionalId') as string || 'unknown';

    if (!file) return c.json({ error: 'No file provided' }, 400);
    if (file.size > 10 * 1024 * 1024) return c.json({ error: 'File too large. Maximum 10MB.' }, 400);

    const ext = file.name.split('.').pop() || 'bin';
    const filePath = `${category}/${professionalId}/${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage.from(UPLOAD_BUCKET).upload(filePath, arrayBuffer, { contentType: file.type, upsert: false });
    if (error) { console.error('Upload error:', error); return c.json({ error: `Upload failed: ${error.message}` }, 500); }

    const { data: signedData, error: signedError } = await supabase.storage.from(UPLOAD_BUCKET).createSignedUrl(filePath, 7 * 24 * 60 * 60);
    if (signedError) return c.json({ error: 'Uploaded but failed to create URL' }, 500);

    console.log(`📎 File uploaded: ${filePath} (${file.size} bytes)`);
    return c.json({ success: true, url: signedData.signedUrl, path: filePath, fileName: file.name, size: file.size });
  } catch (error) {
    console.error('File upload error:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

app.post("/upload/refresh-url", async (c) => {
  try {
    const { path: filePath } = await c.req.json();
    if (!filePath) return c.json({ error: 'path is required' }, 400);
    const { data, error } = await supabase.storage.from(UPLOAD_BUCKET).createSignedUrl(filePath, 7 * 24 * 60 * 60);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ url: data.signedUrl });
  } catch (error) {
    console.error('Refresh URL error:', error);
    return c.json({ error: 'Failed to refresh URL' }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Layer 4: Deno.serve onError — uses the centralized helper
// Layer 5: Wrapped handler — short-circuits on aborted requests and wraps
//          app.fetch() in try/catch so connection-closed errors from Hono's
//          internal response-writing never propagate upward.
// Layer 6: Abort-aware response wrapper — replaces the original Response body
//          with a ReadableStream that monitors req.signal, so Deno never
//          attempts to write bytes to a closed socket (preventing the
//          ext:runtime/01_http.js respondWith error at the source).
// ─────────────────────────────────────────────────────────────────────────────

/** Wrap a Response body in an abort-aware stream tied to the request signal. */
function makeAbortAwareResponse(res: Response, signal: AbortSignal): Response {
  // No body to stream — nothing to wrap
  if (!res.body) return res;
  // Already aborted — return empty immediately
  if (signal.aborted) return new Response(null, { status: 499 });

  const originalBody = res.body;
  const reader = originalBody.getReader();

  const wrappedBody = new ReadableStream({
    async pull(controller) {
      // Check abort BEFORE each chunk read
      if (signal.aborted) {
        controller.close();
        reader.cancel().catch(() => {});
        return;
      }
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
        } else {
          // Re-check after async read in case client disconnected mid-read
          if (signal.aborted) {
            controller.close();
            reader.cancel().catch(() => {});
          } else {
            controller.enqueue(value);
          }
        }
      } catch (err) {
        if (isConnectionClosedError(err) || signal.aborted) {
          controller.close();
        } else {
          controller.error(err);
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(wrappedBody, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}

Deno.serve({
  onError(err: unknown) {
    if (isConnectionClosedError(err)) {
      return new Response(null, { status: 499 });
    }
    _origConsoleError('Unhandled Deno.serve onError:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  },
}, async (req: Request) => {
  // If the client already disconnected, don't bother running the handler.
  if (req.signal.aborted) {
    return new Response(null, { status: 499 });
  }
  try {
    const response = await app.fetch(req);
    // Wrap the response so Deno never writes to a closed socket
    return makeAbortAwareResponse(response, req.signal);
  } catch (err) {
    if (isConnectionClosedError(err)) {
      return new Response(null, { status: 499 });
    }
    throw err; // Re-throw non-connection errors so onError handles them.
  }
});