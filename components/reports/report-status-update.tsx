'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { reportsApi } from '@/lib/api/reports';
import { ReportStatus } from '@/lib/api/types';
import {
  invalidateResourceCache,
  invalidateResourceCacheByPrefix,
} from '@/stores/resource-cache-store';
import { errorToast, successToast } from '@/components/shared/error-toast';
import { updateReportStatusSchema, type UpdateReportStatusInput } from '@/lib/validations/report';

interface ReportStatusUpdateProps {
  reportId: string;
  currentStatus: ReportStatus;
  onUpdate?: () => void;
  readOnly?: boolean;
}

const statusesRequiringNote: ReportStatus[] = [ReportStatus.REJECTED, ReportStatus.RESOLVED];

export function ReportStatusUpdate({
  reportId,
  currentStatus,
  onUpdate,
  readOnly = false,
}: ReportStatusUpdateProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateReportStatusInput>({
    resolver: zodResolver(updateReportStatusSchema),
    defaultValues: {
      status: currentStatus,
    },
  });

  const selectedStatus = watch('status');
  const showNoteField =
    selectedStatus &&
    statusesRequiringNote.includes(selectedStatus as ReportStatus);

  const handleUpdate = async (data: UpdateReportStatusInput) => {
    if (data.status === currentStatus) return;

    setIsLoading(true);
    try {
      await reportsApi.updateStatus(reportId, {
        status: data.status,
        note: data.note || undefined,
      });
      invalidateResourceCache('reports:list');
      invalidateResourceCache('dashboard:overview');
      invalidateResourceCacheByPrefix(`reports:detail:${reportId}`);
      successToast(t('reports.updateSuccess'));
      onUpdate?.();
    } catch (error) {
      errorToast({
        error,
        fallbackMessage: t('errors.networkError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (readOnly) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('reports.status')}: {t(`reportStatus.${currentStatus.toLowerCase()}`)}
      </p>
    );
  }

  const availableTransitions = getValidTransitions(currentStatus);

  if (availableTransitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('reports.status')}: {t(`reportStatus.${currentStatus.toLowerCase()}`)}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleUpdate)} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={selectedStatus}
          onValueChange={(value) => setValue('status', value as ReportStatus)}
        >
          <SelectTrigger className="h-11 w-full rounded-2xl border-border/70 bg-background/70 sm:w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={currentStatus} disabled>
              {t(`reportStatus.${currentStatus.toLowerCase()}`)}
            </SelectItem>
            {availableTransitions.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`reportStatus.${s.toLowerCase()}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="submit"
          disabled={selectedStatus === currentStatus || isLoading}
          className="h-11 rounded-2xl px-5"
        >
          {isLoading ? t('common.loading') : t('common.save')}
        </Button>
      </div>
      {showNoteField && (
        <div className="space-y-2">
          <Textarea
            id="note"
            className="min-h-20 rounded-[1rem] border-border/70 bg-background/70"
            placeholder={t('reports.notePlaceholder')}
            {...register('note')}
          />
          {errors.note && (
            <p className="text-sm text-destructive">
              {errors.note.message}
            </p>
          )}
        </div>
      )}
    </form>
  );
}

function getValidTransitions(status: ReportStatus): ReportStatus[] {
  switch (status) {
    case ReportStatus.RECEIVED:
      return [
        ReportStatus.REVIEWING,
        ReportStatus.ESCALATED,
        ReportStatus.REJECTED,
      ];
    case ReportStatus.REVIEWING:
      return [
        ReportStatus.ESCALATED,
        ReportStatus.REJECTED,
        ReportStatus.RESOLVED,
      ];
    case ReportStatus.ESCALATED:
      return [ReportStatus.RESOLVED, ReportStatus.REJECTED];
    case ReportStatus.REJECTED:
      return [ReportStatus.CLOSED, ReportStatus.REVIEWING];
    case ReportStatus.RESOLVED:
      return [ReportStatus.CLOSED];
    case ReportStatus.CLOSED:
      return [];
    default:
      return [];
  }
}