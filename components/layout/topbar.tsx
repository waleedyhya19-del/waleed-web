'use client';

import { LogOut, Sparkles } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { NavbarControls } from '@/components/layout/navbar-controls';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Link } from '@/i18n/routing';
import { formatDate } from '@/lib/formatters';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { RoleBadge } from '@/components/users/role-badge';
import { NotificationsBell } from '@/components/layout/notifications-bell';

interface TopbarProps {
  onLogout?: () => void | Promise<void>;
}

export function Topbar({ onLogout }: TopbarProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useCurrentUser();

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'MM';

  return (
    <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 rounded-[1.75rem] border border-white/60 bg-white/75 px-3 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 sm:px-4">
        <SidebarTrigger className="shrink-0 rounded-2xl border border-border/70 bg-background/70" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-primary/12 px-2.5 text-primary">
              <Sparkles className="size-3" />
              {t('shell.controlCenter')}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(new Date(), locale, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold sm:text-xl">
              {user?.displayName || t('dashboard.welcome')}
            </h1>
            {user?.role && <RoleBadge role={user.role} />}
          </div>
        </div>

        <NotificationsBell />

        <NavbarControls className="hidden md:flex" />

        <NavbarControls compact className="md:hidden" />

        <Link href="/settings" className="hidden md:block">
          <div className="surface-card-muted flex items-center gap-3 rounded-[1.5rem] border px-3 py-2">
            <Avatar className="ring-2 ring-white/70">
              <AvatarImage src={user?.profilePhotoUrl || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.displayName || t('dashboard.welcome')}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || t('settings.profile')}
              </p>
            </div>
          </div>
        </Link>

        <Button
          type="button"
          variant="ghost"
          onClick={onLogout}
          className="rounded-2xl px-3 text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15"
        >
          <LogOut className="size-4 rtl:-scale-x-100" />
          <span className="hidden sm:inline">{t('navigation.logout')}</span>
        </Button>
      </div>
    </header>
  );
}