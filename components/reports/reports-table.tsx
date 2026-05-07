'use client';

import { ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { DataTable } from '@/components/shared/data-table';
import { ReportStatusBadge } from '@/components/reports/report-status-badge';
import { Link } from '@/i18n/routing';
import { Report } from '@/lib/api/types';
import { formatDate } from '@/lib/formatters';

interface ReportsTableProps {
  data: Report[];
  loading?: boolean;
  searchValue?: string;
  onSearch?: (value: string) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function ReportsTable({
  data,
  loading,
  searchValue,
  onSearch,
  selectable,
  selectedIds,
  onSelectionChange,
}: ReportsTableProps) {
  const t = useTranslations();
  const locale = useLocale();

  const columns = [
    {
      key: 'id',
      header: t('reports.id'),
      className: 'font-mono',
      cell: (item: Report) => (
        <Link href={`/reports/${item.id}`} className="inline-flex items-center gap-2 font-medium hover:text-primary">
          {item.id.slice(0, 8)}
          <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </Link>
      ),
    },
    {
      key: 'imei1',
      header: t('reports.imei1'),
      cell: (item: Report) => (
        <div className="space-y-1">
          <p className="font-semibold">{item.imei1 || `${item.phoneBrand} ${item.phoneModel}`}</p>
          <p className="text-xs text-muted-foreground">
            {t(`reports.${item.type.toLowerCase()}`)}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('reports.status'),
      cell: (item: Report) => <ReportStatusBadge status={item.status} />,
    },
    {
      key: 'user',
      header: t('reports.user'),
      cell: (item: Report) => item.user?.displayName || t('common.noData'),
    },
    {
      key: 'createdAt',
      header: t('reports.createdAt'),
      cell: (item: Report) => formatDate(item.createdAt, locale),
    },
  ];

  return (
    <DataTable<Report>
      data={data}
      columns={columns}
      loading={loading}
      searchValue={searchValue}
      onSearch={onSearch}
      searchPlaceholder={t('reports.searchPlaceholder')}
      emptyStateTitle={t('reports.noReports')}
      emptyStateDescription={t('reports.noReportsDesc')}
      selectable={selectable}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      mobileCard={(item) => (
        <Link
          href={`/reports/${item.id}`}
          className="surface-card-muted block rounded-[1.5rem] p-4 transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{item.imei1 || `${item.phoneBrand} ${item.phoneModel}`}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {t(`reports.${item.type.toLowerCase()}`)}
              </p>
            </div>
            <ReportStatusBadge status={item.status} />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>{item.user?.displayName || t('common.noData')}</span>
            <span>{formatDate(item.createdAt, locale)}</span>
          </div>
        </Link>
      )}
    />
  );
}
