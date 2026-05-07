'use client';

import { ComponentType } from 'react';
import {
  BarChart3,
  FileSearch,
  LayoutPanelLeft,
  LockKeyhole,
  Users2,
  UserSquare2,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { useCurrentUser } from '@/hooks/use-current-user';
import { Link, usePathname } from '@/i18n/routing';
import { Role } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

interface NavItem {
  href: string;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    href: '/',
    labelKey: 'navigation.dashboard',
    icon: BarChart3,
    roles: [Role.MODERATOR, Role.ADMIN, Role.LAWYER],
  },
  {
    href: '/reports',
    labelKey: 'navigation.reports',
    icon: FileSearch,
    roles: [Role.MODERATOR, Role.ADMIN, Role.LAWYER],
  },
  {
    href: '/users',
    labelKey: 'navigation.users',
    icon: Users2,
    roles: [Role.MODERATOR, Role.ADMIN],
  },
  {
    href: '/moderators',
    labelKey: 'navigation.moderators',
    icon: UserSquare2,
    roles: [Role.ADMIN],
  },
  {
    href: '/settings',
    labelKey: 'navigation.settings',
    icon: LockKeyhole,
    roles: [Role.MODERATOR, Role.ADMIN],
  },
];

function isActiveRoute(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function AppSidebar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const isRtl = locale === 'ar';

  const currentRole = user?.role;
  const filteredItems = navItems.filter((item) =>
    currentRole ? item.roles.includes(currentRole) : false
  );

  return (
    <Sidebar
      collapsible="icon"
      side={isRtl ? 'right' : 'left'}
      dir={isRtl ? 'rtl' : 'ltr'}
      variant="floating"
      className="border-0 bg-transparent p-2 md:top-24 md:h-[calc(100svh-6rem)] md:bottom-auto"
    >
      <SidebarHeader className="p-0">
        <div className="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/88 px-3 py-3 shadow-[0_20px_48px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-slate-950/82">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LayoutPanelLeft className="size-4 rtl:-scale-x-100" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {t('shell.platformName')}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-sidebar-foreground">
                {t('shell.controlCenter')}
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="mt-3 overflow-hidden">
        <SidebarGroup className="px-0 py-0">
          <SidebarGroupLabel className="px-3 text-sidebar-foreground/50">
            {t('shell.navigation')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(pathname, item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={{ children: t(item.labelKey), side: isRtl ? 'left' : 'right' }}
                      isActive={active}
                      size="default"
                      className={cn(
                        'h-11 rounded-xl px-3 transition-all',
                        active &&
                          'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_12px_24px_rgba(15,23,42,0.24)]'
                      )}
                    >
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
