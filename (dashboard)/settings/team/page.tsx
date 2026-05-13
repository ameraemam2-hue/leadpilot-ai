import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { InviteUserForm } from "@/components/settings/invite-user-form";
import type { AppUser } from "@/types/db";

export const dynamic = "force-dynamic";

const ROLE_COLORS: Record<string, any> = {
  super_admin: "red", company_admin: "purple", marketing_manager: "blue",
  media_buyer: "orange", sales_manager: "green", viewer: "muted",
};

export default async function TeamPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("users").select("role, company_id").eq("id", user!.id).single();
  const { data: members } = await supabase
    .from("users").select("*").eq("company_id", me!.company_id).order("created_at");

  const isAdmin = me?.role === "company_admin" || me?.role === "super_admin";

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <PageHeader
        tag="Settings"
        title="Team members"
        subtitle="Invite teammates and assign roles."
        action={
          <Link href="/settings" className="lp-btn-ghost">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
      />

      {isAdmin && <InviteUserForm />}

      <div className="lp-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#181c24] text-left text-[10px] font-mono uppercase tracking-wider text-[#7a8099]">
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(members as AppUser[] ?? []).map((m) => (
              <tr key={m.id} className="border-t border-[#222632]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff]/20 to-[#7c5cfc]/20 border border-[#222632] flex items-center justify-center text-[10px] font-bold">
                      {(m.full_name || m.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{m.full_name || "Unnamed"}</div>
                      <div className="text-xs text-[#7a8099] font-mono">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge color={ROLE_COLORS[m.role] ?? "muted"}>
                    {m.role.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {m.is_active ? <Badge color="green">Active</Badge> : <Badge color="muted">Inactive</Badge>}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-[#7a8099]">
                  {formatDate(m.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
