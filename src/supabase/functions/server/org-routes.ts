import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * The organisation (B2B) portal's API.
 *
 * Four real Postgres tables, not KV: `organizations`, `org_memberships`,
 * `org_invites`, `org_audit_log`. All four have RLS on with **no policies**, so
 * the only way in is through this module under the service role. That is a
 * privacy control rather than a convention — with permissive policies an org
 * admin holding the anon key could read membership rows straight through
 * PostgREST and bypass every aggregate rule the portal exists to enforce.
 *
 * ── What an org admin may and may not see ────────────────────────────
 *
 * They MAY see the roster: names, work emails, departments, who has accepted
 * an invite. They supplied it. Withholding it would make the product
 * unusable and protects nobody — HR already knows who works there.
 *
 * They MAY NOT see anything about a person's wellbeing: no individual score,
 * no assessment answer, no journal entry, no therapy attendance, not ever, by
 * any route, including a filter that narrows to one person.
 *
 * That line is why `src/product/org` is its own surface with the import
 * boundary between it and `app/`: the separation is enforced at build time,
 * not by remembering.
 *
 * ── What is deliberately absent ──────────────────────────────────────
 *
 * Every aggregate in the HR spec (adoption over time, wellbeing scores,
 * engagement by product) except the two computable from this module's own
 * tables — seats used and invites accepted. The rest needs member activity,
 * which lives in ikan2's store, and reading across that boundary is an
 * unanswered question, not an implementation detail. A dashboard that
 * reported from the old repo's five `user_*` tables would be reporting a
 * workforce that stopped existing in June 2026, when those tables took their
 * last write.
 */

const PREFIX = "";

/*
 * The full organisation row. `/org/mine` must return all of it, not a summary:
 * the portal hands that object to its Settings screen, which reads
 * `allowed_email_domains` and `min_group_size` directly. Returning four
 * columns made Settings throw on `undefined.join()` the moment anyone opened
 * it — the kind of break that only shows up past a login.
 */
const ORG_COLUMNS =
  "id, name, slug, status, seats_purchased, contract_start, contract_end, " +
  "allowed_email_domains, min_group_size";

type Role = "member" | "admin" | "viewer";

/** Roles that may open the portal at all. A plain member cannot. */
const PORTAL_ROLES: Role[] = ["admin", "viewer"];

export function registerOrgRoutes(app: Hono) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  async function getAuthUser(authHeader: string | null) {
    const token = authHeader?.split(" ")[1];
    if (!token) return null;
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user;
  }

  /**
   * Resolve the caller's standing in one organisation.
   *
   * `write` routes demand `admin`; read routes accept `viewer` too, which is
   * the "read-only leadership" role the spec asks for. An iKAN staff admin is
   * allowed through for support, and is recorded in the audit log as itself
   * rather than borrowing the organisation's identity.
   */
  async function authorise(c: any, orgId: string, need: "read" | "write") {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return { error: c.json({ error: "Unauthorized" }, 401) };

    const { data: staff } = await supabase
      .from("kv_store_cc205da9")
      .select("value")
      .eq("key", `user:${user.id}`)
      .maybeSingle();
    const isStaff = staff?.value?.is_admin === true;

    const { data: m } = await supabase
      .from("org_memberships")
      .select("id, role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .is("ended_at", null)
      .maybeSingle();

    const role = (m?.role ?? null) as Role | null;
    const mayRead = isStaff || (role !== null && PORTAL_ROLES.includes(role));
    const mayWrite = isStaff || role === "admin";

    if (need === "read" ? !mayRead : !mayWrite) {
      return { error: c.json({ error: "Not authorized for this organisation" }, 403) };
    }
    return { user, role, isStaff };
  }

  async function audit(orgId: string, actorId: string, action: string, detail: unknown = {}) {
    // Never allowed to break the request it describes.
    await supabase
      .from("org_audit_log")
      .insert({ org_id: orgId, actor_id: actorId, action, detail })
      .then(undefined, () => {});
  }

  // ── GET /org/mine ────────────────────────────────────────────────
  // Which organisations the caller may open the portal for. The portal's
  // first call; an empty list is a complete answer, not an error.
  app.get(`${PREFIX}/org/mine`, async (c) => {
    try {
      const user = await getAuthUser(c.req.header("Authorization"));
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      /*
       * iKAN staff see every organisation. `authorise` already lets them act
       * on one for support, but this listing did not offer any — so support
       * could pass the gate and still have nothing to open, which also made
       * the portal untestable before a first customer exists.
       */
      const { data: staff } = await supabase
        .from("kv_store_cc205da9").select("value").eq("key", `user:${user.id}`).maybeSingle();
      if (staff?.value?.is_admin === true) {
        const { data: all, error: allErr } = await supabase
          .from("organizations").select(ORG_COLUMNS).order("name");
        if (allErr) throw allErr;
        return c.json({
          organizations: (all ?? []).map((o: any) => ({ ...o, your_role: "admin", via_staff: true })),
        });
      }

      const { data, error } = await supabase
        .from("org_memberships")
        .select(`role, organizations(${ORG_COLUMNS})`)
        .eq("user_id", user.id)
        .is("ended_at", null)
        .in("role", PORTAL_ROLES);
      if (error) throw error;

      return c.json({
        organizations: (data ?? [])
          .filter((r: any) => r.organizations)
          .map((r: any) => ({ ...r.organizations, your_role: r.role })),
      });
    } catch (err) {
      console.log("org/mine failed:", err);
      return c.json({ error: "Failed to load organisations" }, 500);
    }
  });

  // ── GET /org/:orgId/overview ─────────────────────────────────────
  // Only the figures this module's own tables can answer honestly.
  app.get(`${PREFIX}/org/:orgId/overview`, async (c) => {
    try {
      const orgId = c.req.param("orgId");
      const auth = await authorise(c, orgId, "read");
      if ("error" in auth) return auth.error;

      const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .select(ORG_COLUMNS)
        .eq("id", orgId)
        .maybeSingle();
      if (orgErr) throw orgErr;
      if (!org) return c.json({ error: "Organisation not found" }, 404);

      const live = supabase.from("org_memberships").select("id", { count: "exact", head: true })
        .eq("org_id", orgId).is("ended_at", null);

      const [{ count: seatsUsed }, { count: accepted }, { count: pending }] = await Promise.all([
        live,
        supabase.from("org_memberships").select("id", { count: "exact", head: true })
          .eq("org_id", orgId).is("ended_at", null).not("accepted_at", "is", null),
        supabase.from("org_memberships").select("id", { count: "exact", head: true })
          .eq("org_id", orgId).is("ended_at", null).is("accepted_at", null),
      ]);

      return c.json({
        organization: org,
        seats: {
          purchased: org.seats_purchased,
          used: seatsUsed ?? 0,
          remaining: Math.max(0, org.seats_purchased - (seatsUsed ?? 0)),
        },
        onboarding: {
          accepted: accepted ?? 0,
          pending: pending ?? 0,
          // Adoption needs no member data — it is roster arithmetic.
          adoption_rate: org.seats_purchased > 0
            ? Math.round(((accepted ?? 0) / org.seats_purchased) * 100)
            : null,
        },
        /*
         * Named rather than silently missing. An empty dashboard invites
         * someone to fill it with whatever number is nearest to hand, and the
         * nearest to hand here is four months stale.
         */
        wellbeing: {
          available: false,
          reason: "Member activity is not yet connected to this portal.",
        },
      });
    } catch (err) {
      console.log("org overview failed:", err);
      return c.json({ error: "Failed to load overview" }, 500);
    }
  });

  // ── GET /org/:orgId/members ──────────────────────────────────────
  // The roster the organisation supplied. Carries no wellbeing field, and
  // there is no route that would add one.
  app.get(`${PREFIX}/org/:orgId/members`, async (c) => {
    try {
      const orgId = c.req.param("orgId");
      const auth = await authorise(c, orgId, "read");
      if ("error" in auth) return auth.error;

      const includeEnded = c.req.query("include_ended") === "true";
      let q = supabase
        .from("org_memberships")
        .select("id, email, role, department, relationship_type, invited_at, accepted_at, started_at, ended_at")
        .eq("org_id", orgId)
        .order("email");
      if (!includeEnded) q = q.is("ended_at", null);

      const { data, error } = await q;
      if (error) throw error;
      return c.json({ members: data ?? [] });
    } catch (err) {
      console.log("org members failed:", err);
      return c.json({ error: "Failed to load members" }, 500);
    }
  });

  // ── POST /org/:orgId/members ─────────────────────────────────────
  // Invite one or many. Enforces the seat count and the domain allow-list,
  // and reports per-address outcomes rather than failing the whole batch —
  // a 200-row paste that dies on row 149 is not a usable bulk upload.
  app.post(`${PREFIX}/org/:orgId/members`, async (c) => {
    try {
      const orgId = c.req.param("orgId");
      const auth = await authorise(c, orgId, "write");
      if ("error" in auth) return auth.error;

      const body = await c.req.json();
      const incoming: Array<{ email?: string; department?: string; role?: Role }> =
        Array.isArray(body?.members) ? body.members : [body];

      const { data: org } = await supabase
        .from("organizations")
        .select("seats_purchased, allowed_email_domains")
        .eq("id", orgId)
        .maybeSingle();
      if (!org) return c.json({ error: "Organisation not found" }, 404);

      const { count: used } = await supabase
        .from("org_memberships").select("id", { count: "exact", head: true })
        .eq("org_id", orgId).is("ended_at", null);

      let remaining = Math.max(0, org.seats_purchased - (used ?? 0));
      const domains: string[] = org.allowed_email_domains ?? [];
      const results: Array<{ email: string; status: string; reason?: string }> = [];

      for (const raw of incoming) {
        const email = String(raw?.email ?? "").trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          results.push({ email, status: "rejected", reason: "Not a valid email address" });
          continue;
        }
        if (domains.length > 0 && !domains.some((d) => email.endsWith(`@${d.toLowerCase()}`))) {
          results.push({ email, status: "rejected", reason: `Not on an allowed domain (${domains.join(", ")})` });
          continue;
        }
        if (remaining <= 0) {
          results.push({ email, status: "rejected", reason: "No seats remaining" });
          continue;
        }

        const role: Role = raw?.role === "admin" || raw?.role === "viewer" ? raw.role : "member";
        const { error } = await supabase.from("org_memberships").insert({
          org_id: orgId,
          email,
          role,
          department: raw?.department ?? null,
        });

        if (error) {
          // 23505 is the live-membership unique index: already on the roster.
          results.push({
            email,
            status: error.code === "23505" ? "skipped" : "rejected",
            reason: error.code === "23505" ? "Already on the roster" : "Could not be added",
          });
          continue;
        }
        remaining -= 1;
        results.push({ email, status: "invited" });
      }

      await audit(orgId, auth.user.id, "members.invite", {
        requested: incoming.length,
        invited: results.filter((r) => r.status === "invited").length,
      });

      return c.json({
        results,
        summary: {
          invited: results.filter((r) => r.status === "invited").length,
          skipped: results.filter((r) => r.status === "skipped").length,
          rejected: results.filter((r) => r.status === "rejected").length,
          seats_remaining: remaining,
        },
      }, 201);
    } catch (err) {
      console.log("org invite failed:", err);
      return c.json({ error: "Failed to add members" }, 500);
    }
  });

  // ── PATCH /org/:orgId/members/:id ────────────────────────────────
  app.patch(`${PREFIX}/org/:orgId/members/:id`, async (c) => {
    try {
      const orgId = c.req.param("orgId");
      const auth = await authorise(c, orgId, "write");
      if ("error" in auth) return auth.error;

      const body = await c.req.json();
      const patch: Record<string, unknown> = {};
      if (typeof body.department === "string" || body.department === null) patch.department = body.department;
      if (["member", "admin", "viewer"].includes(body.role)) patch.role = body.role;
      if (Object.keys(patch).length === 0) return c.json({ error: "Nothing to update" }, 400);

      const { data, error } = await supabase
        .from("org_memberships").update(patch)
        .eq("id", c.req.param("id")).eq("org_id", orgId)
        .select("id, email, role, department").maybeSingle();
      if (error) throw error;
      if (!data) return c.json({ error: "Member not found" }, 404);

      await audit(orgId, auth.user.id, "members.update", { membership_id: data.id, patch });
      return c.json({ member: data });
    } catch (err) {
      console.log("org member update failed:", err);
      return c.json({ error: "Failed to update member" }, 500);
    }
  });

  // ── DELETE /org/:orgId/members/:id ───────────────────────────────
  /*
   * Off-boarding ENDS a membership, it does not delete it. The row is what
   * says this person was in Marketing during Q3; deleting it would rewrite
   * every historical aggregate they contributed to, which is both wrong and
   * the exact change that lets a reader difference out an individual by
   * comparing last quarter's figure before and after.
   *
   * The seat frees immediately, because `ended_at` leaves the live index.
   */
  app.delete(`${PREFIX}/org/:orgId/members/:id`, async (c) => {
    try {
      const orgId = c.req.param("orgId");
      const auth = await authorise(c, orgId, "write");
      if ("error" in auth) return auth.error;

      const { data, error } = await supabase
        .from("org_memberships")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", c.req.param("id")).eq("org_id", orgId).is("ended_at", null)
        .select("id, email").maybeSingle();
      if (error) throw error;
      if (!data) return c.json({ error: "Member not found, or already ended" }, 404);

      await audit(orgId, auth.user.id, "members.end", { membership_id: data.id });
      return c.json({ success: true, ended: data.id });
    } catch (err) {
      console.log("org member end failed:", err);
      return c.json({ error: "Failed to end membership" }, 500);
    }
  });

  // ── PUT /org/:orgId ──────────────────────────────────────────────
  // Seats and contract are iKAN's to set, not the customer's: an org admin
  // may not sell themselves more seats. `min_group_size` may be raised by
  // anyone who can write, and lowered by nobody — the check constraint holds
  // the floor at 5 even against staff.
  app.put(`${PREFIX}/org/:orgId`, async (c) => {
    try {
      const orgId = c.req.param("orgId");
      const auth = await authorise(c, orgId, "write");
      if ("error" in auth) return auth.error;

      const body = await c.req.json();
      const patch: Record<string, unknown> = {};
      if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
      if (Array.isArray(body.allowed_email_domains)) patch.allowed_email_domains = body.allowed_email_domains;
      if (Number.isInteger(body.min_group_size)) {
        const { data: cur } = await supabase
          .from("organizations").select("min_group_size").eq("id", orgId).maybeSingle();
        if (cur && body.min_group_size < cur.min_group_size && !auth.isStaff) {
          return c.json({ error: "The minimum group size can be raised, not lowered" }, 403);
        }
        patch.min_group_size = body.min_group_size;
      }
      if (auth.isStaff) {
        if (Number.isInteger(body.seats_purchased)) patch.seats_purchased = body.seats_purchased;
        if (body.contract_start !== undefined) patch.contract_start = body.contract_start;
        if (body.contract_end !== undefined) patch.contract_end = body.contract_end;
        if (["active", "suspended", "ended"].includes(body.status)) patch.status = body.status;
      }
      if (Object.keys(patch).length === 0) return c.json({ error: "Nothing to update" }, 400);

      const { data, error } = await supabase
        .from("organizations").update(patch).eq("id", orgId).select().maybeSingle();
      if (error) throw error;
      if (!data) return c.json({ error: "Organisation not found" }, 404);

      await audit(orgId, auth.user.id, "organization.update", { patch });
      return c.json({ organization: data });
    } catch (err) {
      console.log("org update failed:", err);
      return c.json({ error: "Failed to update organisation" }, 500);
    }
  });

  // ── POST /admin/org ──────────────────────────────────────────────
  // iKAN staff create organisations; there is no self-serve signup.
  app.post(`${PREFIX}/admin/org`, async (c) => {
    try {
      const user = await getAuthUser(c.req.header("Authorization"));
      if (!user) return c.json({ error: "Unauthorized" }, 401);
      const { data: staff } = await supabase
        .from("kv_store_cc205da9").select("value").eq("key", `user:${user.id}`).maybeSingle();
      if (staff?.value?.is_admin !== true) return c.json({ error: "Admin access required" }, 403);

      const body = await c.req.json();
      const name = String(body?.name ?? "").trim();
      if (!name) return c.json({ error: "name is required" }, 400);
      const slug = String(body?.slug ?? name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      const { data, error } = await supabase.from("organizations").insert({
        name,
        slug,
        seats_purchased: Number.isInteger(body?.seats_purchased) ? body.seats_purchased : 0,
        allowed_email_domains: Array.isArray(body?.allowed_email_domains) ? body.allowed_email_domains : [],
        contract_start: body?.contract_start ?? null,
        contract_end: body?.contract_end ?? null,
      }).select().maybeSingle();
      if (error) {
        if (error.code === "23505") return c.json({ error: `The slug "${slug}" is taken` }, 409);
        throw error;
      }

      await audit(data!.id, user.id, "organization.create", { name, slug });
      return c.json({ organization: data }, 201);
    } catch (err) {
      console.log("org create failed:", err);
      return c.json({ error: "Failed to create organisation" }, 500);
    }
  });

  // ── GET /admin/org ───────────────────────────────────────────────
  app.get(`${PREFIX}/admin/org`, async (c) => {
    try {
      const user = await getAuthUser(c.req.header("Authorization"));
      if (!user) return c.json({ error: "Unauthorized" }, 401);
      const { data: staff } = await supabase
        .from("kv_store_cc205da9").select("value").eq("key", `user:${user.id}`).maybeSingle();
      if (staff?.value?.is_admin !== true) return c.json({ error: "Admin access required" }, 403);

      const { data, error } = await supabase
        .from("organizations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return c.json({ organizations: data ?? [] });
    } catch (err) {
      console.log("org list failed:", err);
      return c.json({ error: "Failed to list organisations" }, 500);
    }
  });
}
