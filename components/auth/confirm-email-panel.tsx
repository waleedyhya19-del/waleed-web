'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthCard } from './auth-card';
import { Link, useSearchParamsCompat } from './utils';
import { authApi } from '@/lib/api/endpoints';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';
import { ApiError } from '@/lib/api/errors';
import { Loader2 } from 'lucide-react';

export function ConfirmEmailPanel() {
  const t = useTranslations();
  const search = useSearchParamsCompat();
  const token = search.get('token');
  const email = search.get('email');
  const [state, setState] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!token) {
        if (!cancelled) {
          setState('error');
          setErrorMsg(t('errors.validation'));
        }
        return;
      }
      try {
        await authApi.confirmEmail({ token, email: email ?? '' });
        if (!cancelled) setState('success');
      } catch (e) {
        const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
        if (!cancelled) {
          setState('error');
          setErrorMsg(msg);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [token, email, t]);

  return (
    <AuthCard
      title={t('auth.confirmEmailTitle')}
      subtitle={t('auth.confirmEmailSubtitle')}
      footer={<Link href="/login" className="text-accent hover:underline">{t('common.signIn')}</Link>}
    >
      {state === 'pending' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('common.loading')}
        </div>
      )}
      {state === 'success' && (
        <div className="rounded-md border border-success/40 bg-success/10 p-3 text-sm text-success-foreground">
          {t('auth.confirmEmailSuccess')}
        </div>
      )}
      {state === 'error' && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          {errorMsg}
        </div>
      )}
    </AuthCard>
  );
}
