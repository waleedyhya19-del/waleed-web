'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  BellRing,
  Languages,
  Lock,
  Radio,
  Scale,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/routing';
import { Logo, LogoMark } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { RadarLoader } from '@/components/shared/radar-loader';

const HeroScene = dynamic(() => import('./hero-scene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <RadarLoader size={40} />
    </div>
  ),
});

const STEPS = [
  { n: '01', icon: Radio, title: 'step1Title', body: 'step1Body' },
  { n: '02', icon: ShieldCheck, title: 'step2Title', body: 'step2Body' },
  { n: '03', icon: BellRing, title: 'step3Title', body: 'step3Body' },
] as const;

const FEATURES = [
  { icon: Search, title: 'featureLookupTitle', body: 'featureLookupBody' },
  { icon: BellRing, title: 'featureAlertsTitle', body: 'featureAlertsBody' },
  { icon: ShieldCheck, title: 'featureModerationTitle', body: 'featureModerationBody' },
  { icon: Scale, title: 'featureLegalTitle', body: 'featureLegalBody' },
  { icon: Languages, title: 'featureBilingualTitle', body: 'featureBilingualBody' },
  { icon: Lock, title: 'featureSecureTitle', body: 'featureSecureBody' },
] as const;

const STATS = [
  { value: 'statReportsValue', label: 'statReportsLabel' },
  { value: 'statRecoveredValue', label: 'statRecoveredLabel' },
  { value: 'statResponseValue', label: 'statResponseLabel' },
] as const;

export function LandingPage() {
  const t = useTranslations();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !root.current) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context((self) => {
        const q = self.selector;
        if (!q) return;
        // Hero entrance
        gsap.from(q('[data-hero]'), {
          y: 24,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
        });
        // Scroll reveals
        (q('[data-reveal]') as Element[]).forEach((el) => {
          gsap.from(el, {
            y: 34,
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          });
        });
      }, root);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={root} className="min-h-screen bg-background text-foreground">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/60 glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="ms-8 hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              {t('landing.navHowItWorks')}
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              {t('landing.navFeatures')}
            </a>
          </nav>
          <div className="ms-auto flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">{t('landing.signIn')}</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">{t('landing.signUp')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade" />
        <div
          aria-hidden
          className="pointer-events-none absolute start-1/2 top-[-10%] h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, var(--glow), transparent 70%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div
              data-hero
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              <span className="eyebrow !text-foreground/70">
                {t('landing.eyebrow')}
              </span>
            </div>
            <h1
              data-hero
              className="mt-6 text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            >
              {t('landing.heroTitle')}
            </h1>
            <p
              data-hero
              className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              {t('landing.heroSubtitle')}
            </p>
            <div data-hero className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="glow-brand">
                <Link href="/signup">
                  {t('landing.getStarted')}
                  <ArrowRight className="size-4 icon-directional" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">{t('landing.signIn')}</Link>
              </Button>
            </div>
            <p
              data-hero
              className="eyebrow mt-8 flex items-center gap-2 text-muted-foreground"
            >
              <Radio className="size-3.5 text-brand" />
              {t('landing.heroStatus')}
            </p>
          </div>

          <div
            data-hero
            className="relative mx-auto h-[360px] w-full max-w-md sm:h-[440px] lg:h-[520px]"
          >
            <HeroScene />
          </div>
        </div>

        {/* Trust line */}
        <div className="relative border-y border-border/60 bg-card/30">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <p className="text-center text-xs text-muted-foreground sm:text-sm">
              {t('landing.trustLine')}
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">{t('landing.navHowItWorks')}</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t('landing.stepsTitle')}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('landing.stepsSubtitle')}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ n, icon: Icon, title, body }) => (
            <div
              key={n}
              data-reveal
              className="surface-card relative p-6 transition-colors hover:border-brand/40"
            >
              <span className="pointer-events-none absolute end-5 top-4 font-mono text-4xl font-bold text-brand/15">
                {n}
              </span>
              <div className="flex size-11 items-center justify-center rounded-lg bg-brand/10 text-brand ring-1 ring-inset ring-brand/20">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">
                {t(`landing.${title}`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`landing.${body}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats band ──────────────────────────────────────── */}
      <section className="relative border-y border-border/60 bg-card/30">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <div
          className="relative mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3 sm:px-6"
          data-reveal
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-mono text-4xl font-bold tracking-tight text-gradient-brand sm:text-5xl">
                {t(`landing.${value}`)}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {t(`landing.${label}`)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">{t('landing.navFeatures')}</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t('landing.featuresTitle')}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('landing.featuresSubtitle')}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              data-reveal
              className="surface-card group p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:glow-brand"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-brand/10 text-brand ring-1 ring-inset ring-brand/20 transition-transform group-hover:scale-105">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 font-display text-base font-semibold">
                {t(`landing.${title}`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`landing.${body}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div
          data-reveal
          className="relative overflow-hidden rounded-2xl border border-brand/30 bg-card px-6 py-14 text-center glow-brand sm:px-12"
        >
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
          <div
            aria-hidden
            className="pointer-events-none absolute start-1/2 top-0 h-64 w-[560px] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
            style={{
              background: 'radial-gradient(closest-side, var(--glow), transparent 70%)',
            }}
          />
          <div className="relative">
            <LogoMark className="mx-auto h-12 w-12" pinging />
            <h2 className="mt-6 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t('landing.ctaTitle')}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              {t('landing.ctaSubtitle')}
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/signup">
                {t('landing.getStarted')}
                <ArrowRight className="size-4 icon-directional" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <Logo />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {t('landing.footerTagline')}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
            <span>
              © {new Date().getFullYear()} {t('common.appName')}. {t('landing.footerRights')}
            </span>
            <div className="flex items-center gap-4">
              <Link href="/login" className="transition-colors hover:text-foreground">
                {t('landing.signIn')}
              </Link>
              <Link href="/signup" className="transition-colors hover:text-foreground">
                {t('landing.signUp')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
