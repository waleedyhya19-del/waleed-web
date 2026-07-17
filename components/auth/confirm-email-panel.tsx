'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthCard } from './auth-card';
import { ResultDialog } from './result-dialog';
import { Link, useSearchParamsCompat } from './utils';
import { authApi } from '@/lib/api/endpoints';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';
import { ApiError } from '@/lib/api/errors';
import { Loader2 } from 'lucide-react';
import { useSessionStore } from '@/stores/session-store';

export function ConfirmEmailPanel() {
  const t = useTranslations();
  const search = useSearchParamsCompat();
  const token = search.get('token');
  const email = search.get('email');
  const role = useSessionStore((s) => s.user?.role);
  const [state, setState] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!token) {
        if (!cancelled) {
          setState('error');
          setErrorMsg(t('errors.validation'));
          setDialogOpen(true);
        }
        return;
      }
      try {
        await authApi.confirmEmail({ token, email: email ?? '' });
        if (!cancelled) {
          setState('success');
          setDialogOpen(true);
        }
      } catch (e) {
        const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
        if (!cancelled) {
          setState('error');
          setErrorMsg(msg);
          setDialogOpen(true);
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
      footer={role !== 'END_USER' && <Link href="/login" className="text-accent hover:underline">{t('common.signIn')}</Link>}
    >
      {state === 'pending' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('common.loading')}
        </div>
      )}

      <ResultDialog
        open={dialogOpen}
        type={state === 'success' ? 'success' : 'error'}
        title={state === 'success' ? t('common.success') : t('common.error')}
        message={state === 'success' ? t('auth.confirmEmailSuccess') : errorMsg}
        onClose={() => setDialogOpen(false)}
      />
    </AuthCard>
  );
}
