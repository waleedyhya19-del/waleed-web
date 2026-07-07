'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthCard } from './auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link } from './utils';
import { authApi } from '@/lib/api/endpoints';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';
import { ApiError } from '@/lib/api/errors';

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export function ResendConfirmationForm() {
  const t = useTranslations();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (v: FormValues) => {
    setSubmitting(true);
    try {
      await authApi.resendConfirmation(v);
      setSent(true);
      toast.success(t('auth.resendConfirmationSent'));
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.resendConfirmationTitle')}
      footer={<Link href="/login" className="text-accent hover:underline">{t('common.signIn')}</Link>}
    >
      {sent ? (
        <div className="rounded-md border border-success/40 bg-success/10 p-3 text-sm">
          {t('auth.resendConfirmationSent')}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('auth.resendConfirmationSubmit')}
            </Button>
          </form>
        </Form>
      )}
    </AuthCard>
  );
}
