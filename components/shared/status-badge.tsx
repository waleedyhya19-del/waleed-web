'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { statusKey, statusVariant } from '@/lib/i18n/enums';
import type { ReportStatus } from '@/lib/api/types';

export function StatusBadge({ status }: { status: ReportStatus }) {
  const t = useTranslations();
  return <Badge variant={statusVariant(status)}>{t(statusKey(status))}</Badge>;
}
