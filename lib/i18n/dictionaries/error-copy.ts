import type { ApiError } from '@/lib/api/errors';

export function apiErrorKey(err: ApiError | Error | unknown): string {
  if (!err) return 'errors.generic';
  if (err instanceof Error && err.name === 'NetworkError') return 'errors.network';
  const anyErr = err as { statusCode?: number; category?: string };
  const cat = anyErr.category;
  if (cat === 'VALIDATION') return 'errors.validation';
  if (cat === 'AUTHENTICATION') return 'errors.unauthorized';
  if (cat === 'AUTHORIZATION') return 'errors.forbidden';
  if (cat === 'NOT_FOUND') return 'errors.notFound';
  if (cat === 'CONFLICT') return 'errors.conflict';
  if (cat === 'RATE_LIMIT') return 'errors.rateLimit';
  if (cat === 'INTERNAL') return 'errors.internal';
  const s = anyErr.statusCode;
  if (s === 400) return 'errors.validation';
  if (s === 401) return 'errors.unauthorized';
  if (s === 403) return 'errors.forbidden';
  if (s === 404) return 'errors.notFound';
  if (s === 409) return 'errors.conflict';
  if (s === 429) return 'errors.rateLimit';
  if (s && s >= 500) return 'errors.internal';
  return 'errors.generic';
}
