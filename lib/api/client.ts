import type {
  ApiError,
  ApiErrorCategory,
  ApiErrorDetail,
  ApiResponse,
  PaginatedResponse,
} from './types';
import { createAppError } from './error';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '@/lib/auth/token';
import { getRuntimeLocale } from '@/lib/i18n/runtime-locale';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
const REFRESH_ENDPOINT = '/auth/refresh';
let refreshRequest: Promise<boolean> | null = null;

export interface ApiRequestOptions {
  skipAuthRefresh?: boolean;
  skipAuthHeader?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(
    headers?: HeadersInit,
    options: ApiRequestOptions = {},
    body?: BodyInit | null,
  ): HeadersInit {
    const mergedHeaders = new Headers(headers);

    const isFormData =
      typeof FormData !== 'undefined' && body instanceof FormData;

    if (!isFormData && !mergedHeaders.has('Content-Type')) {
      mergedHeaders.set('Content-Type', 'application/json');
    }

    if (!mergedHeaders.has('Accept-Language')) {
      mergedHeaders.set('Accept-Language', getRuntimeLocale());
    }

    if (typeof window !== 'undefined' && !options.skipAuthHeader) {
      const token = getAccessToken();

      if (token) {
        mergedHeaders.set('Authorization', `Bearer ${token}`);
      }
    }

    return mergedHeaders;
  }

  private buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const url = new URL(`${this.baseUrl}${endpoint}`, origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value !== 'undefined' && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return undefined;
    }

    const rawBody = await response.text();

    if (!rawBody) {
      return undefined;
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(rawBody) as unknown;
      } catch {
        return rawBody;
      }
    }

    return rawBody;
  }

  private async request<T>(
    endpoint: string,
    init: RequestInit,
    params?: Record<string, unknown>,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const method = init.method ?? 'GET';

    let response: Response;

    try {
      response = await fetch(url, {
        ...init,
        method,
        headers: this.getHeaders(init.headers, options, init.body),
      });
    } catch (error) {
      throw createAppError({
        statusCode: 0,
        error: 'Network Error',
        message: 'Unable to reach the server. Please check your connection.',
        code: 'NETWORK_ERROR',
        category: 'NETWORK',
        path: new URL(url).pathname,
        method,
        retriable: true,
        cause: error,
      });
    }

    const body = await this.parseResponseBody(response);

    if (!response.ok) {
      if (
        response.status === 401 &&
        !options.skipAuthRefresh &&
        this.shouldAttemptRefresh(endpoint)
      ) {
        const refreshed = await this.refreshSession();

        if (refreshed) {
          return this.request<T>(endpoint, init, params, {
            ...options,
            skipAuthRefresh: true,
          });
        }
      }

      throw this.buildApiError(response, body, method);
    }

    if (typeof body === 'undefined') {
      return undefined as T;
    }

    return body as T;
  }

  async get<T, P extends object = Record<string, unknown>>(
    endpoint: string,
    params?: P,
    options?: ApiRequestOptions,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: 'GET' },
      params as Record<string, unknown>,
      options,
    );
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions,
  ): Promise<T> {
    const body =
      typeof data === 'undefined'
        ? undefined
        : typeof FormData !== 'undefined' && data instanceof FormData
          ? data
          : JSON.stringify(data);

    return this.request<T>(endpoint, {
      method: 'POST',
      body,
    }, undefined, options);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions,
  ): Promise<T> {
    const body =
      typeof data === 'undefined'
        ? undefined
        : typeof FormData !== 'undefined' && data instanceof FormData
          ? data
          : JSON.stringify(data);

    return this.request<T>(endpoint, {
      method: 'PATCH',
      body,
    }, undefined, options);
  }

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, undefined, options);
  }

  private buildApiError(
    response: Response,
    body: unknown,
    method: string,
  ) {
    const parsedBody = isRecord(body) ? body : null;

    return createAppError({
      statusCode: response.status,
      error:
        normalizeOptionalString(parsedBody?.error) ??
        response.statusText ??
        'Request Failed',
      message:
        normalizeOptionalString(parsedBody?.message) ??
        (typeof body === 'string' && body.trim().length > 0
          ? body
          : undefined),
      code: normalizeOptionalString(parsedBody?.code),
      category: normalizeApiErrorCategory(parsedBody?.category),
      details: normalizeApiErrorDetails(parsedBody?.details),
      correlationId:
        normalizeOptionalString(parsedBody?.correlationId) ??
        response.headers.get('x-request-id'),
      timestamp: normalizeOptionalString(parsedBody?.timestamp),
      path:
        normalizeOptionalString(parsedBody?.path) ?? new URL(response.url).pathname,
      method:
        normalizeOptionalString(parsedBody?.method) ?? method,
      retriable: response.status >= 500 || response.status === 429,
    });
  }

  private shouldAttemptRefresh(endpoint: string) {
    if (typeof window === 'undefined') {
      return false;
    }

    if (endpoint === REFRESH_ENDPOINT) {
      return false;
    }

    return Boolean(getRefreshToken());
  }

  private async refreshSession(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    if (refreshRequest) {
      return refreshRequest;
    }

    refreshRequest = this.performRefresh().finally(() => {
      refreshRequest = null;
    });

    return refreshRequest;
  }

  private async performRefresh(): Promise<boolean> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuthTokens();
      return false;
    }

    let response: Response;

    try {
      response = await fetch(this.buildUrl(REFRESH_ENDPOINT), {
        method: 'POST',
        headers: this.getHeaders(undefined, {
          skipAuthHeader: true,
          skipAuthRefresh: true,
        }),
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      clearAuthTokens();
      return false;
    }

    const body = await this.parseResponseBody(response);

    if (!response.ok) {
      clearAuthTokens();
      return false;
    }

    const parsedBody = isRecord(body) ? body : null;
    const data = parsedBody?.data;

    if (!isRecord(data)) {
      clearAuthTokens();
      return false;
    }

    const nextAccessToken = normalizeOptionalString(data.accessToken);
    const nextRefreshToken =
      normalizeOptionalString(data.refreshToken) ?? refreshToken;

    if (!nextAccessToken) {
      clearAuthTokens();
      return false;
    }

    setAuthTokens({
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
    });

    return true;
  }
}

function normalizeOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

const VALID_API_ERROR_CATEGORIES: ReadonlySet<ApiErrorCategory> = new Set([
  'VALIDATION',
  'REQUEST',
  'AUTHENTICATION',
  'AUTHORIZATION',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMIT',
  'DATABASE',
  'EXTERNAL',
  'INTERNAL',
  'NETWORK',
  'UNKNOWN',
]);

function normalizeApiErrorCategory(
  value: unknown,
): ApiErrorCategory | undefined {
  return typeof value === 'string' && VALID_API_ERROR_CATEGORIES.has(value as ApiErrorCategory)
    ? (value as ApiErrorCategory)
    : undefined;
}

function normalizeApiErrorDetails(
  value: unknown,
): ApiErrorDetail[] | null | undefined {
  return Array.isArray(value) ? (value as ApiErrorDetail[]) : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export const apiClient = new ApiClient(BASE_URL);
export type { ApiResponse, PaginatedResponse, ApiError };
