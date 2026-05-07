'use client';

import { useMemo } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { RecentReports } from '@/components/dashboard/recent-reports';
import { ReportsStatusChart } from '@/components/dashboard/reports-status-chart';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { PageHeader } from '@/components/shared/page-header';
import { RequestErrorState } from '@/components/shared/request-error-state';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { Button } from '@/components/ui/button';
import { useAsyncResource } from '@/hooks/use-async-resource';
import { fetchAllPages } from '@/lib/api/pagination';
import {
  buildDailyReportTrend,
  buildDashboardSummary,
  buildEscalatedReportCount,
  buildOpenReportCount,
  buildSolvedRate,
} from '@/lib/dashboard';
import { reportsApi } from '@/lib/api/reports';
import { usersApi } from '@/lib/api/users';

export function DashboardOverview() {
  const t = useTranslations();
  const { data, error, isLoading, refresh } = useAsyncResource(
    async () => {
      const [reports, users] = await Promise.all([
        fetchAllPages(reportsApi.list),
        fetchAllPages(usersApi.list),
      ]);

      return { reports, users };
    },
    [],
    {
      fallbackMessage: t('dashboard.loadError'),
      cacheKey: 'dashboard:overview',
      staleTimeMs: 60_000,
    }
  );

  const reports = useMemo(() => data?.reports ?? [], [data?.reports]);
  const users = useMemo(() => data?.users ?? [], [data?.users]);
  const summary = useMemo(
    () => buildDashboardSummary(reports, users),
    [reports, users]
  );
  const trend = useMemo(() => buildDailyReportTrend(reports, 14), [reports]);
  const openReportCount = useMemo(() => buildOpenReportCount(reports), [reports]);
  const solvedRate = useMemo(() => buildSolvedRate(reports), [reports]);
  const escalatedReportCount = useMemo(
    () => buildEscalatedReportCount(reports),
    [reports]
  );

  return (
    <div className="page-grid">
      <ScrollReveal>
        <PageHeader
          eyebrow={t('shell.controlCenter')}
          title={t('dashboard.title')}
          description={t('dashboard.overviewDescription')}
          meta={
            <div className="flex flex-wrap gap-2">
              <span className="stat-pill">
                {t('dashboard.openReports')}: {openReportCount}
              </span>
              <span className="stat-pill">
                {t('dashboard.solvedRate')}: {solvedRate}%
              </span>
            </div>
          }
          actions={
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl"
              onClick={() => void refresh()}
            >
              <RefreshCcw className="size-4" />
              {t('common.refresh')}
            </Button>
          }
        />
      </ScrollReveal>

      {error ? (
        <RequestErrorState
          error={error}
          title={t('common.error')}
          fallbackMessage={t('dashboard.loadError')}
          action={
            <Button type="button" className="rounded-2xl" onClick={() => void refresh()}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : isLoading && !data ? (
        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-[1.75rem] bg-slate-200/70 dark:bg-slate-800/60"
                />
              ))}
            </div>
            <div className="h-80 animate-pulse rounded-[1.75rem] bg-slate-200/70 dark:bg-slate-800/60" />
          </div>
          <div className="h-[34rem] animate-pulse rounded-[1.75rem] bg-slate-200/60 dark:bg-slate-800/50" />
        </div>
      ) : (
        <>
          <ScrollReveal delay={0.05}>
            <SummaryCards
              reportsByStatus={summary.reportsByStatus}
              totalUsers={summary.totalUsers}
              totalModerators={summary.totalModerators}
              openReports={openReportCount}
              escalatedReports={escalatedReportCount}
              solvedRate={solvedRate}
            />
          </ScrollReveal>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
            <ScrollReveal delay={0.08}>
              <ReportsStatusChart trend={trend} />
            </ScrollReveal>
            <ScrollReveal delay={0.12}>
              <RecentReports reports={summary.recentReports} />
            </ScrollReveal>
          </div>
        </>
      )}
    </div>
  );
}
