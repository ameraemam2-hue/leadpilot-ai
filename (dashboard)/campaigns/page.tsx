import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus, Sparkles } from "lucide-react";
import { formatEGP, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const COLUMNS = [
  { status: "draft",          label: "Drafts",     color: "muted" as const },
  { status: "pending_review", label: "Review",     color: "gold"  as const },
  { status: "active",         label: "Active",     color: "green" as const },
  { status: "paused",         label: "Paused",     color: "orange" as const },
  { status: "completed",      label: "Completed",  color: "blue"  as const },
];

export default async function CampaignsPage() {
  const supabase = createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, status, objective, budget_daily, created_at, project_id, projects(name, location)")
    .order("created_at", { ascending: false });

  const grouped: Record<string, any[]> = {};
  COLUMNS.forEach((c) => (grouped[c.status] = []));
  (campaigns ?? []).forEach((c: any) => {
    if (!grouped[c.status]) grouped[c.status] = [];
    grouped[c.status].push(c);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        tag="Marketing"
        title="Campaigns"
        subtitle="AI-built Meta campaigns. Phase 1 — drafts only. Live publishing in Phase 2."
        action={
          <Link href="/campaigns/new" className="lp-btn-primary">
            <Sparkles className="w-4 h-4" /> New campaign
          </Link>
        }
      />

      {!campaigns || campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Build your first AI-powered campaign in under 2 minutes."
          action={
            <Link href="/campaigns/new" className="lp-btn-primary">
              <Plus className="w-4 h-4" /> Build first campaign
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.status} className="lp-card p-4 min-h-[400px] bg-[#0d1015]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222632]">
                <div className="flex items-center gap-2">
                  <Badge color={col.color}>{col.label}</Badge>
                </div>
                <span className="text-xs font-mono text-[#7a8099]">
                  {grouped[col.status]?.length ?? 0}
                </span>
              </div>
              <div className="space-y-2">
                {(grouped[col.status] ?? []).map((c) => (
                  <div key={c.id} className="lp-card p-3 hover:border-[#00d4ff]/30 cursor-pointer transition-all">
                    <div className="text-sm font-semibold mb-1.5 line-clamp-2">{c.name}</div>
                    <div className="text-[10px] font-mono text-[#7a8099] mb-2 line-clamp-1">
                      {c.projects?.name || "No project"}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#7a8099]">{c.objective}</span>
                      <span className="text-[#00d4ff]">{formatEGP(c.budget_daily)}/d</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#7a8099] mt-2">
                      {timeAgo(c.created_at)}
                    </div>
                  </div>
                ))}
                {(!grouped[col.status] || grouped[col.status].length === 0) && (
                  <div className="text-xs text-[#7a8099]/60 italic text-center py-4">
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
