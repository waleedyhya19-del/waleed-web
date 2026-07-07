'use client';

import { BellRing } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/routing';
import type { Role } from '@/lib/api/types';

export function NotificationsBell({ role }: { role: Role }) {
  const t = useTranslations();
  const href = role === 'END_USER' ? '/portal/notifications' : '/staff/notifications';
  return (
    <Button asChild variant="ghost" size="icon" aria-label={t('nav.notifications')}>
      <Link href={href}>
        <BellRing className="h-4 w-4" />
      </Link>
    </Button>
  );
}
