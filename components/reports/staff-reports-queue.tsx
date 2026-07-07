'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { StatusBadge } from '@/components/shared/status-badge';
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
import { Link } from '@/lib/i18n/routing';
import type { Locale } from '@/lib/i18n/routing';
import { fmtRelative } from '@/lib/utils/format';
import { ReportStatus, ReportType, ReportCategory } from '@/lib/api/types';
import { reportCategoryKey, reportTypeKey, statusKey } from '@/lib/i18n/enums';
import { EmptyState } from '@/components/shared/empty-state';

export function StaffReportsQueue() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
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
      take: 50,
    }),
    [status, type, category, assignedToMe, search],
  );

  const state = useAsyncResource(() => reportsApi.list(query), [JSON.stringify(query)]);
  const isEmpty = !state.isLoading && !state.error && state.data?.data.length === 0;

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
          <Checkbox
            checked={assignedToMe}
            onCheckedChange={(v) => setAssignedToMe(!!v)}
          />
          {t('reports.filters.assignedToMe')}
        </label>
      </div>
      <QueryBoundary
        isLoading={state.isLoading}
        error={state.error}
        onRetry={state.refresh}
        empty={isEmpty}
        emptyChildren={<EmptyState title={t('common.noResults')} />}
      >
        <div className="grid gap-2">
          {state.data?.data.map((r) => (
            <Link
              key={r.id}
              href={`/staff/reports/${r.id}`}
              className="surface-card flex items-center justify-between gap-4 p-4 transition-colors hover:border-accent/50"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {r.phoneBrand ?? '—'} {r.phoneModel ?? ''}
                  </span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t(reportTypeKey(r.type))} · {t(reportCategoryKey(r.reportCategory))} ·{' '}
                  {r.assignedUserName
                    ? t('reports.assignment.assignedTo', { name: r.assignedUserName })
                    : t('reports.assignment.unassigned')}{' '}
                  · {fmtRelative(r.createdAt, locale)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">#{r.id.slice(0, 8)}</div>
            </Link>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
