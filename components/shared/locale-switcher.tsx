'use client';

import { useMemo, useTransition } from 'react';
import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SupportedLocale = 'ar' | 'en';

interface LocaleSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function LocaleSwitcher({
  className,
  compact = false,
}: LocaleSwitcherProps) {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations('settings');
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const options = useMemo(
    () => [
      { value: 'ar' as const, label: t('arabic'), shortLabel: 'AR' },
      { value: 'en' as const, label: t('english'), shortLabel: 'EN' },
    ],
    [t]
  );

  const currentLocale =
    options.find((option) => option.value === locale) ?? options[0];

  const menuAlign = locale === 'ar' ? 'start' : 'end';

  function handleLocaleChange(nextLocale: string) {
    if (nextLocale === locale) {
      return;
    }

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale as SupportedLocale });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={compact ? 'icon-sm' : 'sm'}
          aria-label={t('language')}
          className={cn(
            'rounded-2xl border-border/70 bg-background/70 backdrop-blur-xl',
            compact ? 'w-11 px-0' : 'gap-2 px-3',
            className
          )}
          disabled={isPending}
        >
          <Globe className="size-4" />
          {compact ? (
            <span className="sr-only">{t('language')}</span>
          ) : (
            <>
              <span className="text-xs font-medium text-muted-foreground">
                {t('language')}
              </span>
              <span className="text-sm font-semibold">
                {currentLocale.shortLabel}
              </span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={menuAlign}
        className="min-w-40 rounded-2xl border border-border/80 bg-background/95 p-1.5 backdrop-blur-xl"
      >
        <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={handleLocaleChange}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="rounded-xl px-3 py-2"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
