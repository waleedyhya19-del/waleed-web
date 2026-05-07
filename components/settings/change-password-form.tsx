'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { errorToast, successToast } from '@/components/shared/error-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { ChangePasswordInput } from '@/lib/validations/auth';

export function ChangePasswordForm() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>();

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      successToast(t('settings.passwordSuccess'));
      reset();
    } catch (error) {
      errorToast({
        error,
        fallbackMessage: t('errors.networkError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="surface-card border-0 shadow-none">
      <CardHeader>
        <CardTitle>{t('auth.changePassword')}</CardTitle>
        <CardDescription>{t('settings.passwordDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t('auth.currentPassword')}</Label>
            <Input
              id="currentPassword"
              type="password"
              className="h-12 rounded-2xl border-border/70 bg-background/70"
              {...register('currentPassword', {
                required: 'validation.currentPassword.required',
              })}
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">
                {t(errors.currentPassword.message as string)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
            <Input
              id="newPassword"
              type="password"
              className="h-12 rounded-2xl border-border/70 bg-background/70"
              {...register('newPassword', {
                required: 'validation.password.required',
                minLength: {
                  value: 8,
                  message: 'validation.password.minLength',
                },
                validate: {
                  uppercase: (value) =>
                    /[A-Z]/.test(value) || 'validation.password.uppercase',
                  lowercase: (value) =>
                    /[a-z]/.test(value) || 'validation.password.lowercase',
                  number: (value) =>
                    /[0-9]/.test(value) || 'validation.password.number',
                },
              })}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {t(errors.newPassword.message as string)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              className="h-12 rounded-2xl border-border/70 bg-background/70"
              {...register('confirmPassword', {
                required: 'validation.password.required',
                validate: (value) =>
                  value === getValues('newPassword') ||
                  'validation.password.mismatch',
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {t(errors.confirmPassword.message as string)}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="h-12 rounded-2xl px-5">
            {isLoading ? t('common.loading') : t('common.save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
