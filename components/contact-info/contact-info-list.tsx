'use client';

import { useTranslations } from 'next-intl';
import { Phone, Link2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { contactInfoApi } from '@/lib/api/endpoints';

export function ContactInfoList() {
  const t = useTranslations();
  const state = useAsyncResource(() => contactInfoApi.list({ take: 100 }), []);
  const isEmpty = !state.isLoading && !state.error && state.data?.data.length === 0;

  return (
    <div>
      <PageHeader title={t('portal.contactTitle')} />
      <QueryBoundary
        isLoading={state.isLoading}
        error={state.error}
        onRetry={state.refresh}
        empty={isEmpty}
        emptyChildren={<EmptyState title={t('contactInfo.empty')} />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {state.data?.data.map((c) => {
            const Icon = c.type === 'PHONE' ? Phone : Link2;
            const href = c.type === 'PHONE' ? `tel:${c.value}` : c.value;
            return (
              <a
                key={c.id}
                href={href}
                target={c.type === 'SOCIAL_LINK' ? '_blank' : undefined}
                rel="noreferrer"
                className="surface-card flex items-center gap-3 p-4 transition-colors hover:border-accent/50"
              >
                <div className="rounded-md bg-muted p-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{c.label}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.value}</div>
                </div>
              </a>
            );
          })}
        </div>
      </QueryBoundary>
    </div>
  );
}
