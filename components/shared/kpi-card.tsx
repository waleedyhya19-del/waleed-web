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
    <div className={cn('surface-card p-5', className)}>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
