import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampaignWizard } from "@/components/campaigns/campaign-wizard";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Project } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  const supabase = createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (!projects || projects.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <PageHeader
          tag="Campaign builder"
          title="No projects yet"
          subtitle="You need at least one project before building a campaign."
          action={
            <Link href="/campaigns" className="lp-btn-ghost">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          }
        />
        <div className="lp-card p-8 text-center">
          <Link href="/projects/new" className="lp-btn-primary inline-flex">
            Create your first project →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <PageHeader
        tag="Campaign builder"
        title="New campaign"
        subtitle="5-step wizard. Saves as draft — you'll publish to Meta in Phase 2."
        action={
          <Link href="/campaigns" className="lp-btn-ghost">
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>
        }
      />
      <CampaignWizard projects={projects as Project[]} />
    </div>
  );
}
