'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/error';

type Status = 'verifying' | 'success' | 'error' | 'invalid';

export function ConfirmEmailForm() {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';
  const hasCredentials = Boolean(token && email);

  const [status, setStatus] = useState<Status>(
    hasCredentials ? 'verifying' : 'invalid',
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (hasVerifiedRef.current || !hasCredentials) {
      return;
    }
    hasVerifiedRef.current = true;

    authApi
      .confirmEmail({ token, email })
      .then(() => {
        setStatus('success');
      })
      .catch((error: unknown) => {
        setErrorMessage(getApiErrorMessage(error, t('errors.networkError')));
        setStatus('error');
      });
  }, [hasCredentials, token, email, t]);

  if (status === 'invalid') {
    return (
      <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/8 p-4 text-sm text-destructive">
        {t('auth.invalidConfirmLink')}
      </div>
    );
  }

  if (status === 'verifying') {
    return (
      <div className="flex items-center gap-3 rounded-[1.5rem] border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>{t('auth.confirmingEmail')}</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/8 p-4 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="size-5 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">{t('auth.confirmEmailSuccess')}</p>
            <p className="text-emerald-700/80 dark:text-emerald-300/80">
              {t('auth.confirmEmailSuccessDesc')}
            </p>
          </div>
        </div>
        <Button asChild className="h-12 w-full rounded-2xl">
          <Link href="/login">{t('auth.login')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-[1.5rem] border border-destructive/20 bg-destructive/8 p-4 text-sm text-destructive">
        <XCircle className="size-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium">{t('auth.confirmEmailError')}</p>
          <p className="text-destructive/80">{errorMessage}</p>
        </div>
      </div>
      <Button asChild variant="outline" className="h-12 w-full rounded-2xl">
        <Link href="/login">{t('common.back')}</Link>
      </Button>
    </div>
  );
}
