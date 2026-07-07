'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Link, usePathname } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils/cn';
import { filterNavByRole, type NavGroup } from '@/lib/nav/registry';
import type { Role } from '@/lib/api/types';
import { dirOf, type Locale } from '@/lib/i18n/routing';
import { LogoMark } from '@/components/brand/logo';

export function MobileNav({
  role,
  groups,
  brand,
}: {
  role: Role;
  groups: NavGroup[];
  brand: string;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const filtered = filterNavByRole(groups, role);
  const side = dirOf(locale) === 'rtl' ? 'end' : 'start';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('common.openMenu')}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="w-72 p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7" />
            <span className="font-display">{brand}</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-2">
          {filtered.map((group) => (
            <div key={group.labelKey} className="mt-2">
              <div className="px-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {t(group.labelKey)}
              </div>
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-brand/10 font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-brand/5 hover:text-foreground',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon
                      className={cn('h-4 w-4', active && 'text-brand')}
                    />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
