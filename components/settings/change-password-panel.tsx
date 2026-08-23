'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { useSessionStore } from '@/stores/session-store';
import { authApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const setPasswordSchema = z.object({
  newPassword: z.string().min(8),
});

export function ChangePasswordPanel() {
  const t = useTranslations();
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
  const [submitting, setSubmitting] = useState(false);
  const hasPassword = user?.hasPassword ?? true;

  const form = useForm<{ currentPassword?: string; newPassword: string }>({
    resolver: zodResolver(hasPassword ? changePasswordSchema : setPasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const onSubmit = async (v: { currentPassword?: string; newPassword: string }) => {
    setSubmitting(true);
    try {
      if (hasPassword) {
        await authApi.changePassword({
          currentPassword: v.currentPassword ?? '',
          newPassword: v.newPassword,
        });
      } else {
        await authApi.setPassword({
          newPassword: v.newPassword,
        });
        if (user) {
          setUser({ ...user, hasPassword: true });
        }
      }
      toast.success(hasPassword ? t('settings.password.updated') : t('auth.passwordSetSuccess'));
      form.reset({ currentPassword: '', newPassword: '' });
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-4">
        {!hasPassword && (
          <p className="text-sm text-muted-foreground">{t('auth.setPasswordSubtitle')}</p>
        )}
        {hasPassword && (
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.currentPassword')}</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="newPassword"
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
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {hasPassword ? t('auth.changePasswordSubmit') : t('auth.setPasswordTitle')}
        </Button>
      </form>
    </Form>
  );
}
