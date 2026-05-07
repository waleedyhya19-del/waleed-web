'use client';

import { ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { DataTable } from '@/components/shared/data-table';
import { Link } from '@/i18n/routing';
import { User } from '@/lib/api/types';
import { formatDate } from '@/lib/formatters';
import { RoleBadge } from '@/components/users/role-badge';

interface ModeratorsTableProps {
  data: User[];
  loading?: boolean;
  searchValue?: string;
  onSearch?: (value: string) => void;
}

export function ModeratorsTable({
  data,
  loading,
  searchValue,
  onSearch,
}: ModeratorsTableProps) {
  const t = useTranslations();
  const locale = useLocale();

  const columns = [
    {
      key: 'displayName',
      header: t('moderators.name'),
      cell: (item: User) => (
        <Link href={`/moderators/${item.id}`} className="inline-flex items-center gap-2 font-semibold hover:text-primary">
          {item.displayName}
          <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </Link>
      ),
    },
    {
      key: 'email',
      header: t('moderators.email'),
      cell: (item: User) => item.email || t('common.noData'),
    },
    {
      key: 'phone',
      header: t('moderators.phone'),
      cell: (item: User) => item.phone || t('common.noData'),
    },
    {
      key: 'role',
      header: t('users.role'),
      cell: (item: User) => <RoleBadge role={item.role} />,
    },
    {
      key: 'createdAt',
      header: t('moderators.createdAt'),
      cell: (item: User) => formatDate(item.createdAt, locale),
    },
  ];

  return (
    <DataTable<User>
      data={data}
      columns={columns}
      loading={loading}
      searchValue={searchValue}
      onSearch={onSearch}
      searchPlaceholder={t('moderators.searchPlaceholder')}
      emptyStateTitle={t('moderators.noModerators')}
      emptyStateDescription={t('moderators.noModeratorsDesc')}
      mobileCard={(item) => (
        <Link
          href={`/moderators/${item.id}`}
          className="surface-card-muted block rounded-[1.5rem] p-4 transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{item.displayName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.email || t('common.noData')}
              </p>
            </div>
            <RoleBadge role={item.role} />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>{item.phone || t('common.noData')}</span>
            <span>{formatDate(item.createdAt, locale)}</span>
          </div>
        </Link>
      )}
    />
  );
}
