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
import { Link } from '@/components/auth/utils';
import { authApi } from '@/lib/api/endpoints';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';
import { ApiError } from '@/lib/api/errors';

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (v: FormValues) => {
    setSubmitting(true);
    try {
      await authApi.forgotPassword(v);
      setResult({ type: 'success', message: t('auth.forgotPasswordSent') });
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      setResult({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.forgotPasswordTitle')}
      subtitle={t('auth.forgotPasswordSubtitle')}
      footer={<Link href="/login" className="text-accent hover:underline">{t('common.signIn')}</Link>}
    >
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
            {t('auth.forgotPasswordSubmit')}
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
