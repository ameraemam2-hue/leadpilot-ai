"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Megaphone,
  Users,
  FileBarChart,
  Settings,
} from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard",  label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects",   label: "Projects",  icon: Building2 },
  { href: "/campaigns",  label: "Campaigns", icon: Megaphone },
  { href: "/leads",      label: "Leads",     icon: Users },
  { href: "/reports",    label: "Reports",   icon: FileBarChart, soon: true },
  { href: "/settings",   label: "Settings",  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-[#0a0c10] border-r border-[#222632] h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-[#222632]">
        <Logo />
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.soon ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                active
                  ? "bg-gradient-to-r from-[#00d4ff]/10 to-transparent text-[#00d4ff] border border-[#00d4ff]/20"
                  : "text-[#7a8099] hover:bg-[#181c24] hover:text-[#e8eaf0]",
                item.soon && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.soon && (
                <span className="ml-auto text-[9px] font-mono uppercase tracking-wider text-[#7a8099] bg-[#181c24] px-1.5 py-0.5 rounded">
                  soon
                </span>
              )}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#00d4ff] rounded-r" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#222632]">
        <div className="lp-card p-3 bg-gradient-to-br from-[#00d4ff]/5 to-[#7c5cfc]/5 border-[#00d4ff]/20">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#00d4ff] mb-1">
            Phase 1 MVP
          </div>
          <div className="text-xs text-[#7a8099]">
            Meta API & CRM sync coming in Phase 2.
          </div>
        </div>
      </div>
    </aside>
  );
}
