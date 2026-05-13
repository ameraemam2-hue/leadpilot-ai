import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Plug, CreditCard, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Company, AppUser } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users").select("*").eq("id", user!.id).single<AppUser>();
  const { data: company } = await supabase
    .from("companies").select("*").eq("id", profile!.company_id!).single<Company>();
  const { count: teamCount } = await supabase
    .from("users").select("*", { count: "exact", head: true })
    .eq("company_id", profile!.company_id!);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <PageHeader
        tag="Workspace"
        title="Settings"
        subtitle="Manage your company, team, integrations, and billing."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#00d4ff]" />
            </div>
            <Badge color="blue">{company?.subscription_plan}</Badge>
          </div>
          <h3 className="font-display font-bold text-base mb-1">Company profile</h3>
          <p className="text-xs text-[#7a8099] mb-4">
            {company?.name} · created {formatDate(company?.created_at)}
          </p>
          <div className="space-y-2 text-xs">
            <Row label="Slug" value={company?.slug} />
            <Row label="Plan" value={company?.subscription_plan} />
            <Row label="Brand colors" value={
              <div className="flex gap-1">
                {company?.brand_colors && Object.values(company.brand_colors).map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded border border-[#222632]" style={{ background: c as string }} />
                ))}
              </div>
            } />
          </div>
        </Card>

        <Link href="/settings/team" className="block">
          <Card className="hover:border-[#00d4ff]/30 transition-all h-full cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#7c5cfc]/10 border border-[#7c5cfc]/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#7c5cfc]" />
              </div>
              <ChevronRight className="w-4 h-4 text-[#7a8099] group-hover:text-[#00d4ff]" />
            </div>
            <h3 className="font-display font-bold text-base mb-1">Team members</h3>
            <p className="text-xs text-[#7a8099] mb-4">
              Invite marketing, media buyers, sales staff with roles.
            </p>
            <div className="text-2xl font-display font-bold">{teamCount ?? 1}</div>
            <div className="text-xs text-[#7a8099]">members</div>
          </Card>
        </Link>

        <Card className="opacity-60">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center">
              <Plug className="w-5 h-5 text-[#ff6b35]" />
            </div>
            <Badge color="muted">Phase 2</Badge>
          </div>
          <h3 className="font-display font-bold text-base mb-1">Integrations</h3>
          <p className="text-xs text-[#7a8099]">
            Meta Ads, Engaz CRM, WhatsApp Business — coming in Phase 2.
          </p>
        </Card>

        <Card className="opacity-60">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#22d17a]/10 border border-[#22d17a]/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#22d17a]" />
            </div>
            <Badge color="muted">Phase 3</Badge>
          </div>
          <h3 className="font-display font-bold text-base mb-1">Billing</h3>
          <p className="text-xs text-[#7a8099]">
            Stripe subscriptions arrive in Phase 3. Free during MVP.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#222632]/50 last:border-0">
      <span className="text-[10px] font-mono uppercase tracking-wider text-[#7a8099]">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}
