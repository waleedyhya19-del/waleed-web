'use client';

import { useTranslations, useLocale } from 'next-intl';
import { FileText, ShieldCheck, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { KpiCard } from '@/components/shared/kpi-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { reportsApi, usersApi } from '@/lib/api/endpoints';
import { Link } from '@/lib/i18n/routing';
import type { Locale } from '@/lib/i18n/routing';
import { useSessionStore } from '@/stores/session-store';
import { fmtRelative } from '@/lib/utils/format';

export function StaffOverview() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const user = useSessionStore((s) => s.user);

  const reportsState = useAsyncResource(
    () => reportsApi.list({ take: 10 }),
    [],
  );
  const openState = useAsyncResource(
    () => reportsApi.list({ take: 1, status: 'RECEIVED' }),
    [],
  );
  const usersState = useAsyncResource(
    () => (user?.role === 'ADMIN' ? usersApi.list({ take: 1 }) : Promise.resolve(null)),
    [user?.role],
  );

  return (
    <div>
      <PageHeader title={t('staff.overviewTitle')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('staff.kpi.totalReports')}
          value={reportsState.data?.meta.hasMore ? '10+' : String(reportsState.data?.data.length ?? 0)}
          icon={FileText}
        />
        <KpiCard
          label={t('staff.kpi.openReports')}
          value={openState.data?.data.length ?? 0}
          icon={FileText}
        />
        {user?.role === 'ADMIN' && (
          <>
            <KpiCard
              label={t('staff.kpi.totalUsers')}
              value={usersState.data?.data.length ?? 0}
              icon={Users}
            />
            <KpiCard
              label={t('staff.kpi.totalModerators')}
              value={'—'}
              icon={ShieldCheck}
            />
          </>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium">{t('staff.recentReports')}</h2>
        <QueryBoundary
          isLoading={reportsState.isLoading}
          error={reportsState.error}
          onRetry={reportsState.refresh}
        >
          <div className="grid gap-2">
            {reportsState.data?.data.slice(0, 10).map((r) => (
              <Link
                key={r.id}
                href={`/staff/reports/${r.id}`}
                className="surface-card flex items-center justify-between gap-4 p-4 transition-colors hover:border-accent/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {r.phoneBrand ?? '—'} {r.phoneModel ?? ''}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {fmtRelative(r.createdAt, locale)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">#{r.id.slice(0, 8)}</div>
              </Link>
            ))}
          </div>
        </QueryBoundary>
      </div>
    </div>
  );
}
