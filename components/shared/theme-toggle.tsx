'use client';

import { MoonStar, SunMedium } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({
  className,
  compact = false,
}: ThemeToggleProps) {
  const t = useTranslations('settings');
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? 'icon-sm' : 'sm'}
      aria-label={t('theme')}
      onClick={() => setTheme(nextTheme)}
      className={cn(
        'rounded-2xl border-border/70 bg-background/70 backdrop-blur-xl',
        compact ? 'w-11 px-0' : 'gap-2 px-3',
        className
      )}
    >
      {isDark ? (
        <SunMedium className="size-4" />
      ) : (
        <MoonStar className="size-4" />
      )}
      {compact ? (
        <span className="sr-only">{t('theme')}</span>
      ) : (
        <>
          <span className="text-xs font-medium text-muted-foreground">
            {t('theme')}
          </span>
          <span className="text-sm font-semibold" suppressHydrationWarning>
            {isDark ? t('dark') : t('light')}
          </span>
        </>
      )}
    </Button>
  );
}
