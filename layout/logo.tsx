import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { box: "w-7 h-7", text: "text-base" },
    md: { box: "w-9 h-9", text: "text-lg" },
    lg: { box: "w-12 h-12", text: "text-2xl" },
  };
  const s = sizes[size];

  return (
    <Link href="/dashboard" className="inline-flex items-center gap-2.5 group">
      <div className={`${s.box} rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#7c5cfc] flex items-center justify-center shadow-lg shadow-[#00d4ff]/20 group-hover:shadow-[#00d4ff]/40 transition-shadow`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-1/2 h-1/2">
          <path
            d="M3 12L7 8M7 8L11 12L17 6L21 10"
            stroke="#0a0c10"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-display font-extrabold ${s.text} tracking-tight`}>
          LeadPilot
        </span>
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#00d4ff] mt-0.5">
          AI
        </span>
      </div>
    </Link>
  );
}
