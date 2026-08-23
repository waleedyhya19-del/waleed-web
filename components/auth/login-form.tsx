'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthCard } from './auth-card';
import { GoogleSignInButton } from './google-sign-in-button';
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
import { Link, useRouter, useSearchParamsCompat } from '@/components/auth/utils';
import { loginAndCommit } from '@/lib/auth/login-flow';
import { roleHomeHref } from '@/lib/hooks/use-role-home';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const search = useSearchParamsCompat();
  const [submitting, setSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setUnverifiedEmail(null);
    try {
      const res = await loginAndCommit(values.email, values.password);
      const redirect = search.get('redirect');
      router.replace(redirect || roleHomeHref(res.user.role));
    } catch (e) {
      if (e instanceof ApiError && (e.code === 'EMAIL_NOT_VERIFIED' || e.statusCode === 403)) {
        setUnverifiedEmail(values.email);
      }
      const key = apiErrorKey(e);
      const msg =
        e instanceof ApiError && e.message ? e.message : (t(key) as string);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
      footer={
        <>
          {t('auth.noAccountYet')}{' '}
          <Link href="/signup" className="font-medium text-accent hover:underline">
            {t('common.signUp')}
          </Link>
        </>
      }
    >
      {search.get('reason') === 'session-expired' && (
        <div className="mb-4 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning-foreground">
          {t('auth.sessionExpiredDescription')}
        </div>
      )}
      {unverifiedEmail && (
        <div className="mb-4 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning-foreground">
          <p>{t('auth.emailNotVerifiedAlert')}</p>
          <Link
            href={`/resend-confirmation?email=${encodeURIComponent(unverifiedEmail)}`}
            className="mt-1 inline-block font-medium text-accent hover:underline"
          >
            {t('auth.resendConfirmationLink')}
          </Link>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.email')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder={t('auth.loginEmailPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t('common.password')}</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-accent hover:underline"
                  >
                    {t('auth.forgotPasswordLink')}
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('auth.loginSubmit')}
          </Button>
        </form>
      </Form>
      <GoogleSignInButton text="signin_with" redirect={search.get('redirect')} />
    </AuthCard>
  );
}
