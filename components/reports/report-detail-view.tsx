'use client';

import { useTranslations, useLocale } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { reportsApi } from '@/lib/api/endpoints';
import type { Locale } from '@/lib/i18n/routing';
import { fmtDateTime } from '@/lib/utils/format';
import {
  photoCategoryKey,
  reportCategoryKey,
  reportTypeKey,
} from '@/lib/i18n/enums';
import type { ReportPhoto, ReportPhotoCategory } from '@/lib/api/types';
import { ReportStatusPanel } from './report-status-panel';
import { ReportNotesTimeline } from './report-notes-timeline';
import { ReportAssignmentPanel } from './report-assignment-panel';
import { ReportRewardAuditPanel } from './report-reward-audit-panel';
import { useSessionStore } from '@/stores/session-store';

interface Props {
  id: string;
  audience: 'owner' | 'staff';
}

export function ReportDetailView({ id, audience }: Props) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const user = useSessionStore((s) => s.user);
  const state = useAsyncResource(() => reportsApi.get(id), [id]);

  const canTransition =
    audience === 'staff' &&
    !!user &&
    ['MODERATOR', 'ADMIN', 'LAWYER'].includes(user.role);
  const canAssign = audience === 'staff' && user?.role === 'ADMIN';
  const canReward = audience === 'staff' && user?.role === 'ADMIN';

  return (
    <div>
      <PageHeader
        title={t('reports.detailTitle')}
        description={state.data ? `#${state.data.id}` : undefined}
      />
      <QueryBoundary isLoading={state.isLoading} error={state.error} onRetry={state.refresh}>
        {state.data && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <div className="surface-card p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold">
                    {state.data.phoneBrand ?? '—'} {state.data.phoneModel ?? ''}
                  </span>
                  <StatusBadge status={state.data.status} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {t(reportTypeKey(state.data.type))} · {t(reportCategoryKey(state.data.reportCategory))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                  <Detail label={t('reports.fields.imei1')} value={state.data.imei1} />
                  <Detail label={t('reports.fields.imei2')} value={state.data.imei2} />
                  <Detail label={t('reports.fields.lastPhoneNumber1')} value={state.data.lastPhoneNumber1} />
                  <Detail label={t('reports.fields.lastPhoneNumber2')} value={state.data.lastPhoneNumber2} />
                  <Detail label={t('reports.fields.lossDate')} value={state.data.lossDate} />
                  <Detail label={t('reports.fields.lossArea')} value={state.data.lossArea} />
                  <Detail label={t('reports.fields.lossAddress')} value={state.data.lossAddress} />
                  <Detail label={t('reports.fields.contactPhoneNumber')} value={state.data.contactPhoneNumber} />
                  <Detail label={t('reports.fields.createdAt')} value={fmtDateTime(state.data.createdAt, locale)} />
                  <Detail label={t('reports.fields.updatedAt')} value={fmtDateTime(state.data.updatedAt, locale)} />
                </div>
                {state.data.description && (
                  <div className="mt-4">
                    <div className="text-xs text-muted-foreground">
                      {t('reports.fields.description')}
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm">{state.data.description}</p>
                  </div>
                )}
              </div>
              <PhotoGrid category="PHONE_BOX" photos={state.data.photos} />
              <PhotoGrid category="PAYMENT_RECEIPT" photos={state.data.photos} />
              <PhotoGrid category="POLICE_REPORT" photos={state.data.photos} />
              {state.data.notes && <ReportNotesTimeline notes={state.data.notes} />}
              {canReward && <ReportRewardAuditPanel reportId={state.data.id} />}
            </div>
            <div className="space-y-6">
              {canTransition && (
                <ReportStatusPanel report={state.data} onUpdated={state.refresh} />
              )}
              {canAssign && (
                <ReportAssignmentPanel report={state.data} onUpdated={state.refresh} />
              )}
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function PhotoGrid({
  category,
  photos,
}: {
  category: ReportPhotoCategory;
  photos: ReportPhoto[];
}) {
  const t = useTranslations();
  const filtered = photos.filter((p) => p.category === category);
  if (filtered.length === 0) return null;
  return (
    <div className="surface-card p-6">
      <div className="mb-3 text-sm font-medium">{t(photoCategoryKey(category))}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {filtered.map((p) => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-md border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="aspect-square h-full w-full object-cover" />
          </a>
        ))}
      </div>
    </div>
  );
}
