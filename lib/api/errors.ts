import type { ApiErrorEnvelope, ErrorCategory, ErrorDetail } from './types';
import { pickMessage } from './message';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly category?: ErrorCategory;
  readonly details?: ErrorDetail[];
  readonly correlationId?: string;
  readonly raw?: ApiErrorEnvelope;

  constructor(envelope: ApiErrorEnvelope) {
    super(pickMessage(envelope.message) || envelope.error || 'Request failed');
    this.name = 'ApiError';
    this.statusCode = envelope.statusCode;
    this.code = envelope.code;
    this.category = envelope.category;
    this.details = envelope.details;
    this.correlationId = envelope.correlationId;
    this.raw = envelope;
  }

  get isUnauthenticated() {
    return this.statusCode === 401 || this.category === 'AUTHENTICATION';
  }
  get isForbidden() {
    return this.statusCode === 403 || this.category === 'AUTHORIZATION';
  }
  get isValidation() {
    return this.statusCode === 400 || this.category === 'VALIDATION';
  }
  get isNotFound() {
    return this.statusCode === 404 || this.category === 'NOT_FOUND';
  }
  get isConflict() {
    return this.statusCode === 409 || this.category === 'CONFLICT';
  }
  get isRateLimited() {
    return this.statusCode === 429 || this.category === 'RATE_LIMIT';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network unreachable') {
    super(message);
    this.name = 'NetworkError';
  }
}
