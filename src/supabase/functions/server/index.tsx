import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { createHash, createHmac } from "node:crypto";

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
  validateEquipProgram
} from "./validation.tsx";

import { 
  EquipService, 
  EquipDayService, 
  EquipBlockService, 
  DatasetService 
} from "./program-service.ts";
import { ProgressService } from "./progress-service.ts";
import { RecommendationService } from "./recommendation-service.ts";
import { MigrationRunner } from "./migration-runner.ts";

import { registerEquipRoutes } from './equip-routes.ts';
import { registerProgressRoutes } from './progress-routes.ts';
import { registerRecommendationRoutes } from './recommendation-routes.ts';
import { registerAdminRoutes } from './admin-routes.ts';
import { registerAssessmentRoutes } from './assessment-routes.ts';
import { registerMoodRoutes } from './mood-routes.ts';
import { registerNewsletterRoutes } from './newsletter-routes.ts';
import { registerResourceRoutes } from './resource-routes.ts';

const app = new Hono().basePath('/make-server-cc205da9');

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint (Public)
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

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
  if (!userProfile?.is_admin) {
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
registerNewsletterRoutes(app);
registerResourceRoutes(app, requireAuth);

  // CMS Public Routes
  app.get("/cms/pages/:slug", async (c) => {
    try {
      const slug = c.req.param("slug");
      
      // Attempt 1: Check if there is a direct mapping (if we implemented it)
      const pageId = await kv.get(`page_slug:${slug}`);
      
      let page;
      if (pageId) {
         page = await kv.get(`page:${pageId}`);
      } else {
         // Fallback: Scan all pages (slow, but works for MVP)
         const pages = await kv.getByPrefix("page:");
         page = pages.find((p: any) => p.slug === slug);
      }
      
      // Fallback: Check if it's one of our hardcoded CMS pages (homepage content blocks)
      // This is crucial for the homepage components which expect specific hardcoded data structures
      if (!page) {
        // Try getting from cms_page: prefix which is used for the hardcoded content blocks
        // These are distinct from the "page:" prefix used by the Admin Page Manager
        page = await kv.get(`cms_page:${slug}`);
        
        // If still not found, check if we should generate default content for it
        if (!page) {
           const requiredPageIds = [
             'about', 'privacy', 'terms', 'faq', 'contact', 'return-policy', 'cancellation-policy', 'sitemap',
             'homepage-hero', 'homepage-assessment', 'homepage-mission', 'homepage-benefits', 'homepage-faq', 'homepage-newsletter', 'homepage-equip-intro'
           ];
           
           if (requiredPageIds.includes(slug)) {
              console.log(`Generating default content for ${slug}`);
              const defaultContent = createDefaultCMSContent(slug);
              page = {
                id: slug,
                name: defaultContent.title,
                title: defaultContent.title,
                slug: slug,
                published: true,
                content: defaultContent.content,
                lastUpdated: defaultContent.lastUpdated,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              // Persist it so next time we find it
              await kv.set(`cms_page:${slug}`, page);
           }
        }
      }

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

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Initialization endpoint
app.post("/init/sample-data", async (c) => {
  const authHeader = c.req.header('Authorization');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  // Allow if using service role key
  if (authHeader !== `Bearer ${serviceRoleKey}`) {
    // Also allow if it's a dev environment or if explicit anon key is allowed (unlikely)
    // For now, strict check
    return c.json({ error: 'Unauthorized: Service Role Key required' }, 401);
  }

  try {
    const result = await MigrationRunner.run();
    return c.json(result);
  } catch (error: any) {
    console.error("Initialization failed:", error);
    return c.json({ error: error.message }, 500);
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
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    });

    if (error) {
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
    
    // Update emergency contact fields
    if (sanitizedUpdates.emergencyContactName !== undefined) {
      updatedProfile.emergencyContactName = sanitizedUpdates.emergencyContactName;
      updatedProfile.emergencyContactPhone = sanitizedUpdates.emergencyContactPhone;
      updatedProfile.emergencyContactRelationship = sanitizedUpdates.emergencyContactRelationship;
    }
    
    // Update preferences
    if (sanitizedUpdates.preferences !== undefined) {
      updatedProfile.preferences = sanitizedUpdates.preferences;
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

// Avatar Upload Endpoint (placeholder for Supabase Storage integration)
app.post("/users/avatar", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    // In production, this would:
    // 1. Accept multipart/form-data file upload
    // 2. Validate file type and size
    // 3. Resize/crop image
    // 4. Upload to Supabase Storage
    // 5. Generate signed URL
    // 6. Update user profile with avatar_url
    
    // For now, accept a URL
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
    
    // Create audit log
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

// Assessment Endpoints
app.get("/assessments", async (c) => {
  try {
    // Get all available assessments
    let assessments = await kv.getByPrefix('assessment:');

    // Filter out null/undefined entries and duplicates (since we store by ID and Slug)
    const validAssessments = assessments.filter((a: any) => a && a.id);
    const uniqueAssessments = Array.from(new Map(validAssessments.map((a: any) => [a.id, a])).values());
    
    // ✅ FILTER OUT UNPUBLISHED/DRAFT ASSESSMENTS - Only return published assessments
    const publishedAssessments = uniqueAssessments.filter((a: any) => a.published !== false);
    
    console.log(`✅ Returning ${publishedAssessments.length} published assessments (${uniqueAssessments.length} total)`);
    return c.json({ assessments: publishedAssessments });
  } catch (error) {
    console.error('❌ Get assessments error:', error);
    return c.json({ error: 'Failed to retrieve assessments', assessments: [] }, 500);
  }
});

app.get("/assessments/:assessmentId", async (c) => {
  try {
    const assessmentId = c.req.param('assessmentId');
    console.log(`🔍 Looking up assessment: ${assessmentId}`);
    
    // Try direct lookup first
    let assessment = await kv.get(`assessment:${assessmentId}`);
    
    // If not found, search through all assessments by ID or slug
    if (!assessment) {
      console.log(`⚠️ Assessment not found by key, searching by ID/slug...`);
      const allAssessments = await kv.getByPrefix('assessment:');
      assessment = allAssessments.find((a: any) => 
        a && (a.id === assessmentId || a.slug === assessmentId || a.assessment_id === assessmentId)
      );
    }
    
    if (!assessment) {
      // Return 404 if not found
      console.log(`❌ Assessment not found: ${assessmentId}`);
      return c.json({ error: 'Assessment not found' }, 404);
    }
    
    console.log(`✅ Found assessment: ${assessment.title || assessment.slug}`);
    return c.json({ assessment });
  } catch (error) {
    console.log('Get assessment error:', error);
    return c.json({ error: 'Failed to retrieve assessment' }, 500);
  }
});

app.post("/assessments", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const assessmentData = await c.req.json();
    // Use assessment_id if provided, otherwise use id, otherwise generate new
    const assessmentId = assessmentData.assessment_id || assessmentData.id || `assessment-${Date.now()}`;
    
    // Ensure both ID fields are set for compatibility
    const newAssessment = {
      ...assessmentData,
      id: assessmentId,
      assessment_id: assessmentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`assessment:${assessmentId}`, newAssessment);
    
    console.log(`✅ Assessment created: ${assessmentId}`);
    return c.json({ assessment: newAssessment });
  } catch (error) {
    console.log('Create assessment error:', error);
    return c.json({ error: 'Failed to create assessment' }, 500);
  }
});

app.put("/assessments/:assessmentId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const assessmentId = c.req.param('assessmentId');
    console.log(`📝 Updating assessment: ${assessmentId}`);
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const updates = await c.req.json();
    
    // Try direct lookup first
    let existingAssessment = await kv.get(`assessment:${assessmentId}`);
    let storageKey = `assessment:${assessmentId}`;
    
    // If not found, search by ID/slug
    if (!existingAssessment) {
      const allAssessments = await kv.getByPrefix('assessment:');
      const found = allAssessments.find((a: any) => 
        a && (a.id === assessmentId || a.slug === assessmentId || a.assessment_id === assessmentId)
      );
      
      if (found) {
        existingAssessment = found;
        // Use the actual storage key (slug or id)
        storageKey = `assessment:${found.slug || found.id}`;
      }
    }
    
    if (!existingAssessment) {
      console.log(`❌ Assessment not found for update: ${assessmentId}`);
      return c.json({ error: 'Assessment not found' }, 404);
    }
    
    const updatedAssessment = {
      ...existingAssessment,
      ...updates,
      id: existingAssessment.id,
      assessment_id: existingAssessment.assessment_id || existingAssessment.id,
      slug: existingAssessment.slug,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(storageKey, updatedAssessment);
    
    console.log(`✅ Assessment updated: ${storageKey}`);
    return c.json({ assessment: updatedAssessment });
  } catch (error) {
    console.log('Update assessment error:', error);
    return c.json({ error: 'Failed to update assessment' }, 500);
  }
});

app.delete("/assessments/:assessmentId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const assessmentId = c.req.param('assessmentId');
    console.log(`🗑️ Deleting assessment: ${assessmentId}`);
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    // Try direct lookup first
    let existingAssessment = await kv.get(`assessment:${assessmentId}`);
    let storageKey = `assessment:${assessmentId}`;
    
    // If not found, search by ID/slug
    if (!existingAssessment) {
      const allAssessments = await kv.getByPrefix('assessment:');
      const found = allAssessments.find((a: any) => 
        a && (a.id === assessmentId || a.slug === assessmentId || a.assessment_id === assessmentId)
      );
      
      if (found) {
        existingAssessment = found;
        // Use the actual storage key (slug or id)
        storageKey = `assessment:${found.slug || found.id}`;
      }
    }
    
    if (!existingAssessment) {
      console.log(`❌ Assessment not found for deletion: ${assessmentId}`);
      return c.json({ error: 'Assessment not found' }, 404);
    }
    
    await kv.del(storageKey);
    
    console.log(`✅ Assessment deleted: ${storageKey}`);
    return c.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    console.log('Delete assessment error:', error);
    return c.json({ error: 'Failed to delete assessment' }, 500);
  }
});

app.post("/assessments/:assessmentId/responses", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const assessmentId = c.req.param('assessmentId');
    const { responses, status, score, interpretation, severity } = await c.req.json();
    
    const responseId = `${userId}-${assessmentId}-${Date.now()}`;
    const assessmentResponse = {
      response_id: responseId,
      user_id: userId,
      assessment_id: assessmentId,
      responses,
      status: status || 'in_progress',
      score: score || null,
      interpretation: interpretation || null, // Store full interpretation object/string
      severity: severity || null, // Explicit severity: low, mild, moderate, high
      started_at: new Date().toISOString(),
      completed_at: status === 'completed' ? new Date().toISOString() : null
    };

    await kv.set(`assessment_response:${responseId}`, assessmentResponse);
    await kv.set(`assessment_response_by_user:${userId}:${assessmentId}:latest`, assessmentResponse);
    
    return c.json({ response: assessmentResponse });
  } catch (error) {
    console.log('Save assessment response error:', error);
    return c.json({ error: 'Failed to save assessment response' }, 500);
  }
});

app.get("/assessments/responses/user", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const responses = await kv.getByPrefix(`assessment_response_by_user:${userId}`);
    
    return c.json({ responses });
  } catch (error) {
    console.log('Get user assessment responses error:', error);
    return c.json({ error: 'Failed to retrieve assessment responses' }, 500);
  }
});

// ========================================
// EQUIP PROGRAMS LIST ENDPOINT
// ========================================

// Get all Equip Programs (Public Endpoint)
app.get("/equip-programs", async (c) => {
  try {
    // Get all equip programs
    let programs = await kv.getByPrefix('equip_program:');

    // Filter out null/undefined entries
    const validPrograms = programs.filter((p: any) => p && (p.id || p.equip_id));
    
    // Deduplicate by ID (equip_id or id)
    const uniquePrograms = Array.from(
      new Map(
        validPrograms.map((p: any) => [p.equip_id || p.id, p])
      ).values()
    );
    
    // ✅ FILTER OUT UNPUBLISHED/DRAFT PROGRAMS - Only return published programs
    const publishedPrograms = uniquePrograms.filter((p: any) => p.published !== false);
    
    console.log(`✅ Returning ${publishedPrograms.length} published equip programs (${uniquePrograms.length} total)`);
    return c.json({ programs: publishedPrograms });
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
    
    console.log(`✅ Equip program found: ${program.id || program.equip_id}`);
    return c.json({ program });
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







// Library Resource Endpoints
app.get("/library/resources", async (c) => {
  try {
    const { category, limit = 50, offset = 0 } = c.req.query();
    
    // Check both possible prefixes for resources
    let resources = await kv.getByPrefix('library:resource:');
    
    // If no resources found with new prefix, try legacy prefix
    if (resources.length === 0) {
      resources = await kv.getByPrefix('resource:');
    }
    
    // Filter out null/undefined entries
    resources = resources.filter((r: any) => r && r.id);
    
    // ✅ FILTER OUT UNPUBLISHED/DRAFT RESOURCES - Only return published resources
    resources = resources.filter((resource: any) => resource.published !== false);
    
    // Filter by category if provided
    if (category) {
      resources = resources.filter((resource: any) => resource.category === category);
    }
    
    // Sort by created_at descending and apply pagination
    resources = resources
      .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    console.log(`✅ Returning ${resources.length} published resources`);
    return c.json({ resources });
  } catch (error) {
    console.error('❌ Get library resources error:', error);
    return c.json({ error: 'Failed to retrieve resources', resources: [] }, 500);
  }
});

app.get("/library/resources/:resourceId", async (c) => {
  try {
    const resourceId = c.req.param('resourceId');
    console.log(`🔍 Looking up resource: ${resourceId}`);
    
    // Try direct lookup with both prefixes
    let resource = await kv.get(`library:resource:${resourceId}`);
    if (!resource) {
      resource = await kv.get(`resource:${resourceId}`);
    }
    
    // If not found, search by ID/slug in both prefixes
    if (!resource) {
      let allResources = await kv.getByPrefix('library:resource:');
      if (allResources.length === 0) {
        allResources = await kv.getByPrefix('resource:');
      }
      resource = allResources.find((r: any) => 
        r && (r.id === resourceId || r.slug === resourceId)
      );
    }
    
    if (!resource) {
      console.log(`❌ Resource not found: ${resourceId}`);
      return c.json({ error: 'Resource not found' }, 404);
    }
    
    console.log(`✅ Found resource: ${resource.title || resource.slug}`);
    return c.json({ resource });
  } catch (error) {
    console.log('Get library resource error:', error);
    return c.json({ error: 'Failed to retrieve resource' }, 500);
  }
});

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



// Admin Resource Management Endpoints
app.get("/admin/resources", requireAdmin, async (c) => {
  try {
    // Get all resources - check both prefixes
    let resources = await kv.getByPrefix('library:resource:');
    if (resources.length === 0) {
      resources = await kv.getByPrefix('resource:');
    }
    
    // Filter out null/undefined entries
    resources = resources.filter((r: any) => r && r.id);
    
    console.log(`✅ Admin fetched ${resources.length} resources`);
    
    // Sort by created_at descending
    const sortedResources = resources.sort((a: any, b: any) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    
    return c.json({ resources: sortedResources });
  } catch (error) {
    console.error('❌ Get admin resources error:', error);
    return c.json({ error: 'Failed to retrieve resources', resources: [] }, 500);
  }
});

app.post("/admin/resources", requireAdmin, async (c) => {
  try {
    const user = c.get('user');
    
    const resourceData = await c.req.json();
    // Use provided id if available, otherwise generate new
    const resourceId = resourceData.id || `resource-${Date.now()}`;
    
    const newResource = {
      ...resourceData,
      id: resourceId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.id
    };
    
    // Use the new prefix for consistency with seeded data
    await kv.set(`library:resource:${resourceId}`, newResource);
    
    console.log(`✅ Resource created: ${resourceId}`);
    return c.json({ resource: newResource });
  } catch (error) {
    console.log('Create resource error:', error);
    return c.json({ error: 'Failed to create resource' }, 500);
  }
});

app.put("/admin/resources/:resourceId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const resourceId = c.req.param('resourceId');
    console.log(`📝 Updating resource: ${resourceId}`);
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const updates = await c.req.json();
    
    // Try direct lookup with both prefixes
    let existingResource = await kv.get(`library:resource:${resourceId}`);
    let storageKey = `library:resource:${resourceId}`;
    
    if (!existingResource) {
      existingResource = await kv.get(`resource:${resourceId}`);
      storageKey = `resource:${resourceId}`;
    }
    
    // If not found, search by ID/slug
    if (!existingResource) {
      let allResources = await kv.getByPrefix('library:resource:');
      if (allResources.length === 0) {
        allResources = await kv.getByPrefix('resource:');
      }
      const found = allResources.find((r: any) => 
        r && (r.id === resourceId || r.slug === resourceId)
      );
      
      if (found) {
        existingResource = found;
        // Determine which prefix was used
        const isNewPrefix = (await kv.get(`library:resource:${found.slug || found.id}`)) !== null;
        storageKey = isNewPrefix ? `library:resource:${found.slug || found.id}` : `resource:${found.slug || found.id}`;
      }
    }
    
    if (!existingResource) {
      console.log(`❌ Resource not found for update: ${resourceId}`);
      return c.json({ error: 'Resource not found' }, 404);
    }
    
    const updatedResource = {
      ...existingResource,
      ...updates,
      id: existingResource.id,
      slug: existingResource.slug,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };
    
    await kv.set(storageKey, updatedResource);
    
    console.log(`✅ Resource updated: ${storageKey}`);
    return c.json({ resource: updatedResource });
  } catch (error) {
    console.log('Update resource error:', error);
    return c.json({ error: 'Failed to update resource' }, 500);
  }
});

app.delete("/admin/resources/:resourceId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const resourceId = c.req.param('resourceId');
    console.log(`🗑️ Deleting resource: ${resourceId}`);
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    // FETCH resource first to identify all keys (ID and Slug)
    let resource = await kv.get(`library:resource:${resourceId}`);
    if (!resource) resource = await kv.get(`resource:${resourceId}`);
    
    // If not found by ID, try finding by slug/ID in all resources
    if (!resource) {
       const all1 = await kv.getByPrefix('library:resource:');
       const all2 = await kv.getByPrefix('resource:');
       resource = [...all1, ...all2].find((r: any) => r && (r.id === resourceId || r.slug === resourceId));
    }

    if (!resource) {
      return c.json({ error: 'Resource not found' }, 404);
    }

    // Construct all possible keys to ensure cleanup
    const keysToDelete = [
      `library:resource:${resource.id}`,
      `resource:${resource.id}`
    ];
    
    if (resource.slug) {
      keysToDelete.push(`library:resource:${resource.slug}`);
      keysToDelete.push(`resource:${resource.slug}`);
    }

    await kv.mdel(keysToDelete);
    
    console.log(`✅ Resource deleted (keys: ${keysToDelete.join(', ')})`);
    return c.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    console.log('Delete resource error:', error);
    return c.json({ error: 'Failed to delete resource' }, 500);
  }
});

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
    
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      user_id: userId, // Prevent changing user ID
      updated_at: new Date().toISOString()
    };
    
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
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Delete user and related data
    await kv.del(`user:${userId}`);
    
    // Optionally delete related data (journal entries, etc.)
    const journalEntries = await kv.getByPrefix(`journal:${userId}:`);
    for (const entry of journalEntries) {
      await kv.del(`journal:${userId}:${entry.date}`);
    }
    
    return c.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.log('Admin delete user error:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// ========================================
// MIGRATION ENDPOINT (PHASE 4)
// ========================================

app.post("/admin/migrate/v1", requireAdmin, async (c) => {
  try {
    const result = await MigrationRunner.run();
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
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
    const validPages = (pagesData || [])
      .map(item => item?.value)
      .filter(page => page && page.id && page.name && page.title && page.slug);

    // List of required standard pages
    const requiredPageIds = [
      'about', 'privacy', 'terms', 'faq', 'contact', 'return-policy', 'cancellation-policy', 'sitemap',
      'homepage-hero', 'homepage-assessment', 'homepage-mission', 'homepage-benefits', 'homepage-faq', 'homepage-newsletter', 'homepage-equip-intro'
    ];
    const missingPages = [];

    // Check for missing standard pages
    for (const pageId of requiredPageIds) {
       const exists = validPages.some(p => p.id === pageId || p.slug === pageId);
       if (!exists) {
         missingPages.push(pageId);
       }
    }

    // Create any missing standard pages
    if (missingPages.length > 0) {
      console.log(`📄 Creating ${missingPages.length} missing CMS pages: ${missingPages.join(', ')}`);
      
      for (const pageId of missingPages) {
        const defaultContent = createDefaultCMSContent(pageId);
        const page = {
          id: pageId,
          name: defaultContent.title,
          title: defaultContent.title,
          slug: pageId,
          published: true,
          content: defaultContent.content,
          lastUpdated: defaultContent.lastUpdated,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await kv.set(`cms_page:${page.id}`, page);
        validPages.push(page);
      }
    }
    
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

// Helper function to create default CMS content
function createDefaultCMSContent(pageId: string): any {
  const defaults: { [key: string]: any } = {
    'about': {
      title: 'About iKan',
      content: `
        <div class="space-y-8">
          <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">🌟 Our Mission</h2>
            <p class="text-gray-700 leading-relaxed">At iKan, we believe that everyone deserves access to quality mental health support. We're on a mission to make mental wellness accessible, affordable, and stigma-free.</p>
          </div>

          <div class="grid gap-6">
            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">💙</span> What We Do
              </h3>
              <p class="text-gray-700 leading-relaxed mb-4">
                iKan is a comprehensive mental health platform that connects you with licensed professionals, evidence-based self-help programs, and a supportive community. Whether you're dealing with stress, anxiety, depression, or just looking to improve your overall well-being, we're here to help.
              </p>
              <ul class="space-y-2 text-gray-700 ml-4">
                <li>• One-on-one consultations with qualified therapists and counselors</li>
                <li>• Self-paced programs based on cognitive behavioral therapy (CBT)</li>
                <li>• Mood tracking and personalized insights</li>
                <li>• Resource library with articles, guides, and tools</li>
                <li>• 24/7 crisis support and emergency resources</li>
              </ul>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">🎯</span> Our Values
              </h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 class="font-medium text-gray-900 mb-2">Accessibility</h4>
                  <p class="text-sm text-gray-700">Mental health support should be available to everyone, regardless of location or financial situation.</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 class="font-medium text-gray-900 mb-2">Privacy</h4>
                  <p class="text-sm text-gray-700">Your data and conversations are completely confidential and protected with industry-leading security.</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 class="font-medium text-gray-900 mb-2">Evidence-Based</h4>
                  <p class="text-sm text-gray-700">All our programs and approaches are grounded in scientific research and proven therapeutic methods.</p>
                </div>
                <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 class="font-medium text-gray-900 mb-2">Stigma-Free</h4>
                  <p class="text-sm text-gray-700">We're working to normalize conversations about mental health and create a judgment-free space for healing.</p>
                </div>
              </div>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">👥</span> Our Team
              </h3>
              <p class="text-gray-700 leading-relaxed">
                iKan is built by a diverse team of mental health professionals, technologists, and individuals with lived experience. Our licensed therapists, psychiatrists, and counselors bring decades of combined expertise in various therapeutic modalities and specializations.
              </p>
            </section>
          </div>

          <div class="bg-indigo-900 text-white p-6 rounded-lg">
            <h3 class="text-lg font-medium mb-3">Ready to Start Your Journey?</h3>
            <p class="mb-4">Take the first step towards better mental health today. Our team is here to support you every step of the way.</p>
            <a href="/consultation" class="inline-block bg-white text-indigo-900 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
              Book a Consultation
            </a>
          </div>
        </div>
      `,
      lastUpdated: new Date().toISOString()
    },
    'privacy': {
      title: 'Privacy Policy',
      content: `
        <div class="space-y-8">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">🔒 Your Privacy Matters</h2>
            <p class="text-gray-700 leading-relaxed">At iKan, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data when you use our mental health services.</p>
          </div>

          <div class="grid gap-6">
            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">📝</span> Information We Collect
              </h3>
              <div class="space-y-4 text-gray-700">
                <div class="pl-4 border-l-4 border-blue-200">
                  <h4 class="font-medium text-gray-900 mb-2">Personal Information</h4>
                  <p>Information you provide directly, including name, email, and assessment responses when you create an account or use our services.</p>
                </div>
                <div class="pl-4 border-l-4 border-green-200">
                  <h4 class="font-medium text-gray-900 mb-2">Usage Information</h4>
                  <p>Automatically collected data about your platform interactions, session duration, and device information to improve our services.</p>
                </div>
                <div class="pl-4 border-l-4 border-purple-200">
                  <h4 class="font-medium text-gray-900 mb-2">Health Data</h4>
                  <p>Mental health assessment responses and mood tracking data, which receive the highest level of protection.</p>
                </div>
              </div>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">🎯</span> How We Use Your Information
              </h3>
              <ul class="space-y-3 text-gray-700">
                <li class="flex items-start">
                  <span class="text-green-500 mr-3 mt-1">✓</span>
                  <span>Provide personalized mental health support and recommendations</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-3 mt-1">✓</span>
                  <span>Improve our services and develop new features</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-3 mt-1">✓</span>
                  <span>Ensure platform security and prevent fraud</span>
                </li>
                <li class="flex items-start">
                  <span class="text-red-500 mr-3 mt-1">✗</span>
                  <span><strong>We never sell your personal data to third parties</strong></span>
                </li>
              </ul>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">🛡️</span> Data Security & Protection
              </h3>
              <div class="grid md:grid-cols-2 gap-4 text-gray-700">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium text-gray-900 mb-2">Encryption</h4>
                  <p class="text-sm">End-to-end encryption for all sensitive data transmission and storage.</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium text-gray-900 mb-2">Access Control</h4>
                  <p class="text-sm">Strict access controls with multi-factor authentication for all team members.</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium text-gray-900 mb-2">Regular Audits</h4>
                  <p class="text-sm">Third-party security audits and compliance with healthcare data standards.</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium text-gray-900 mb-2">Data Minimization</h4>
                  <p class="text-sm">We collect only the data necessary to provide our services effectively.</p>
                </div>
              </div>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">⚖️</span> Your Rights
              </h3>
              <div class="space-y-3 text-gray-700">
                <p class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <strong class="text-blue-900">You have full control over your data.</strong> You can access, update, or delete your personal information at any time through your account settings.
                </p>
                <ul class="space-y-2 ml-4">
                  <li>• Request a copy of your data</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Delete your account and associated data</li>
                  <li>• Opt out of non-essential communications</li>
                </ul>
              </div>
            </section>
          </div>

          <div class="bg-gray-900 text-white p-6 rounded-lg">
            <h3 class="text-lg font-medium mb-3 flex items-center">
              <span class="mr-2">📞</span> Questions? We're Here to Help
            </h3>
            <p class="text-gray-300 mb-4">If you have any questions about this Privacy Policy or how we handle your data, our privacy team is ready to assist you.</p>
            <div class="flex flex-col sm:flex-row gap-4">
              <a href="mailto:privacy@ikan.health" class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center">
                Email: privacy@ikan.health
              </a>
              <span class="text-gray-400 text-sm self-center">Response within 24 hours</span>
            </div>
          </div>
        </div>
      `,
      lastUpdated: new Date().toISOString()
    },
    'terms': {
      title: 'Terms of Service',
      content: `
        <div class="space-y-8">
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">📋 Terms of Service</h2>
            <p class="text-gray-700 leading-relaxed">By accessing and using iKan's mental health platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. Last updated: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="grid gap-6">
            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">🎯</span> Scope of Services
              </h3>
              <div class="space-y-4 text-gray-700">
                <p class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  Our platform is designed to <strong>support your mental health journey</strong> through evidence-based assessments, personalized programs, and curated resources.
                </p>
                <ul class="space-y-2 ml-4">
                  <li>• Mental health assessments and progress tracking</li>
                  <li>• Personalized equip programs and interventions</li>
                  <li>• Resource library and educational content</li>
                  <li>• Professional consultation matching</li>
                </ul>
              </div>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">👤</span> Your Responsibilities
              </h3>
              <div class="grid gap-4">
                <div class="border-l-4 border-green-400 pl-4">
                  <h4 class="font-medium text-gray-900 mb-2">Account Security</h4>
                  <p class="text-gray-700 text-sm">Maintain the confidentiality of your account credentials and notify us immediately of any unauthorized access.</p>
                </div>
                <div class="border-l-4 border-blue-400 pl-4">
                  <h4 class="font-medium text-gray-900 mb-2">Accurate Information</h4>
                  <p class="text-gray-700 text-sm">Provide accurate and honest information in assessments to ensure effective recommendations.</p>
                </div>
                <div class="border-l-4 border-purple-400 pl-4">
                  <h4 class="font-medium text-gray-900 mb-2">Appropriate Use</h4>
                  <p class="text-gray-700 text-sm">Use our services for their intended purpose and respect other users and mental health professionals.</p>
                </div>
              </div>
            </section>

            <section class="bg-red-50 p-6 rounded-lg border border-red-200">
              <h3 class="text-lg font-medium text-red-900 mb-4 flex items-center">
                <span class="mr-2">⚠️</span> Important Medical Disclaimer
              </h3>
              <div class="space-y-4">
                <div class="bg-white p-4 rounded-lg border border-red-200">
                  <p class="text-red-800 font-medium mb-2">Our services are NOT a substitute for professional medical care.</p>
                  <ul class="space-y-1 text-red-700 text-sm ml-4">
                    <li>• Always consult qualified healthcare providers for medical advice</li>
                    <li>• Do not use our platform for emergency mental health situations</li>
                    <li>• Seek immediate help if you're experiencing thoughts of self-harm</li>
                  </ul>
                </div>
                <div class="bg-gray-900 text-white p-4 rounded-lg">
                  <p class="font-medium mb-2">🚨 Crisis Resources:</p>
                  <div class="grid sm:grid-cols-2 gap-2 text-sm">
                    <p>• National: 988 Suicide & Crisis Lifeline</p>
                    <p>• Text: HOME to 741741</p>
                    <p>• Emergency: 911</p>
                    <p>• International: befrienders.org</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">🛡️</span> Limitation of Liability
              </h3>
              <div class="space-y-4 text-gray-700">
                <p class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <strong class="text-yellow-800">Legal Protection:</strong> iKan provides tools and resources for mental wellness support. We are not liable for indirect, incidental, or consequential damages arising from service use.
                </p>
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-2">Service Availability</h4>
                    <p class="text-sm">We strive for 99.9% uptime but cannot guarantee uninterrupted service.</p>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-2">Content Accuracy</h4>
                    <p class="text-sm">Information is provided for educational purposes and regularly updated.</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">🔄</span> Updates & Modifications
              </h3>
              <div class="space-y-4">
                <p class="text-gray-700">We may update these terms to reflect service improvements or legal requirements. You'll be notified of significant changes.</p>
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 class="font-medium text-blue-900 mb-2">How We'll Notify You:</h4>
                  <ul class="text-blue-800 text-sm space-y-1">
                    <li>• Email notification to your registered address</li>
                    <li>• In-app notification banner</li>
                    <li>• 30-day notice for major changes</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div class="bg-gray-900 text-white p-6 rounded-lg">
            <h3 class="text-lg font-medium mb-3">Questions About These Terms?</h3>
            <p class="text-gray-300 mb-4">Our legal team is available to clarify any aspect of our Terms of Service.</p>
            <a href="mailto:legal@ikan.health" class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block">
              Contact Legal Team
            </a>
          </div>
        </div>
      `,
      lastUpdated: new Date().toISOString()
    },
    'faq': {
      title: 'Frequently Asked Questions',
      content: `
        <div class="space-y-8">
          <div class="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-100">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">❓ Frequently Asked Questions</h2>
            <p class="text-gray-700 leading-relaxed">Find answers to common questions about iKan's mental health platform. Can't find what you're looking for? <a href="mailto:support@ikan.health" class="text-green-600 font-medium hover:underline">Contact our support team</a>.</p>
          </div>

          <div class="space-y-6">
            <section class="bg-white rounded-lg shadow-sm border border-gray-100">
              <div class="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 class="text-lg font-medium text-gray-900 flex items-center">
                  <span class="mr-2">🌟</span> Getting Started
                </h3>
              </div>
              <div class="p-6 space-y-6">
                <div class="border-l-4 border-blue-400 pl-4">
                  <h4 class="font-medium text-gray-900 mb-2">What is iKan?</h4>
                  <p class="text-gray-700 text-sm">iKan is a comprehensive mental health platform that provides evidence-based assessments, personalized equip programs, and a curated resource library to support your mental wellness journey.</p>
                </div>
                <div class="border-l-4 border-green-400 pl-4">
                  <h4 class="font-medium text-gray-900 mb-2">How do I get started?</h4>
                  <p class="text-gray-700 text-sm mb-3">Getting started is simple:</p>
                  <ol class="text-gray-700 text-sm space-y-1 ml-4">
                    <li>1. Create your free account</li>
                    <li>2. Complete our initial assessment (10-15 minutes)</li>
                    <li>3. Receive personalized recommendations</li>
                    <li>4. Start your mental wellness journey</li>
                  </ol>
                </div>
                <div class="border-l-4 border-purple-400 pl-4">
                  <h4 class="font-medium text-gray-900 mb-2">Is my information secure?</h4>
                  <p class="text-gray-700 text-sm">Absolutely. We use industry-standard encryption and security measures to protect your personal and mental health information. Your privacy is our top priority, and we never sell your data.</p>
                </div>
              </div>
            </section>

            <section class="bg-white rounded-lg shadow-sm border border-gray-100">
              <div class="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <h3 class="text-lg font-medium text-gray-900 flex items-center">
                  <span class="mr-2">📊</span> Assessments
                </h3>
              </div>
              <div class="p-6 space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-2 flex items-center">
                      <span class="text-blue-500 mr-2">⏱️</span> Duration
                    </h4>
                    <p class="text-gray-700 text-sm">Most assessments take 10-15 minutes to complete. You can save your progress and return anytime.</p>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-2 flex items-center">
                      <span class="text-green-500 mr-2">🔄</span> Frequency
                    </h4>
                    <p class="text-gray-700 text-sm">We recommend monthly assessments to track your progress and adjust recommendations.</p>
                  </div>
                </div>
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 class="font-medium text-blue-900 mb-2">Available Assessments:</h4>
                  <ul class="text-blue-800 text-sm space-y-1">
                    <li>• PHQ-9 Depression Screening</li>
                    <li>• GAD-7 Anxiety Assessment</li>
                    <li>• Burnout Risk Evaluation</li>
                    <li>• Stress Level Assessment</li>
                    <li>• Overall Wellness Check-in</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="bg-white rounded-lg shadow-sm border border-gray-100">
              <div class="bg-purple-50 px-6 py-4 border-b border-purple-100">
                <h3 class="text-lg font-medium text-gray-900 flex items-center">
                  <span class="mr-2">🎯</span> Equip Programs
                </h3>
              </div>
              <div class="p-6 space-y-6">
                <div class="border-l-4 border-purple-400 pl-4">
                  <h4 class="font-medium text-gray-900 mb-2">What are Equip Programs?</h4>
                  <p class="text-gray-700 text-sm">Equip Programs are structured, evidence-based mental health interventions designed to help you develop coping skills and improve your overall wellbeing.</p>
                </div>
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 class="font-medium text-purple-900 mb-2">Popular Programs:</h4>
                    <ul class="text-purple-800 text-sm space-y-1">
                      <li>• Burnout Recovery (32 days)</li>
                      <li>• Stress Management (30 days)</li>
                      <li>• Better Sleep (21 days)</li>
                      <li>• Productivity Challenge (7 days)</li>
                    </ul>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-2">How to Access:</h4>
                    <p class="text-gray-700 text-sm">Programs are recommended based on your assessment results. You can also browse our program library and choose ones that interest you.</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="bg-white rounded-lg shadow-sm border border-gray-100">
              <div class="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
                <h3 class="text-lg font-medium text-gray-900 flex items-center">
                  <span class="mr-2">💰</span> Pricing & Plans
                </h3>
              </div>
              <div class="p-6 space-y-4">
                <div class="grid md:grid-cols-3 gap-4">
                  <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 class="font-medium text-green-900 mb-2">Free Features</h4>
                    <ul class="text-green-800 text-sm space-y-1">
                      <li>• Basic assessments</li>
                      <li>• Resource library access</li>
                      <li>• Mood tracking</li>
                    </ul>
                  </div>
                  <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 class="font-medium text-blue-900 mb-2">Equip Programs</h4>
                    <ul class="text-blue-800 text-sm space-y-1">
                      <li>• ₹199 - ₹499 each</li>
                      <li>• One-time payment</li>
                      <li>• Lifetime access</li>
                    </ul>
                  </div>
                  <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 class="font-medium text-purple-900 mb-2">Consultations</h4>
                    <ul class="text-purple-800 text-sm space-y-1">
                      <li>• Professional matching</li>
                      <li>• Secure video sessions</li>
                      <li>• Flexible scheduling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section class="bg-white rounded-lg shadow-sm border border-gray-100">
              <div class="bg-orange-50 px-6 py-4 border-b border-orange-100">
                <h3 class="text-lg font-medium text-gray-900 flex items-center">
                  <span class="mr-2">🤝</span> Support & Help
                </h3>
              </div>
              <div class="p-6 space-y-4">
                <div class="grid md:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <div class="border-l-4 border-orange-400 pl-4">
                      <h4 class="font-medium text-gray-900 mb-2">Contact Support</h4>
                      <p class="text-gray-700 text-sm">Email us at <a href="mailto:support@ikan.health" class="text-orange-600 font-medium hover:underline">support@ikan.health</a> or use our in-app contact form. We typically respond within 24 hours.</p>
                    </div>
                    <div class="border-l-4 border-red-400 pl-4">
                      <h4 class="font-medium text-gray-900 mb-2">Crisis Support</h4>
                      <p class="text-gray-700 text-sm">For mental health emergencies, contact your local emergency services or call 988 (Suicide & Crisis Lifeline).</p>
                    </div>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-3">Quick Links</h4>
                    <ul class="space-y-2 text-sm">
                      <li><a href="/privacy" class="text-blue-600 hover:underline">Privacy Policy</a></li>
                      <li><a href="/terms" class="text-blue-600 hover:underline">Terms of Service</a></li>
                      <li><a href="/return-policy" class="text-blue-600 hover:underline">Return Policy</a></li>
                      <li><a href="/contact" class="text-blue-600 hover:underline">Contact Us</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      `,
      lastUpdated: new Date().toISOString()
    },
    'contact': {
      title: "We're Here to Help",
      content: `
        <p>Your mental health journey matters to us. Reach out for support, questions, or just to connect.</p>
        <p><strong>Note:</strong> If you are in immediate danger, please call emergency services.</p>
      `,
      lastUpdated: new Date().toISOString()
    },
    'return-policy': {
      title: 'Return Policy',
      content: `
        <div class="space-y-8">
          <div class="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-lg border border-emerald-100">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">💚 Our Satisfaction Guarantee</h2>
            <p class="text-gray-700 leading-relaxed">At iKan, we're committed to your satisfaction with our mental health services. If you're not completely satisfied with your purchase, we offer a comprehensive and fair return policy.</p>
          </div>

          <div class="grid gap-6">
            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">📱</span> Digital Services Refund
              </h3>
              <div class="space-y-4">
                <p class="text-gray-700">For digital assessment reports, equip programs, and consultations:</p>
                <div class="grid md:grid-cols-3 gap-4">
                  <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 class="font-medium text-green-900 mb-2">7-Day Full Refund</h4>
                    <p class="text-green-800 text-sm">Complete refund available within 7 days of purchase, no questions asked.</p>
                  </div>
                  <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 class="font-medium text-blue-900 mb-2">Partial Refunds</h4>
                    <p class="text-blue-800 text-sm">Available for unused portions of programs based on progress completed.</p>
                  </div>
                  <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 class="font-medium text-purple-900 mb-2">Easy Process</h4>
                    <p class="text-purple-800 text-sm">Submit requests via email to <a href="mailto:billing@ikan.health" class="underline">billing@ikan.health</a></p>
                  </div>
                </div>
              </div>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">🔄</span> Subscription Services
              </h3>
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p class="text-blue-900 font-medium mb-3">Flexible subscription management:</p>
                <ul class="space-y-2 text-blue-800">
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2 mt-1">✓</span>
                    <span>Cancel anytime with no cancellation fees</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2 mt-1">✓</span>
                    <span>Refunds prorated to the date of cancellation</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2 mt-1">✓</span>
                    <span>Access continues until the end of billing period</span>
                  </li>
                </ul>
              </div>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">👨‍⚕️</span> Consultation Services
              </h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="space-y-4">
                  <div class="border-l-4 border-green-400 pl-4">
                    <h4 class="font-medium text-gray-900 mb-2">24+ Hours Notice</h4>
                    <p class="text-gray-700 text-sm">Full refund available for cancellations made 24+ hours before appointment</p>
                  </div>
                  <div class="border-l-4 border-yellow-400 pl-4">
                    <h4 class="font-medium text-gray-900 mb-2">2-24 Hours Notice</h4>
                    <p class="text-gray-700 text-sm">Rescheduling credit available (no cash refund)</p>
                  </div>
                </div>
                <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 class="font-medium text-red-900 mb-2">No-Show Policy</h4>
                  <p class="text-red-800 text-sm">Appointments missed without notice are non-refundable to respect our professionals' time.</p>
                </div>
              </div>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span class="mr-2">📝</span> How to Request a Refund
              </h3>
              <div class="grid lg:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-3">What to Include:</h4>
                    <ul class="space-y-2 text-gray-700 text-sm">
                      <li>• Your order number or transaction ID</li>
                      <li>• Reason for the refund request</li>
                      <li>• Your registered email address</li>
                      <li>• Any relevant feedback (optional)</li>
                    </ul>
                  </div>
                  <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 class="font-medium text-blue-900 mb-2">Contact Information:</h4>
                    <p class="text-blue-800 text-sm">Email: <a href="mailto:billing@ikan.health" class="underline font-medium">billing@ikan.health</a></p>
                    <p class="text-blue-700 text-xs mt-1">Response within 24 hours</p>
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 class="font-medium text-green-900 mb-2">Processing Timeline:</h4>
                    <ul class="space-y-1 text-green-800 text-sm">
                      <li>• Review: 1-2 business days</li>
                      <li>• Approval: Same day</li>
                      <li>• Bank processing: 3-5 business days</li>
                    </ul>
                  </div>
                  <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 class="font-medium text-purple-900 mb-2">Refund Method:</h4>
                    <p class="text-purple-800 text-sm">Refunds are issued to your original payment method (credit card, PayPal, etc.)</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="bg-gray-900 text-white p-6 rounded-lg">
            <h3 class="text-lg font-medium mb-3">Questions About Returns?</h3>
            <p class="text-gray-300 mb-4">Our billing team is here to help with any questions about refunds, credits, or payment issues.</p>
            <div class="flex flex-col sm:flex-row gap-4">
              <a href="mailto:billing@ikan.health" class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center">
                Contact Billing Team
              </a>
              <a href="/faq" class="border border-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-center">
                View FAQ
              </a>
            </div>
          </div>
        </div>
      `,
      lastUpdated: new Date().toISOString()
    },
    'cancellation-policy': {
      title: 'Cancellation Policy',
      content: `
        <h2>Account Cancellation</h2>
        <p>You may cancel your iKan account at any time. Here's what you need to know about our cancellation process.</p>
        
        <h2>How to Cancel</h2>
        <p>You can cancel your account through:</p>
        <ul>
          <li>Your account settings page</li>
          <li>Contacting our support team at support@ikan.health</li>
          <li>Using our online cancellation form</li>
        </ul>
        
        <h2>Subscription Cancellation</h2>
        <p>For subscription services:</p>
        <ul>
          <li>Cancel anytime before your next billing date</li>
          <li>No cancellation fees or penalties</li>
          <li>Access continues until the end of your current billing period</li>
          <li>Automatic renewal will be disabled upon cancellation</li>
        </ul>
        
        <h2>Appointment Cancellation</h2>
        <p>For consultation appointments:</p>
        <ul>
          <li>Cancel up to 24 hours before for full refund</li>
          <li>Cancel 2-24 hours before for rescheduling credit</li>
          <li>Cancellations less than 2 hours before are non-refundable</li>
        </ul>
        
        <h2>Data Retention</h2>
        <p>After account cancellation:</p>
        <ul>
          <li>Personal data will be deleted within 30 days</li>
          <li>Assessment results may be retained for research purposes (anonymized)</li>
          <li>You can request immediate data deletion by contacting privacy@ikan.health</li>
        </ul>
        
        <h2>Reactivation</h2>
        <p>You can reactivate your account within 30 days of cancellation by logging in. After 30 days, you'll need to create a new account.</p>
        
        <h2>Questions?</h2>
        <p>If you have questions about cancellation, please contact our support team at support@ikan.health.</p>
      `,
      lastUpdated: new Date().toISOString()
    },
    'sitemap': {
      title: 'Sitemap',
      content: `
        <h2>Site Navigation</h2>
        <p>Find all the pages and resources available on the iKan platform.</p>
        
        <h2>Main Sections</h2>
        <h3>Getting Started</h3>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/login">Sign In</a></li>
        </ul>
        
        <h3>Mental Health Tools</h3>
        <ul>
          <li><a href="/assessments">Assessments</a></li>
          <li><a href="/equip-programs">Equip Programs</a></li>
          <li><a href="/library">Resource Library</a></li>
          <li><a href="/consultation">Consultation Services</a></li>
        </ul>
        
        <h3>User Dashboard</h3>
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/mood-journal">Mood Journal</a></li>
          <li><a href="/account">Account Settings</a></li>
        </ul>
        
        <h2>Support & Information</h2>
        <h3>Help Center</h3>
        <ul>
          <li><a href="/faq">Frequently Asked Questions</a></li>
          <li><a href="/contact">Contact Us</a></li>
          <li><a href="/crisis-support">Crisis Support Resources</a></li>
        </ul>
        
        <h3>Legal & Policies</h3>
        <ul>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/return-policy">Return Policy</a></li>
          <li><a href="/cancellation-policy">Cancellation Policy</a></li>
        </ul>
        
        <h2>Resources by Category</h2>
        <h3>Mental Health Topics</h3>
        <ul>
          <li>Anxiety Management</li>
          <li>Depression Support</li>
          <li>Stress Relief</li>
          <li>Sleep Improvement</li>
          <li>Mindfulness & Meditation</li>
          <li>Relationship Wellness</li>
        </ul>
        
        <h3>Assessment Types</h3>
        <ul>
          <li>Mental Health Screening</li>
          <li>Anxiety Assessment</li>
          <li>Depression Screening</li>
          <li>Stress Level Evaluation</li>
          <li>Wellness Check-in</li>
        </ul>
        
        <h2>Mobile App</h2>
        <p>Access iKan on mobile devices through our progressive web app (PWA) for a seamless experience across all platforms.</p>
      `,
      lastUpdated: new Date().toISOString()
    },
    'homepage-hero': {
      title: 'Homepage Hero',
      content: JSON.stringify({
        title: "Reimagining mental health care.",
        description: "Stay on top of your mental health with real time monitoring and insights, expert therapists, science backed tools and programs.",
        ctaText: "Get Started",
        statistics: [
          {
            type: 'label',
            title: 'Acceptance',
            bgImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=600&fit=crop",
            videoImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=800&fit=crop"
          },
          {
            type: 'stat',
            number: '2500+',
            description: 'People who have gained more wellbeing through our platform',
            bgImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop",
            videoImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop"
          },
          {
            type: 'label',
            title: 'Understanding',
            bgImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
            videoImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop"
          },
          {
            type: 'stat',
            number: '52+',
            description: 'Qualified Psychologists',
            bgImage: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400&h=400&fit=crop",
            videoImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop"
          },
          {
            type: 'label',
            title: 'Compassion',
            bgImage: "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?w=400&h=400&fit=crop",
            videoImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"
          },
          {
            type: 'stat',
            number: '96%',
            description: 'Recommend our courses',
            bgImage: null,
            videoImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop",
            videoImage2: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop"
          }
        ]
      }),
      lastUpdated: new Date().toISOString()
    },
    'homepage-assessment': {
      title: 'Homepage Assessment Intro',
      content: JSON.stringify({
        title: "iKan is the mental health platform for the modern era.",
        description: "Get actionable and quantified insights about your mental health. Screen for issues prevent them from turning chronic with the help of our experts and evidence backed tools.",
        ctaText: "Get Started",
        image: "https://images.unsplash.com/photo-1724176636904-394580bfedf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB0ZWNobm9sb2d5JTIwYW5hbHl0aWNzJTIwaW5zaWdodHN8ZW58MXx8fHwxNzY1NDQ3NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
        programsTitle: "Assessment Programs",
        programsSubtitle: "PROGRAM",
        buttonText: "Take Assessment",
        programs: [
          { title: "Adult Therapy", image: "https://images.unsplash.com/photo-1758273240373-370993d0275d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
          { title: "Adult Psychiatry", image: "https://images.unsplash.com/photo-1758273240403-052b3c99f636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
          { title: "Hospital Care", image: "https://images.unsplash.com/photo-1711343777918-6d395c16e37f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" }
        ]
      }),
      lastUpdated: new Date().toISOString()
    },
    'homepage-mission': {
      title: 'Homepage Mission',
      content: JSON.stringify({
        title: "Our Mission",
        content: "We believe mental health is for everyone. Our mission is to fix the broken system and democratize mental healthcare by creating an accessible, secure, and people-centric and science-backed platform empowering every individual to achieve lasting well-being.",
        videoCaption: "Watch the full\\ninterview",
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
        imageAlt: "Mission interview"
      }),
      lastUpdated: new Date().toISOString()
    },
    'homepage-testimonial': {
      title: 'Homepage Testimonial',
      content: JSON.stringify({
        quote: "This platform has transformed how I manage my mental health. The tools are easy to use and the professionals are incredibly supportive.",
        author: "Sarah J.",
        role: "Member since 2023",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
      }),
      lastUpdated: new Date().toISOString()
    },
    'homepage-benefits': {
      title: 'Homepage Benefits',
      content: JSON.stringify({
        title: "Who is it for?",
        benefits: [
          {
            targetType: 'individuals',
            title: 'For Individuals',
            subtitle: 'Find Balance',
            description: 'Personalized mental health support tailored to your unique journey. Access therapy, tools, and a supportive community.',
            color: '#E0F2FE',
            iconColor: '#0284C7'
          },
          {
            targetType: 'employers',
            title: 'For Employers',
            subtitle: 'Support Your Team',
            description: 'Empower your workforce with comprehensive mental wellness programs. Boost productivity and improve team morale.',
            color: '#F0FDF4',
            iconColor: '#16A34A'
          },
          {
            targetType: 'professionals',
            title: 'For Professionals',
            subtitle: 'Expand Your Reach',
            description: 'Join our network of certified mental health professionals. Connect with clients and manage your practice efficiently.',
            color: '#FAF5FF',
            iconColor: '#9333EA'
          }
        ]
      }),
      lastUpdated: new Date().toISOString()
    },
    'homepage-faq': {
      title: 'Homepage FAQ',
      content: JSON.stringify({
        eyebrow: "Your Course",
        headline: "Psychological Help for Stress.\\nWhat this course offers you:",
        description: "Change takes time. Similar to sports or meditation, you won't feel immediate improvement - a clear plan and persistence are the keys to success. That's why our courses are designed for sustainability.",
        courseTitle: "6 Month Group Course",
        modules: [
          "MODULE 1: Start your journey!",
          "MODULE 2: My symptoms and goals",
          "MODULE 3: Psychological stress model",
          "MODULE 4: Resources and resilience",
          "MODULE 5: Self-worth and personal beliefs",
          "MODULE 6: Open discussion session",
          "MODULE 7: Reflection and review"
        ],
        cardTitle: "Begin your journey",
        features: [
          "1 month risk-free trial",
          "Self-paced learning modules",
          "Community support included"
        ],
        ctaText: "Get Started"
      }),
      lastUpdated: new Date().toISOString()
    },
    'homepage-newsletter': {
      title: 'Homepage Newsletter',
      content: JSON.stringify({
        title: "Newsletter Signup",
        benefits: [
          "Get weekly mental health tips and insights",
          "Early access to new features and programs",
          "Exclusive resources and guided exercises"
        ],
        imageUrl: "https://images.unsplash.com/photo-1758273240360-76b908e7582a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB3ZWxsbmVzcyUyMHN1cHBvcnR8ZW58MXx8fHwxNzY0OTUxMDY1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        imageAlt: "Mental health and wellness support",
        privacyText: "Privacy: We store and process your personal data based on our privacy policy. You can unsubscribe at any time.",
        ctaText: "Sign up now!"
      }),
      lastUpdated: new Date().toISOString()
    },
    'homepage-equip-intro': {
      title: 'Homepage Equip Intro',
      content: JSON.stringify({
        title: "Equip Programs",
        subtitle: "PROGRAM",
        features: [
          "Flexible — whenever and wherever you want",
          "Self-paced learning modules",
          "Expert-designed curriculum",
          "Community support included",
          "Progress tracking tools"
        ],
        ctaText: "LEARN MORE",
        footerText: "Supported by leading healthcare providers"
      }),
      lastUpdated: new Date().toISOString()
    }
  };

  return defaults[pageId] || {
    title: `${pageId.charAt(0).toUpperCase() + pageId.slice(1)} Page`,
    content: `<h2>${pageId.charAt(0).toUpperCase() + pageId.slice(1)}</h2><p>Content for this page will be available soon.</p>`,
    lastUpdated: new Date().toISOString()
  };
}







// Newsletter Signup Endpoint
app.post("/newsletter/signup", async (c) => {
  try {
    const { name, email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    const subscriberId = `newsletter:${email}`;
    
    // Check if already subscribed
    const existingSubscriber = await kv.get(subscriberId);
    if (existingSubscriber) {
      return c.json({ 
        message: 'You are already subscribed to our newsletter',
        alreadySubscribed: true 
      }, 200);
    }

    // Create newsletter subscription
    const subscription = {
      email,
      name: name || '',
      subscribed_at: new Date().toISOString(),
      status: 'active',
      source: 'website'
    };

    await kv.set(subscriberId, subscription);
    
    console.log(`✅ Newsletter subscription: ${email}`);
    return c.json({ 
      message: 'Successfully subscribed to newsletter!',
      success: true 
    });
  } catch (error) {
    console.log('Newsletter signup error:', error);
    return c.json({ error: 'Failed to process newsletter signup' }, 500);
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

    // Generate unique analytics ID
    const analyticsId = `analytics:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store analytics data with timestamp
    const analyticsRecord = {
      ...analyticsData,
      tracked_at: new Date().toISOString(),
      id: analyticsId
    };

    await kv.set(analyticsId, analyticsRecord);
    
    // Also store by resource ID for easy querying
    const resourceAnalyticsKey = `analytics:resource:${analyticsData.resource_id}`;
    const existingAnalytics = await kv.get(resourceAnalyticsKey) || [];
    existingAnalytics.push(analyticsId);
    await kv.set(resourceAnalyticsKey, existingAnalytics);
    
    console.log(`📊 Analytics tracked: ${analyticsData.action} on resource ${analyticsData.resource_id}`);
    
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
 */
app.post("/admin/communication/test", requireAdmin, async (c) => {
  try {
    const { provider, recipient, message } = await c.req.json();
    // Placeholder for actual API testing
    // Implementation depends on which provider (email, SMS, WhatsApp)
    return c.json({ 
      success: true, 
      message: `Test ${provider} message queued for ${recipient}` 
    });
  } catch (error) {
    console.error('Error testing communication API:', error);
    return c.json({ error: 'Failed to test API' }, 500);
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
 * Test payment gateway (Admin Only)
 */
app.post("/admin/payment/test", requireAdmin, async (c) => {
  try {
    const { gateway, amount } = await c.req.json();
    // Placeholder for actual gateway testing
    return c.json({ 
      success: true, 
      message: `Test transaction of ₹${amount} initiated with ${gateway}` 
    });
  } catch (error) {
    console.error('Error testing payment gateway:', error);
    return c.json({ error: 'Failed to test gateway' }, 500);
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

// Upload file to Supabase Storage
app.post("/upload", async (c) => {
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

// Upload image - Alias for /upload endpoint (specifically for image uploads)
app.post("/upload-image", async (c) => {
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

// Get all media files (for media library)
app.get("/media", async (c) => {
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

// Delete media file
app.delete("/media/:id", async (c) => {
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

// Update site settings
app.put("/settings", async (c) => {
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

// ========================================
// ACTIVITY LOG & ANALYTICS ENDPOINTS
// ========================================

// Log activity (login, resource view, etc.)
app.post("/analytics/activity", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const { type, resourceId, metadata } = await c.req.json();
    
    if (!type) {
      return c.json({ error: 'Activity type is required' }, 400);
    }

    const activityId = `activity:${Date.now()}:${user.id}`;
    const activity = {
      id: activityId,
      userId: user.id,
      type, // 'login', 'resource_view', 'program_start', etc.
      resourceId: resourceId || null,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    };

    // Store in main activity log
    await kv.set(activityId, activity);
    
    // Also store in user-specific log for easier user history
    await kv.set(`user_activity:${user.id}:${Date.now()}`, activity);

    console.log(`📊 Activity logged: ${type} for user ${user.id}`);
    return c.json({ success: true, activity });
  } catch (error) {
    console.error('Log activity error:', error);
    return c.json({ error: 'Failed to log activity' }, 500);
  }
});

// Get aggregated activity analytics
app.get("/analytics/aggregated", requireAdmin, async (c) => {
  try {
    // Fetch all activities
    // Note: In a real production system with millions of rows, you'd use a dedicated analytics DB
    // or pre-aggregated counters. For this KV store, we'll scan.
    const activities = await kv.getByPrefix('activity:');
    
    // Initialize counters
    const stats = {
      totalLogins: 0,
      totalResourceViews: 0,
      activeUsers24h: new Set(),
      activeUsers7d: new Set(),
      resourceViews: {} as Record<string, number>,
      dailyActivity: {} as Record<string, number>
    };

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const item of activities) {
      const act = item; // kv.getByPrefix returns values directly in this setup if configured, or { key, value }
      // Based on previous code, getByPrefix returns array of values? 
      // Checking `kv.getByPrefix` usage: `const categories = await kv.getByPrefix('category:');`
      // It seems it returns values. Let's assume it returns values.
      
      if (!act || !act.timestamp) continue;
      
      const date = new Date(act.timestamp);
      const dateStr = date.toISOString().split('T')[0];

      // Daily Activity Count
      stats.dailyActivity[dateStr] = (stats.dailyActivity[dateStr] || 0) + 1;

      // Active Users
      if (date > oneDayAgo) stats.activeUsers24h.add(act.userId);
      if (date > sevenDaysAgo) stats.activeUsers7d.add(act.userId);

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
    
    // Try to get from the dedicated read tracking list first (from mark-read endpoint)
    const readActivityIds = await kv.get(`activity:user:${userId}:reads`) || [];
    if (readActivityIds.length > 0) {
      // We have IDs, we would need to check timestamps. 
      // Since we don't want to fetch all individually, we can rely on the fact that IDs usually contain timestamps 
      // or we just trust the client for now? No, let's look at the implementation of mark-read.
      // It stores full objects in `activity:read:...` but only IDs in the user list.
      // For simplicity/performance in this MVP, let's check the user_activity log instead.
      
      const recentActivities = await kv.getByPrefix(`user_activity:${userId}:`);
      weeklyResourcesRead = recentActivities.filter((act: any) => 
        (act.type === 'resource_view' || act.type === 'read') && 
        new Date(act.timestamp) >= startOfWeek
      ).length;
    } else {
        // Fallback to scanning user_activity prefix
        const recentActivities = await kv.getByPrefix(`user_activity:${userId}:`);
        weeklyResourcesRead = recentActivities.filter((act: any) => 
            (act.type === 'resource_view' || act.type === 'read') && 
            new Date(act.timestamp) >= startOfWeek
        ).length;
    }

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
    
    // Get user activity
    const activities = await kv.getByPrefix(`user_activity:${user.id}:`);
    
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

// ========================================
// HEALTH DATA (Google Fit) ENDPOINTS
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
    console.log(`✅ Returning ${validMoods.length} mood types`);
    return c.json({ moods: validMoods });
  } catch (error) {
    console.error('❌ Get moods error:', error);
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

// Get all moods
app.get('/moods', async (c) => {
  try {
    const moods = await kv.getByPrefix('mood:');
    const validMoods = moods.filter((mood: any) => mood && mood.id);
    console.log(`✅ Returning ${validMoods.length} moods`);
    return c.json(validMoods);
  } catch (error) {
    console.error('Get moods error:', error);
    return c.json({ error: 'Failed to fetch moods' }, 500);
  }
});

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

Deno.serve(app.fetch);