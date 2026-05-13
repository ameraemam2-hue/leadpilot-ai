"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Copy, RefreshCw, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project, AIGeneratedCopy } from "@/types/db";

export function CopyGenerator({
  project,
  initial,
  onChange,
}: {
  project: Project | null;
  initial?: AIGeneratedCopy | null;
  onChange?: (copy: AIGeneratedCopy) => void;
}) {
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copy, setCopy] = useState<AIGeneratedCopy | null>(initial ?? null);

  async function generate() {
    if (!project) {
      toast({ title: "Pick a project first", variant: "error" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-copy", {
        body: { project, language: "both" },
      });
      if (error) throw error;
      const result = data as AIGeneratedCopy;
      setCopy(result);
      onChange?.(result);
      toast({
        title: "Copy generated ✨",
        description: `Model: ${result.model || "claude"}`,
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Generation failed",
        description: err?.message || "Edge function error. Check that 'ai-copy' is deployed.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", variant: "success" });
  }

  return (
    <div className="space-y-4">
      <div className="lp-card p-5 bg-gradient-to-br from-[#7c5cfc]/5 to-[#00d4ff]/5 border-[#7c5cfc]/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#00d4ff] flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-[#0a0c10]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base mb-1">AI Copy Generator</h3>
              <p className="text-xs text-[#7a8099]">
                Egyptian Arabic + English ad copy, generated from your project's USPs and pricing.
              </p>
            </div>
          </div>
          <Button onClick={generate} loading={loading} size="md">
            <Sparkles className="w-4 h-4" />
            {copy ? "Regenerate" : "Generate"}
          </Button>
        </div>
      </div>

      {!copy && (
        <div className="lp-card p-8 text-center">
          <Sparkles className="w-8 h-8 text-[#7a8099] mx-auto mb-3" />
          <p className="text-sm text-[#7a8099]">
            Click <span className="text-[#00d4ff]">Generate</span> to produce 3 headlines, 2 primary text variations, and 1 WhatsApp script.
          </p>
        </div>
      )}

      {copy && (
        <>
          <Section title="Headlines" count={copy.headlines?.length ?? 0}>
            {(copy.headlines ?? []).map((h, i) => (
              <CopyBlock key={i} text={h} onCopy={() => copyToClipboard(h)} />
            ))}
          </Section>

          <Section title="Primary text" count={copy.primary_texts?.length ?? 0}>
            {(copy.primary_texts ?? []).map((p, i) => (
              <CopyBlock key={i} text={p} onCopy={() => copyToClipboard(p)} />
            ))}
          </Section>

          {copy.whatsapp_script && (
            <Section title="WhatsApp opening script" count={1}>
              <CopyBlock
                text={copy.whatsapp_script}
                onCopy={() => copyToClipboard(copy.whatsapp_script)}
              />
            </Section>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-[#7a8099]">
            <span>Model: {copy.model ?? "—"}</span>
            <button onClick={generate} className="hover:text-[#00d4ff] flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Regenerate all
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-[#7a8099]">{title}</h4>
        <Badge color="blue">{count}</Badge>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CopyBlock({ text, onCopy }: { text: string; onCopy: () => void }) {
  return (
    <div className="lp-card p-4 flex items-start gap-3 hover:border-[#00d4ff]/30 group">
      <div className="flex-1 text-sm leading-relaxed whitespace-pre-wrap" dir="auto">
        {text}
      </div>
      <button
        onClick={onCopy}
        className="text-[#7a8099] hover:text-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
}
