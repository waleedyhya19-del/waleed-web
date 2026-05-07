'use client';

import { useEffect } from 'react';

interface LocaleDocumentSyncProps {
  locale: string;
  direction: 'ltr' | 'rtl';
}

export function LocaleDocumentSync({
  locale,
  direction,
}: LocaleDocumentSyncProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [direction, locale]);

  return null;
}
