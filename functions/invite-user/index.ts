// =====================================================================
// /functions/v1/invite-user
// Invites a new user to the caller's company.
// Uses Supabase Admin API (service role) to send an invitation email.
// On signup, the on_auth_user_created trigger creates a public.users row;
// this function then UPDATEs it with company_id + role.
// =====================================================================
//
// Auth: caller must be company_admin or super_admin.
// Body: { "email": "...", "full_name": "...", "role": "marketing_manager" }
// =====================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ALLOWED_ROLES = [
  "company_admin",
  "marketing_manager",
  "media_buyer",
  "sales_manager",
  "viewer",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing auth" }, 401);
    }

    // Caller's client (uses their JWT for RLS)
    const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthenticated" }, 401);

    // Look up caller's company + role
    const { data: callerProfile, error: profileErr } = await callerClient
      .from("users")
      .select("company_id, role")
      .eq("id", user.id)
      .single();

    if (profileErr || !callerProfile?.company_id) {
      return json({ error: "Caller has no company" }, 403);
    }
    if (!["super_admin", "company_admin"].includes(callerProfile.role)) {
      return json({ error: "Only company admins can invite" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const { email, full_name, role } = body ?? {};

    if (!email || !role) return json({ error: "email and role required" }, 400);
    if (!ALLOWED_ROLES.includes(role)) return json({ error: "Invalid role" }, 400);

    // Admin client (service role) to create the auth user + invite
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      email,
      {
        data: { full_name: full_name ?? email.split("@")[0] },
      }
    );

    if (inviteErr) {
      // If user already exists, try to look them up + update
      if (inviteErr.message?.includes("already")) {
        const { data: existing } = await admin
          .from("users")
          .select("id, company_id")
          .eq("email", email)
          .maybeSingle();
        if (existing && !existing.company_id) {
          await admin
            .from("users")
            .update({ company_id: callerProfile.company_id, role, full_name })
            .eq("id", existing.id);
          return json({ ok: true, status: "linked_existing", user_id: existing.id });
        }
        return json({ error: "User already belongs to a company" }, 409);
      }
      return json({ error: inviteErr.message }, 400);
    }

    // Update the public.users row created by the trigger
    if (invited?.user) {
      await admin
        .from("users")
        .update({
          company_id: callerProfile.company_id,
          role,
          full_name: full_name ?? email.split("@")[0],
        })
        .eq("id", invited.user.id);
    }

    return json({ ok: true, status: "invited", user_id: invited?.user?.id });
  } catch (err) {
    console.error("invite-user error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
