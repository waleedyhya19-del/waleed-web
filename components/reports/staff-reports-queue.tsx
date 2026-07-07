'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search } from 'lucide-react';
import type { ColDef } from 'ag-grid-community';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { DataGrid } from '@/components/shared/data-grid';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { reportsApi } from '@/lib/api/endpoints';
import { useRouter } from '@/lib/i18n/routing';
import type { Locale } from '@/lib/i18n/routing';
import { fmtRelative } from '@/lib/utils/format';
import {
  ReportStatus,
  ReportType,
  ReportCategory,
  type Report,
} from '@/lib/api/types';
import { reportCategoryKey, reportTypeKey, statusKey } from '@/lib/i18n/enums';

export function StaffReportsQueue() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [status, setStatus] = useState<'ALL' | ReportStatus>('ALL');
  const [type, setType] = useState<'ALL' | ReportType>('ALL');
  const [category, setCategory] = useState<'ALL' | ReportCategory>('ALL');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [search, setSearch] = useState('');

  const query = useMemo(
    () => ({
      status: status === 'ALL' ? undefined : status,
      type: type === 'ALL' ? undefined : type,
      reportCategory: category === 'ALL' ? undefined : category,
      assignedToMe: assignedToMe || undefined,
      search: search.trim() || undefined,
      take: 100,
    }),
    [status, type, category, assignedToMe, search],
  );

  const state = useAsyncResource(() => reportsApi.list(query), [JSON.stringify(query)]);

  const columnDefs = useMemo<ColDef<Report>[]>(
    () => [
      {
        headerName: t('reports.columns.device'),
        flex: 2,
        minWidth: 180,
        valueGetter: (p) =>
          `${p.data?.phoneBrand ?? '—'} ${p.data?.phoneModel ?? ''}`.trim(),
        cellRenderer: (p: { value: string }) => (
          <span className="font-medium">{p.value}</span>
        ),
      },
      {
        headerName: t('reports.filters.status'),
        field: 'status',
        maxWidth: 150,
        cellRenderer: (p: { value: ReportStatus }) => <StatusBadge status={p.value} />,
      },
      {
        headerName: t('reports.filters.type'),
        valueGetter: (p) => (p.data ? t(reportTypeKey(p.data.type)) : ''),
      },
      {
        headerName: t('reports.filters.category'),
        valueGetter: (p) => (p.data ? t(reportCategoryKey(p.data.reportCategory)) : ''),
      },
      {
        headerName: t('reports.columns.assigned'),
        valueGetter: (p) =>
          p.data?.assignedUserName ?? t('reports.assignment.unassigned'),
        cellRenderer: (p: { value: string }) => (
          <span className="text-muted-foreground">{p.value}</span>
        ),
      },
      {
        headerName: t('reports.columns.created'),
        maxWidth: 160,
        valueGetter: (p) => (p.data ? fmtRelative(p.data.createdAt, locale) : ''),
        cellRenderer: (p: { value: string }) => (
          <span className="text-muted-foreground">{p.value}</span>
        ),
      },
      {
        headerName: t('reports.columns.id'),
        maxWidth: 120,
        valueGetter: (p) => (p.data ? `#${p.data.id.slice(0, 8)}` : ''),
        cellRenderer: (p: { value: string }) => (
          <span className="font-mono text-xs text-muted-foreground">{p.value}</span>
        ),
      },
    ],
    [t, locale],
  );

  return (
    <div>
      <PageHeader title={t('reports.queueTitle')} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select value={status} onValueChange={(v) => setStatus(v as 'ALL' | ReportStatus)}>
          <SelectTrigger>
            <SelectValue placeholder={t('reports.filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('reports.filters.all')}</SelectItem>
            {Object.values(ReportStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {t(statusKey(s))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => setType(v as 'ALL' | ReportType)}>
          <SelectTrigger>
            <SelectValue placeholder={t('reports.filters.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('reports.filters.all')}</SelectItem>
            {Object.values(ReportType).map((v) => (
              <SelectItem key={v} value={v}>
                {t(reportTypeKey(v))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => setCategory(v as 'ALL' | ReportCategory)}>
          <SelectTrigger>
            <SelectValue placeholder={t('reports.filters.category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('reports.filters.all')}</SelectItem>
            {Object.values(ReportCategory).map((v) => (
              <SelectItem key={v} value={v}>
                {t(reportCategoryKey(v))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="pointer-events-none absolute start-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('reports.filters.search')}
            className="ps-8"
          />
        </div>
        <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
          <Checkbox checked={assignedToMe} onCheckedChange={(v) => setAssignedToMe(!!v)} />
          {t('reports.filters.assignedToMe')}
        </label>
      </div>

      <QueryBoundary
        isLoading={false}
        error={state.error}
        onRetry={state.refresh}
        empty={false}
      >
        <DataGrid<Report>
          rowData={state.data?.data}
          columnDefs={columnDefs}
          loading={state.isLoading}
          getRowId={(p) => p.data.id}
          onRowClicked={(r) => router.push(`/staff/reports/${r.id}`)}
          emptyText={t('common.noResults')}
        />
      </QueryBoundary>
    </div>
  );
}
