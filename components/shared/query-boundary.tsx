'use client';

import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';
import { ApiError } from '@/lib/api/errors';

interface Props {
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  fallback?: ReactNode;
  empty?: boolean;
  emptyChildren?: ReactNode;
  children: ReactNode;
}

export function QueryBoundary({
  isLoading,
  error,
  onRetry,
  fallback,
  empty,
  emptyChildren,
  children,
}: Props) {
  const t = useTranslations();
  if (isLoading) {
    return (
      fallback ?? (
        <div className="grid gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )
    );
  }
  if (error) {
    const msg = error instanceof ApiError && error.message ? error.message : (t(apiErrorKey(error)) as string);
    return (
      <div className="surface-card flex flex-col items-start gap-3 p-6">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {msg}
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )}
      </div>
    );
  }
  if (empty) {
    return (
      emptyChildren ?? (
        <div className="surface-card grid place-items-center p-10 text-sm text-muted-foreground">
          {t('common.empty')}
        </div>
      )
    );
  }
  return <>{children}</>;
}
