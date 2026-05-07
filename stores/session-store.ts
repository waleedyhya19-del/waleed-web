'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { User } from '@/lib/api/types';

type SessionStoreState = {
  user: User | null;
  isLoading: boolean;
  sessionError: unknown;
  lastValidatedAt: number | null;
  setLoading: (isLoading: boolean) => void;
  setSessionError: (sessionError: unknown) => void;
  setUser: (
    user: User | null | ((current: User | null) => User | null)
  ) => void;
  markValidated: () => void;
  clearSession: () => void;
};

export const SESSION_CACHE_TTL_MS = 60_000;

export const useSessionStore = create<SessionStoreState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      sessionError: null,
      lastValidatedAt: null,
      setLoading: (isLoading) => set({ isLoading }),
      setSessionError: (sessionError) => set({ sessionError }),
      setUser: (user) =>
        set((state) => ({
          user:
            typeof user === 'function'
              ? user(state.user)
              : user,
        })),
      markValidated: () => set({ lastValidatedAt: Date.now() }),
      clearSession: () =>
        set({
          user: null,
          isLoading: false,
          sessionError: null,
          lastValidatedAt: null,
        }),
    }),
    {
      name: 'mobili-mafqud-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        lastValidatedAt: state.lastValidatedAt,
      }),
    }
  )
);

export function hasFreshSession(user: User | null, lastValidatedAt: number | null) {
  return Boolean(
    user &&
      lastValidatedAt &&
      Date.now() - lastValidatedAt < SESSION_CACHE_TTL_MS
  );
}
