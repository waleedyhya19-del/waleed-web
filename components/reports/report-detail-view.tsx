'use client';

import { useState } from 'react';
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

import { Camera, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { photosApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';

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
  const canEditPhotos =
    state.data?.status === 'RECEIVED' &&
    (audience === 'owner' || user?.role === 'ADMIN');

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
                  <Detail label={t('reports.fields.reporterFullName')} value={state.data.reporterFullName} />
                  <Detail label={t('reports.fields.witnessFullName')} value={state.data.witnessFullName} />
                  <Detail label={t('reports.fields.createdAt')} value={fmtDateTime(state.data.createdAt, locale)} />
                  <Detail label={t('reports.fields.updatedAt')} value={fmtDateTime(state.data.updatedAt, locale)} />
                </div>
                {(state.data.rewardIfDataIntact !== null || state.data.rewardIfWiped !== null) && (
                  <div className="mt-4 border-t border-border pt-3">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      {t('reports.reward.rewardOffer')}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      {state.data.rewardIfDataIntact !== null && (
                        <Detail
                          label={t('reports.reward.ifIntact')}
                          value={`${state.data.rewardIfDataIntact} EGP`}
                        />
                      )}
                      {state.data.rewardIfWiped !== null && (
                        <Detail
                          label={t('reports.reward.ifWiped')}
                          value={`${state.data.rewardIfWiped} EGP`}
                        />
                      )}
                    </div>
                  </div>
                )}
                {state.data.description && (
                  <div className="mt-4 border-t border-border pt-3">
                    <div className="text-xs text-muted-foreground">
                      {t('reports.fields.description')}
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm">{state.data.description}</p>
                  </div>
                )}
              </div>
              <PhotoGrid
                category="PHONE_BOX"
                reportId={state.data.id}
                photos={state.data.photos}
                canEdit={canEditPhotos}
                onUpdated={state.refresh}
              />
              <PhotoGrid
                category="PAYMENT_RECEIPT"
                reportId={state.data.id}
                photos={state.data.photos}
                canEdit={canEditPhotos}
                onUpdated={state.refresh}
              />
              <PhotoGrid
                category="POLICE_REPORT"
                reportId={state.data.id}
                photos={state.data.photos}
                canEdit={canEditPhotos}
                onUpdated={state.refresh}
                accept="image/jpeg,image/png,application/pdf"
              />
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
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function PhotoGrid({
  category,
  reportId,
  photos,
  canEdit,
  onUpdated,
  accept = 'image/jpeg,image/png',
}: {
  category: ReportPhotoCategory;
  reportId: string;
  photos: ReportPhoto[];
  canEdit?: boolean;
  onUpdated: () => void;
  accept?: string;
}) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const filtered = photos.filter((p) => p.category === category);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    setLoading(true);
    try {
      await photosApi.upload({ reportId, category, files });
      toast.success(t('common.update'));
      onUpdated();
    } catch (err) {
      const msg = err instanceof ApiError && err.message ? err.message : (t(apiErrorKey(err)) as string);
      toast.error(msg);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const onDelete = async (photoId: string) => {
    setLoading(true);
    try {
      await photosApi.remove(reportId, photoId);
      toast.success(t('common.delete'));
      onUpdated();
    } catch (err) {
      const msg = err instanceof ApiError && err.message ? err.message : (t(apiErrorKey(err)) as string);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (filtered.length === 0 && !canEdit) return null;

  return (
    <div className="surface-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">{t(photoCategoryKey(category))}</div>
        {canEdit && (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs hover:bg-accent/10">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            <span>{t('reports.photos.addPhoto')}</span>
            <input
              type="file"
              className="hidden"
              accept={accept}
              multiple={category === 'PHONE_BOX'}
              disabled={loading}
              onChange={onUpload}
            />
          </label>
        )}
      </div>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-md border border-border bg-muted">
              <a href={p.url} target="_blank" rel="noreferrer" className="block aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </a>
              {canEdit && (
                <button
                  type="button"
                  aria-label={t('common.delete')}
                  className="absolute end-1 top-1 rounded-md bg-background/80 p-1 text-destructive opacity-0 backdrop-blur-xs transition group-hover:opacity-100 hover:bg-background"
                  disabled={loading}
                  onClick={() => onDelete(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">{t('common.empty')}</div>
      )}
    </div>
  );
}
