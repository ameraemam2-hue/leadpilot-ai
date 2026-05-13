"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

const ROLES = [
  { value: "marketing_manager", label: "Marketing Manager" },
  { value: "media_buyer",       label: "Media Buyer" },
  { value: "sales_manager",     label: "Sales Manager" },
  { value: "viewer",            label: "Viewer (read-only)" },
  { value: "company_admin",     label: "Company Admin" },
];

export function InviteUserForm() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("marketing_manager");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email, full_name: fullName, role },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({
        title: "Invitation sent",
        description: `${email} will receive an email with a sign-in link.`,
        variant: "success",
      });
      setEmail(""); setFullName("");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Could not invite", description: err?.message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#7c5cfc]/10 border border-[#7c5cfc]/20 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-[#7c5cfc]" />
        </div>
        <div>
          <h3 className="font-display font-bold text-base">Invite teammate</h3>
          <p className="text-xs text-[#7a8099]">
            They'll receive an email invitation. Requires the <code className="font-mono">invite-user</code> Edge Function deployed.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label>Email</Label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@..." />
        </div>
        <div>
          <Label>Full name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <Label>Role</Label>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
        </div>
        <div className="sm:col-span-3 flex justify-end">
          <Button type="submit" loading={loading}>
            <UserPlus className="w-4 h-4" /> Send invite
          </Button>
        </div>
      </form>
    </Card>
  );
}
