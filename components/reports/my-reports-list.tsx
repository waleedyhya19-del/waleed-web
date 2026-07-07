'use client';

import { useTranslations } from 'next-intl';
import { FileText, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/routing';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { reportsApi } from '@/lib/api/endpoints';
import { fmtRelative } from '@/lib/utils/format';
import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/i18n/routing';
import { reportTypeKey, reportCategoryKey } from '@/lib/i18n/enums';

export function MyReportsList() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const state = useAsyncResource(() => reportsApi.list({ take: 50 }), []);
  const isEmpty = !state.isLoading && !state.error && state.data?.data.length === 0;

  return (
    <div>
      <PageHeader
        title={t('portal.myReportsTitle')}
        actions={
          <Button asChild>
            <Link href="/portal/reports/new">
              <Plus className="h-4 w-4" />
              {t('nav.newReport')}
            </Link>
          </Button>
        }
      />
      <QueryBoundary
        isLoading={state.isLoading}
        error={state.error}
        onRetry={state.refresh}
        empty={isEmpty}
        emptyChildren={
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title={t('portal.myReportsEmpty')}
            action={
              <Button asChild>
                <Link href="/portal/reports/new">{t('portal.newReportCta')}</Link>
              </Button>
            }
          />
        }
      >
        <div className="grid gap-3">
          {state.data?.data.map((r) => (
            <Link
              key={r.id}
              href={`/portal/reports/${r.id}`}
              className="surface-card flex items-center justify-between gap-4 p-4 transition-colors hover:border-accent/50"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {r.phoneBrand ?? '—'} {r.phoneModel ?? ''}
                  </span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t(reportTypeKey(r.type))} · {t(reportCategoryKey(r.reportCategory))} · {fmtRelative(r.createdAt, locale)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">#{r.id.slice(0, 8)}</div>
            </Link>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
