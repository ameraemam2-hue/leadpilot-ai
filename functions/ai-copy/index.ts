// =====================================================================
// /functions/v1/ai-copy
// Generates Egyptian real-estate ad copy using Claude (Anthropic).
// Falls back to a deterministic mock if CLAUDE_API_KEY is not set.
// =====================================================================
//
// Deploy:
//   supabase functions deploy ai-copy --no-verify-jwt
//   # then re-enable JWT verification:
//   supabase functions deploy ai-copy
//
// Secrets:
//   supabase secrets set CLAUDE_API_KEY=sk-ant-...
//
// Request body:
//   {
//     "project": {
//        "name": "Elysium Compound",
//        "location": "Sheikh Zayed",
//        "starting_price": 4500000,
//        "down_payment_pct": 10,
//        "installment_years": 8,
//        "usps": ["Smart home", "Prime location"],
//        "property_type": "apartment"
//     },
//     "tone": "urgency" | "trust" | "aspiration",   // optional
//     "language": "ar" | "en" | "both"              // optional, default "both"
//   }
//
// Response:
//   {
//     "headlines": [ "...", "...", "..." ],
//     "primary_texts": [ "...", "..." ],
//     "whatsapp_script": "...",
//     "language": "both",
//     "model": "claude-sonnet-4" | "mock"
//   }
// =====================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";

const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY");
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `You are an elite Egyptian real estate ad copywriter.
You write persuasive Meta Ads copy in both Egyptian Arabic and English.

Egyptian buyer psychology you understand deeply:
- Buyers fear missing out on good payment plans (low down payment, long installments)
- They want security, family space, and a strong investment
- Egyptian Arabic dialect feels more trusted than Modern Standard Arabic
- Location prestige matters (Sheikh Zayed, New Cairo, North Coast, etc.)
- Delivery date and developer reputation are decision drivers

Always include in every variation:
- A hook (urgency, FOMO, or aspirational lifestyle)
- The payment plan benefit (down payment %, installment years)
- One specific USP from the project
- A strong call-to-action ("سجل اهتمامك" / "Reserve your unit")

Output STRICT JSON only — no markdown, no commentary. Schema:
{
  "headlines": ["...", "...", "..."],
  "primary_texts": ["...", "..."],
  "whatsapp_script": "..."
}`;

function buildUserPrompt(project: any, tone?: string, language?: string) {
  const lang = language ?? "both";
  const toneNote = tone ? `Tone: ${tone}.` : "";
  return `Generate ad copy for this Egyptian real estate project.

Project: ${project.name ?? "Untitled"}
Developer: ${project.developer_name ?? "N/A"}
Location: ${project.location ?? "N/A"}
Property type: ${project.property_type ?? "apartment"}
Starting price: ${project.starting_price ? project.starting_price.toLocaleString() + " EGP" : "N/A"}
Down payment: ${project.down_payment_pct ?? "N/A"}%
Installment years: ${project.installment_years ?? "N/A"}
Delivery: ${project.delivery_date ?? "N/A"}
USPs: ${(project.usps ?? []).join(" | ") || "N/A"}

Language: ${lang === "both" ? "produce each variation in Egyptian Arabic AND English (label them AR: / EN:)" : lang === "ar" ? "Egyptian Arabic only" : "English only"}.
${toneNote}

Output exactly 3 headlines, 2 primary_texts, 1 whatsapp_script.
Return ONLY the JSON object, nothing else.`;
}

function mockResponse(project: any) {
  const name = project?.name ?? "the project";
  const loc = project?.location ?? "Egypt";
  const dp = project?.down_payment_pct ?? 10;
  const yrs = project?.installment_years ?? 8;
  return {
    headlines: [
      `AR: امتلك وحدتك في ${name} بـ ${dp}% مقدم وتقسيط ${yrs} سنين 🏡`,
      `EN: Own your home in ${name} — ${dp}% down, ${yrs}-year plan`,
      `AR: فرصة محدودة في ${loc} — احجز قبل نفاد الوحدات`,
    ],
    primary_texts: [
      `AR: عيش في ${loc} بأفضل خطة سداد في السوق. ${dp}% مقدم وتقسيط على ${yrs} سنين بدون فوائد. الوحدات محدودة — سجل اهتمامك دلوقتي.`,
      `EN: Discover ${name} in ${loc}. Just ${dp}% down and pay over ${yrs} years. Premium units selling fast — reserve yours today.`,
    ],
    whatsapp_script: `أهلاً 👋 شكراً لاهتمامك بـ ${name} في ${loc}. ممكن أعرف اسم حضرتك ورقم الموبايل عشان نبعتلك تفاصيل خطة السداد والوحدات المتاحة؟`,
    language: "both",
    model: "mock",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { project, tone, language } = body ?? {};

    if (!project || !project.name) {
      return new Response(
        JSON.stringify({ error: "Missing project.name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mock mode — useful for local dev or before you set CLAUDE_API_KEY
    if (!CLAUDE_API_KEY) {
      return new Response(JSON.stringify(mockResponse(project)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Real Claude call
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: buildUserPrompt(project, tone, language) },
        ],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error("Claude API error:", errText);
      // Graceful fallback
      const fallback = mockResponse(project);
      fallback.model = "mock_fallback";
      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const claudeData = await claudeRes.json();
    const text = claudeData?.content?.[0]?.text ?? "{}";

    // Strip code fences if Claude added any
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (_err) {
      console.error("Failed to parse Claude JSON:", text);
      parsed = mockResponse(project);
      parsed.model = "mock_parse_error";
    }

    parsed.language = language ?? "both";
    parsed.model = parsed.model ?? CLAUDE_MODEL;

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-copy error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
