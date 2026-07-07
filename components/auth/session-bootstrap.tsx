'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { registerSessionExpiredHandler } from '@/lib/api/client';
import { useSessionStore } from '@/stores/session-store';
import { setRuntimeLocale } from '@/lib/i18n/runtime-locale';
import { tokenStorage } from '@/lib/auth/token-storage';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import type { Locale } from '@/lib/i18n/routing';

function SessionExpiredHandler() {
  const reset = useSessionStore((s) => s.reset);
  useEffect(() => {
    registerSessionExpiredHandler(() => {
      reset();
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (!path.match(/\/(login|signup|forgot-password|reset-password|confirm-email)/)) {
          window.location.assign(`/${window.location.pathname.split('/')[1] || 'ar'}/login?reason=session-expired`);
        }
      }
    });
  }, [reset]);
  return null;
}

function CrossTabSync() {
  const reset = useSessionStore((s) => s.reset);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === tokenStorage.keys.AT_KEY && !e.newValue) reset();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [reset]);
  return null;
}

function LocaleSync() {
  const locale = useLocale() as Locale;
  useEffect(() => {
    setRuntimeLocale(locale);
  }, [locale]);
  return null;
}

function CurrentUserPrefetch() {
  useCurrentUser();
  return null;
}

export function SessionBootstrap() {
  return (
    <>
      <LocaleSync />
      <SessionExpiredHandler />
      <CrossTabSync />
      <CurrentUserPrefetch />
    </>
  );
}
