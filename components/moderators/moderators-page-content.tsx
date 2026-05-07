'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ModeratorsTable } from '@/components/moderators/moderators-table';
import { PageHeader } from '@/components/shared/page-header';
import { RequestErrorState } from '@/components/shared/request-error-state';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Link } from '@/i18n/routing';
import { useAsyncResource } from '@/hooks/use-async-resource';
import { fetchAllPages } from '@/lib/api/pagination';
import { Role, User } from '@/lib/api/types';
import { usersApi } from '@/lib/api/users';

function matchesSearch(user: User, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [user.displayName, user.email, user.phone]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

export function ModeratorsPageContent() {
  const t = useTranslations();
  const { user } = useCurrentUser();
  const [searchValue, setSearchValue] = useState('');
  const deferredSearch = useDeferredValue(searchValue.trim().toLowerCase());
  const { data, error, isLoading, refresh } = useAsyncResource(
    async () => fetchAllPages(usersApi.list),
    [],
    {
      fallbackMessage: t('moderators.loadError'),
      cacheKey: 'moderators:list',
      staleTimeMs: 45_000,
    }
  );

  const moderators = useMemo(
    () =>
      (data || []).filter(
        (user) =>
          [Role.MODERATOR, Role.ADMIN, Role.LAWYER].includes(user.role) &&
          matchesSearch(user, deferredSearch)
      ),
    [data, deferredSearch]
  );

  return (
    <div className="page-grid">
      <ScrollReveal>
        <PageHeader
          eyebrow={t('navigation.moderators')}
          title={t('moderators.title')}
          description={t('moderators.directoryDescription')}
          meta={
            <span className="stat-pill">
              {t('common.results')}: {moderators.length}
            </span>
          }
          actions={
            <>
              {user?.role === Role.ADMIN ? (
                <Button asChild type="button" className="h-11 rounded-2xl">
                  <Link href="/moderators/new">{t('moderators.new')}</Link>
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl"
                onClick={() => void refresh()}
              >
                <RefreshCcw className="size-4" />
                {t('common.refresh')}
              </Button>
            </>
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
        ) : (
          <ModeratorsTable
            data={moderators}
            loading={isLoading && !data}
            searchValue={searchValue}
            onSearch={setSearchValue}
          />
        )}
      </ScrollReveal>
    </div>
  );
}
