import { cn } from "@/lib/utils";

type BadgeColor = "blue" | "purple" | "orange" | "green" | "gold" | "red" | "muted";

const colors: Record<BadgeColor, string> = {
  blue:   "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/30",
  purple: "bg-[#7c5cfc]/10 text-[#7c5cfc] border-[#7c5cfc]/30",
  orange: "bg-[#ff6b35]/10 text-[#ff6b35] border-[#ff6b35]/30",
  green:  "bg-[#22d17a]/10 text-[#22d17a] border-[#22d17a]/30",
  gold:   "bg-[#f5c842]/10 text-[#f5c842] border-[#f5c842]/30",
  red:    "bg-[#ff4757]/10 text-[#ff4757] border-[#ff4757]/30",
  muted:  "bg-[#7a8099]/10 text-[#7a8099] border-[#7a8099]/30",
};

export function Badge({
  color = "blue",
  children,
  className,
}: {
  color?: BadgeColor;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider font-medium border",
      colors[color],
      className
    )}>
      {children}
    </span>
  );
}
