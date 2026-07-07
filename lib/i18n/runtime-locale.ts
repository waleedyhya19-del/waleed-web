import type { Locale } from './routing';

let current: Locale = 'ar';

export function setRuntimeLocale(locale: Locale) {
  current = locale;
}
export function getRuntimeLocale(): Locale {
  return current;
}
