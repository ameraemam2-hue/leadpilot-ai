"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Logo } from "@/components/layout/logo";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "password") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        toast({ title: "Sign-in failed", description: error.message, variant: "error" });
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) {
        toast({ title: "Could not send link", description: error.message, variant: "error" });
        return;
      }
      toast({
        title: "Check your inbox",
        description: "We sent you a magic sign-in link.",
        variant: "success",
      });
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0c10] bg-hero-glow p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="lp-card p-8 animate-fade-in">
          <h1 className="font-display font-extrabold text-2xl mb-1.5 lp-text-gradient">
            Welcome back
          </h1>
          <p className="text-sm text-[#7a8099] mb-6">
            Sign in to your LeadPilot AI workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8099]" />
                <Input
                  type="email"
                  required
                  className="pl-10"
                  placeholder="you@brokerage.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {mode === "password" && (
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8099]" />
                  <Input
                    type="password"
                    required
                    className="pl-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {mode === "password" ? "Sign in" : "Send magic link"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "password" ? "magic" : "password")}
            className="mt-4 text-xs text-[#7a8099] hover:text-[#00d4ff] transition-colors"
          >
            {mode === "password"
              ? "→ Use magic link instead"
              : "→ Use password instead"}
          </button>
        </div>

        <p className="text-center text-sm text-[#7a8099] mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#00d4ff] hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
