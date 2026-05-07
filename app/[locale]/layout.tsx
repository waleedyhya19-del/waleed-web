import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';

import { LocaleDocumentSync } from '@/components/shared/locale-document-sync';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const isRtl = locale === 'ar';

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <LocaleDocumentSync
          locale={locale}
          direction={isRtl ? 'rtl' : 'ltr'}
        />
        <TooltipProvider delayDuration={120}>
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={cn('min-h-screen', isRtl && 'font-arabic')}
          >
            {children}
          </div>
          <Toaster position="top-center" dir={isRtl ? 'rtl' : 'ltr'} richColors />
        </TooltipProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
