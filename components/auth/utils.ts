'use client';

import { useSearchParams } from 'next/navigation';
export { Link, useRouter, usePathname } from '@/lib/i18n/routing';

export function useSearchParamsCompat() {
  return useSearchParams();
}
