'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { useAsyncResource } from '@/lib/hooks/use-async-resource';
import { platformSettingsApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';

interface FormValues {
  defaultLawyerDepositAmount: number | null;
  maxRewardAmount: number | null;
  serialLookupRateLimit: number | null;
}

export function PlatformSettingsPanel() {
  const t = useTranslations();
  const state = useAsyncResource(() => platformSettingsApi.getReportWorkflow(), []);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    defaultValues: {
      defaultLawyerDepositAmount: null,
      maxRewardAmount: null,
      serialLookupRateLimit: null,
    },
  });

  useEffect(() => {
    if (state.data) {
      form.reset({
        defaultLawyerDepositAmount: state.data.defaultLawyerDepositAmount,
        maxRewardAmount: state.data.maxRewardAmount,
        serialLookupRateLimit: state.data.serialLookupRateLimit,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.data]);

  const onSubmit = async (v: FormValues) => {
    setSubmitting(true);
    try {
      await platformSettingsApi.updateReportWorkflow(v);
      toast.success(t('settings.platform.updated'));
      state.refresh();
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <QueryBoundary isLoading={state.isLoading} error={state.error} onRetry={state.refresh}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-4">
          <FormField
            control={form.control}
            name="defaultLawyerDepositAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('settings.platform.defaultLawyerDeposit')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxRewardAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('settings.platform.maxReward')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serialLookupRateLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('settings.platform.serialLookupRateLimit')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('common.save')}
          </Button>
        </form>
      </Form>
    </QueryBoundary>
  );
}
