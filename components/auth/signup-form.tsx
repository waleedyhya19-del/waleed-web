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
import { ResultDialog } from './result-dialog';
import { Link, useRouter } from '@/components/auth/utils';
import { signup } from '@/lib/auth/login-flow';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';
import { ApiError } from '@/lib/api/errors';

const schema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
});
type FormValues = z.infer<typeof schema>;

export function SignupForm() {
  const t = useTranslations();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', email: '', phone: '', password: '' },
  });

  const onSubmit = async (v: FormValues) => {
    setSubmitting(true);
    try {
      await signup(v);
      setRegisteredEmail(v.email);
      setSuccessDialogOpen(true);
    } catch (e) {
      const key = apiErrorKey(e);
      const msg = e instanceof ApiError && e.message ? e.message : (t(key) as string);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.signupTitle')}
      subtitle={t('auth.signupSubtitle')}
      footer={
        <>
          {t('auth.haveAccount')}{' '}
          <Link href="/login" className="font-medium text-accent hover:underline">
            {t('common.signIn')}
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.displayName')}</FormLabel>
                <FormControl>
                  <Input autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.phone')}</FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="tel" {...field} />
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
                <FormLabel>{t('common.password')}</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('auth.signupSubmit')}
          </Button>
        </form>
      </Form>
      <GoogleSignInButton text="signup_with" />
      <ResultDialog
        open={successDialogOpen}
        type="success"
        title={t('common.success')}
        message={t('auth.signupSuccessNote', { email: registeredEmail })}
        actionLabel={t('common.signIn')}
        onClose={() => {
          setSuccessDialogOpen(false);
          router.replace('/login');
        }}
      />
    </AuthCard>
  );
}
