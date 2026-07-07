'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { useRouter } from '@/components/auth/utils';
import { googleOAuthAndCommit } from '@/lib/auth/login-flow';
import { roleHomeHref } from '@/lib/hooks/use-role-home';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';
import { cn } from '@/lib/utils/cn';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdApi {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: 'standard' | 'icon';
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with';
      logo_alignment?: 'left' | 'center';
      locale?: string;
      width?: number;
    },
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdApi } };
  }
}

export function GoogleSignInButton({
  text = 'continue_with',
  redirect,
}: {
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  redirect?: string | null;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [gsiReady, setGsiReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.google?.accounts?.id),
  );
  const [exchanging, setExchanging] = useState(false);
  const exchangingRef = useRef(false);

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential || exchangingRef.current) return;
      exchangingRef.current = true;
      setExchanging(true);
      try {
        const res = await googleOAuthAndCommit(response.credential);
        router.replace(redirect || roleHomeHref(res.user.role));
      } catch (e) {
        const key = apiErrorKey(e);
        const msg =
          e instanceof ApiError && e.message ? e.message : (t(key) as string);
        toast.error(msg);
        exchangingRef.current = false;
        setExchanging(false);
      }
    },
    [redirect, router, t],
  );

  useEffect(() => {
    const container = containerRef.current;
    const googleId = window.google?.accounts?.id;
    if (!gsiReady || !googleId || !container || !GOOGLE_CLIENT_ID) return;

    googleId.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
    });
    container.replaceChildren();
    googleId.renderButton(container, {
      type: 'standard',
      theme: resolvedTheme === 'dark' ? 'filled_black' : 'outline',
      size: 'large',
      text,
      logo_alignment: 'center',
      locale,
      width: Math.min(container.offsetWidth || 400, 400),
    });
  }, [gsiReady, handleCredential, locale, resolvedTheme, text]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <Script src={GSI_SRC} strategy="afterInteractive" onReady={() => setGsiReady(true)} />
      <div className="relative">
        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">
            {t('auth.orContinueWith')}
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div
          ref={containerRef}
          aria-label={t('auth.google')}
          className={cn(
            'flex min-h-10 justify-center',
            exchanging && 'pointer-events-none opacity-60',
          )}
        />
      </div>
    </>
  );
}
