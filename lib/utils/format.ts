import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export function fmtDate(input: string | Date | null | undefined, locale: 'ar' | 'en' = 'en') {
  if (!input) return '';
  const d = typeof input === 'string' ? parseISO(input) : input;
  return format(d, 'PPP', { locale: locale === 'ar' ? ar : enUS });
}

export function fmtDateTime(input: string | Date | null | undefined, locale: 'ar' | 'en' = 'en') {
  if (!input) return '';
  const d = typeof input === 'string' ? parseISO(input) : input;
  return format(d, 'PPp', { locale: locale === 'ar' ? ar : enUS });
}

export function fmtRelative(input: string | Date | null | undefined, locale: 'ar' | 'en' = 'en') {
  if (!input) return '';
  const d = typeof input === 'string' ? parseISO(input) : input;
  return formatDistanceToNowStrict(d, { addSuffix: true, locale: locale === 'ar' ? ar : enUS });
}

export function fmtNumber(n: number | null | undefined, locale: 'ar' | 'en' = 'en') {
  if (n === null || n === undefined) return '';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(n);
}

export function fmtCurrency(n: number | null | undefined, locale: 'ar' | 'en' = 'en') {
  if (n === null || n === undefined) return '';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(n);
}
