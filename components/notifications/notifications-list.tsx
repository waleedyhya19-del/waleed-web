'use client';

import { useTranslations } from 'next-intl';
import { BellOff } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export function NotificationsList() {
  const t = useTranslations();
  return (
    <div>
      <PageHeader title={t('notifications.title')} />
      <EmptyState icon={<BellOff className="h-5 w-5" />} title={t('notifications.empty')} />
    </div>
  );
}
