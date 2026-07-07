'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/errors';

export interface AsyncResourceState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  deps: unknown[] = [],
): AsyncResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const run = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError(null);
    try {
      const result = await loaderRef.current();
      if (!controller.signal.aborted) {
        setData(result);
        setIsLoading(false);
      }
    } catch (e) {
      if ((e as { name?: string }).name === 'AbortError') return;
      setError(e instanceof Error ? e : new Error(String(e)));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void run();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, isLoading, refresh: run };
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
