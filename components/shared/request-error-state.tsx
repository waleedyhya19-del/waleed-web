'use client';

import { AlertTriangle } from 'lucide-react';
import { type ReactNode } from 'react';

import {
  getApiErrorDetailMessages,
  getApiErrorMessage,
  getApiErrorReferenceLabel,
  normalizeApiError,
} from '@/lib/api/error';

interface RequestErrorStateProps {
  error: unknown;
  title: string;
  fallbackMessage?: string;
  action?: ReactNode;
}

export function RequestErrorState({
  error,
  title,
  fallbackMessage = 'Unable to complete the request.',
  action,
}: RequestErrorStateProps) {
  const normalized = normalizeApiError(error, fallbackMessage);
  const primaryMessage = getApiErrorMessage(normalized, fallbackMessage);
  const details = getApiErrorDetailMessages(normalized)
    .filter((message) => message !== primaryMessage)
    .slice(0, 4);
  const referenceLabel = getApiErrorReferenceLabel();

  return (
    <div className="surface-card-muted rounded-[1.75rem] border border-destructive/15 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-destructive/10 p-2 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm leading-7 text-muted-foreground">{primaryMessage}</p>
          </div>
        </div>

        {details.length > 0 ? (
          <ul className="space-y-2 rounded-2xl bg-background/70 p-4 text-sm text-muted-foreground">
            {details.map((detail, index) => (
              <li key={`${detail}-${index}`} className="leading-6">
                {detail}
              </li>
            ))}
          </ul>
        ) : null}

        {normalized.correlationId ? (
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground/80">
            {referenceLabel}: {normalized.correlationId}
          </p>
        ) : null}

        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}
