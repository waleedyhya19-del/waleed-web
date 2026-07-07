'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
import { UserMenu } from './user-menu';
import { NotificationsBell } from './notifications-bell';
import { MobileNav } from './mobile-nav';
import type { NavGroup } from '@/lib/nav/registry';
import type { Role } from '@/lib/api/types';

export function Topbar({
  role,
  groups,
  brand,
  right,
}: {
  role: Role;
  groups: NavGroup[];
  brand: string;
  right?: ReactNode;
}) {
  const t = useTranslations();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
      <MobileNav role={role} groups={groups} brand={brand} />
      <div className="hidden text-sm font-medium text-muted-foreground md:block">
        {t('common.appName')}
      </div>
      <div className="ms-auto flex items-center gap-1">
        {right}
        <NotificationsBell role={role} />
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
