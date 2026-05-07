'use client';

import { Eye, EyeOff, Check, Circle, Lock } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { errorToast, successToast } from '@/components/shared/error-toast';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/auth';
import { useRouter } from '@/i18n/routing';

export function ResetPasswordForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const newPassword = watch('newPassword') ?? '';
  const confirmPassword = watch('confirmPassword') ?? '';

  const passwordRules = [
    { key: 'passwordRuleLength', met: newPassword.length >= 8 },
    { key: 'passwordRuleUppercase', met: /[A-Z]/.test(newPassword) },
    { key: 'passwordRuleLowercase', met: /[a-z]/.test(newPassword) },
    { key: 'passwordRuleNumber', met: /[0-9]/.test(newPassword) },
    {
      key: 'passwordRuleMatch',
      met: newPassword.length > 0 && newPassword === confirmPassword,
    },
  ];

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword(data);
      successToast(t('auth.resetPasswordSuccess'));
      router.replace('/login');
    } catch (error) {
      errorToast({ error, fallbackMessage: t('errors.networkError') });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/8 p-4 text-sm text-destructive">
        {t('auth.invalidResetLink')}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register('token')} />

      <div className="space-y-2">
        <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
        <InputGroup className="h-12 rounded-2xl border-border/70 bg-background/65">
          <InputGroupAddon align="inline-start">
            <Lock className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            {...register('newPassword')}
          />
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              aria-label={t(showNewPassword ? 'auth.hidePassword' : 'auth.showPassword')}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            >
              {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </InputGroupAddon>
        </InputGroup>
        {errors.newPassword && (
          <p className="text-sm text-destructive">
            {t(errors.newPassword.message as string)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
        <InputGroup className="h-12 rounded-2xl border-border/70 bg-background/65">
          <InputGroupAddon align="inline-start">
            <Lock className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
          />
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={t(showConfirmPassword ? 'auth.hidePassword' : 'auth.showPassword')}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </InputGroupAddon>
        </InputGroup>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {t(errors.confirmPassword.message as string)}
          </p>
        )}
      </div>

      <ul className="space-y-1.5 text-sm">
        {passwordRules.map((rule) => (
          <li key={rule.key} className="flex items-center gap-2">
            {rule.met ? (
              <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Circle className="size-4 text-muted-foreground" />
            )}
            <span
              className={
                rule.met
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-muted-foreground'
              }
            >
              {t(`auth.${rule.key}`)}
            </span>
          </li>
        ))}
      </ul>

      <Button type="submit" className="h-12 w-full rounded-2xl" disabled={isLoading}>
        {isLoading ? t('common.loading') : t('auth.resetPassword')}
      </Button>
    </form>
  );
}
