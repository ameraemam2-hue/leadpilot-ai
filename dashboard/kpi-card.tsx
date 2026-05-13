import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function KPICard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = "blue",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: "blue" | "purple" | "green" | "orange" | "gold";
  hint?: string;
}) {
  const colorMap = {
    blue:   { ring: "ring-[#00d4ff]/20", bg: "bg-[#00d4ff]/10", text: "text-[#00d4ff]" },
    purple: { ring: "ring-[#7c5cfc]/20", bg: "bg-[#7c5cfc]/10", text: "text-[#7c5cfc]" },
    green:  { ring: "ring-[#22d17a]/20", bg: "bg-[#22d17a]/10", text: "text-[#22d17a]" },
    orange: { ring: "ring-[#ff6b35]/20", bg: "bg-[#ff6b35]/10", text: "text-[#ff6b35]" },
    gold:   { ring: "ring-[#f5c842]/20", bg: "bg-[#f5c842]/10", text: "text-[#f5c842]" },
  }[color];

  const TrendIcon = trend == null ? Minus : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend == null ? "text-[#7a8099]" : trend > 0 ? "text-[#22d17a]" : trend < 0 ? "text-[#ff4757]" : "text-[#7a8099]";

  return (
    <div className="lp-card p-5 hover:border-[#00d4ff]/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorMap.bg, "ring-1", colorMap.ring)}>
          <Icon className={cn("w-5 h-5", colorMap.text)} />
        </div>
        {trend != null && (
          <div className={cn("flex items-center gap-1 text-xs font-mono", trendColor)}>
            <TrendIcon className="w-3 h-3" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a8099] mb-1">
        {label}
      </div>
      <div className="font-display font-extrabold text-2xl mb-0.5">{value}</div>
      {(trendLabel || hint) && (
        <div className="text-xs text-[#7a8099]">{trendLabel || hint}</div>
      )}
    </div>
  );
}
