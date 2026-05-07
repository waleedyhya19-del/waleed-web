'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { ReportStatus } from '@/lib/api/types';

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

const statusColors: Record<ReportStatus, string> = {
  [ReportStatus.RECEIVED]: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  [ReportStatus.REVIEWING]: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  [ReportStatus.ESCALATED]: 'bg-orange-500/12 text-orange-700 dark:text-orange-300',
  [ReportStatus.REJECTED]: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
  [ReportStatus.RESOLVED]: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  [ReportStatus.CLOSED]: 'bg-slate-500/12 text-slate-700 dark:text-slate-300',
};

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const t = useTranslations('reportStatus');

  const statusKey = status.toLowerCase() as keyof typeof statusColors;

  return (
    <Badge className={`rounded-full px-2.5 py-1 ${statusColors[status]}`}>
      {t(statusKey)}
    </Badge>
  );
}
