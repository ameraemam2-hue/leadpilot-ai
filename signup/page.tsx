"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Logo } from "@/components/layout/logo";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "error" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "error" });
      return;
    }
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
    } else {
      toast({
        title: "Confirm your email",
        description: "Check your inbox for a verification link.",
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
            Create your workspace
          </h1>
          <p className="text-sm text-[#7a8099] mb-6">
            Free during Phase 1 MVP — no credit card required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8099]" />
                <Input
                  required
                  className="pl-10"
                  placeholder="Faris Hassan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Work email</Label>
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
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8099]" />
                <Input
                  type="password"
                  required
                  minLength={8}
                  className="pl-10"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Create account <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#7a8099] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#00d4ff] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
