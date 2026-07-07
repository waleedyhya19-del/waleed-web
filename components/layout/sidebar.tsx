'use client';

import { useTranslations } from 'next-intl';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { Link, usePathname } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils/cn';
import { filterNavByRole, type NavGroup } from '@/lib/nav/registry';
import type { Role } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Logo, LogoMark } from '@/components/brand/logo';

interface SidebarProps {
  role: Role;
  groups: NavGroup[];
  brand: string;
}

export function Sidebar({ role, groups }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const filtered = filterNavByRole(groups, role);

  return (
    <aside
      className={cn(
        'group hidden shrink-0 border-e border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col',
        collapsed ? 'md:w-16' : 'md:w-64',
        'transition-[width] duration-200 ease-in-out',
      )}
      data-collapsed={collapsed}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
        {collapsed ? (
          <LogoMark className="mx-auto h-8 w-8" />
        ) : (
          <Logo className="ps-1" />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ms-auto h-8 w-8"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={t('common.openMenu')}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 rtl:-scale-x-100" />
          ) : (
            <PanelLeftClose className="h-4 w-4 rtl:-scale-x-100" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {filtered.map((group) => (
            <div key={group.labelKey} className="mt-2 first:mt-0">
              {!collapsed && (
                <div className="px-2 pb-1 pt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t(group.labelKey)}
                </div>
              )}
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group/nav relative flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                      collapsed && 'justify-center',
                      active
                        ? 'bg-brand/10 font-medium text-foreground'
                        : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                    )}
                    title={collapsed ? t(item.labelKey) : undefined}
                    aria-current={active ? 'page' : undefined}
                  >
                    {active && (
                      <span className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-brand" />
                    )}
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        active ? 'text-brand' : 'text-current',
                      )}
                    />
                    {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
