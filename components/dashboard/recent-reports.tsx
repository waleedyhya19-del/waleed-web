'use client';

import { ArrowUpRight, Clock3 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { ReportStatusBadge } from '@/components/reports/report-status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Link } from '@/i18n/routing';
import { Report } from '@/lib/api/types';
import { formatDateTime } from '@/lib/formatters';

interface RecentReportsProps {
  reports: Report[];
}

export function RecentReports({ reports }: RecentReportsProps) {
  const t = useTranslations();
  const locale = useLocale();

  if (reports.length === 0) {
    return (
      <EmptyState
        title={t('reports.noReports')}
        description={t('dashboard.recentReportsEmpty')}
      />
    );
  }

  return (
    <section className="surface-card border-0 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-kicker">{t('dashboard.recentReports')}</p>
          <h2 className="mt-2 text-xl font-semibold">{t('dashboard.recentActivity')}</h2>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          {t('dashboard.viewAll')}
          <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </Link>
      </div>

      <div className="grid gap-3">
        {reports.map((report) => (
          <Link
            key={report.id}
            href={`/reports/${report.id}`}
            className="surface-card-muted flex flex-col gap-4 rounded-[1.5rem] p-4 transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Clock3 className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{report.imei1 || `${report.phoneBrand} ${report.phoneModel}`}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {report.user?.displayName || t('common.noData')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <span className="text-sm text-muted-foreground">
                {formatDateTime(report.createdAt, locale)}
              </span>
              <ReportStatusBadge status={report.status} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
