export function PageHeader({
  title,
  subtitle,
  tag,
  action,
}: {
  title: string;
  subtitle?: string;
  tag?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        {tag && (
          <div className="inline-block text-[10px] font-mono uppercase tracking-[0.18em] text-[#00d4ff] bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2.5 py-1 rounded mb-3">
            {tag}
          </div>
        )}
        <h1 className="font-display font-extrabold text-3xl lp-text-gradient">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[#7a8099] mt-1.5 text-sm max-w-2xl">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
