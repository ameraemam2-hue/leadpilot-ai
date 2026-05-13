"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CopyGenerator } from "./copy-generator";
import {
  Target,
  Building2,
  DollarSign,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { cn, formatEGP } from "@/lib/utils";
import type { Project, CampaignObjective, AIGeneratedCopy } from "@/types/db";

const STEPS = [
  { id: 1, label: "Objective", icon: Target },
  { id: 2, label: "Project & audience", icon: Building2 },
  { id: 3, label: "Budget & schedule", icon: DollarSign },
  { id: 4, label: "AI copy", icon: Sparkles },
  { id: 5, label: "Review & save", icon: CheckCircle2 },
];

const OBJECTIVES: { value: CampaignObjective; label: string; description: string }[] = [
  { value: "LEAD_GENERATION", label: "Lead Generation", description: "Capture name + phone via Meta lead form. Best for real estate." },
  { value: "MESSAGES",        label: "Messages",        description: "Drive WhatsApp / Messenger conversations." },
  { value: "TRAFFIC",         label: "Traffic",         description: "Send people to your landing page." },
  { value: "CONVERSIONS",     label: "Conversions",     description: "Optimize for form-fill conversions on your site." },
];

export function CampaignWizard({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [objective, setObjective] = useState<CampaignObjective>("LEAD_GENERATION");
  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? "");
  const [locations, setLocations] = useState("Cairo, Giza");
  const [ageMin, setAgeMin] = useState(28);
  const [ageMax, setAgeMax] = useState(55);
  const [budget, setBudget] = useState("1500");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [aiCopy, setAiCopy] = useState<AIGeneratedCopy | null>(null);
  const [campaignName, setCampaignName] = useState("");

  const project = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projects, projectId]
  );

  // Auto-generate campaign name
  const autoName = useMemo(() => {
    if (!project) return "";
    const date = new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    return `${project.name} — ${project.location ?? "EG"} — ${objective.replace("_", " ")} — ${date}`;
  }, [project, objective]);

  function next() {
    if (step === 2 && !projectId) {
      toast({ title: "Pick a project", variant: "error" });
      return;
    }
    if (step === 3 && (!budget || parseInt(budget) < 100)) {
      toast({ title: "Budget too low", description: "Min 100 EGP/day.", variant: "error" });
      return;
    }
    if (step < 5) setStep(step + 1);
    if (step === 4 && !campaignName) setCampaignName(autoName);
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  async function save() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("users").select("company_id").eq("id", user.id).single();
    if (!profile?.company_id) {
      toast({ title: "No company", variant: "error" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("campaigns").insert({
      company_id: profile.company_id,
      project_id: projectId,
      created_by: user.id,
      name: (campaignName || autoName).trim(),
      objective,
      status: "draft",
      budget_daily: parseInt(budget),
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date:   endDate   ? new Date(endDate).toISOString()   : null,
      builder_data: {
        audience: {
          locations: locations.split(",").map((s) => s.trim()).filter(Boolean),
          age_min: ageMin,
          age_max: ageMax,
        },
        wizard_completed: true,
      },
      ai_generated_copy: aiCopy ?? {},
    });

    setLoading(false);
    if (error) {
      toast({ title: "Could not save campaign", description: error.message, variant: "error" });
      return;
    }
    toast({ title: "Campaign saved as draft 🎯", variant: "success" });
    router.push("/campaigns");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="lp-card p-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1 min-w-0">
                <div className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-lg flex-shrink-0",
                  isActive && "bg-[#00d4ff]/10 border border-[#00d4ff]/30",
                  isDone && "text-[#22d17a]"
                )}>
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
                    isActive ? "bg-[#00d4ff] text-[#0a0c10]" : isDone ? "bg-[#22d17a]/20 text-[#22d17a]" : "bg-[#181c24] text-[#7a8099]"
                  )}>
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={cn(
                    "text-xs font-mono uppercase tracking-wider hidden sm:inline whitespace-nowrap",
                    isActive ? "text-[#00d4ff]" : isDone ? "text-[#22d17a]" : "text-[#7a8099]"
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-px min-w-[12px]", isDone ? "bg-[#22d17a]/40" : "bg-[#222632]")} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      {step === 1 && (
        <Card>
          <h3 className="font-display font-bold text-lg mb-4">Pick your campaign objective</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OBJECTIVES.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setObjective(o.value)}
                className={cn(
                  "lp-card p-4 text-left transition-all",
                  objective === o.value
                    ? "border-[#00d4ff] bg-[#00d4ff]/5"
                    : "hover:border-[#00d4ff]/30"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-sm">{o.label}</div>
                  {objective === o.value && (
                    <CheckCircle2 className="w-4 h-4 text-[#00d4ff]" />
                  )}
                </div>
                <div className="text-xs text-[#7a8099] leading-relaxed">{o.description}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h3 className="font-display font-bold text-lg mb-4">Project & target audience</h3>
          <div className="space-y-4">
            <div>
              <Label>Project *</Label>
              <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.location ? `— ${p.location}` : ""}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Target locations (comma-separated)</Label>
              <Input value={locations} onChange={(e) => setLocations(e.target.value)} placeholder="Cairo, Giza, Alexandria" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min age</Label>
                <Input type="number" min="18" max="65" value={ageMin} onChange={(e) => setAgeMin(parseInt(e.target.value))} />
              </div>
              <div>
                <Label>Max age</Label>
                <Input type="number" min="18" max="65" value={ageMax} onChange={(e) => setAgeMax(parseInt(e.target.value))} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <h3 className="font-display font-bold text-lg mb-4">Budget & schedule</h3>
          <div className="space-y-4">
            <div>
              <Label>Daily budget (EGP) *</Label>
              <Input type="number" min="100" value={budget} onChange={(e) => setBudget(e.target.value)} />
              <div className="text-xs text-[#7a8099] mt-1.5 font-mono">
                Monthly estimate: {formatEGP(parseInt(budget || "0") * 30)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>End date (optional)</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {step === 4 && <CopyGenerator project={project} initial={aiCopy} onChange={setAiCopy} />}

      {step === 5 && (
        <Card>
          <h3 className="font-display font-bold text-lg mb-4">Review & save</h3>
          <div className="space-y-4">
            <div>
              <Label>Campaign name</Label>
              <Input value={campaignName || autoName} onChange={(e) => setCampaignName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <ReviewItem label="Objective" value={objective} />
              <ReviewItem label="Project" value={project?.name ?? "—"} />
              <ReviewItem label="Locations" value={locations} />
              <ReviewItem label="Age range" value={`${ageMin}–${ageMax}`} />
              <ReviewItem label="Daily budget" value={formatEGP(parseInt(budget))} />
              <ReviewItem label="Schedule" value={`${startDate || "—"} → ${endDate || "ongoing"}`} />
              <ReviewItem label="AI copy" value={aiCopy ? `${aiCopy.headlines?.length ?? 0} headlines` : "Not generated"} />
              <ReviewItem label="Status on save" value={<Badge color="muted">Draft</Badge>} />
            </div>

            <div className="lp-card p-4 bg-[#00d4ff]/5 border-[#00d4ff]/20 text-xs text-[#7a8099] flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#00d4ff] flex-shrink-0 mt-0.5" />
              <div>
                Phase 1 saves campaigns as <strong className="text-[#e8eaf0]">drafts only</strong>.
                Live publishing to Meta Ads Manager arrives in Phase 2.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 1}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="text-xs font-mono text-[#7a8099]">Step {step} of 5</div>
        {step < 5 ? (
          <Button onClick={next}>
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={save} loading={loading}>
            <CheckCircle2 className="w-4 h-4" /> Save as draft
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="lp-card p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a8099] mb-1">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
