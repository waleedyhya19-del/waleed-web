'use client';

import { toast } from 'sonner';

import {
  getApiErrorDescription,
  getApiErrorTitle,
  normalizeApiError,
} from '@/lib/api/error';

type ToastPayload =
  | string
  | {
      title: string;
      description?: string;
    };

type ErrorToastPayload =
  | string
  | {
      title?: string;
      description?: string;
      error?: unknown;
      fallbackMessage?: string;
    };

export function errorToast(payload: ErrorToastPayload) {
  if (typeof payload === 'string') {
    return toast.error(payload);
  }

  if (!payload.error) {
    return toast.error(payload.title ?? 'Error', {
      description: payload.description,
    });
  }

  const normalized = normalizeApiError(
    payload.error,
    payload.fallbackMessage ?? 'Something went wrong.',
  );

  return toast.error(payload.title ?? getApiErrorTitle(normalized), {
    description:
      payload.description ??
      getApiErrorDescription(
        normalized,
        payload.fallbackMessage ?? 'Something went wrong.',
      ),
  });
}

export function successToast(payload: ToastPayload) {
  if (typeof payload === 'string') {
    return toast.success(payload);
  }

  return toast.success(payload.title, {
    description: payload.description,
  });
}

export function loadingToast(payload: ToastPayload) {
  if (typeof payload === 'string') {
    return toast.loading(payload);
  }

  return toast.loading(payload.title, {
    description: payload.description,
  });
}
