'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, ShieldCheck, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/lib/i18n/routing';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useSessionStore } from '@/stores/session-store';
import { roleHomeHref } from '@/lib/hooks/use-role-home';

export default function Landing() {
  const t = useTranslations();
  const router = useRouter();
  const { user, status } = useSessionStore();

  useEffect(() => {
    if (status === 'authed' && user) {
      router.replace(roleHomeHref(user.role));
    }
  }, [status, user, router]);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center gap-3 border-b border-border px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            M
          </div>
          <span className="text-sm font-semibold">{t('common.appName')}</span>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher />
          <Button asChild variant="ghost">
            <Link href="/login">{t('landing.signIn')}</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">{t('landing.signUp')}</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col items-center gap-16 px-4 py-24 sm:px-6">
        <section className="flex max-w-3xl flex-col items-center gap-6 text-center">
          <div className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            {t('common.appName')}
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-pretty text-base text-muted-foreground sm:text-lg">
            {t('landing.heroSubtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                {t('landing.signUp')}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">{t('landing.signIn')}</Link>
            </Button>
          </div>
        </section>
        <section className="grid w-full max-w-5xl gap-4 sm:grid-cols-3">
          {[
            { icon: FileText, key: 'nav.reports' },
            { icon: Search, key: 'nav.serialLookup' },
            { icon: ShieldCheck, key: 'nav.moderators' },
          ].map(({ icon: Icon, key }) => (
            <div key={key} className="surface-card p-6">
              <Icon className="h-5 w-5 text-accent" />
              <div className="mt-3 text-sm font-semibold">{t(key)}</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
