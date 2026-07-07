import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/logo';
import { Link } from '@/lib/i18n/routing';

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-10">
      {/* Radar field backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade" />
      <div
        aria-hidden
        className="pointer-events-none absolute start-1/2 top-[-8%] h-[380px] w-[720px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, var(--glow), transparent 70%)' }}
      />
      <div className="relative grid min-h-[calc(100vh-5rem)] place-items-center">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Link href="/" aria-label={title}>
              <Logo markClassName="h-9 w-9" />
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-card/90 p-6 shadow-sm backdrop-blur-sm sm:p-7">
            <div className="mb-6 space-y-1.5">
              <h1 className="font-display text-xl font-semibold tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
          {footer && (
            <div className="mt-5 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
