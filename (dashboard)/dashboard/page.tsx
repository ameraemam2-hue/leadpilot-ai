import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { LeadsChart } from "@/components/dashboard/leads-chart";
import { Building2, Megaphone, Users, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatEGP, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const [
    { count: projectCount },
    { count: campaignCount },
    { count: activeCampaigns },
    { count: leadCount },
    { count: qualifiedCount },
    { data: recentLeads },
    { data: recentCampaigns },
    { data: leadsLast14 },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("campaigns").select("*", { count: "exact", head: true }),
    supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }).in("status", ["qualified", "site_visit", "reservation", "deal"]),
    supabase.from("leads").select("id, full_name, phone, status, source, created_at, project_id, projects(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("campaigns").select("id, name, status, budget_daily, objective, created_at, project_id, projects(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("leads").select("created_at").gte("created_at", new Date(Date.now() - 14 * 86400000).toISOString()),
  ]);

  // Build 14-day chart data
  const days: { day: string; leads: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().split("T")[0];
    const count = (leadsLast14 ?? []).filter((l: any) => l.created_at?.startsWith(key)).length;
    days.push({
      day: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      leads: count,
    });
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        tag="Overview"
        title="Dashboard"
        subtitle="Real-time view of your projects, campaigns, and lead pipeline."
        action={
          <Link href="/campaigns/new" className="lp-btn-primary">
            <Sparkles className="w-4 h-4" /> New campaign
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Projects" value={projectCount ?? 0} icon={Building2} color="blue" hint="In your workspace" />
        <KPICard label="Total Campaigns" value={campaignCount ?? 0} icon={Megaphone} color="purple" hint={`${activeCampaigns ?? 0} active`} />
        <KPICard label="Total Leads" value={leadCount ?? 0} icon={Users} color="orange" hint="All time" />
        <KPICard label="Qualified+ Leads" value={qualifiedCount ?? 0} icon={Sparkles} color="green" hint="Sales pipeline" />
      </div>

      {/* Chart + recent leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LeadsChart data={days} />
        </div>
        <div className="lp-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a8099] mb-1">
                Most recent
              </div>
              <h3 className="font-display font-bold text-base">New leads</h3>
            </div>
            <Link href="/leads" className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {(recentLeads ?? []).length === 0 && (
              <div className="text-sm text-[#7a8099] py-6 text-center">
                No leads yet. Add some manually or import a CSV.
              </div>
            )}
            {(recentLeads ?? []).map((l: any) => (
              <div key={l.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#181c24] transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff]/20 to-[#7c5cfc]/20 border border-[#222632] flex items-center justify-center text-[10px] font-bold">
                  {(l.full_name || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{l.full_name || "Unnamed"}</div>
                  <div className="text-[10px] font-mono text-[#7a8099] truncate">
                    {l.projects?.name || "—"} · {timeAgo(l.created_at)}
                  </div>
                </div>
                <LeadStatusBadge status={l.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="lp-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a8099] mb-1">
              Workspace
            </div>
            <h3 className="font-display font-bold text-base">Recent campaigns</h3>
          </div>
          <Link href="/campaigns" className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {(recentCampaigns ?? []).length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#7a8099] mb-4">No campaigns yet — build your first one.</p>
            <Link href="/campaigns/new" className="lp-btn-primary inline-flex">
              <Sparkles className="w-4 h-4" /> New campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-[#7a8099] border-b border-[#222632]">
                  <th className="px-5 py-2.5">Name</th>
                  <th className="px-5 py-2.5">Project</th>
                  <th className="px-5 py-2.5">Objective</th>
                  <th className="px-5 py-2.5">Daily Budget</th>
                  <th className="px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {(recentCampaigns ?? []).map((c: any) => (
                  <tr key={c.id} className="border-b border-[#222632]/50 hover:bg-[#181c24] transition-colors">
                    <td className="px-5 py-3 font-medium">
                      <Link href={`/campaigns`} className="hover:text-[#00d4ff]">{c.name}</Link>
                    </td>
                    <td className="px-5 py-3 text-[#7a8099]">{c.projects?.name || "—"}</td>
                    <td className="px-5 py-3 text-[#7a8099] font-mono text-xs">{c.objective}</td>
                    <td className="px-5 py-3 font-mono">{formatEGP(c.budget_daily)}</td>
                    <td className="px-5 py-3"><CampaignStatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: any; label: string }> = {
    new:         { color: "blue",   label: "New" },
    contacted:   { color: "purple", label: "Contacted" },
    qualified:   { color: "gold",   label: "Qualified" },
    site_visit:  { color: "orange", label: "Visit" },
    reservation: { color: "green",  label: "Reserved" },
    deal:        { color: "green",  label: "Deal" },
    lost:        { color: "red",    label: "Lost" },
  };
  const m = map[status] ?? { color: "muted", label: status };
  return <Badge color={m.color}>{m.label}</Badge>;
}

function CampaignStatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: any; label: string }> = {
    draft:          { color: "muted",  label: "Draft" },
    pending_review: { color: "gold",   label: "Pending" },
    active:         { color: "green",  label: "Active" },
    paused:         { color: "orange", label: "Paused" },
    completed:      { color: "blue",   label: "Done" },
    archived:       { color: "muted",  label: "Archived" },
  };
  const m = map[status] ?? { color: "muted", label: status };
  return <Badge color={m.color}>{m.label}</Badge>;
}
