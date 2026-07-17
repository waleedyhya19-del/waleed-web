import type { Metadata } from 'next';
import {
  Inter,
  IBM_Plex_Sans_Arabic,
  JetBrains_Mono,
  Space_Grotesk,
} from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { SessionBootstrap } from '@/components/auth/session-bootstrap';
import { routing, dirOf, type Locale } from '@/lib/i18n/routing';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plex-ar',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-grotesk',
});

export const metadata: Metadata = {
  title: {
    default: 'Telephoney Mafqud — Recover lost & missing phones',
    template: '%s · Telephoney Mafqud',
  },
  description:
    'Report a lost or missing phone, track its recovery, and get it back — a single trusted platform for owners, moderators, and lawyers.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = dirOf(locale as Locale);

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${inter.variable} ${plexArabic.variable} ${jetbrains.variable} ${grotesk.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SessionBootstrap />
            {children}
            <Toaster
              position={dir === 'rtl' ? 'top-left' : 'top-right'}
              richColors
              closeButton
            />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
