'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { errorToast } from '@/components/shared/error-toast';
import { RequestErrorState } from '@/components/shared/request-error-state';
import { Button } from '@/components/ui/button';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    errorToast({
      error,
      fallbackMessage: t('errors.serverError'),
    });
    console.log(error)
  }, [error, t]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-10 sm:px-6">
      <RequestErrorState
        error={error}
        title={t('common.error')}
        fallbackMessage={t('errors.serverError')}
        action={
          <Button type="button" className="rounded-2xl" onClick={reset}>
            {t('common.retry')}
          </Button>
        }
      />
    </div>
  );
}
