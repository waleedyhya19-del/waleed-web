'use client';

import { RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ReportDetail } from '@/components/reports/report-detail';
import { PageHeader } from '@/components/shared/page-header';
import { RequestErrorState } from '@/components/shared/request-error-state';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { Button } from '@/components/ui/button';
import { useAsyncResource } from '@/hooks/use-async-resource';
import { reportsApi } from '@/lib/api/reports';

interface ReportDetailPageContentProps {
  id: string;
}

export function ReportDetailPageContent({
  id,
}: ReportDetailPageContentProps) {
  const t = useTranslations();
  const { data, error, refresh } = useAsyncResource(
    async () => reportsApi.getById(id),
    [id],
    {
      fallbackMessage: t('reports.loadError'),
      cacheKey: `reports:detail:${id}`,
      staleTimeMs: 30_000,
    }
  );

  return (
    <div className="page-grid">
      <ScrollReveal>
        <PageHeader
          eyebrow={t('navigation.reports')}
          title={t('reports.detail')}
          description={t('reports.detailDescription')}
          breadcrumbs={[
            { label: t('navigation.reports'), href: '/reports' },
            { label: data?.imei1 || data?.phoneBrand + ' ' + data?.phoneModel || id.slice(0, 8) },
          ]}
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

      <ScrollReveal delay={0.08}>
        {error ? (
          <RequestErrorState
            error={error}
            title={t('common.error')}
            fallbackMessage={t('reports.loadError')}
            action={
              <Button type="button" className="rounded-2xl" onClick={() => void refresh()}>
                {t('common.retry')}
              </Button>
            }
          />
        ) : data ? (
          <ReportDetail report={data} onRefresh={refresh} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="h-72 animate-pulse rounded-[1.75rem] bg-slate-200/70 dark:bg-slate-800/60" />
            <div className="h-72 animate-pulse rounded-[1.75rem] bg-slate-200/60 dark:bg-slate-800/50" />
          </div>
        )}
      </ScrollReveal>
    </div>
  );
}
