import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Plus, Tag } from "lucide-react";
import { formatEGP } from "@/lib/utils";
import type { Project } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        tag="Workspace"
        title="Projects"
        subtitle="Real estate compounds, developments, and units your brokerage sells."
        action={
          <Link href="/projects/new" className="lp-btn-primary">
            <Plus className="w-4 h-4" /> Add project
          </Link>
        }
      />

      {!projects || projects.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No projects yet"
          description="Add your first compound or development. Each project becomes a campaign target."
          action={
            <Link href="/projects/new" className="lp-btn-primary">
              <Plus className="w-4 h-4" /> Add first project
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(projects as Project[]).map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="lp-card overflow-hidden hover:border-[#00d4ff]/30 transition-all group">
      <div className="aspect-video bg-gradient-to-br from-[#181c24] to-[#0a0c10] relative overflow-hidden">
        {project.media_urls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.media_urls[0]} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-[#222632]" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {project.is_active ? (
            <Badge color="green">Active</Badge>
          ) : (
            <Badge color="muted">Inactive</Badge>
          )}
          {project.property_type && <Badge color="purple">{project.property_type}</Badge>}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-base mb-1 group-hover:text-[#00d4ff] transition-colors">
          {project.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-[#7a8099] mb-3 font-mono">
          {project.location && (
            <>
              <MapPin className="w-3 h-3" />
              <span>{project.location}</span>
            </>
          )}
          {project.developer_name && (
            <>
              <span>·</span>
              <span>{project.developer_name}</span>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a8099]">From</div>
            <div className="font-semibold">{formatEGP(project.starting_price)}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a8099]">DP / Years</div>
            <div className="font-semibold">{project.down_payment_pct ?? "—"}% / {project.installment_years ?? "—"}y</div>
          </div>
        </div>
        {project.usps?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.usps.slice(0, 3).map((u, i) => (
              <span key={i} className="lp-tag bg-[#181c24] text-[#7a8099] border border-[#222632] normal-case tracking-normal">
                <Tag className="w-2.5 h-2.5" /> {u}
              </span>
            ))}
            {project.usps.length > 3 && (
              <span className="lp-tag bg-[#181c24] text-[#7a8099] border border-[#222632]">
                +{project.usps.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
