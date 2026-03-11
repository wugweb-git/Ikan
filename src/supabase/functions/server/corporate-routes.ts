import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

// ─── KV Schema for Corporate Program ──────────────────────────────
// user_employer:{user_id}              → { employer_id, enrolled_at, status }
// corporate_program:{employer_id}      → { program_name, program_description, key_benefits_summary, welcome_message, internal_contact_name, internal_contact_email, internal_contact_phone, employer_name, employer_logo_url, last_updated }
// company_resources:{employer_id}      → [{ company_item_id, item_type, title, description, content_url, start_date, end_date, location, contact_info, status }]
// daycare_providers:{employer_id}      → [{ provider_id, name, description, address, contact_information, hours_of_operation, age_ranges_served, special_programs, pricing_summary, employer_specific_notes, availability_status_summary }]

const PREFIX = "/make-server-cc205da9";

export function registerCorporateRoutes(app: Hono) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ── Helper: extract authenticated user ──────────────────────────
  async function getAuthUser(authHeader: string | null) {
    const token = authHeader?.split(" ")[1];
    if (!token) return null;
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user;
  }

  // ── GET /corporate/my-program ───────────────────────────────────
  // Returns the authenticated user's corporate program details
  app.get(`${PREFIX}/corporate/my-program`, async (c) => {
    try {
      const user = await getAuthUser(c.req.header("Authorization"));
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      // Check employer linkage
      const linkage = await kv.get(`user_employer:${user.id}`);
      if (!linkage) {
        return c.json({ enrolled: false, program: null, resources: [], daycare: [] });
      }

      const { employer_id } = typeof linkage === "string" ? JSON.parse(linkage) : linkage;
      if (!employer_id) {
        return c.json({ enrolled: false, program: null, resources: [], daycare: [] });
      }

      // Fetch all corporate data in parallel
      const [programRaw, resourcesRaw, daycareRaw] = await Promise.all([
        kv.get(`corporate_program:${employer_id}`).catch(() => null),
        kv.get(`company_resources:${employer_id}`).catch(() => null),
        kv.get(`daycare_providers:${employer_id}`).catch(() => null),
      ]);

      const program = programRaw ? (typeof programRaw === "string" ? JSON.parse(programRaw) : programRaw) : null;
      const resources = resourcesRaw ? (typeof resourcesRaw === "string" ? JSON.parse(resourcesRaw) : resourcesRaw) : [];
      const daycare = daycareRaw ? (typeof daycareRaw === "string" ? JSON.parse(daycareRaw) : daycareRaw) : [];

      return c.json({
        enrolled: true,
        employer_id,
        program: program || {},
        resources: Array.isArray(resources) ? resources.filter((r: any) => r.status === "Active" || !r.status) : [],
        daycare: Array.isArray(daycare) ? daycare : [],
      });
    } catch (err) {
      console.log("Error fetching corporate program:", err);
      return c.json({ error: `Failed to fetch corporate program: ${err}` }, 500);
    }
  });

  // ── GET /corporate/resources/:employer_id ───────────────────────
  // Returns company-specific resources for the user's employer
  app.get(`${PREFIX}/corporate/resources/:employer_id`, async (c) => {
    try {
      const user = await getAuthUser(c.req.header("Authorization"));
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const employer_id = c.req.param("employer_id");

      // Verify user belongs to this employer
      const linkage = await kv.get(`user_employer:${user.id}`);
      const parsed = linkage ? (typeof linkage === "string" ? JSON.parse(linkage) : linkage) : null;
      if (!parsed || parsed.employer_id !== employer_id) {
        return c.json({ error: "Not authorized for this employer" }, 403);
      }

      const resourcesRaw = await kv.get(`company_resources:${employer_id}`).catch(() => null);
      const resources = resourcesRaw ? (typeof resourcesRaw === "string" ? JSON.parse(resourcesRaw) : resourcesRaw) : [];

      return c.json({
        resources: Array.isArray(resources) ? resources.filter((r: any) => r.status === "Active" || !r.status) : [],
      });
    } catch (err) {
      console.log("Error fetching corporate resources:", err);
      return c.json({ error: `Failed to fetch corporate resources: ${err}` }, 500);
    }
  });

  // ── GET /corporate/daycare/:employer_id ─────────────────────────
  // Returns daycare provider listings for the user's employer
  app.get(`${PREFIX}/corporate/daycare/:employer_id`, async (c) => {
    try {
      const user = await getAuthUser(c.req.header("Authorization"));
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const employer_id = c.req.param("employer_id");

      // Verify user belongs to this employer
      const linkage = await kv.get(`user_employer:${user.id}`);
      const parsed = linkage ? (typeof linkage === "string" ? JSON.parse(linkage) : linkage) : null;
      if (!parsed || parsed.employer_id !== employer_id) {
        return c.json({ error: "Not authorized for this employer" }, 403);
      }

      const daycareRaw = await kv.get(`daycare_providers:${employer_id}`).catch(() => null);
      const daycare = daycareRaw ? (typeof daycareRaw === "string" ? JSON.parse(daycareRaw) : daycareRaw) : [];

      return c.json({
        providers: Array.isArray(daycare) ? daycare : [],
      });
    } catch (err) {
      console.log("Error fetching daycare providers:", err);
      return c.json({ error: `Failed to fetch daycare providers: ${err}` }, 500);
    }
  });

  // ── Admin: PUT /corporate/program/:employer_id ──────────────────
  // Sets/updates corporate program details (admin only)
  app.put(`${PREFIX}/corporate/program/:employer_id`, async (c) => {
    try {
      const user = await getAuthUser(c.req.header("Authorization"));
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      // Check admin
      const profileRaw = await kv.get(`profile:${user.id}`);
      const profile = profileRaw ? (typeof profileRaw === "string" ? JSON.parse(profileRaw) : profileRaw) : {};
      if (!profile.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const employer_id = c.req.param("employer_id");
      const body = await c.req.json();

      const programData = {
        employer_id,
        employer_name: body.employer_name || "",
        employer_logo_url: body.employer_logo_url || "",
        program_name: body.program_name || "",
        program_description: body.program_description || "",
        key_benefits_summary: body.key_benefits_summary || "",
        welcome_message: body.welcome_message || "",
        internal_contact_name: body.internal_contact_name || "",
        internal_contact_email: body.internal_contact_email || "",
        internal_contact_phone: body.internal_contact_phone || "",
        last_updated: new Date().toISOString(),
      };

      await kv.set(`corporate_program:${employer_id}`, JSON.stringify(programData));
      return c.json({ success: true, program: programData });
    } catch (err) {
      console.log("Error updating corporate program:", err);
      return c.json({ error: `Failed to update corporate program: ${err}` }, 500);
    }
  });

  // ── Admin: PUT /corporate/enroll-user ───────────────────────────
  // Links a user to an employer
  app.put(`${PREFIX}/corporate/enroll-user`, async (c) => {
    try {
      const user = await getAuthUser(c.req.header("Authorization"));
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const profileRaw = await kv.get(`profile:${user.id}`);
      const profile = profileRaw ? (typeof profileRaw === "string" ? JSON.parse(profileRaw) : profileRaw) : {};
      if (!profile.is_admin) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const { user_id, employer_id } = await c.req.json();
      if (!user_id || !employer_id) {
        return c.json({ error: "user_id and employer_id are required" }, 400);
      }

      const linkage = {
        employer_id,
        enrolled_at: new Date().toISOString(),
        status: "active",
      };

      await kv.set(`user_employer:${user_id}`, JSON.stringify(linkage));
      return c.json({ success: true, linkage });
    } catch (err) {
      console.log("Error enrolling user in corporate program:", err);
      return c.json({ error: `Failed to enroll user: ${err}` }, 500);
    }
  });
}
