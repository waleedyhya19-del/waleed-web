'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Plus, Search } from 'lucide-react';
import type { ColDef } from 'ag-grid-community';
import { PageHeader } from '@/components/shared/page-header';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { DataGrid } from '@/components/shared/data-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { usersApi } from '@/lib/api/endpoints';
import { Link, useRouter } from '@/lib/i18n/routing';
import { Role, type User } from '@/lib/api/types';
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
  const router = useRouter();
  const currentRole = useSessionStore((s) => s.user?.role);
  const isAdmin = currentRole === 'ADMIN';
  const [search, setSearch] = useState('');

  const listRole =
    mode === 'all'
      ? currentRole === 'MODERATOR'
        ? Role.END_USER
        : undefined
      : MODE_ROLE[mode];

  const query = useMemo(
    () => ({ role: listRole, search: search.trim() || undefined, take: 100 }),
    [listRole, search],
  );

  const state = useAsyncResource(() => usersApi.list(query), [JSON.stringify(query)]);

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

  const columnDefs = useMemo<ColDef<User>[]>(
    () => [
      {
        headerName: t('common.displayName'),
        field: 'displayName',
        flex: 2,
        minWidth: 180,
        cellRenderer: (p: { value: string }) => (
          <span className="font-medium">{p.value}</span>
        ),
      },
      {
        headerName: t('common.role'),
        field: 'role',
        maxWidth: 150,
        cellRenderer: (p: { value: Role }) => (
          <Badge variant="outline">{t(roleKey(p.value))}</Badge>
        ),
      },
      {
        headerName: t('common.email'),
        flex: 2,
        minWidth: 180,
        valueGetter: (p) => p.data?.email ?? p.data?.phone ?? '—',
        cellRenderer: (p: { value: string }) => (
          <span className="text-muted-foreground">{p.value}</span>
        ),
      },
      {
        headerName: t('reports.columns.created'),
        maxWidth: 160,
        valueGetter: (p) => (p.data ? fmtDate(p.data.createdAt, locale) : ''),
        cellRenderer: (p: { value: string }) => (
          <span className="text-muted-foreground">{p.value}</span>
        ),
      },
    ],
    [t, locale],
  );

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
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute start-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
          className="max-w-md ps-8"
        />
      </div>
      <QueryBoundary
        isLoading={false}
        error={state.error}
        onRetry={state.refresh}
        empty={false}
      >
        <DataGrid<User>
          rowData={state.data?.data}
          columnDefs={columnDefs}
          loading={state.isLoading}
          getRowId={(p) => p.data.id}
          onRowClicked={(u) => router.push(`/staff/users/${u.id}`)}
          emptyText={t('common.noResults')}
        />
      </QueryBoundary>
    </div>
  );
}
