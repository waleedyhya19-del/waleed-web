import { ApiError, NetworkError } from './errors';
import type { ApiErrorEnvelope, ApiMessage, ApiSuccess, Paginated, PaginatedMeta } from './types';
import { tokenStorage } from '@/lib/auth/token-storage';
import { getRuntimeLocale } from '@/lib/i18n/runtime-locale';
import { uuidv4 } from '@/lib/utils/uuid';

const DEFAULT_BASE = 'http://localhost:3000/api/v1';

function baseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE).replace(/\/+$/, '');
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: Method;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  formData?: FormData;
  signal?: AbortSignal;
  skipAuth?: boolean;
  headers?: Record<string, string>;
}

import { normalizeResponsePayload } from './normalize';

let refreshInFlight: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  const { refreshToken } = tokenStorage.read();
  if (!refreshToken) return null;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${baseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': uuidv4(),
        },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return null;
      const json = (await res.json()) as ApiSuccess<{
        accessToken: string;
        refreshToken: string;
      }>;
      const tokens = normalizeResponsePayload(json.data);
      if (!tokens?.accessToken || !tokens?.refreshToken) return null;
      tokenStorage.write(tokens.accessToken, tokens.refreshToken);
      return tokens.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

let onSessionExpired: (() => void) | null = null;
export function registerSessionExpiredHandler(fn: () => void) {
  onSessionExpired = fn;
}

function buildQuery(q?: RequestOptions['query']) {
  if (!q) return '';
  const usp = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    usp.append(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

async function coreRequest<T>(
  path: string,
  opts: RequestOptions,
  isRetry: boolean,
): Promise<{ data: T; meta?: PaginatedMeta; message?: ApiMessage }> {
  const method = opts.method ?? 'GET';
  const url = `${baseUrl()}${path}${buildQuery(opts.query)}`;

  const headers: Record<string, string> = {
    'X-Request-Id': uuidv4(),
    'X-Locale': getRuntimeLocale(),
    'Accept-Language': getRuntimeLocale(),
    ...(opts.headers ?? {}),
  };

  if (!opts.skipAuth) {
    const { accessToken } = tokenStorage.read();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }

  let body: BodyInit | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body, signal: opts.signal });
  } catch (e) {
    if ((e as { name?: string }).name === 'AbortError') throw e;
    throw new NetworkError();
  }

  if (res.status === 204) {
    return { data: undefined as unknown as T };
  }

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    if (res.status === 401 && !opts.skipAuth && !isRetry) {
      const newToken = await refreshTokens();
      if (newToken) {
        return coreRequest<T>(path, opts, true);
      }
      tokenStorage.clear();
      onSessionExpired?.();
    }
    const envelope: ApiErrorEnvelope =
      (payload as ApiErrorEnvelope) ?? {
        statusCode: res.status,
        error: res.statusText,
        message: res.statusText,
      };
    throw new ApiError({ ...envelope, statusCode: envelope.statusCode ?? res.status });
  }

  const success = payload as ApiSuccess<T>;
  const normalizedData = normalizeResponsePayload(success.data);
  return { data: normalizedData, meta: success.meta, message: success.message };
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { data } = await coreRequest<T>(path, opts, false);
  return data;
}

export async function apiPaginated<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<Paginated<T>> {
  const { data, meta } = await coreRequest<T[]>(path, opts, false);
  return { data, meta: meta ?? { nextCursor: null, hasMore: false } };
}

export async function apiRawRequest<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<{ data: T; meta?: PaginatedMeta; message?: ApiMessage }> {
  return coreRequest<T>(path, opts, false);
}
