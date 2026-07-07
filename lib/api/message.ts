import type { ApiMessage, LocalizedMessage } from './types';
import { getRuntimeLocale } from '@/lib/i18n/runtime-locale';

export function isLocalizedMessage(v: unknown): v is LocalizedMessage {
  return (
    !!v &&
    typeof v === 'object' &&
    'en' in (v as Record<string, unknown>) &&
    'ar' in (v as Record<string, unknown>)
  );
}

export function pickMessage(m: ApiMessage | undefined | null): string {
  if (!m) return '';
  if (typeof m === 'string') return m;
  if (isLocalizedMessage(m)) return m[getRuntimeLocale()] || m.en;
  return '';
}
