export function toLocaleTag(locale: string) {
  return locale === 'ar' ? 'ar-EG' : 'en-US';
}

export function formatDate(
  value: string | Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
) {
  const resolvedOptions =
    options && Object.keys(options).length > 0
      ? options
      : { dateStyle: 'medium' as const };

  return new Intl.DateTimeFormat(toLocaleTag(locale), {
    ...resolvedOptions,
  }).format(new Date(value));
}

export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(toLocaleTag(locale)).format(value);
}

export function formatDateTime(value: string | Date, locale: string) {
  return new Intl.DateTimeFormat(toLocaleTag(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
