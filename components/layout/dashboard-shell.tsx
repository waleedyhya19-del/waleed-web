'use client';

import { useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { errorToast } from '@/components/shared/error-toast';
import { RequestErrorState } from '@/components/shared/request-error-state';
import { Topbar } from '@/components/layout/topbar';
import { authApi } from '@/lib/api/auth';
import { initializeFirebase, requestNotificationPermission } from '@/lib/firebase/client';
import { hasApiErrorStatus, normalizeApiError } from '@/lib/api/error';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
} from '@/lib/auth/token';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { usePathname, useRouter } from '@/i18n/routing';
import { canAccessRoute } from '@/lib/constants/roles';
import { clearResourceCache } from '@/stores/resource-cache-store';
import { hasFreshSession, useSessionStore } from '@/stores/session-store';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const user = useSessionStore((state) => state.user);
  const isLoading = useSessionStore((state) => state.isLoading);
  const sessionError = useSessionStore((state) => state.sessionError);
  const lastValidatedAt = useSessionStore((state) => state.lastValidatedAt);
  const setUser = useSessionStore((state) => state.setUser);
  const setLoading = useSessionStore((state) => state.setLoading);
  const setSessionError = useSessionStore((state) => state.setSessionError);
  const markValidated = useSessionStore((state) => state.markValidated);
  const clearSession = useSessionStore((state) => state.clearSession);

  const loadSession = useCallback(
    async (force = false) => {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken && !refreshToken) {
        clearSession();
        router.replace('/login');
        return;
      }

      if (!force && accessToken && hasFreshSession(user, lastValidatedAt)) {
        setLoading(false);
        setSessionError(null);
        return;
      }

      if (!user || force || !accessToken) {
        setLoading(true);
      }

      setSessionError(null);

      try {
        const currentUser = await authApi.getSession();
        setUser(currentUser);
        markValidated();

        if (typeof window !== 'undefined') {
          initializeFirebase();
          void requestNotificationPermission();
        }
      } catch (error) {
        const normalizedError = normalizeApiError(
          error,
          t('auth.sessionExpiredDesc')
        );

        if (hasApiErrorStatus(normalizedError, 401)) {
          clearAuthTokens();
          clearResourceCache();
          clearSession();
          errorToast({
            title: t('auth.sessionExpired'),
            error: normalizedError,
            fallbackMessage: t('auth.sessionExpiredDesc'),
          });
          router.replace('/login');
          return;
        }

        if (hasApiErrorStatus(normalizedError, 403)) {
          clearResourceCache();
          clearSession();
          errorToast({
            title: t('errors.forbidden'),
            error: normalizedError,
            fallbackMessage: t('errors.forbidden'),
          });
          router.replace('/forbidden');
          return;
        }

        setSessionError(normalizedError);
      } finally {
        setLoading(false);
      }
    },
    [
      clearSession,
      lastValidatedAt,
      markValidated,
      router,
      setLoading,
      setSessionError,
      setUser,
      t,
      user,
    ]
  );

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    if (!canAccessRoute(user.role, pathname)) {
      router.replace('/forbidden');
    }
  }, [isLoading, pathname, router, user]);

  const isRouteAllowed = user != null && canAccessRoute(user.role, pathname);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch (error) {
      errorToast({
        title: t('navigation.logout'),
        error,
        fallbackMessage: t('errors.networkError'),
      });
    } finally {
      clearAuthTokens();
      clearResourceCache();
      clearSession();
      router.replace('/login');
    }
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.12),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.10),_transparent_30%)]" />
          <Topbar onLogout={handleLogout} />
          <div className="relative px-4 pb-8 pt-4 sm:px-6 lg:px-8">
            <div
              className={cn(
                'mx-auto flex w-full max-w-7xl flex-col gap-6 rounded-[2rem] border border-white/60 bg-white/72 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/64 sm:p-6 lg:p-8',
                isLoading && !user && 'animate-pulse'
              )}
            >
              {isLoading && !user ? (
                <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
                  <div className="h-52 rounded-[1.5rem] bg-slate-200/70 dark:bg-slate-800/60" />
                  <div className="h-52 rounded-[1.5rem] bg-slate-200/60 dark:bg-slate-800/50" />
                </div>
              ) : sessionError ? (
                <RequestErrorState
                  error={sessionError}
                  title={t('common.error')}
                  fallbackMessage={t('errors.serverError')}
                  action={
                    <Button
                      type="button"
                      className="rounded-2xl"
                      onClick={() => void loadSession(true)}
                    >
                      {t('common.retry')}
                    </Button>
                  }
                />
              ) : !isRouteAllowed ? null : (
                children
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
