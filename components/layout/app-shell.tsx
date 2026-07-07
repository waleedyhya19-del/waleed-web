'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useSessionStore } from '@/stores/session-store';
import type { NavGroup } from '@/lib/nav/registry';
import type { Role } from '@/lib/api/types';

export function AppShell({
  groups,
  variant = 'staff',
  children,
}: {
  groups: NavGroup[];
  variant?: 'staff' | 'portal';
  children: ReactNode;
}) {
  const t = useTranslations();
  const user = useSessionStore((s) => s.user);
  if (!user) return null;
  const role: Role = user.role;
  const brand = t('common.appName');

  return (
    <div className="flex min-h-screen">
      {variant === 'staff' && <Sidebar role={role} groups={groups} brand={brand} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} groups={groups} brand={brand} />
        <main className="flex-1 min-w-0 bg-background p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
