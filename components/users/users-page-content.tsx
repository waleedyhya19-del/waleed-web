'use client';

import { useCallback, useDeferredValue, useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/shared/page-header';
import { RequestErrorState } from '@/components/shared/request-error-state';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { errorToast } from '@/components/shared/error-toast';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Link } from '@/i18n/routing';
import { useAsyncResource } from '@/hooks/use-async-resource';
import { hasMorePages } from '@/lib/api/pagination';
import { Role, User } from '@/lib/api/types';
import { usersApi } from '@/lib/api/users';
import { UsersTable } from '@/components/users/users-table';

const USERS_PAGE_SIZE = 24;

export function UsersPageContent() {
  const t = useTranslations();
  const { user } = useCurrentUser();
  const [searchValue, setSearchValue] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const deferredSearch = useDeferredValue(searchValue.trim());
  const { data, error, isLoading, refresh } = useAsyncResource(
    async () =>
      usersApi.list({
        role: Role.END_USER,
        search: deferredSearch || undefined,
        take: USERS_PAGE_SIZE,
      }),
    [deferredSearch],
    {
      fallbackMessage: t('users.loadError'),
      cacheKey: `users:list:${deferredSearch || 'all'}`,
      staleTimeMs: 45_000,
    }
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    setUsers(data.data);
    setNextCursor(data.meta.nextCursor);
    setHasMore(hasMorePages(data.meta));
  }, [data]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const nextPage = await usersApi.list({
        role: Role.END_USER,
        search: deferredSearch || undefined,
        take: USERS_PAGE_SIZE,
        cursor: nextCursor,
      });

      setUsers((currentUsers) => [
        ...currentUsers,
        ...nextPage.data.filter(
          (nextUser) =>
            !currentUsers.some((currentUser) => currentUser.id === nextUser.id)
        ),
      ]);
      setNextCursor(nextPage.meta.nextCursor);
      setHasMore(hasMorePages(nextPage.meta));
    } catch (loadMoreError) {
      errorToast({
        title: t('common.error'),
        error: loadMoreError,
        fallbackMessage: t('users.loadError'),
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [deferredSearch, isLoadingMore, nextCursor, t]);

  const resultCount = hasMore ? `${users.length}+` : `${users.length}`;

  return (
    <div className="page-grid">
      <ScrollReveal>
        <PageHeader
          eyebrow={t('navigation.users')}
          title={t('users.title')}
          description={t('users.directoryDescription')}
          meta={
            <span className="stat-pill">
              {t('common.results')}: {resultCount}
            </span>
          }
          actions={
            <>
              {user?.role === Role.ADMIN ? (
                <Button asChild type="button" className="h-11 rounded-2xl">
                  <Link href="/users/new">{t('users.new')}</Link>
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
            fallbackMessage={t('users.loadError')}
            action={
              <Button type="button" className="rounded-2xl" onClick={() => void refresh()}>
                {t('common.retry')}
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            <UsersTable
              data={users}
              loading={isLoading && users.length === 0}
              searchValue={searchValue}
              onSearch={setSearchValue}
            />
            {hasMore ? (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-40 rounded-2xl"
                  onClick={() => void loadMore()}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? t('common.loading') : t('common.next')}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </ScrollReveal>
    </div>
  );
}
