'use client';

import dynamic from 'next/dynamic';

import { cn } from '@/lib/utils';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';

const ThemeToggle = dynamic(
  () =>
    import('@/components/shared/theme-toggle').then(
      (module) => module.ThemeToggle
    ),
  {
    ssr: false,
  }
);

interface NavbarControlsProps {
  className?: string;
  compact?: boolean;
}

export function NavbarControls({
  className,
  compact = false,
}: NavbarControlsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ThemeToggle compact={compact} />
      <LocaleSwitcher compact={compact} />
    </div>
  );
}
