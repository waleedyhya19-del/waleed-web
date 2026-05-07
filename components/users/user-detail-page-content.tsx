'use client';

import { RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { UserDetail } from '@/components/users/user-detail';
import { PageHeader } from '@/components/shared/page-header';
import { RequestErrorState } from '@/components/shared/request-error-state';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { Button } from '@/components/ui/button';
import { useAsyncResource } from '@/hooks/use-async-resource';
import { usersApi } from '@/lib/api/users';

interface UserDetailPageContentProps {
  id: string;
}

export function UserDetailPageContent({ id }: UserDetailPageContentProps) {
  const t = useTranslations();
  const { data, error, refresh } = useAsyncResource(
    async () => usersApi.getById(id),
    [id],
    {
      fallbackMessage: t('users.loadError'),
      cacheKey: `users:detail:${id}`,
      staleTimeMs: 30_000,
    }
  );

  return (
    <div className="page-grid">
      <ScrollReveal>
        <PageHeader
          eyebrow={t('navigation.users')}
          title={t('users.detail')}
          description={t('users.detailDescription')}
          breadcrumbs={[
            { label: t('navigation.users'), href: '/users' },
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
            fallbackMessage={t('users.loadError')}
            action={
              <Button type="button" className="rounded-2xl" onClick={() => void refresh()}>
                {t('common.retry')}
              </Button>
            }
          />
        ) : data ? (
          <UserDetail user={data} />
        ) : (
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-slate-200/70 dark:bg-slate-800/60" />
        )}
      </ScrollReveal>
    </div>
  );
}
