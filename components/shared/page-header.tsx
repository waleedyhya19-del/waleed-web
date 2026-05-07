'use client';

import { ChevronRight } from 'lucide-react';

import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs,
  actions,
  meta,
}: PageHeaderProps) {
  return (
    <section className="surface-card relative overflow-hidden border-0 p-6 sm:p-7">
      <div className="hero-orb -start-8 top-0 size-24" />
      <div className="hero-orb bottom-0 end-0 size-28" />

      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="relative mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <span
              key={`${crumb.label}-${index}`}
              className="inline-flex items-center gap-2"
            >
              {index > 0 && <ChevronRight className="size-4 rtl:-scale-x-100" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow && <p className="section-kicker">{eyebrow}</p>}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>

        <div className={cn('flex flex-col gap-3 sm:items-end', !actions && !meta && 'hidden')}>
          {meta}
          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      </div>
    </section>
  );
}
