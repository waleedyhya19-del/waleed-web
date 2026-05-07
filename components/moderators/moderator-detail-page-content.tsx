'use client';

import { RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ModeratorDetail } from '@/components/moderators/moderator-detail';
import { PageHeader } from '@/components/shared/page-header';
import { RequestErrorState } from '@/components/shared/request-error-state';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { Button } from '@/components/ui/button';
import { useAsyncResource } from '@/hooks/use-async-resource';
import { usersApi } from '@/lib/api/users';

interface ModeratorDetailPageContentProps {
  id: string;
}

export function ModeratorDetailPageContent({
  id,
}: ModeratorDetailPageContentProps) {
  const t = useTranslations();
  const { data, error, refresh } = useAsyncResource(
    async () => usersApi.getById(id),
    [id],
    {
      fallbackMessage: t('moderators.loadError'),
      cacheKey: `moderators:detail:${id}`,
      staleTimeMs: 30_000,
    }
  );

  return (
    <div className="page-grid">
      <ScrollReveal>
        <PageHeader
          eyebrow={t('navigation.moderators')}
          title={t('moderators.detail')}
          description={t('moderators.detailDescription')}
          breadcrumbs={[
            { label: t('navigation.moderators'), href: '/moderators' },
            { label: data?.displayName || id.slice(0, 8) },
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
            fallbackMessage={t('moderators.loadError')}
            action={
              <Button type="button" className="rounded-2xl" onClick={() => void refresh()}>
                {t('common.retry')}
              </Button>
            }
          />
        ) : data ? (
          <ModeratorDetail user={data} />
        ) : (
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-slate-200/70 dark:bg-slate-800/60" />
        )}
      </ScrollReveal>
    </div>
  );
}
