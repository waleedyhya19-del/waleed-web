import { ReactNode } from 'react';
import { ShieldCheck, Smartphone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { NavbarControls } from '@/components/layout/navbar-controls';

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations();

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute end-4 top-4 z-20 sm:end-6 lg:end-8">
        <NavbarControls />
      </div>
      <div className="hero-orb -top-10 start-0 size-40" />
      <div className="hero-orb bottom-0 end-0 size-56" />
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="surface-card relative hidden overflow-hidden border-0 p-8 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex size-14 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(160deg,rgba(15,23,42,0.95),rgba(8,145,178,0.85))] text-white shadow-[0_20px_50px_rgba(15,23,42,0.24)]">
                <ShieldCheck className="size-6" />
              </div>
              <p className="section-kicker mt-8">{t('shell.platformName')}</p>
              <h1 className="mt-3 max-w-md text-4xl font-semibold tracking-tight">
                {t('auth.heroTitle')}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground">
                {t('auth.heroDescription')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="surface-card-muted rounded-[1.5rem] p-5">
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Smartphone className="size-5" />
                </div>
                <h2 className="text-lg font-semibold">{t('auth.heroFeatureOne')}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {t('auth.heroFeatureOneDescription')}
                </p>
              </div>
              <div className="surface-card-muted rounded-[1.5rem] p-5">
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-600">
                  <ShieldCheck className="size-5" />
                </div>
                <h2 className="text-lg font-semibold">{t('auth.heroFeatureTwo')}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {t('auth.heroFeatureTwoDescription')}
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}
