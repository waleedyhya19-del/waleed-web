'use client';

import { useTranslations, useLocale } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { announcementsApi } from '@/lib/api/endpoints';
import type { Locale } from '@/lib/i18n/routing';
import { fmtDate } from '@/lib/utils/format';

export function AnnouncementsFeed() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const state = useAsyncResource(() => announcementsApi.list({ take: 50 }), []);
  const isEmpty = !state.isLoading && !state.error && state.data?.data.length === 0;

  return (
    <div>
      <PageHeader title={t('portal.announcementsTitle')} />
      <QueryBoundary
        isLoading={state.isLoading}
        error={state.error}
        onRetry={state.refresh}
        empty={isEmpty}
        emptyChildren={<EmptyState title={t('announcements.empty')} />}
      >
        <div className="space-y-4">
          {state.data?.data.map((a) => (
            <article key={a.id} className="surface-card p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{a.title}</h2>
                <span className="text-xs text-muted-foreground">{fmtDate(a.createdAt, locale)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p>
            </article>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
