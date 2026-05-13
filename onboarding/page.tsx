"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Logo } from "@/components/layout/logo";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Building2 } from "lucide-react";
import { slugify } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("");
  const [primary, setPrimary] = useState("#00d4ff");
  const [secondary, setSecondary] = useState("#7c5cfc");
  const [accent, setAccent] = useState("#ff6b35");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not signed in", variant: "error" });
      router.push("/login");
      return;
    }

    // Insert company (allowed by companies_insert_self policy)
    const slug = `${slugify(companyName)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: companyName.trim(),
        slug,
        brand_colors: { primary, secondary, accent },
      })
      .select()
      .single();

    if (companyError || !company) {
      setLoading(false);
      toast({
        title: "Could not create company",
        description: companyError?.message,
        variant: "error",
      });
      return;
    }

    // Update the user row (created by trigger) with company_id + admin role
    const { error: userError } = await supabase
      .from("users")
      .update({ company_id: company.id, role: "company_admin" })
      .eq("id", user.id);

    setLoading(false);

    if (userError) {
      toast({
        title: "Created company but couldn't assign you",
        description: userError.message,
        variant: "error",
      });
      return;
    }

    toast({ title: "Workspace created 🎉", variant: "success" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0c10] bg-hero-glow p-6">
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="lp-card p-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[10px] font-mono uppercase tracking-wider text-[#00d4ff] mb-4">
            <Building2 className="w-3 h-3" /> Step 1 of 1
          </div>
          <h1 className="font-display font-extrabold text-2xl mb-2 lp-text-gradient">
            Set up your company workspace
          </h1>
          <p className="text-sm text-[#7a8099] mb-6">
            This creates an isolated, multi-tenant workspace for your brokerage.
            You'll be assigned as Company Admin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Company name</Label>
              <Input
                required
                placeholder="New Step Real Estate"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <Label>Brand colors</Label>
              <div className="grid grid-cols-3 gap-3">
                <ColorPicker label="Primary" value={primary} onChange={setPrimary} />
                <ColorPicker label="Secondary" value={secondary} onChange={setSecondary} />
                <ColorPicker label="Accent" value={accent} onChange={setAccent} />
              </div>
            </div>

            <div className="lp-card p-4 bg-[#181c24]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a8099] mb-2">
                Preview
              </div>
              <div className="flex gap-2">
                <div className="h-10 flex-1 rounded-md" style={{ background: primary }} />
                <div className="h-10 flex-1 rounded-md" style={{ background: secondary }} />
                <div className="h-10 flex-1 rounded-md" style={{ background: accent }} />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create workspace <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

function ColorPicker({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a8099] mb-1.5">
        {label}
      </div>
      <div className="flex items-center gap-2 bg-[#181c24] border border-[#222632] rounded-lg px-3 py-2 cursor-pointer hover:border-[#00d4ff]/50">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-xs font-mono outline-none uppercase"
        />
      </div>
    </div>
  );
}
