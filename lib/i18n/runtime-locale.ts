export type RuntimeLocale = 'ar' | 'en';

const SUPPORTED_LOCALES = new Set<RuntimeLocale>(['ar', 'en']);

export function getRuntimeLocale(locale?: string | null): RuntimeLocale {
  if (locale && SUPPORTED_LOCALES.has(locale as RuntimeLocale)) {
    return locale as RuntimeLocale;
  }

  if (typeof window !== 'undefined') {
    const pathLocale = window.location.pathname.split('/').filter(Boolean)[0];

    if (SUPPORTED_LOCALES.has(pathLocale as RuntimeLocale)) {
      return pathLocale as RuntimeLocale;
    }

    const htmlLang = document.documentElement.lang
      .toLowerCase()
      .split('-')[0];

    if (SUPPORTED_LOCALES.has(htmlLang as RuntimeLocale)) {
      return htmlLang as RuntimeLocale;
    }
  }

  return 'en';
}
