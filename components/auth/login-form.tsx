'use client';

import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

import { errorToast } from '@/components/shared/error-toast';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { setAuthTokens } from '@/lib/auth/token';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { useRouter } from '@/i18n/routing';

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      const result = await authApi.login(data);
      setAuthTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      router.replace('/');
    } catch (error) {
      errorToast({
        title: t('auth.loginError'),
        error,
        fallbackMessage: t('errors.networkError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-sm text-destructive">{t(errors.email.message as string)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.password')}</Label>
        <InputGroup className="h-12 rounded-2xl border-border/70 bg-background/65">
          <InputGroupAddon align="inline-start">
            <Lock className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="password"
            type="password"
            {...register('password')}
          />
        </InputGroup>
        {errors.password && (
          <p className="text-sm text-destructive">
            {t(errors.password.message as string)}
          </p>
        )}
      </div>

      <Button type="submit" className="h-12 w-full rounded-2xl" disabled={isLoading}>
        {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
      </Button>
    </form>
  );
}
