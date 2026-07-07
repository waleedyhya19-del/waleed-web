'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { usersApi } from '@/lib/api/endpoints';
import { Link } from '@/lib/i18n/routing';
import { Role } from '@/lib/api/types';
import { roleKey } from '@/lib/i18n/enums';
import type { Locale } from '@/lib/i18n/routing';
import { fmtDate } from '@/lib/utils/format';
import { useSessionStore } from '@/stores/session-store';

interface Props {
  mode: 'all' | 'moderators' | 'lawyers' | 'endUsers';
}

const MODE_ROLE: Record<Props['mode'], Role | undefined> = {
  all: undefined,
  moderators: Role.MODERATOR,
  lawyers: Role.LAWYER,
  endUsers: Role.END_USER,
};

export function UsersList({ mode }: Props) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const currentRole = useSessionStore((s) => s.user?.role);
  const isAdmin = currentRole === 'ADMIN';
  const [search, setSearch] = useState('');

  const listRole = mode === 'all'
    ? currentRole === 'MODERATOR'
      ? Role.END_USER
      : undefined
    : MODE_ROLE[mode];

  const query = useMemo(
    () => ({ role: listRole, search: search.trim() || undefined, take: 50 }),
    [listRole, search],
  );

  const state = useAsyncResource(() => usersApi.list(query), [JSON.stringify(query)]);
  const isEmpty = !state.isLoading && !state.error && state.data?.data.length === 0;

  const title =
    mode === 'moderators'
      ? t('moderators.listTitle')
      : mode === 'lawyers'
      ? t('lawyers.listTitle')
      : t('users.listTitle');

  const newHref =
    mode === 'moderators'
      ? '/staff/moderators/new'
      : mode === 'lawyers'
      ? '/staff/lawyers/new'
      : '/staff/users/new';

  return (
    <div>
      <PageHeader
        title={title}
        actions={
          isAdmin && (
            <Button asChild>
              <Link href={newHref}>
                <Plus className="h-4 w-4" />
                {t('common.create')}
              </Link>
            </Button>
          )
        }
      />
      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute start-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
          className="ps-8 max-w-md"
        />
      </div>
      <QueryBoundary
        isLoading={state.isLoading}
        error={state.error}
        onRetry={state.refresh}
        empty={isEmpty}
        emptyChildren={<EmptyState title={t('common.noResults')} />}
      >
        <div className="grid gap-2">
          {state.data?.data.map((u) => (
            <Link
              key={u.id}
              href={`/staff/users/${u.id}`}
              className="surface-card flex items-center justify-between gap-4 p-4 transition-colors hover:border-accent/50"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{u.displayName}</span>
                  <Badge variant="outline">{t(roleKey(u.role))}</Badge>
                </div>
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {u.email ?? u.phone ?? '—'}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{fmtDate(u.createdAt, locale)}</div>
            </Link>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
