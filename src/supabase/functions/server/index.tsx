import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { createHash, createHmac } from "node:crypto";

const app = new Hono();

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

// Health check endpoint
app.get("/make-server-cc205da9/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// User signup endpoint
app.post("/make-server-cc205da9/auth/signup", async (c) => {
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
      created_at: new Date().toISOString()
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get user profile
app.get("/make-server-cc205da9/users/profile", requireAuth, async (c) => {
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

// Update user profile
app.put("/make-server-cc205da9/users/profile", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const updates = await c.req.json();
    
    const currentProfile = await kv.get(`user:${userId}`);
    if (!currentProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`user:${userId}`, updatedProfile);
    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Journal Entry Endpoints
app.post("/make-server-cc205da9/journal/entries", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { date, mood_rating, freehand_text_content, associated_tracker_entry_id } = await c.req.json();
    
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

app.get("/make-server-cc205da9/journal/entries", requireAuth, async (c) => {
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

app.get("/make-server-cc205da9/journal/entries/:date", requireAuth, async (c) => {
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
app.get("/make-server-cc205da9/assessments", async (c) => {
  try {
    // Get all available assessments
    const assessments = await kv.getByPrefix('assessment:');
    return c.json({ assessments });
  } catch (error) {
    console.log('Get assessments error:', error);
    return c.json({ error: 'Failed to retrieve assessments' }, 500);
  }
});

app.get("/make-server-cc205da9/assessments/:assessmentId", async (c) => {
  try {
    const assessmentId = c.req.param('assessmentId');
    const assessment = await kv.get(`assessment:${assessmentId}`);
    
    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }
    
    return c.json({ assessment });
  } catch (error) {
    console.log('Get assessment error:', error);
    return c.json({ error: 'Failed to retrieve assessment' }, 500);
  }
});

app.post("/make-server-cc205da9/assessments", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const assessmentData = await c.req.json();
    const assessmentId = assessmentData.id || `assessment-${Date.now()}`;
    
    // Ensure ID is set
    const newAssessment = {
      ...assessmentData,
      id: assessmentId,
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

app.put("/make-server-cc205da9/assessments/:assessmentId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const assessmentId = c.req.param('assessmentId');
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const updates = await c.req.json();
    const existingAssessment = await kv.get(`assessment:${assessmentId}`);
    
    if (!existingAssessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }
    
    const updatedAssessment = {
      ...existingAssessment,
      ...updates,
      id: assessmentId,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`assessment:${assessmentId}`, updatedAssessment);
    
    console.log(`✅ Assessment updated: ${assessmentId}`);
    return c.json({ assessment: updatedAssessment });
  } catch (error) {
    console.log('Update assessment error:', error);
    return c.json({ error: 'Failed to update assessment' }, 500);
  }
});

app.delete("/make-server-cc205da9/assessments/:assessmentId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const assessmentId = c.req.param('assessmentId');
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const existingAssessment = await kv.get(`assessment:${assessmentId}`);
    if (!existingAssessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }
    
    await kv.del(`assessment:${assessmentId}`);
    
    console.log(`✅ Assessment deleted: ${assessmentId}`);
    return c.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    console.log('Delete assessment error:', error);
    return c.json({ error: 'Failed to delete assessment' }, 500);
  }
});

app.post("/make-server-cc205da9/assessments/:assessmentId/responses", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const assessmentId = c.req.param('assessmentId');
    const { responses, status, score } = await c.req.json();
    
    const responseId = `${userId}-${assessmentId}-${Date.now()}`;
    const assessmentResponse = {
      response_id: responseId,
      user_id: userId,
      assessment_id: assessmentId,
      responses,
      status: status || 'in_progress',
      score: score || null,
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

app.get("/make-server-cc205da9/assessments/responses/user", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const responses = await kv.getByPrefix(`assessment_response_by_user:${userId}`);
    
    return c.json({ responses });
  } catch (error) {
    console.log('Get user assessment responses error:', error);
    return c.json({ error: 'Failed to retrieve assessment responses' }, 500);
  }
});

// Equip Program Endpoints
app.get("/make-server-cc205da9/equip/programs", async (c) => {
  try {
    const programs = await kv.getByPrefix('equip_program:');
    return c.json({ programs });
  } catch (error) {
    console.log('Get equip programs error:', error);
    return c.json({ error: 'Failed to retrieve programs' }, 500);
  }
});

app.get("/make-server-cc205da9/equip/programs/:equipId", async (c) => {
  try {
    const equipId = c.req.param('equipId');
    let program = await kv.get(`equip_program:${equipId}`);
    
    if (!program) {
      program = await kv.get(`equip_program_by_slug:${equipId}`);
    }
    
    if (!program) {
      return c.json({ error: 'Program not found' }, 404);
    }
    
    return c.json({ program });
  } catch (error) {
    console.log('Get equip program error:', error);
    return c.json({ error: 'Failed to retrieve program' }, 500);
  }
});

app.post("/make-server-cc205da9/equip/programs", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const programData = await c.req.json();
    const equipId = programData.equip_id || `equip-${Date.now()}`;
    
    const newProgram = {
      ...programData,
      equip_id: equipId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`equip_program:${equipId}`, newProgram);
    
    // Also store by slug if available for lookup flexibility
    if (newProgram.slug) {
      await kv.set(`equip_program_by_slug:${newProgram.slug}`, newProgram);
    }
    
    console.log(`✅ Equip program created: ${equipId}`);
    return c.json({ program: newProgram });
  } catch (error) {
    console.log('Create equip program error:', error);
    return c.json({ error: 'Failed to create equip program' }, 500);
  }
});

app.put("/make-server-cc205da9/equip/programs/:equipId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const equipId = c.req.param('equipId');
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const updates = await c.req.json();
    const existingProgram = await kv.get(`equip_program:${equipId}`);
    
    if (!existingProgram) {
      return c.json({ error: 'Program not found' }, 404);
    }
    
    const updatedProgram = {
      ...existingProgram,
      ...updates,
      equip_id: equipId,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`equip_program:${equipId}`, updatedProgram);
    
    // Update slug mapping if it changed
    if (updatedProgram.slug && updatedProgram.slug !== existingProgram.slug) {
        if (existingProgram.slug) {
            await kv.del(`equip_program_by_slug:${existingProgram.slug}`);
        }
        await kv.set(`equip_program_by_slug:${updatedProgram.slug}`, updatedProgram);
    } else if (updatedProgram.slug) {
         await kv.set(`equip_program_by_slug:${updatedProgram.slug}`, updatedProgram);
    }
    
    console.log(`✅ Equip program updated: ${equipId}`);
    return c.json({ program: updatedProgram });
  } catch (error) {
    console.log('Update equip program error:', error);
    return c.json({ error: 'Failed to update equip program' }, 500);
  }
});

app.delete("/make-server-cc205da9/equip/programs/:equipId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const equipId = c.req.param('equipId');
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const existingProgram = await kv.get(`equip_program:${equipId}`);
    if (!existingProgram) {
      return c.json({ error: 'Program not found' }, 404);
    }
    
    await kv.del(`equip_program:${equipId}`);
    
    if (existingProgram.slug) {
        await kv.del(`equip_program_by_slug:${existingProgram.slug}`);
    }
    
    console.log(`✅ Equip program deleted: ${equipId}`);
    return c.json({ success: true, message: 'Program deleted successfully' });
  } catch (error) {
    console.log('Delete equip program error:', error);
    return c.json({ error: 'Failed to delete equip program' }, 500);
  }
});

// Library Resource Endpoints
app.get("/make-server-cc205da9/library/resources", async (c) => {
  try {
    const { category, limit = 50, offset = 0 } = c.req.query();
    
    let resources = await kv.getByPrefix('resource:');
    
    // Filter by category if provided
    if (category) {
      resources = resources.filter(resource => resource.category === category);
    }
    
    // Sort by created_at descending and apply pagination
    resources = resources
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    return c.json({ resources });
  } catch (error) {
    console.log('Get library resources error:', error);
    return c.json({ error: 'Failed to retrieve resources' }, 500);
  }
});

app.get("/make-server-cc205da9/library/resources/:resourceId", async (c) => {
  try {
    const resourceId = c.req.param('resourceId');
    const resource = await kv.get(`resource:${resourceId}`);
    
    if (!resource) {
      return c.json({ error: 'Resource not found' }, 404);
    }
    
    return c.json({ resource });
  } catch (error) {
    console.log('Get library resource error:', error);
    return c.json({ error: 'Failed to retrieve resource' }, 500);
  }
});

// Admin Blog Management Endpoints
app.get("/make-server-cc205da9/admin/blogs", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    // Get all blog resources
    const blogs = await kv.getByPrefix('resource:');
    
    // Sort by created_at descending
    const sortedBlogs = blogs.sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    
    return c.json({ blogs: sortedBlogs });
  } catch (error) {
    console.log('Get admin blogs error:', error);
    return c.json({ error: 'Failed to retrieve blogs' }, 500);
  }
});

app.post("/make-server-cc205da9/admin/blogs", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const blogData = await c.req.json();
    const blogId = `blog-${Date.now()}`;
    
    const newBlog = {
      id: blogId,
      ...blogData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.id
    };
    
    await kv.set(`resource:${blogId}`, newBlog);
    
    console.log(`✅ Blog created: ${blogId}`);
    return c.json({ blog: newBlog });
  } catch (error) {
    console.log('Create blog error:', error);
    return c.json({ error: 'Failed to create blog' }, 500);
  }
});

app.put("/make-server-cc205da9/admin/blogs/:blogId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const blogId = c.req.param('blogId');
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const updates = await c.req.json();
    const existingBlog = await kv.get(`resource:${blogId}`);
    
    if (!existingBlog) {
      return c.json({ error: 'Blog not found' }, 404);
    }
    
    const updatedBlog = {
      ...existingBlog,
      ...updates,
      id: blogId, // Preserve ID
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };
    
    await kv.set(`resource:${blogId}`, updatedBlog);
    
    console.log(`✅ Blog updated: ${blogId}`);
    return c.json({ blog: updatedBlog });
  } catch (error) {
    console.log('Update blog error:', error);
    return c.json({ error: 'Failed to update blog' }, 500);
  }
});

app.delete("/make-server-cc205da9/admin/blogs/:blogId", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const blogId = c.req.param('blogId');
    
    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const existingBlog = await kv.get(`resource:${blogId}`);
    if (!existingBlog) {
      return c.json({ error: 'Blog not found' }, 404);
    }
    
    await kv.del(`resource:${blogId}`);
    
    console.log(`✅ Blog deleted: ${blogId}`);
    return c.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.log('Delete blog error:', error);
    return c.json({ error: 'Failed to delete blog' }, 500);
  }
});

// Seed Demo Users Endpoint
app.post("/make-server-cc205da9/seed/users", async (c) => {
  try {
    const demoUser = {
      email: 'demo@ikan.health',
      password: 'password123',
      user_metadata: { name: 'Demo User', corporate_user: false },
      email_confirm: true
    };

    // Try to create the user
    const { data, error } = await supabase.auth.admin.createUser(demoUser);

    if (error) {
      // If user already exists, just return success (idempotent)
      if (error.message?.includes('already registered')) {
        console.log('Demo user already exists');
        return c.json({ message: 'Demo user already exists' });
      }
      console.log('Error creating demo user:', error);
      return c.json({ error: error.message }, 400);
    }

    // Also create profile in KV
    if (data.user) {
      await kv.set(`user:${data.user.id}`, {
        user_id: data.user.id,
        email: demoUser.email,
        name: demoUser.user_metadata.name,
        phone: null,
        avatar_url: null,
        corporate_user: false,
        created_at: new Date().toISOString(),
        is_admin: true // Make demo user an admin for convenience
      });
    }

    console.log('✅ Demo user created');
    return c.json({ user: data.user, message: 'Demo user created successfully' });
  } catch (error) {
    console.log('Seed users error:', error);
    return c.json({ error: 'Failed to seed users' }, 500);
  }
});

// Set user as admin endpoint (for initial admin setup)
app.post("/make-server-cc205da9/admin/set-admin/:userId", requireAuth, async (c) => {
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

// Consultation/Professional Endpoints
app.get("/make-server-cc205da9/consultation/professionals", async (c) => {
  try {
    const { specialty, location, limit = 50 } = c.req.query();
    
    let professionals = await kv.getByPrefix('professional:');
    
    // Filter by specialty if provided
    if (specialty) {
      professionals = professionals.filter(professional => 
        professional.specialties && professional.specialties.includes(specialty)
      );
    }
    
    // Filter by location if provided
    if (location) {
      professionals = professionals.filter(professional => 
        professional.location && professional.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Limit results
    professionals = professionals.slice(0, parseInt(limit));
    
    return c.json({ professionals });
  } catch (error) {
    console.log('Get professionals error:', error);
    return c.json({ error: 'Failed to retrieve professionals' }, 500);
  }
});

app.get("/make-server-cc205da9/consultation/professionals/:professionalId", async (c) => {
  try {
    const professionalId = c.req.param('professionalId');
    const professional = await kv.get(`professional:${professionalId}`);
    
    if (!professional) {
      return c.json({ error: 'Professional not found' }, 404);
    }
    
    return c.json({ professional });
  } catch (error) {
    console.log('Get professional error:', error);
    return c.json({ error: 'Failed to retrieve professional' }, 500);
  }
});

// CMS Page Endpoints
app.get("/make-server-cc205da9/cms/pages/:pageId", async (c) => {
  try {
    const pageId = c.req.param('pageId');
    console.log(`📄 CMS request for page: ${pageId}`);
    
    // Try to get page content from KV store first
    let page = await kv.get(`cms_page:${pageId}`);
    
    if (!page) {
      // Create default content if page doesn't exist
      console.log(`📄 Creating default content for CMS page: ${pageId}`);
      page = createDefaultCMSContent(pageId);
      
      // Store the default content for future requests
      await kv.set(`cms_page:${pageId}`, page);
    }
    
    return c.json(page);
  } catch (error) {
    console.log('Get CMS page error:', error);
    return c.json({ error: 'Failed to retrieve page content' }, 500);
  }
});

app.put("/make-server-cc205da9/cms/pages/:pageId", requireAuth, async (c) => {
  try {
    const pageId = c.req.param('pageId');
    const content = await c.req.json();
    
    const updatedPage = {
      ...content,
      pageId,
      lastUpdated: new Date().toISOString()
    };
    
    await kv.set(`cms_page:${pageId}`, updatedPage);
    return c.json(updatedPage);
  } catch (error) {
    console.log('Update CMS page error:', error);
    return c.json({ error: 'Failed to update page content' }, 500);
  }
});

// Helper function to create default CMS content
function createDefaultCMSContent(pageId: string): any {
  const defaults: { [key: string]: any } = {
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
      title: 'Contact Us',
      content: `
        <div class="space-y-8">
          <div class="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-lg border border-cyan-100">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">💬 Get in Touch</h2>
            <p class="text-gray-700 leading-relaxed">We're here to support you on your mental health journey. Reach out to us for any questions, concerns, or feedback. Your wellbeing is our priority.</p>
          </div>

          <div class="grid lg:grid-cols-2 gap-8">
            <div class="space-y-6">
              <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span class="mr-2">🎧</span> Support Team
                </h3>
                <div class="space-y-4">
                  <p class="text-gray-700">Our dedicated support team is available to help with technical issues, account questions, and general inquiries.</p>
                  <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div class="grid gap-3">
                      <div class="flex items-center">
                        <span class="text-blue-600 mr-3">📧</span>
                        <div>
                          <p class="font-medium text-blue-900">Email Support</p>
                          <a href="mailto:support@ikan.health" class="text-blue-600 hover:underline">support@ikan.health</a>
                        </div>
                      </div>
                      <div class="flex items-center">
                        <span class="text-green-600 mr-3">⏰</span>
                        <div>
                          <p class="font-medium text-green-900">Response Time</p>
                          <p class="text-green-700 text-sm">Within 24 hours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section class="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 class="text-lg font-medium text-red-900 mb-4 flex items-center">
                  <span class="mr-2">🚨</span> Crisis Support
                </h3>
                <div class="space-y-4">
                  <p class="text-red-800 font-medium">If you're experiencing a mental health crisis, please reach out for immediate help:</p>
                  <div class="grid gap-3">
                    <div class="bg-white p-3 rounded-lg border border-red-200">
                      <p class="font-medium text-red-900">National Suicide Prevention Lifeline</p>
                      <a href="tel:988" class="text-red-600 font-mono text-lg hover:underline">988</a>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-red-200">
                      <p class="font-medium text-red-900">Crisis Text Line</p>
                      <p class="text-red-600">Text <strong>HOME</strong> to <strong>741741</strong></p>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-red-200">
                      <p class="font-medium text-red-900">Emergency Services</p>
                      <a href="tel:911" class="text-red-600 font-mono text-lg hover:underline">911</a>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-red-200">
                      <p class="font-medium text-red-900">International Support</p>
                      <a href="https://befrienders.org" target="_blank" class="text-red-600 hover:underline">befrienders.org</a>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div class="space-y-6">
              <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span class="mr-2">🤝</span> Business Inquiries
                </h3>
                <div class="space-y-4">
                  <div class="border-l-4 border-purple-400 pl-4">
                    <h4 class="font-medium text-gray-900 mb-2">Partnerships</h4>
                    <p class="text-gray-700 text-sm mb-2">For partnership opportunities and collaborations:</p>
                    <a href="mailto:partnerships@ikan.health" class="text-purple-600 hover:underline">partnerships@ikan.health</a>
                  </div>
                  <div class="border-l-4 border-green-400 pl-4">
                    <h4 class="font-medium text-gray-900 mb-2">Media Inquiries</h4>
                    <p class="text-gray-700 text-sm mb-2">For press and media inquiries:</p>
                    <a href="mailto:press@ikan.health" class="text-green-600 hover:underline">press@ikan.health</a>
                  </div>
                  <div class="border-l-4 border-blue-400 pl-4">
                    <h4 class="font-medium text-gray-900 mb-2">Legal & Compliance</h4>
                    <p class="text-gray-700 text-sm mb-2">For legal matters and compliance questions:</p>
                    <a href="mailto:legal@ikan.health" class="text-blue-600 hover:underline">legal@ikan.health</a>
                  </div>
                </div>
              </section>

              <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span class="mr-2">📍</span> Office Address
                </h3>
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <address class="not-italic text-gray-700 leading-relaxed">
                    <strong class="text-gray-900">iKan Health Inc.</strong><br>
                    123 Mental Health Boulevard<br>
                    Wellness City, CA 90210<br>
                    United States
                  </address>
                </div>
                <div class="mt-4 text-sm text-gray-600">
                  <p>📞 Phone consultations available through our platform</p>
                  <p>🌐 Remote-first mental health support</p>
                </div>
              </section>

              <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span class="mr-2">🌐</span> Connect With Us
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <a href="https://twitter.com/ikan_health" target="_blank" class="bg-blue-50 p-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-center">
                    <div class="text-blue-600 text-2xl mb-1">🐦</div>
                    <p class="text-blue-900 font-medium text-sm">Twitter</p>
                  </a>
                  <a href="https://linkedin.com/company/ikan-health" target="_blank" class="bg-blue-50 p-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-center">
                    <div class="text-blue-600 text-2xl mb-1">💼</div>
                    <p class="text-blue-900 font-medium text-sm">LinkedIn</p>
                  </a>
                  <a href="https://instagram.com/ikan.health" target="_blank" class="bg-pink-50 p-3 rounded-lg border border-pink-200 hover:bg-pink-100 transition-colors text-center">
                    <div class="text-pink-600 text-2xl mb-1">📸</div>
                    <p class="text-pink-900 font-medium text-sm">Instagram</p>
                  </a>
                  <a href="https://youtube.com/@ikan.health" target="_blank" class="bg-red-50 p-3 rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-center">
                    <div class="text-red-600 text-2xl mb-1">📺</div>
                    <p class="text-red-900 font-medium text-sm">YouTube</p>
                  </a>
                </div>
              </section>
            </div>
          </div>

          <div class="bg-gray-900 text-white p-6 rounded-lg">
            <h3 class="text-lg font-medium mb-3">We Value Your Feedback</h3>
            <p class="text-gray-300 mb-4">Your experience matters to us. Share your thoughts, suggestions, or concerns to help us improve our mental health platform.</p>
            <div class="flex flex-col sm:flex-row gap-4">
              <a href="mailto:feedback@ikan.health" class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center">
                Send Feedback
              </a>
              <a href="/faq" class="border border-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-center">
                Check FAQ First
              </a>
            </div>
          </div>
        </div>
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
    }
  };

  return defaults[pageId] || {
    title: `${pageId.charAt(0).toUpperCase() + pageId.slice(1)} Page`,
    content: `<h2>${pageId.charAt(0).toUpperCase() + pageId.slice(1)}</h2><p>Content for this page will be available soon.</p>`,
    lastUpdated: new Date().toISOString()
  };
}

// Optimized seeding endpoint - lightweight and fast
app.post("/make-server-cc205da9/seed/data", async (c) => {
  try {
    console.log('🌱 Seeding iKan sample data (optimized)...');
    
    // Import seed function from dedicated file
    const { handleSeedData } = await import('./seed-endpoint.tsx');
    const result = await handleSeedData();
    
    return c.json(result);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    return c.json({
      success: false,
      error: 'Failed to seed data: ' + error.message
    }, 500);
  }
});

// Force seed all canonical programs - this ensures all 4 programs are available
app.post("/make-server-cc205da9/seed/force-programs", async (c) => {
  try {
    console.log('🚀 Force seeding all canonical equip programs...');
    
    // Clear existing programs first
    const existingPrograms = await kv.getByPrefix('equip_program:');
    for (const program of existingPrograms) {
      const keys = [`equip_program:${program.slug}`, `equip_program:${program.equip_id}`];
      for (const key of keys) {
        try {
          await kv.del(key);
        } catch (e) {
          console.warn('Could not delete key:', key);
        }
      }
    }
    console.log(`🧹 Cleared ${existingPrograms.length} existing programs`);

    // All 4 canonical programs with consistent data structure
    const canonicalPrograms = [
      {
        equip_id: "equip-burnout-recovery-32",
        id: "00000000-0000-0000-0000-000000000010",
        slug: "burnout-recovery-32",
        title: "Burnout Recovery (32-day)",
        description: "A comprehensive 32-day guided program to recover from burnout",
        price: {
          currency: "INR",
          amount_cents: 49900,
          payment_provider: "razorpay",
          one_time: true
        },
        duration_days: 32,
        expiry_days_after_purchase: 180,
        category: "burnout",
        difficulty_level: "intermediate",
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        days: [
          {
            day: 1,
            title: "Introduction to Burnout",
            type: "lesson",
            content: [
              {kind: "text", body: "Learn what burnout is, its signs, and how this program will guide recovery."}
            ],
            required: true,
            estimated_min: 10
          }
        ]
      },
      {
        equip_id: "equip-stress-management-30",
        id: "00000000-0000-0000-0000-000000000011",
        slug: "stress-management-30",
        title: "Stress Management (30-day)",
        description: "A 30-day comprehensive program to develop effective stress management techniques",
        price: {
          currency: "INR",
          amount_cents: 39900,
          payment_provider: "razorpay",
          one_time: true
        },
        duration_days: 30,
        expiry_days_after_purchase: 180,
        category: "stress",
        difficulty_level: "beginner",
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        days: [
          {
            day: 1,
            title: "Understanding Your Stress",
            type: "lesson",
            content: [
              {kind: "text", body: "Identify your unique stress patterns and triggers."}
            ],
            required: true,
            estimated_min: 15
          }
        ]
      },
      {
        equip_id: "equip-better-sleep-21",
        id: "00000000-0000-0000-0000-000000000013",
        slug: "better-sleep-21",
        title: "Better Sleep (21-day)",
        description: "A focused 21-day program to improve sleep quality through evidence-based practices",
        price: {
          currency: "INR",
          amount_cents: 29900,
          payment_provider: "razorpay",
          one_time: true
        },
        duration_days: 21,
        expiry_days_after_purchase: 120,
        category: "sleep",
        difficulty_level: "beginner", 
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        days: [
          {
            day: 1,
            title: "Sleep Science Basics",
            type: "lesson",
            content: [
              {kind: "text", body: "Learn about sleep cycles, circadian rhythms, and sleep's role in mental health."}
            ],
            required: true,
            estimated_min: 15
          }
        ]
      },
      {
        equip_id: "equip-productivity-challenge-7",
        id: "00000000-0000-0000-0000-000000000014",
        slug: "productivity-challenge-7",
        title: "Productivity Challenge (7-day)",
        description: "A quick 7-day intensive challenge to boost productivity and improve focus",
        price: {
          currency: "INR",
          amount_cents: 19900,
          payment_provider: "razorpay",
          one_time: true
        },
        duration_days: 7,
        expiry_days_after_purchase: 90,
        category: "productivity",
        difficulty_level: "beginner",
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        days: [
          {
            day: 1,
            title: "Productivity Assessment",
            type: "lesson",
            content: [
              {kind: "text", body: "Assess your current productivity patterns and identify improvement areas."}
            ],
            required: true,
            estimated_min: 20
          }
        ]
      }
    ];

    // Store all canonical equip programs with multiple keys for lookup flexibility
    for (const program of canonicalPrograms) {
      await kv.set(`equip_program:${program.slug}`, program);
      await kv.set(`equip_program:${program.equip_id}`, program);
      console.log(`✅ Force seeded: ${program.title}`);
    }

    console.log('🎉 All 4 canonical equip programs force seeded successfully');
    
    return c.json({
      success: true,
      message: 'All 4 canonical equip programs force seeded successfully',
      programs: canonicalPrograms.map(p => ({ id: p.slug, title: p.title, duration_days: p.duration_days }))
    });

  } catch (error) {
    console.error('❌ Force seeding programs error:', error);
    return c.json({
      success: false,
      error: 'Failed to force seed programs: ' + error.message
    }, 500);
  }
});

// Legacy endpoint maintained for compatibility
app.post("/make-server-cc205da9/seed/data-legacy", async (c) => {
  try {
    console.log('🌱 Seeding iKan sample data (optimized)...');
    
    // Quick status check to prevent duplicate work
    const existingAssessments = await kv.getByPrefix('assessment:');
    if (existingAssessments.length >= 2) {
      console.log('✅ Assessments already seeded - skipping full seed');
      return c.json({
        success: true,
        message: 'Data already seeded',
        assessments: existingAssessments.map(a => ({ id: a.slug, title: a.title }))
      });
    }

    // Seed just the essential assessments to prevent timeout
    const phq9Assessment = {
      assessment_id: "assess-depression-phq9",
      id: "00000000-0000-0000-0000-000000000003",
      slug: "phq9",
      title: "PHQ-9 Depression Screening",
      description: "9-item depression screening tool",
      version: "1.0",
      metadata: {
        estimated_minutes: 3,
        category: "depression",
        allow_repeat_days: 30,
        created_at: "2025-09-18T00:00:00Z"
      },
      questions: [
        {
          question_id: "q1",
          id: "q1",
          order: 1,
          text: "Little interest or pleasure in doing things",
          type: "scale",
          required: true,
          options: [
            { id: "0", label: "Not at all", value: 0, score: 0 },
            { id: "1", label: "Several days", value: 1, score: 1 },
            { id: "2", label: "More than half the days", value: 2, score: 2 },
            { id: "3", label: "Nearly every day", value: 3, score: 3 }
          ]
        },
        {
          question_id: "q2",
          id: "q2",
          order: 2,
          text: "Feeling down, depressed, or hopeless",
          type: "scale",
          required: true,
          options: [
            { id: "0", label: "Not at all", value: 0, score: 0 },
            { id: "1", label: "Several days", value: 1, score: 1 },
            { id: "2", label: "More than half the days", value: 2, score: 2 },
            { id: "3", label: "Nearly every day", value: 3, score: 3 }
          ]
        }
      ]
    };

    const gad7Assessment = {
      assessment_id: "assess-anxiety-gad7",
      id: "00000000-0000-0000-0000-000000000004",
      slug: "gad7",
      title: "GAD-7 Anxiety Screening",
      description: "7-item anxiety screening tool",
      version: "1.0",
      metadata: {
        estimated_minutes: 2,
        category: "anxiety",
        allow_repeat_days: 30,
        created_at: "2025-09-18T00:00:00Z"
      },
      questions: [
        {
          question_id: "q1",
          id: "q1",
          order: 1,
          text: "Feeling nervous, anxious, or on edge",
          type: "scale",
          required: true,
          options: [
            { id: "0", label: "Not at all", value: 0, score: 0 },
            { id: "1", label: "Several days", value: 1, score: 1 },
            { id: "2", label: "More than half the days", value: 2, score: 2 },
            { id: "3", label: "Nearly every day", value: 3, score: 3 }
          ]
        },
        {
          question_id: "q2",
          id: "q2",
          order: 2,
          text: "Not being able to stop or control worrying",
          type: "scale",
          required: true,
          options: [
            { id: "0", label: "Not at all", value: 0, score: 0 },
            { id: "1", label: "Several days", value: 1, score: 1 },
            { id: "2", label: "More than half the days", value: 2, score: 2 },
            { id: "3", label: "Nearly every day", value: 3, score: 3 }
          ]
        }
      ]
    };

    console.log('📊 Seeding essential assessments...');
    
    // Seed assessments quickly
    await kv.set(`assessment:assess-depression-phq9`, phq9Assessment);
    await kv.set(`assessment:phq9`, phq9Assessment);
    console.log('✅ Seeded: PHQ-9 Depression Screening');

    await kv.set(`assessment:assess-anxiety-gad7`, gad7Assessment);
    await kv.set(`assessment:gad7`, gad7Assessment);
    console.log('✅ Seeded: GAD-7 Anxiety Screening');

    // Add a simple burnout program
    const burnoutProgram = {
      equip_id: "equip-burnout-32",
      id: "00000000-0000-0000-0000-000000000010",
      slug: "burnout-recovery-32",
      title: "Burnout Recovery Program",
      description: "32-day guided program to recover from burnout",
      price: {
        currency: "INR",
        amount_cents: 49900,
        payment_provider: "razorpay",
        one_time: true
      },
      duration_days: 32,
      expiry_days_after_purchase: 180,
      days: [
        {
          day: 1,
          title: "Introduction to Burnout",
          type: "lesson",
          content: [
            {kind: "text", body: "Learn what burnout is and how to recover."}
          ],
          required: true,
          estimated_min: 10
        }
      ]
    };

    await kv.set(`equip_program:burnout-recovery-32`, burnoutProgram);
    await kv.set(`equip_program:equip-burnout-32`, burnoutProgram);
    console.log('✅ Seeded: Burnout Recovery Program');

    // Add a few essential resources
    const sampleResources = [
      {
        resource_id: "00000000-0000-0000-0000-000000000200",
        title: "Understanding Anxiety: A Complete Guide",
        description: "Learn about different types of anxiety disorders, their symptoms, and evidence-based treatment approaches.",
        category: "anxiety",
        content_type: "article",
        content_url: "https://example.com/anxiety-guide",
        read_time_minutes: 12,
        tags: ["anxiety", "mental health", "coping strategies"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        resource_id: "00000000-0000-0000-0000-000000000201",
        title: "The Science of Sleep and Mental Health",
        description: "Explore the crucial connection between quality sleep and mental wellbeing.",
        category: "wellness",
        content_type: "article",
        content_url: "https://example.com/sleep-mental-health",
        read_time_minutes: 8,
        tags: ["sleep", "wellness", "mental health"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        resource_id: "00000000-0000-0000-0000-000000000202",
        title: "Mindfulness for Beginners",
        description: "A gentle introduction to mindfulness practice with simple exercises you can try today.",
        category: "mindfulness",
        content_type: "article",
        content_url: "https://example.com/mindfulness-beginners",
        read_time_minutes: 6,
        tags: ["mindfulness", "meditation", "stress relief"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Seed resources
    for (const resource of sampleResources) {
      await kv.set(`resource:${resource.resource_id}`, resource);
    }
    console.log('✅ Seeded: 3 sample resources');

    // Add sample professionals
    const sampleProfessionals = [
      {
        professional_id: "00000000-0000-0000-0000-000000000300",
        name: "Dr. Sarah Johnson",
        title: "Clinical Psychologist",
        specialties: ["Anxiety", "Depression", "Trauma"],
        location: "New York, NY",
        phone: "+1 (555) 123-4567",
        email: "s.johnson@therapy.com",
        available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        professional_id: "00000000-0000-0000-0000-000000000301",
        name: "Dr. Michael Chen",
        title: "Licensed Therapist",
        specialties: ["CBT", "Mindfulness", "Stress Management"],
        location: "Los Angeles, CA",
        phone: "+1 (555) 987-6543",
        email: "m.chen@therapy.com",
        available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        professional_id: "00000000-0000-0000-0000-000000000302",
        name: "Dr. Emily Rodriguez",
        title: "Psychiatrist",
        specialties: ["Medication Management", "Bipolar Disorder", "ADHD"],
        location: "Chicago, IL",
        phone: "+1 (555) 456-7890",
        email: "e.rodriguez@therapy.com",
        available: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Seed professionals
    for (const professional of sampleProfessionals) {
      await kv.set(`professional:${professional.professional_id}`, professional);
    }
    console.log('✅ Seeded: 3 sample professionals');

    console.log('🎉 Essential data seeded successfully');
    
    return c.json({
      success: true,
      message: 'Essential data seeded successfully',
      assessments: [
        { id: 'phq9', title: 'PHQ-9 Depression Screening' },
        { id: 'gad7', title: 'GAD-7 Anxiety Screening' }
      ],
      equip_programs: [
        { id: 'burnout-recovery-32', title: 'Burnout Recovery Program' }
      ],
      resources: sampleResources.map(r => ({ id: r.resource_id, title: r.title })),
      professionals: sampleProfessionals.map(p => ({ id: p.professional_id, name: p.name }))
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    return c.json({
      success: false,
      error: 'Failed to seed data: ' + error.message
    }, 500);
  }
});

// Complete database sync endpoint for full data seeding
app.post("/make-server-cc205da9/seed/complete-data", async (c) => {
  try {
    console.log('🔄 Starting complete database sync...');
    
    const { assessments, equip_programs, force_update } = await c.req.json();
    
    if (!assessments || !equip_programs) {
      return c.json({ error: 'Missing required data: assessments and equip_programs' }, 400);
    }
    
    const results = {
      assessments_seeded: 0,
      programs_seeded: 0,
      errors: []
    };
    
    // Seed assessments with complete data
    for (const assessment of assessments) {
      try {
        // Store with multiple keys for lookup flexibility
        await kv.set(`assessment:${assessment.assessment_id}`, assessment);
        await kv.set(`assessment:${assessment.slug}`, assessment);
        
        results.assessments_seeded++;
        console.log(`✅ Seeded complete ${assessment.title} (${assessment.questions?.length || 0} questions)`);
      } catch (error) {
        console.error(`❌ Failed to seed ${assessment.title}:`, error);
        results.errors.push(`Failed to seed ${assessment.title}: ${error.message}`);
      }
    }
    
    // Seed equip programs with complete data
    for (const program of equip_programs) {
      try {
        // Store with multiple keys for lookup flexibility
        await kv.set(`equip_program:${program.equip_id}`, program);
        await kv.set(`equip_program:${program.slug}`, program);
        await kv.set(`equip_program_by_slug:${program.slug}`, program);
        
        results.programs_seeded++;
        console.log(`✅ Seeded complete ${program.title} (${program.days?.length || 0} days)`);
      } catch (error) {
        console.error(`❌ Failed to seed ${program.title}:`, error);
        results.errors.push(`Failed to seed ${program.title}: ${error.message}`);
      }
    }
    
    const success = results.errors.length === 0;
    const message = success 
      ? `Complete sync successful: ${results.assessments_seeded} assessments, ${results.programs_seeded} programs`
      : `Partial sync: ${results.errors.length} errors encountered`;
    
    console.log(success ? '🎉 Complete database sync finished successfully' : '⚠️ Database sync completed with errors');
    
    return c.json({
      success,
      message,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Complete sync error:', error);
    return c.json({
      success: false,
      error: 'Failed to complete database sync: ' + error.message
    }, 500);
  }
});

// Demo users seeding endpoint
app.post("/make-server-cc205da9/seed/users", async (c) => {
  try {
    console.log('👥 Seeding demo users...');
    
    // First, create demo users in Supabase Auth if they don't exist
    const demoUsers = [
      {
        email: 'demo1@ikan.com',
        password: 'demo123',
        name: 'Alex Johnson',
        phone: '+1 (555) 100-0001'
      },
      {
        email: 'demo2@ikan.com', 
        password: 'demo123',
        name: 'Sam Rivera',
        phone: '+1 (555) 200-0002'
      },
      {
        email: 'demo3@ikan.com',
        password: 'demo123', 
        name: 'Jordan Chen',
        phone: '+1 (555) 300-0003'
      },
      {
        email: 'test@ikan.com',
        password: 'demo123',
        name: 'Test User',
        phone: '+1 (555) 000-0000'
      }
    ];

    const createdUsers = [];
    
    for (const demoUser of demoUsers) {
      try {
        // Try to create the user
        const { data, error } = await supabase.auth.admin.createUser({
          email: demoUser.email,
          password: demoUser.password,
          user_metadata: { 
            name: demoUser.name, 
            phone: demoUser.phone,
            corporate_user: false 
          },
          // Automatically confirm the user's email since an email server hasn't been configured
          email_confirm: true
        });

        if (error) {
          console.log(`Demo user ${demoUser.email} might already exist:`, error.message);
        } else {
          console.log(`✅ Created demo user: ${demoUser.name} (${demoUser.email})`);
          createdUsers.push({ email: demoUser.email, name: demoUser.name, id: data.user.id });
          
          // Store user profile in KV store
          await kv.set(`user:${data.user.id}`, {
            user_id: data.user.id,
            email: demoUser.email,
            name: demoUser.name,
            phone: demoUser.phone,
            avatar_url: null,
            corporate_user: false,
            created_at: new Date().toISOString()
          });
        }
      } catch (userError) {
        console.log(`Error creating demo user ${demoUser.email}:`, userError);
      }
    }
    
    // Helper function to generate dates
    const getDaysAgo = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date.toISOString();
    };

    // Helper function to generate journal entries
    const generateJournalEntries = (userId: string, startDays: number, count: number) => {
      const moods = ['happy', 'content', 'calm', 'motivated', 'grateful', 'excited', 'hopeful', 'creative', 'accomplished', 'determined', 'neutral', 'tired', 'stressed', 'anxious', 'frustrated', 'overwhelmed', 'sad', 'lonely'];
      const entries = [];
      
      for (let i = 0; i < count; i++) {
        const dayOffset = startDays - i;
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const moodScore = mood === 'happy' || mood === 'excited' || mood === 'grateful' ? Math.floor(Math.random() * 3) + 8 :
                         mood === 'content' || mood === 'calm' || mood === 'motivated' ? Math.floor(Math.random() * 2) + 7 :
                         mood === 'neutral' || mood === 'tired' ? Math.floor(Math.random() * 3) + 5 :
                         Math.floor(Math.random() * 3) + 3;
        
        entries.push({
          id: `journal-${userId}-${i}`,
          user_id: userId,
          entry_date: getDaysAgo(dayOffset).split('T')[0],
          mood,
          mood_score: moodScore,
          content: `Day ${count - i} journal entry for ${mood} mood.`,
          timestamp: getDaysAgo(dayOffset),
          status: 'present'
        });
      }
      return entries;
    };

    // User 1: demo1@ikan.com - New user
    const user1 = {
      user_id: "demo-user-001",
      email: "demo1@ikan.com",
      name: "Alex Johnson",
      phone: "+1 (555) 100-0001",
      avatar_url: null,
      corporate_user: false,
      created_at: getDaysAgo(3),
      updated_at: getDaysAgo(3),
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: false,
        moodReminders: true,
        reminderTime: "19:00",
        timezone: "America/New_York"
      },
      profile: {
        age_range: "25-34",
        occupation: "Software Engineer",
        goals: ["stress management", "better work-life balance"],
        onboarding_completed: true
      }
    };

    // User 2: demo2@ikan.com - Active user with moderate engagement
    const user2 = {
      user_id: "demo-user-002",
      email: "demo2@ikan.com",
      name: "Sam Rivera",
      phone: "+1 (555) 200-0002",
      avatar_url: null,
      corporate_user: false,
      created_at: getDaysAgo(45),
      updated_at: getDaysAgo(1),
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: true,
        moodReminders: true,
        reminderTime: "20:00",
        timezone: "America/Los_Angeles"
      },
      profile: {
        age_range: "30-39",
        occupation: "Marketing Manager",
        goals: ["anxiety management", "burnout prevention", "better sleep"],
        onboarding_completed: true
      }
    };

    // User 3: demo3@ikan.com - Power user with extensive engagement
    const user3 = {
      user_id: "demo-user-003",
      email: "demo3@ikan.com",
      name: "Jordan Chen",
      phone: "+1 (555) 300-0003",
      avatar_url: null,
      corporate_user: false,
      created_at: getDaysAgo(120),
      updated_at: getDaysAgo(0),
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: true,
        moodReminders: true,
        reminderTime: "18:30",
        timezone: "America/Chicago"
      },
      profile: {
        age_range: "28-35",
        occupation: "Clinical Psychologist",
        goals: ["personal development", "stress management", "mindfulness", "work-life balance"],
        onboarding_completed: true
      }
    };

    // Store users
    await kv.set(`user:demo1@ikan.com`, user1);
    await kv.set(`user:demo2@ikan.com`, user2);
    await kv.set(`user:demo3@ikan.com`, user3);

    // Generate journal entries
    const user1Journals = generateJournalEntries(user1.user_id, 3, 3); // 3 days worth
    const user2Journals = generateJournalEntries(user2.user_id, 45, 25); // 25 entries over 45 days
    const user3Journals = generateJournalEntries(user3.user_id, 100, 100); // 100 days of entries

    // Store journal entries
    for (const entry of [...user1Journals, ...user2Journals, ...user3Journals]) {
      await kv.set(`journal_entry:${entry.id}`, entry);
    }

    // Assessment responses for User 2 (2 completed, 1 in progress)
    const user2Assessments = [
      {
        id: "response-u2-phq9-1",
        user_id: user2.user_id,
        assessment_id: "assess-depression-phq9",
        started_at: getDaysAgo(30),
        completed_at: getDaysAgo(30),
        responses: [
          { question_id: "q1", value: 1, score: 1 },
          { question_id: "q2", value: 2, score: 2 },
          { question_id: "q3", value: 1, score: 1 },
          { question_id: "q4", value: 2, score: 2 },
          { question_id: "q5", value: 1, score: 1 },
          { question_id: "q6", value: 0, score: 0 },
          { question_id: "q7", value: 1, score: 1 },
          { question_id: "q8", value: 0, score: 0 },
          { question_id: "q9", value: 0, score: 0 }
        ],
        total_score: 8,
        interpretation: "Mild",
        status: "completed"
      },
      {
        id: "response-u2-gad7-1",
        user_id: user2.user_id,
        assessment_id: "assess-anxiety-gad7",
        started_at: getDaysAgo(20),
        completed_at: getDaysAgo(20),
        responses: [
          { question_id: "q1", value: 2, score: 2 },
          { question_id: "q2", value: 1, score: 1 },
          { question_id: "q3", value: 2, score: 2 },
          { question_id: "q4", value: 1, score: 1 },
          { question_id: "q5", value: 0, score: 0 },
          { question_id: "q6", value: 1, score: 1 },
          { question_id: "q7", value: 1, score: 1 }
        ],
        total_score: 8,
        interpretation: "Mild",
        status: "completed"
      },
      {
        id: "response-u2-burnout-1",
        user_id: user2.user_id,
        assessment_id: "assess-burnout-risk-1",
        started_at: getDaysAgo(1),
        completed_at: null,
        responses: [
          { question_id: "bq1", value: 3, score: 3 },
          { question_id: "bq2", value: 2, score: 2 }
        ],
        total_score: null,
        interpretation: null,
        status: "in_progress"
      }
    ];

    // Store assessment responses
    for (const response of user2Assessments) {
      await kv.set(`assessment_response:${response.id}`, response);
    }

    // Resource read tracking
    const resourceIds = [
      "00000000-0000-0000-0000-000000000200",
      "00000000-0000-0000-0000-000000000201",
      "00000000-0000-0000-0000-000000000202",
      "00000000-0000-0000-0000-000000000203",
      "00000000-0000-0000-0000-000000000204",
      "00000000-0000-0000-0000-000000000205"
    ];

    // User 2 has read some resources
    for (let i = 0; i < 6; i++) {
      const readRecord = {
        id: `read-u2-${i}`,
        user_id: user2.user_id,
        resource_id: resourceIds[i],
        read_at: getDaysAgo(Math.floor(Math.random() * 30) + 10),
        completed: true
      };
      await kv.set(`resource_read:${readRecord.id}`, readRecord);
    }

    // User 3 has read most resources (12 total)
    for (let i = 0; i < 12; i++) {
      const readRecord = {
        id: `read-u3-${i}`,
        user_id: user3.user_id,
        resource_id: resourceIds[i % resourceIds.length],
        read_at: getDaysAgo(Math.floor(Math.random() * 80) + 20),
        completed: true
      };
      await kv.set(`resource_read:${readRecord.id}`, readRecord);
    }

    // Consultations for User 3
    const user3Consultations = [
      {
        id: "consult-u3-1",
        user_id: user3.user_id,
        professional_id: "00000000-0000-0000-0000-000000000300",
        scheduled_at: getDaysAgo(60),
        completed_at: getDaysAgo(60),
        type: "initial_consultation",
        duration_minutes: 50,
        status: "completed",
        notes: "Initial assessment and treatment planning"
      },
      {
        id: "consult-u3-2",
        user_id: user3.user_id,
        professional_id: "00000000-0000-0000-0000-000000000301",
        scheduled_at: getDaysAgo(30),
        completed_at: getDaysAgo(30),
        type: "follow_up",
        duration_minutes: 45,
        status: "completed",
        notes: "Progress review and strategy adjustment"
      }
    ];

    // Store consultations
    for (const consultation of user3Consultations) {
      await kv.set(`consultation:${consultation.id}`, consultation);
    }

    console.log('✅ Demo users seeded successfully');
    
    return c.json({
      success: true,
      message: 'Demo users seeded successfully',
      users: [
        { email: 'demo1@ikan.com', name: 'Alex Johnson', status: 'new user' },
        { email: 'demo2@ikan.com', name: 'Sam Rivera', status: 'active user' },
        { email: 'demo3@ikan.com', name: 'Jordan Chen', status: 'power user' }
      ]
    });

  } catch (error) {
    console.error('❌ User seeding error:', error);
    return c.json({
      success: false,
      error: 'Failed to seed users: ' + error.message
    }, 500);
  }
});

Deno.serve(app.fetch);