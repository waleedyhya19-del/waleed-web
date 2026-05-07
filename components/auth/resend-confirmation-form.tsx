'use client';

import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

import { errorToast, successToast } from '@/components/shared/error-toast';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/routing';
import { authApi } from '@/lib/api/auth';
import {
  resendConfirmationSchema,
  ResendConfirmationInput,
} from '@/lib/validations/auth';

export function ResendConfirmationForm() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendConfirmationInput>({
    resolver: zodResolver(resendConfirmationSchema),
  });

  const onSubmit = async (data: ResendConfirmationInput) => {
    setIsLoading(true);
    try {
      await authApi.resendConfirmation(data);
      setEmailSent(true);
      successToast(t('auth.resendConfirmationSent'));
    } catch (error) {
      errorToast({ error, fallbackMessage: t('errors.networkError') });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/8 p-4 text-sm text-emerald-700 dark:text-emerald-300">
          {t('auth.resendConfirmationSent')}
        </div>
        <Button asChild variant="outline" className="h-12 w-full rounded-2xl">
          <Link href="/login">{t('common.back')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">{t('auth.email')}</Label>
        <InputGroup className="h-12 rounded-2xl border-border/70 bg-background/65">
          <InputGroupAddon align="inline-start">
            <Mail className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="email"
            type="email"
            {...register('email')}
          />
        </InputGroup>
        {errors.email && (
          <p className="text-sm text-destructive">
            {t(errors.email.message as string)}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-2xl"
        disabled={isLoading}
      >
        {isLoading ? t('common.loading') : t('auth.resendConfirmationSubmit')}
      </Button>
    </form>
  );
}
