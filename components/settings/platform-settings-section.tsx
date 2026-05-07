'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAsyncResource } from '@/hooks/use-async-resource';
import { errorToast, successToast } from '@/components/shared/error-toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Role } from '@/lib/api/types';
import { platformSettingsApi } from '@/lib/api/platform-settings';
import {
  reportWorkflowSchema,
  type ReportWorkflowInput,
} from '@/lib/validations/platform-settings';

export function PlatformSettingsSection() {
  const t = useTranslations();
  const { user } = useCurrentUser();
  const [isSaving, setIsSaving] = useState(false);

  const { data, refresh } = useAsyncResource(
    () => platformSettingsApi.getReportWorkflow(),
    [],
    {
      cacheKey: 'settings:workflow',
      staleTimeMs: 60_000,
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReportWorkflowInput>({
    resolver: zodResolver(reportWorkflowSchema),
    defaultValues: {
      defaultLawyerDepositAmount: null,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        defaultLawyerDepositAmount: data.defaultLawyerDepositAmount ?? null,
      });
    }
  }, [data, reset]);

  const onSubmit = async (
    values: ReportWorkflowInput
  ) => {
    setIsSaving(true);
    try {
      await platformSettingsApi.updateReportWorkflow(values);
      await refresh();
      successToast(t('settings.updateSuccess'));
    } catch (error) {
      errorToast({
        error,
        fallbackMessage: t('settings.loadError'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.role !== Role.ADMIN) {
    return null;
  }

  return (
    <section className="surface-card border-0 p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div>
          <p className="section-kicker">{t('settings.platform')}</p>
          <h3 className="mt-1 text-lg font-semibold">
            {t('settings.reportWorkflow')}
          </h3>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="depositAmount">
            {t('settings.defaultLawyerDepositAmount')}
          </Label>
          <Input
            id="depositAmount"
            type="number"
            min={0}
            className="h-12 rounded-2xl border-border/70 bg-background/70"
            placeholder={t('settings.depositAmountPlaceholder')}
            {...register('defaultLawyerDepositAmount', {
              valueAsNumber: true,
            })}
          />
          <p className="text-sm text-muted-foreground">
            {t('settings.depositAmountHint')}
          </p>
          {errors.defaultLawyerDepositAmount && (
            <p className="text-sm text-destructive">
              {errors.defaultLawyerDepositAmount.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSaving}
          className="h-11 rounded-2xl px-5"
        >
          {isSaving ? t('common.loading') : t('common.save')}
        </Button>
      </form>
    </section>
  );
}