'use client';

import { create } from 'zustand';
import type { User } from '@/lib/api/types';
import { tokenStorage } from '@/lib/auth/token-storage';

export type SessionStatus = 'idle' | 'loading' | 'authed' | 'guest' | 'expired';

interface SessionState {
  user: User | null;
  status: SessionStatus;
  lastFetchedAt: number | null;
  setUser: (user: User | null) => void;
  setStatus: (status: SessionStatus) => void;
  markFresh: () => void;
  reset: () => void;
}

const SESSION_TTL_MS = 60_000;

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  status: 'idle',
  lastFetchedAt: null,
  setUser: (user) => set({ user, status: user ? 'authed' : 'guest' }),
  setStatus: (status) => set({ status }),
  markFresh: () => set({ lastFetchedAt: Date.now() }),
  reset: () => {
    tokenStorage.clear();
    set({ user: null, status: 'guest', lastFetchedAt: null });
  },
}));

export function isSessionFresh(): boolean {
  const state = useSessionStore.getState();
  return (
    state.lastFetchedAt !== null &&
    Date.now() - state.lastFetchedAt < SESSION_TTL_MS
  );
}
