'use client';

import { create } from 'zustand';

type ResourceCacheEntry<T = unknown> = {
  data: T;
  updatedAt: number;
  expiresAt: number;
};

type ResourceCacheState = {
  entries: Record<string, ResourceCacheEntry>;
  pending: Record<string, Promise<unknown>>;
  setEntry: (key: string, data: unknown, ttlMs: number) => void;
  removeEntry: (key: string) => void;
  removeByPrefix: (prefix: string) => void;
  setPending: (key: string, promise: Promise<unknown> | null) => void;
  clear: () => void;
};

export const useResourceCacheStore = create<ResourceCacheState>((set) => ({
  entries: {},
  pending: {},
  setEntry: (key, data, ttlMs) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [key]: {
          data,
          updatedAt: Date.now(),
          expiresAt: Date.now() + ttlMs,
        },
      },
    })),
  removeEntry: (key) =>
    set((state) => {
      const entries = { ...state.entries };
      delete entries[key];
      return { entries };
    }),
  removeByPrefix: (prefix) =>
    set((state) => ({
      entries: Object.fromEntries(
        Object.entries(state.entries).filter(([key]) => !key.startsWith(prefix))
      ),
      pending: Object.fromEntries(
        Object.entries(state.pending).filter(([key]) => !key.startsWith(prefix))
      ),
    })),
  setPending: (key, promise) =>
    set((state) => {
      const pending = { ...state.pending };

      if (promise) {
        pending[key] = promise;
      } else {
        delete pending[key];
      }

      return { pending };
    }),
  clear: () => set({ entries: {}, pending: {} }),
}));

export function peekCachedResource<T>(
  key: string,
): ResourceCacheEntry<T> | null {
  const entry = useResourceCacheStore.getState().entries[key];
  return (entry as ResourceCacheEntry<T> | undefined) ?? null;
}

export function getCachedResource<T>(
  key: string,
): ResourceCacheEntry<T> | null {
  const entry = peekCachedResource<T>(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    useResourceCacheStore.getState().removeEntry(key);
    return null;
  }

  return entry;
}

export function getPendingResource<T>(key: string): Promise<T> | null {
  const pending = useResourceCacheStore.getState().pending[key];
  return (pending as Promise<T> | undefined) ?? null;
}

export function setCachedResource(
  key: string,
  data: unknown,
  ttlMs: number,
): void {
  useResourceCacheStore.getState().setEntry(key, data, ttlMs);
}

export function setPendingResource(
  key: string,
  promise: Promise<unknown> | null,
): void {
  useResourceCacheStore.getState().setPending(key, promise);
}

export function invalidateResourceCache(key: string): void {
  useResourceCacheStore.getState().removeEntry(key);
  useResourceCacheStore.getState().setPending(key, null);
}

export function invalidateResourceCacheByPrefix(prefix: string): void {
  useResourceCacheStore.getState().removeByPrefix(prefix);
}

export function clearResourceCache(): void {
  useResourceCacheStore.getState().clear();
}
