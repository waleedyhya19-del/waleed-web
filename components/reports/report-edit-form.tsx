'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReportType, Report } from '@/lib/api/types';
import { reportsApi } from '@/lib/api/reports';
import { updateReportSchema, type UpdateReportInput } from '@/lib/validations/report';
import { errorToast, successToast } from '@/components/shared/error-toast';
import {
  invalidateResourceCache,
  invalidateResourceCacheByPrefix,
} from '@/stores/resource-cache-store';

interface ReportEditFormProps {
  report: Report;
  onUpdate?: () => void;
  onCancel?: () => void;
}

export function ReportEditForm({
  report,
  onUpdate,
  onCancel,
}: ReportEditFormProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateReportInput>({
    resolver: zodResolver(updateReportSchema),
    defaultValues: {
      type: report.type,
      reportCategory: report.reportCategory,
      imei1: report.imei1 ?? undefined,
      imei2: report.imei2 ?? undefined,
      phoneBrand: report.phoneBrand ?? undefined,
      phoneModel: report.phoneModel ?? undefined,
      lastPhoneNumber1: report.lastPhoneNumber1 ?? undefined,
      lastPhoneNumber2: report.lastPhoneNumber2 ?? undefined,
      description: report.description ?? undefined,
      lossDate: report.lossDate ?? undefined,
      lossArea: report.lossArea ?? undefined,
      lossAddress: report.lossAddress ?? undefined,
      reporterFullName: report.reporterFullName ?? undefined,
      witnessFullName: report.witnessFullName ?? undefined,
      witnessLocation: report.witnessLocation ?? undefined,
      contactPhoneNumber: report.contactPhoneNumber ?? undefined,
      paymentPhoneNumber: report.paymentPhoneNumber ?? undefined,
      depositAmount: report.depositAmount ?? undefined,
    },
  });

  const onSubmit = async (data: UpdateReportInput) => {
    setIsLoading(true);
    try {
      await reportsApi.update(report.id, data);
      invalidateResourceCache('reports:list');
      invalidateResourceCache('dashboard:overview');
      invalidateResourceCacheByPrefix(`reports:detail:${report.id}`);
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

  const selectedType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="imei1">{t('reports.imei1')}</Label>
          <Input id="imei1" className="h-11 rounded-2xl" {...register('imei1')} />
          {errors.imei1 && (
            <p className="text-sm text-destructive mt-1">{errors.imei1.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phoneBrand">{t('reports.phoneBrand')}</Label>
          <Input id="phoneBrand" className="h-11 rounded-2xl" {...register('phoneBrand')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phoneModel">{t('reports.phoneModel')}</Label>
          <Input id="phoneModel" className="h-11 rounded-2xl" {...register('phoneModel')} />
        </div>
        <div>
          <Label htmlFor="type">{t('reports.type')}</Label>
          <Select
            value={selectedType}
            onValueChange={(value) =>
              setValue('type', value as ReportType, { shouldDirty: true })
            }
          >
            <SelectTrigger className="h-11 rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ReportType.LOST}>{t('reports.lost')}</SelectItem>
              <SelectItem value={ReportType.STOLEN}>{t('reports.stolen')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="description">{t('reports.description')}</Label>
        <Textarea id="description" className="rounded-2xl" {...register('description')} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isLoading} className="h-11 rounded-2xl">
          {isLoading ? t('common.loading') : t('common.save')}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} className="h-11 rounded-2xl">
            {t('common.cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  );
}