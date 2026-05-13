import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="lp-card p-12 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#181c24] border border-[#222632] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[#7a8099]" />
      </div>
      <h3 className="font-display font-bold text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#7a8099] max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}
