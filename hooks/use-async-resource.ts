'use client';

import {
  DependencyList,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  type AppError,
  getApiErrorMessage,
  normalizeApiError,
} from '@/lib/api/error';
import {
  getCachedResource,
  getPendingResource,
  peekCachedResource,
  setCachedResource,
  setPendingResource,
} from '@/stores/resource-cache-store';

interface UseAsyncResourceOptions<T> {
  fallbackMessage?: string;
  initialData?: T | null;
  cacheKey?: string;
  staleTimeMs?: number;
  keepStaleData?: boolean;
}

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  dependencies: DependencyList,
  options: UseAsyncResourceOptions<T> = {}
) {
  const initialCachedData = useMemo<T | null>(
    () => {
      if (!options.cacheKey) {
        return null;
      }

      return (
        getCachedResource<T>(options.cacheKey)?.data ??
        peekCachedResource<T>(options.cacheKey)?.data ??
        null
      );
    },
    [options.cacheKey]
  );
  const [data, setData] = useState<T | null>(
    options.initialData ?? initialCachedData ?? null
  );
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(!initialCachedData);
  const requestIdRef = useRef(0);
  const dataRef = useRef(data);
  const loaderRef = useRef(loader);
  const optionsRef = useRef({
    cacheKey: options.cacheKey,
    fallbackMessage: options.fallbackMessage ?? 'Unable to load data.',
    staleTimeMs: options.staleTimeMs ?? 30_000,
    keepStaleData: options.keepStaleData ?? true,
  });
  const dependencyKey = JSON.stringify([options.cacheKey ?? null, ...dependencies]);
  const fallbackMessage = optionsRef.current.fallbackMessage;

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    optionsRef.current = {
      cacheKey: options.cacheKey,
      fallbackMessage: options.fallbackMessage ?? 'Unable to load data.',
      staleTimeMs: options.staleTimeMs ?? 30_000,
      keepStaleData: options.keepStaleData ?? true,
    };
  }, [
    options.cacheKey,
    options.fallbackMessage,
    options.keepStaleData,
    options.staleTimeMs,
  ]);

  const load = useCallback(async (force = false) => {
    const requestId = ++requestIdRef.current;
    const {
      cacheKey,
      fallbackMessage: nextFallbackMessage,
      staleTimeMs,
      keepStaleData,
    } = optionsRef.current;
    const freshCache = cacheKey ? getCachedResource<T>(cacheKey) : null;
    const staleCache = cacheKey ? peekCachedResource<T>(cacheKey) : null;

    if (!force && freshCache) {
      startTransition(() => setData(freshCache.data));
      setError(null);
      setIsLoading(false);
      return freshCache.data;
    }

    if (!force && staleCache && keepStaleData) {
      startTransition(() => setData(staleCache.data));
    }

    if (!dataRef.current || !keepStaleData) {
      setIsLoading(true);
    }

    setError(null);

    const pendingRequest =
      !force && cacheKey ? getPendingResource<T>(cacheKey) : null;
    const request = pendingRequest ?? loaderRef.current();

    if (cacheKey && !pendingRequest) {
      setPendingResource(cacheKey, request);
    }

    try {
      const nextData = await request;

      if (requestId !== requestIdRef.current) {
        return null;
      }

      if (cacheKey) {
        setCachedResource(cacheKey, nextData, staleTimeMs);
      }

      startTransition(() => setData(nextData));

      return nextData;
    } catch (loaderError) {
      if (requestId !== requestIdRef.current) {
        return null;
      }

      setError(
        normalizeApiError(
          loaderError,
          nextFallbackMessage
        )
      );
      return null;
    } finally {
      if (cacheKey) {
        setPendingResource(cacheKey, null);
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [dependencyKey, load]);

  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  return {
    data,
    error,
    errorMessage: error
      ? getApiErrorMessage(
          error,
          fallbackMessage
        )
      : null,
    isLoading,
    refresh,
  };
}
