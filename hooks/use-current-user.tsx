'use client';

import { ReactNode } from 'react';

import { useSessionStore } from '@/stores/session-store';

interface CurrentUserContextType {
  user: ReturnType<typeof useSessionStore.getState>['user'];
  setUser: ReturnType<typeof useSessionStore.getState>['setUser'];
  isLoading: boolean;
}

export function CurrentUserProvider({
  children,
}: {
  children: ReactNode;
  value?: CurrentUserContextType;
}) {
  return <>{children}</>;
}

export function useCurrentUser() {
  const user = useSessionStore((state) => state.user);
  const setUser = useSessionStore((state) => state.setUser);
  const isLoading = useSessionStore((state) => state.isLoading);

  return {
    user,
    setUser,
    isLoading,
  };
}
