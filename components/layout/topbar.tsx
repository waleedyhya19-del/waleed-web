'use client';

import type { ReactNode } from 'react';
import { LanguageSwitcher } from './language-switcher';
import { UserMenu } from './user-menu';
import { NotificationsBell } from './notifications-bell';
import { MobileNav } from './mobile-nav';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
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
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <MobileNav role={role} groups={groups} brand={brand} />
      <Logo className="hidden md:inline-flex" />
      <div className="ms-auto flex items-center gap-1">
        {right}
        <NotificationsBell role={role} />
        <ThemeToggle />
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
