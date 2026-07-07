'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * ThemeToggle — light/dark switch. Renders a stable placeholder until mounted
 * so server and client markup match (next-themes reads the DOM on mount).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t('common.toggleTheme')}
      title={t('common.toggleTheme')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn('relative', className)}
    >
      {mounted ? (
        <>
          <Sun
            className={cn(
              'h-[1.15rem] w-[1.15rem] transition-all',
              isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
            )}
          />
          <Moon
            className={cn(
              'absolute h-[1.15rem] w-[1.15rem] transition-all',
              isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0',
            )}
          />
        </>
      ) : (
        <Sun className="h-[1.15rem] w-[1.15rem] opacity-0" />
      )}
    </Button>
  );
}
