import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ar', 'en'] as const,
  defaultLocale: 'ar',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

export const dirOf = (locale: Locale): 'rtl' | 'ltr' =>
  locale === 'ar' ? 'rtl' : 'ltr';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
