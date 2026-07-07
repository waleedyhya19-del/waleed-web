'use client';

import { useTranslations, useLocale } from 'next-intl';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { reportsApi } from '@/lib/api/endpoints';
import type { Locale } from '@/lib/i18n/routing';
import { fmtDateTime } from '@/lib/utils/format';

export function ReportRewardAuditPanel({ reportId }: { reportId: string }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const state = useAsyncResource(() => reportsApi.rewardAudit(reportId, { take: 20 }), [reportId]);
  const isEmpty = !state.isLoading && !state.error && state.data?.data.length === 0;

  return (
    <div className="surface-card p-6">
      <div className="mb-3 text-sm font-medium">{t('reports.rewardAudit.title')}</div>
      <QueryBoundary
        isLoading={state.isLoading}
        error={state.error}
        onRetry={state.refresh}
        empty={isEmpty}
        emptyChildren={
          <div className="text-sm text-muted-foreground">{t('reports.rewardAudit.empty')}</div>
        }
      >
        <ul className="space-y-2 text-sm">
          {state.data?.data.map((e) => (
            <li key={e.id} className="flex flex-col gap-1 border-b border-border/60 pb-2 last:border-0">
              <div className="flex justify-between">
                <span className="font-medium">{e.actorDisplayName}</span>
                <span className="text-xs text-muted-foreground">
                  {fmtDateTime(e.createdAt, locale)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {e.changeType}: intact {e.beforeIntact ?? '—'} → {e.afterIntact ?? '—'} · wiped{' '}
                {e.beforeWiped ?? '—'} → {e.afterWiped ?? '—'}
              </div>
            </li>
          ))}
        </ul>
      </QueryBoundary>
    </div>
  );
}
