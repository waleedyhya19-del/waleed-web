'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Filter, RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/shared/page-header';
import { RequestErrorState } from '@/components/shared/request-error-state';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAssignableUsers } from '@/hooks/use-assignable-users';
import { Link } from '@/i18n/routing';
import { ReportsTable } from '@/components/reports/reports-table';
import { BulkActionsBar } from '@/components/reports/bulk-actions-bar';
import { useAsyncResource } from '@/hooks/use-async-resource';
import { fetchAllPages } from '@/lib/api/pagination';
import { reportsApi } from '@/lib/api/reports';
import { Report, ReportStatus, ReportCategory, Role } from '@/lib/api/types';

const reportFilters: Array<'ALL' | ReportStatus> = [
  'ALL',
  ReportStatus.RECEIVED,
  ReportStatus.REVIEWING,
  ReportStatus.ESCALATED,
  ReportStatus.REJECTED,
  ReportStatus.RESOLVED,
  ReportStatus.CLOSED,
];


function getCommonCategory(
  reports: Report[],
  selectedIds: string[],
): ReportCategory | undefined {
  if (selectedIds.length === 0) return undefined;
  const selected = reports.filter((r) => selectedIds.includes(r.id));
  if (selected.length === 0) return undefined;
  const first = selected[0].reportCategory;
  return selected.every((r) => r.reportCategory === first) ? first : undefined;
}

function matchesSearch(report: Report, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    report.id,
    report.imei1,
    report.imei2,
    report.phoneBrand,
    report.phoneModel,
    report.reporterFullName,
    report.contactPhoneNumber,
    report.assignedModerator?.displayName,
    report.user?.displayName,
    report.user?.email,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

export function ReportsPageContent() {
  const t = useTranslations();
  const { user } = useCurrentUser();
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | ReportStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ReportCategory>('ALL');
  const [assignedToMe, setAssignedToMe] = useState<boolean | null>(null);
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const deferredSearch = useDeferredValue(searchValue.trim().toLowerCase());

  const { data, error, isLoading, refresh } = useAsyncResource(
    async () => fetchAllPages(reportsApi.list),
    [],
    {
      fallbackMessage: t('reports.loadError'),
      cacheKey: 'reports:list',
      staleTimeMs: 45_000,
    }
  );

  const assignableCategoryScope =
    categoryFilter === 'ALL' ? undefined : categoryFilter;
  const { assignableUsers } = useAssignableUsers(assignableCategoryScope);

  const reports = useMemo(
    () =>
      (data || []).filter((report) => {
        const matchesStatus =
          activeFilter === 'ALL' ? true : report.status === activeFilter;

        const matchesCategory =
          categoryFilter === 'ALL'
            ? true
            : report.reportCategory === categoryFilter;

        const matchesAssignedToMe =
          assignedToMe === true
            ? report.assignedToId === user?.id
            : true;

        const matchesAssignedToId =
          assignedToId
            ? report.assignedToId === assignedToId
            : true;

        return (
          matchesStatus &&
          matchesCategory &&
          matchesAssignedToMe &&
          matchesAssignedToId &&
          matchesSearch(report, deferredSearch)
        );
      }),
    [activeFilter, categoryFilter, assignedToMe, assignedToId, data, deferredSearch, user]
  );

  const isAdmin = user?.role === Role.ADMIN;
  const isLawyer = user?.role === Role.LAWYER;

  return (
    <div className="page-grid">
      <ScrollReveal>
        <PageHeader
          eyebrow={t('navigation.reports')}
          title={isLawyer ? t('reports.myCases') : t('reports.title')}
          description={
            isLawyer
              ? t('reports.myCasesDescription')
              : t('reports.directoryDescription')
          }
          meta={<span className="stat-pill">{t('common.results')}: {reports.length}</span>}
          actions={
            <>
              {user?.role === Role.ADMIN ? (
                <Button asChild type="button" className="h-11 rounded-2xl">
                  <Link href="/reports/new">{t('reports.new')}</Link>
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

      <ScrollReveal delay={0.06}>
        <div className="flex flex-wrap gap-2">
          {reportFilters.map((filter) => (
            <Button
              key={filter}
              type="button"
              variant={activeFilter === filter ? 'default' : 'outline'}
              className="h-10 rounded-full"
              onClick={() => setActiveFilter(filter)}
            >
              <Filter className="size-4" />
              {filter === 'ALL'
                ? t('common.all')
                : t(`reportStatus.${filter.toLowerCase()}`)}
            </Button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          <Select
            value={categoryFilter}
            onValueChange={(value) =>
              setCategoryFilter(value as 'ALL' | ReportCategory)
            }
          >
            <SelectTrigger className="h-10 w-[150px] rounded-full">
              <SelectValue placeholder={t('reports.category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('common.all')}</SelectItem>
              <SelectItem value={ReportCategory.BASIC}>
                {t('reports.categoryBasic')}
              </SelectItem>
              <SelectItem value={ReportCategory.LAWYER_REQUEST}>
                {t('reports.categoryLawyer')}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={assignedToMe === true ? 'true' : assignedToMe === false ? 'false' : ''}
            onValueChange={(value) =>
              setAssignedToMe(value === '' ? null : value === 'true')
            }
          >
            <SelectTrigger className="h-10 w-[150px] rounded-full">
              <SelectValue placeholder={t('reports.assignedToMe')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('common.all')}</SelectItem>
              <SelectItem value="true">{t('common.yes')}</SelectItem>
              <SelectItem value="false">{t('common.no')}</SelectItem>
            </SelectContent>
          </Select>

          {isAdmin && (
            <Select
              value={assignedToId || ''}
              onValueChange={(value) =>
                setAssignedToId(value === '' ? null : value)
              }
            >
              <SelectTrigger className="h-10 w-[180px] rounded-full">
                <SelectValue placeholder={t('reports.assignee')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('common.all')}</SelectItem>
                {(assignableUsers || []).map((mod) => (
                  <SelectItem key={mod.id} value={mod.id}>
                    {mod.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        {error ? (
          <RequestErrorState
            error={error}
            title={t('common.error')}
            fallbackMessage={t('reports.loadError')}
            action={
              <Button type="button" className="rounded-2xl" onClick={() => void refresh()}>
                {t('common.retry')}
              </Button>
            }
          />
        ) : (
          <ReportsTable
            data={reports}
            loading={isLoading && !data}
            searchValue={searchValue}
            onSearch={setSearchValue}
            selectable={user?.role === Role.ADMIN}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        )}
      </ScrollReveal>

      {user?.role === Role.ADMIN && (
        <BulkActionsBar
          selectedIds={selectedIds}
          reportCategory={getCommonCategory(reports, selectedIds)}
          onClearSelection={() => setSelectedIds([])}
        />
      )}
    </div>
  );
}