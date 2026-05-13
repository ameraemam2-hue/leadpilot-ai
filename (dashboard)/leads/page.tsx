import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, Mail } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, any> = {
  new: "blue", contacted: "purple", qualified: "gold",
  site_visit: "orange", reservation: "green", deal: "green", lost: "red",
};

export default async function LeadsPage() {
  const supabase = createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*, projects(name), campaigns(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        tag="Sales pipeline"
        title="Leads"
        subtitle="Phase 1 shows leads from manual input + CSV. Live Meta lead webhook lands in Phase 2."
      />

      {!leads || leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="In Phase 2, leads will flow in from Meta Lead Forms automatically. For now, you can add them manually via SQL or wait for the manual-add UI in the next sprint."
        />
      ) : (
        <div className="lp-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#181c24] text-left text-[10px] font-mono uppercase tracking-wider text-[#7a8099]">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Received</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l: any) => (
                  <tr key={l.id} className="border-t border-[#222632] hover:bg-[#181c24]/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{l.full_name || "—"}</td>
                    <td className="px-4 py-3 text-[#7a8099]">
                      <div className="flex flex-col gap-0.5">
                        {l.phone && (
                          <span className="flex items-center gap-1.5 text-xs">
                            <Phone className="w-3 h-3" /> {l.phone}
                          </span>
                        )}
                        {l.email && (
                          <span className="flex items-center gap-1.5 text-xs">
                            <Mail className="w-3 h-3" /> {l.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#7a8099]">{l.projects?.name || "—"}</td>
                    <td className="px-4 py-3 text-xs font-mono text-[#7a8099]">{l.source}</td>
                    <td className="px-4 py-3">
                      <Badge color={STATUS_COLORS[l.status] ?? "muted"}>
                        {l.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#7a8099]">
                      {timeAgo(l.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
