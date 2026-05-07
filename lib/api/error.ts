import type {
  ApiError,
  ApiErrorCategory,
  ApiErrorDetail,
  ApiErrorSource,
} from '@/lib/api/types';
import {
  getCategoryTitleKey,
  getErrorCopy,
  resolveMessageKey,
} from '@/lib/api/error-copy';
import { getRuntimeLocale, type RuntimeLocale } from '@/lib/i18n/runtime-locale';

const ERROR_CATEGORIES: ApiErrorCategory[] = [
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
];

const ERROR_SOURCES: ApiErrorSource[] = [
  'request',
  'body',
  'query',
  'param',
  'header',
  'database',
  'external',
  'server',
];

type CreateAppErrorInput = Partial<ApiError> & {
  cause?: unknown;
  message?: string;
};

export class AppError extends Error implements ApiError {
  statusCode: number;
  error: string;
  code: string;
  category: ApiErrorCategory;
  details: ApiErrorDetail[] | null;
  correlationId: string | null;
  timestamp: string | null;
  path: string | null;
  method: string | null;
  retriable: boolean;
  cause?: unknown;

  constructor(input: CreateAppErrorInput) {
    const details = normalizeDetails(input.details);
    const category = normalizeCategory(input.category, input.statusCode, details);
    const statusCode = normalizeStatusCode(input.statusCode, category);
    const message = normalizeMessage(input.message, details, category, statusCode);

    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;
    this.error = normalizeLabel(input.error, category, statusCode);
    this.message = message;
    this.code = normalizeCode(input.code, category, statusCode, details);
    this.category = category;
    this.details = details;
    this.correlationId = normalizeOptionalString(input.correlationId);
    this.timestamp = normalizeOptionalString(input.timestamp);
    this.path = normalizeOptionalString(input.path);
    this.method = normalizeOptionalString(input.method)?.toUpperCase() ?? null;
    this.retriable = normalizeRetriable(input.retriable, statusCode, category);
    this.cause = input.cause;
  }
}

export function createAppError(input: CreateAppErrorInput): AppError {
  return new AppError(input);
}

export function normalizeApiError(
  error: unknown,
  fallback = 'Something went wrong.',
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    const category: ApiErrorCategory =
      error.name === 'AbortError' || error instanceof TypeError
        ? 'NETWORK'
        : 'UNKNOWN';

    return createAppError({
      statusCode: category === 'NETWORK' ? 0 : 500,
      error: category === 'NETWORK' ? 'Network Error' : 'Unexpected Error',
      message: error.message || fallback,
      code: category === 'NETWORK' ? 'NETWORK_ERROR' : 'UNEXPECTED_ERROR',
      category,
      retriable: category === 'NETWORK',
      cause: error,
    });
  }

  if (isRecord(error)) {
    return createAppError({
      statusCode: parseNumber(error.statusCode),
      error: normalizeOptionalString(error.error) ?? undefined,
      message: normalizeOptionalString(error.message) ?? fallback,
      code: normalizeOptionalString(error.code) ?? undefined,
      category: isApiErrorCategory(error.category) ? error.category : undefined,
      details: normalizeDetails(error.details),
      correlationId: normalizeOptionalString(error.correlationId),
      timestamp: normalizeOptionalString(error.timestamp),
      path: normalizeOptionalString(error.path),
      method: normalizeOptionalString(error.method),
      retriable: typeof error.retriable === 'boolean' ? error.retriable : undefined,
      cause: 'cause' in error ? error.cause : undefined,
    });
  }

  return createAppError({
    statusCode: 500,
    error: 'Unexpected Error',
    message: fallback,
    code: 'UNEXPECTED_ERROR',
    category: 'UNKNOWN',
    cause: error,
  });
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.',
  locale?: string | null,
): string {
  const normalized = normalizeApiError(error, fallback);
  const runtimeLocale = getRuntimeLocale(locale);

  return resolveLocalizedPrimaryMessage(normalized, fallback, runtimeLocale);
}

export function getApiErrorTitle(
  error: unknown,
  fallback = 'Error',
  locale?: string | null,
): string {
  const normalized = normalizeApiError(error, fallback);
  const runtimeLocale = getRuntimeLocale(locale);
  const copy = getErrorCopy(runtimeLocale);

  if (
    normalized.category === 'AUTHENTICATION' &&
    resolveMessageKey(normalized.message) === 'accountLocked'
  ) {
    return copy.titles.authentication;
  }

  return copy.titles[getCategoryTitleKey(normalized.category)] ?? fallback;
}

export function getApiErrorDescription(
  error: unknown,
  fallback = 'Something went wrong.',
  locale?: string | null,
): string {
  const normalized = normalizeApiError(error, fallback);
  const runtimeLocale = getRuntimeLocale(locale);
  const copy = getErrorCopy(runtimeLocale);
  const primaryMessage = getApiErrorMessage(normalized, fallback, runtimeLocale);
  const detailMessages = getApiErrorDetailMessages(
    normalized,
    runtimeLocale,
  ).filter((message) => message.length > 0 && message !== primaryMessage);
  const summary = detailMessages.slice(0, 2).join(' | ');
  const reference = normalized.correlationId
    ? `${copy.referenceLabel}: ${normalized.correlationId}`
    : null;

  return [primaryMessage, summary || null, reference].filter(Boolean).join('\n');
}

export function getApiErrorDetails(error: unknown): ApiErrorDetail[] {
  return normalizeApiError(error).details ?? [];
}

export function getApiErrorReferenceLabel(locale?: string | null): string {
  return getErrorCopy(getRuntimeLocale(locale)).referenceLabel;
}

export function getApiErrorDetailMessages(
  error: unknown,
  locale?: string | null,
): string[] {
  const normalized = normalizeApiError(error);
  const runtimeLocale = getRuntimeLocale(locale);

  return (normalized.details ?? []).map((detail) =>
    localizeValidationDetail(detail, runtimeLocale),
  );
}

export function hasApiErrorStatus(
  error: unknown,
  ...statusCodes: number[]
): boolean {
  const normalized = normalizeApiError(error);
  return statusCodes.includes(normalized.statusCode);
}

function normalizeStatusCode(
  statusCode: unknown,
  category: ApiErrorCategory,
): number {
  const parsed = parseNumber(statusCode);

  if (typeof parsed === 'number') {
    return parsed;
  }

  if (category === 'NETWORK') {
    return 0;
  }

  return 500;
}

function normalizeLabel(
  label: unknown,
  category: ApiErrorCategory,
  statusCode: number,
): string {
  const normalized = normalizeOptionalString(label);

  if (normalized) {
    return normalized;
  }

  switch (category) {
    case 'VALIDATION':
      return 'Validation Error';
    case 'AUTHENTICATION':
      return 'Unauthorized';
    case 'AUTHORIZATION':
      return 'Forbidden';
    case 'NOT_FOUND':
      return 'Not Found';
    case 'CONFLICT':
      return 'Conflict';
    case 'RATE_LIMIT':
      return 'Too Many Requests';
    case 'DATABASE':
      return 'Database Error';
    case 'EXTERNAL':
      return 'External Service Error';
    case 'NETWORK':
      return 'Network Error';
    case 'UNKNOWN':
      return 'Unexpected Error';
    default:
      return statusCode >= 500 ? 'Server Error' : 'Request Error';
  }
}

function normalizeMessage(
  message: unknown,
  details: ApiErrorDetail[] | null,
  category: ApiErrorCategory,
  statusCode: number,
): string {
  const normalized = normalizeOptionalString(message);

  if (normalized) {
    return normalized;
  }

  if (details?.[0]?.message) {
    return details[0].message;
  }

  switch (category) {
    case 'VALIDATION':
      return 'Please review the highlighted fields and try again.';
    case 'AUTHENTICATION':
      return 'Your session is no longer valid. Please sign in again.';
    case 'AUTHORIZATION':
      return 'You do not have permission to perform this action.';
    case 'NOT_FOUND':
      return 'The requested resource could not be found.';
    case 'CONFLICT':
      return 'This request conflicts with the current resource state.';
    case 'RATE_LIMIT':
      return 'Too many requests were sent. Please wait and try again.';
    case 'DATABASE':
      return 'A database operation failed. Please try again.';
    case 'EXTERNAL':
      return 'An upstream service failed. Please try again.';
    case 'NETWORK':
      return 'Unable to reach the server. Please check your connection.';
    case 'UNKNOWN':
      return 'An unexpected error occurred.';
    default:
      return statusCode >= 500
        ? 'A server error occurred. Please try again later.'
        : 'The request could not be completed.';
  }
}

function normalizeCode(
  code: unknown,
  category: ApiErrorCategory,
  statusCode: number,
  details: ApiErrorDetail[] | null,
): string {
  const normalized = normalizeOptionalString(code);

  if (normalized) {
    return normalized;
  }

  if (category === 'VALIDATION' || (statusCode === 400 && details?.length)) {
    return 'VALIDATION_FAILED';
  }

  switch (category) {
    case 'AUTHENTICATION':
      return 'AUTHENTICATION_FAILED';
    case 'AUTHORIZATION':
      return 'FORBIDDEN';
    case 'NOT_FOUND':
      return 'RESOURCE_NOT_FOUND';
    case 'CONFLICT':
      return 'RESOURCE_CONFLICT';
    case 'RATE_LIMIT':
      return 'RATE_LIMIT_EXCEEDED';
    case 'DATABASE':
      return 'DATABASE_OPERATION_FAILED';
    case 'EXTERNAL':
      return 'EXTERNAL_SERVICE_FAILED';
    case 'NETWORK':
      return 'NETWORK_ERROR';
    case 'UNKNOWN':
      return 'UNEXPECTED_ERROR';
    default:
      return statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED';
  }
}

function normalizeCategory(
  category: unknown,
  statusCode: unknown,
  details?: ApiErrorDetail[] | null,
): ApiErrorCategory {
  if (isApiErrorCategory(category)) {
    return category;
  }

  const normalizedStatusCode = parseNumber(statusCode);

  if (normalizedStatusCode === 400 && details?.length) {
    return 'VALIDATION';
  }

  switch (normalizedStatusCode) {
    case 0:
      return 'NETWORK';
    case 400:
      return 'REQUEST';
    case 401:
      return 'AUTHENTICATION';
    case 403:
      return 'AUTHORIZATION';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'RATE_LIMIT';
    default:
      return typeof normalizedStatusCode === 'number' && normalizedStatusCode >= 500
        ? 'INTERNAL'
        : 'UNKNOWN';
  }
}

function normalizeRetriable(
  retriable: unknown,
  statusCode: number,
  category: ApiErrorCategory,
): boolean {
  if (typeof retriable === 'boolean') {
    return retriable;
  }

  return (
    category === 'NETWORK' ||
    [408, 425, 429, 500, 502, 503, 504].includes(statusCode)
  );
}

function normalizeDetails(rawDetails: unknown): ApiErrorDetail[] | null {
  if (!Array.isArray(rawDetails)) {
    return null;
  }

  const details = rawDetails
    .map((detail) => normalizeDetail(detail))
    .filter((detail): detail is ApiErrorDetail => detail !== null);

  return details.length > 0 ? details : null;
}

function normalizeDetail(rawDetail: unknown): ApiErrorDetail | null {
  if (typeof rawDetail === 'string') {
    return {
      message: rawDetail,
      source: 'request',
    };
  }

  if (!isRecord(rawDetail)) {
    return null;
  }

  const message = normalizeOptionalString(rawDetail.message);

  if (!message) {
    return null;
  }

  return {
    field: normalizeOptionalString(rawDetail.field) ?? undefined,
    code: normalizeOptionalString(rawDetail.code) ?? undefined,
    message,
    source: isApiErrorSource(rawDetail.source) ? rawDetail.source : undefined,
    rejectedValue: normalizeRejectedValue(rawDetail.rejectedValue),
  };
}

function normalizeRejectedValue(
  value: unknown,
): string | number | boolean | null | undefined {
  if (value === null) {
    return null;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  return undefined;
}

function normalizeOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function resolveLocalizedPrimaryMessage(
  error: AppError,
  fallback: string,
  locale: RuntimeLocale,
): string {
  const copy = getErrorCopy(locale);
  const messageKey = resolveMessageKey(error.message);

  if (messageKey) {
    return copy.messages[messageKey];
  }

  if (error.message) {
    if (locale === 'en') {
      return error.message;
    }

    if (containsArabicText(error.message)) {
      return error.message;
    }
  }

  switch (error.category) {
    case 'VALIDATION':
      return copy.messages.validation;
    case 'AUTHENTICATION':
      return copy.messages.sessionExpired;
    case 'AUTHORIZATION':
      return copy.messages.forbidden;
    case 'NOT_FOUND':
      return copy.messages.notFound;
    case 'CONFLICT':
      return copy.messages.conflict;
    case 'RATE_LIMIT':
      return copy.messages.rateLimit;
    case 'DATABASE':
      return copy.messages.database;
    case 'EXTERNAL':
      return copy.messages.external;
    case 'NETWORK':
      return copy.messages.network;
    case 'INTERNAL':
      return copy.messages.server;
    default:
      break;
  }

  if (locale === 'ar' && fallback && fallback !== 'Something went wrong.') {
    return fallback;
  }

  return copy.messages.unknown;
}

function localizeValidationDetail(
  detail: ApiErrorDetail,
  locale: RuntimeLocale,
): string {
  const copy = getErrorCopy(locale);
  const fieldKey = getFieldKey(detail.field);
  const ruleCode = detail.code ?? '';

  if (fieldKey && copy.fieldRuleMessages[fieldKey]?.[ruleCode]) {
    return copy.fieldRuleMessages[fieldKey][ruleCode];
  }

  if (detail.message && (locale === 'en' || containsArabicText(detail.message))) {
    return detail.message;
  }

  const fieldLabel =
    (fieldKey && copy.fieldLabels[fieldKey]) || detail.field || null;
  const validationRule = resolveValidationRule(detail.code, copy);

  if (!fieldLabel) {
    return validationRule;
  }

  return locale === 'ar'
    ? `${fieldLabel}: ${validationRule}`
    : `${fieldLabel} ${validationRule}`;
}

function resolveValidationRule(
  code: string | undefined,
  copy: ReturnType<typeof getErrorCopy>,
): string {
  switch (code) {
    case 'isNotEmpty':
    case 'isDefined':
      return copy.validationRules.required;
    case 'isEmail':
      return copy.validationRules.invalidEmail;
    case 'isPhoneNumber':
      return copy.validationRules.invalidPhone;
    case 'isEnum':
      return copy.validationRules.invalidChoice;
    case 'isString':
      return copy.validationRules.invalidText;
    case 'minLength':
      return copy.validationRules.minLength;
    case 'maxLength':
    case 'arrayMaxSize':
      return copy.validationRules.maxLength;
    case 'matches':
      return copy.validationRules.invalidFormat;
    default:
      return copy.validationRules.generic;
  }
}

function getFieldKey(field: string | undefined): string | null {
  if (!field) {
    return null;
  }

  const segments = field.split('.');
  return segments[segments.length - 1] ?? field;
}

function containsArabicText(value: string | null | undefined): boolean {
  return typeof value === 'string' && /[\u0600-\u06FF]/.test(value);
}

function parseNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function isApiErrorCategory(value: unknown): value is ApiErrorCategory {
  return typeof value === 'string' && ERROR_CATEGORIES.includes(value as ApiErrorCategory);
}

function isApiErrorSource(value: unknown): value is ApiErrorSource {
  return typeof value === 'string' && ERROR_SOURCES.includes(value as ApiErrorSource);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
