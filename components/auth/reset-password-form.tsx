'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { AuthCard } from './auth-card';
import { ResultDialog } from './result-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Link, useSearchParamsCompat } from './utils';
import { authApi } from '@/lib/api/endpoints';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';
import { ApiError } from '@/lib/api/errors';
import { useSessionStore } from '@/stores/session-store';

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'errors.passwordsMismatch',
  });
type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const t = useTranslations();
  const search = useSearchParamsCompat();
  const token = search.get('token') ?? '';
  const role = useSessionStore((s) => s.user?.role);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (v: FormValues) => {
    if (!token) {
      setResult({ type: 'error', message: t('errors.validation') });
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, newPassword: v.password });
      setResult({ type: 'success', message: t('auth.resetPasswordSuccess') });
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      setResult({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.resetPasswordTitle')}
      footer={role !== 'END_USER' && <Link href="/login" className="text-accent hover:underline">{t('common.signIn')}</Link>}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.newPassword')}</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.confirmPassword')}</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('auth.resetPasswordSubmit')}
          </Button>
        </form>
      </Form>

      <ResultDialog
        open={result !== null}
        type={result?.type ?? 'success'}
        title={result?.type === 'success' ? t('common.success') : t('common.error')}
        message={result?.message ?? ''}
        onClose={() => setResult(null)}
      />
    </AuthCard>
  );
}
