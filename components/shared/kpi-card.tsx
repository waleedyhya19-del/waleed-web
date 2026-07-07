import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
}

export function KpiCard({ label, value, icon: Icon, hint, className }: Props) {
  return (
    <div
      className={cn(
        'surface-card group p-5 transition-colors hover:border-brand/40',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="eyebrow">{label}</div>
        {Icon && (
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand ring-1 ring-inset ring-brand/20">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="mt-4 font-display text-3xl font-bold tracking-tight tabular-nums">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
