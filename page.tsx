import Link from "next/link";
import { ArrowRight, Sparkles, Building2, Megaphone, Users, Bot, Shield } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const features = [
  { icon: Bot, title: "AI Ad Copy in Egyptian Arabic", body: "Claude-powered copywriter trained on Egyptian real-estate buyer psychology. Generate headlines, primary text, and WhatsApp scripts in seconds." },
  { icon: Megaphone, title: "Campaign Builder", body: "5-step wizard creates Meta-ready campaigns with targeting, budgets, and creative briefs — no Ads Manager required." },
  { icon: Users, title: "Unified Lead Pipeline", body: "Every Meta lead, WhatsApp inquiry, and CSV import in one place. Track status from new → reservation → deal." },
  { icon: Building2, title: "Multi-Project Workspace", body: "Manage every compound, developer, and unit type your brokerage sells under one company workspace." },
  { icon: Shield, title: "Tenant-Isolated Security", body: "Row-level security in Postgres. Each company's data is sealed off at the database layer — not just the app." },
  { icon: Sparkles, title: "Built for Egyptian Brokerages", body: "EGP currency, Arabic-first copy, Sheikh Zayed / New Cairo / Coast targeting baked in. Engaz CRM integration coming." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0c10] bg-hero-glow">
      {/* Nav */}
      <nav className="border-b border-[#222632] backdrop-blur-md bg-[#0a0c10]/70 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/login" className="lp-btn-ghost">Sign in</Link>
            <Link href="/signup" className="lp-btn-primary">
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[11px] font-mono uppercase tracking-wider text-[#00d4ff] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
            Phase 1 MVP — Now Live
          </div>
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6">
            <span className="lp-text-gradient">Sell more units.</span>
            <br />
            <span className="bg-gradient-to-r from-[#00d4ff] to-[#7c5cfc] bg-clip-text text-transparent">
              Spend less on ads.
            </span>
          </h1>
          <p className="text-lg text-[#7a8099] max-w-2xl mx-auto mb-10 leading-relaxed">
            The AI marketing platform built for Egyptian real estate brokerages.
            Run Meta campaigns, generate Arabic ad copy, and track every lead from
            click to closed deal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="lp-btn-primary text-base px-6 py-3">
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="lp-btn-secondary text-base px-6 py-3">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="lp-card p-6 hover:border-[#00d4ff]/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff]/15 to-[#7c5cfc]/15 border border-[#00d4ff]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-[#00d4ff]" />
                </div>
                <h3 className="font-display font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[#7a8099] leading-relaxed">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-[#222632] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#7a8099]">
          <div>LeadPilot AI · Built for New Step Real Estate</div>
          <div>© {new Date().getFullYear()} · Phase 1 MVP</div>
        </div>
      </footer>
    </main>
  );
}
