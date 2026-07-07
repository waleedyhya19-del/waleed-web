'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSessionStore, isSessionFresh } from '@/stores/session-store';
import { usersApi } from '@/lib/api/endpoints';
import { tokenStorage } from '@/lib/auth/token-storage';
import { ApiError } from '@/lib/api/errors';

export function useCurrentUser() {
  const { user, status, setUser, setStatus, markFresh, reset } = useSessionStore();
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    const { accessToken } = tokenStorage.read();
    if (!accessToken) {
      reset();
      return null;
    }
    if (inFlight.current) return user;
    inFlight.current = true;
    setStatus('loading');
    try {
      const me = await usersApi.me();
      setUser(me);
      markFresh();
      return me;
    } catch (e) {
      if (e instanceof ApiError && (e.isUnauthenticated || e.statusCode === 401)) {
        reset();
      } else {
        setStatus('guest');
      }
      return null;
    } finally {
      inFlight.current = false;
    }
  }, [reset, setStatus, setUser, markFresh, user]);

  useEffect(() => {
    if (status === 'idle') {
      void refresh();
      return;
    }
    if (status === 'authed' && !isSessionFresh()) {
      void refresh();
    }
  }, [status, refresh]);

  return { user, status, refresh };
}
