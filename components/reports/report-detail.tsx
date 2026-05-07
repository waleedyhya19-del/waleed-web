'use client';

import { useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  Pencil,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { errorToast, successToast } from '@/components/shared/error-toast';
import { Link, useRouter } from '@/i18n/routing';
import { ReportEditForm } from '@/components/reports/report-edit-form';
import { Report, ReportStatus, Role } from '@/lib/api/types';
import { canLawyerActOnReport } from '@/lib/constants/roles';
import { reportsApi } from '@/lib/api/reports';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { PhotoGallery } from '@/components/reports/photo-gallery';
import { ReportStatusBadge } from '@/components/reports/report-status-badge';
import { ReportStatusUpdate } from '@/components/reports/report-status-update';
import { AssigneeCombobox } from '@/components/reports/assignee-combobox';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  invalidateResourceCache,
  invalidateResourceCacheByPrefix,
} from '@/stores/resource-cache-store';

interface ReportDetailProps {
  report: Report;
  onRefresh?: () => void | Promise<void>;
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="surface-card-muted rounded-[1.35rem] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-3 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export function ReportDetail({ report, onRefresh }: ReportDetailProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const canAdminEdit =
    user?.role === Role.ADMIN && report.status === ReportStatus.RECEIVED;
  const canLawyerEdit = user
    ? canLawyerActOnReport(user.role, report, user.id)
    : false;
  const canEdit = canAdminEdit || canLawyerEdit;
  const canDelete = canAdminEdit;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await reportsApi.delete(report.id);
      invalidateResourceCache('dashboard:overview');
      invalidateResourceCache('reports:list');
      invalidateResourceCacheByPrefix(`reports:detail:${report.id}`);
      successToast(t('reports.deleteSuccess'));
      router.push('/reports');
    } catch (error) {
      errorToast({
        error,
        fallbackMessage: t('reports.loadError'),
      });
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleUpdated = async () => {
    setIsEditing(false);
    await onRefresh?.();
  };

  return (
    <div className="page-grid">
      <section className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="surface-card border-0 p-5 sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Smartphone className="size-5" />
              </div>
              <div>
                <p className="section-kicker">{t('reports.detail')}</p>
                <h2 className="mt-2 text-xl font-semibold">
                  {report.imei1 || report.phoneBrand + ' ' + report.phoneModel || t('common.noData')}
                </h2>
              </div>
            </div>

            {canEdit ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant={isEditing ? 'secondary' : 'outline'}
                  className="rounded-2xl"
                  onClick={() => setIsEditing((current) => !current)}
                >
                  <Pencil className="size-4" />
                  {t('reports.edit')}
                </Button>
                {canDelete ? (
                  <Button
                    type="button"
                    variant="destructive"
                    className="rounded-2xl"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    {t('reports.delete')}
                  </Button>
                ) : null}
              </div>
            ) : null}

            {user?.role === Role.ADMIN && (
              <div className="mt-3 w-full sm:mt-0 sm:w-auto">
                <AssigneeCombobox
                  currentAssigneeId={report.assignedToId}
                  reportCategory={report.reportCategory}
                  onAssign={async (assigneeId) => {
                    await reportsApi.assign(report.id, assigneeId);
                    invalidateResourceCacheByPrefix(`reports:detail:${report.id}`);
                  }}
                  onSuccess={onRefresh}
                />
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t('reports.status')} value={<ReportStatusBadge status={report.status} />} />
            <Field
              label={t('reports.type')}
              value={t(`reports.${report.type.toLowerCase()}`)}
            />
            <Field label={t('reports.id')} value={<span className="font-mono">{report.id}</span>} />
            <Field label={t('reports.imei1')} value={report.imei1 || t('common.noData')} />
            <Field
              label={t('reports.createdAt')}
              value={formatDate(report.createdAt, locale)}
            />
            <Field
              label={t('reports.updatedAt')}
              value={formatDateTime(report.updatedAt, locale)}
            />
          </div>

          {report.description ? (
            <div className="surface-card-muted mt-4 rounded-[1.5rem] p-5">
              <p className="section-kicker">{t('reports.description')}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                {report.description}
              </p>
            </div>
          ) : null}

          {canEdit && isEditing ? (
            <div className="surface-card-muted mt-4 rounded-[1.5rem] p-5">
              <p className="section-kicker">{t('reports.edit')}</p>
              <h3 className="mt-2 text-lg font-semibold">
                {report.imei1 || report.phoneBrand + ' ' + report.phoneModel || t('common.noData')}
              </h3>
              <div className="mt-5">
                <ReportEditForm
                  report={report}
                  onUpdate={() => void handleUpdated()}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4">
          <section className="surface-card border-0 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-600">
                <CalendarClock className="size-4" />
              </div>
              <div>
                <p className="section-kicker">{t('reports.user')}</p>
                <h3 className="mt-1 text-lg font-semibold">
                  {report.user?.displayName || t('common.noData')}
                </h3>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground">
              <p>{report.user?.email || t('common.noData')}</p>
              <p>{report.user?.phone || t('common.noData')}</p>
              {report.user ? (
                <Link
                  href={`/users/${report.user.id}`}
                  className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                >
                  {t('reports.viewUser')}
                </Link>
              ) : null}
            </div>
          </section>

          <section className="surface-card border-0 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-rose-500/12 text-rose-600">
                <AlertCircle className="size-4" />
              </div>
              <div>
                <p className="section-kicker">{t('reports.updateStatus')}</p>
                <h3 className="mt-1 text-lg font-semibold">
                  {t('reports.changeWorkflow')}
                </h3>
              </div>
            </div>
            <ReportStatusUpdate
              reportId={report.id}
              currentStatus={report.status}
              onUpdate={onRefresh}
              readOnly={
                user?.role !== Role.ADMIN &&
                user?.role !== Role.MODERATOR &&
                !canLawyerEdit
              }
            />
          </section>
        </div>
      </section>

      <section className="surface-card border-0 p-5 sm:p-6">
        <div className="mb-5">
          <p className="section-kicker">{t('reports.photos')}</p>
          <h3 className="mt-2 text-xl font-semibold">{t('reports.evidenceGallery')}</h3>
        </div>
        <PhotoGallery photos={report.photos || []} reportId={report.id} />
      </section>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('reports.delete')}
        description={t('reports.deleteConfirm')}
        confirmText={isDeleting ? t('common.loading') : t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
