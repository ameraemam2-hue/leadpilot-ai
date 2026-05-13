"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { AppUser, Company } from "@/types/db";

export function Topbar({ user, company }: { user: AppUser | null; company: Company | null }) {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = (user?.full_name || user?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[#0a0c10]/80 border-b border-[#222632]">
      <div className="flex items-center justify-between h-16 px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="lg:hidden text-[#7a8099]">
            <Menu className="w-5 h-5" />
          </button>
          {company && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center text-[#0a0c10] font-bold text-sm">
                {company.name[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-semibold text-sm">{company.name}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7a8099]">
                  {company.subscription_plan} plan
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col leading-tight items-end">
                <span className="text-sm font-medium">{user.full_name || user.email}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7a8099]">
                  {user.role.replace(/_/g, " ")}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#181c24] border border-[#222632] flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
