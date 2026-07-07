'use client';

import { useEffect } from 'react';
import { useRouter } from '@/lib/i18n/routing';
import { useSessionStore } from '@/stores/session-store';
import { roleHomeHref } from '@/lib/hooks/use-role-home';
import { LandingPage } from '@/components/landing/landing-page';

export default function Landing() {
  const router = useRouter();
  const { user, status } = useSessionStore();

  useEffect(() => {
    if (status === 'authed' && user) {
      router.replace(roleHomeHref(user.role));
    }
  }, [status, user, router]);

  return <LandingPage />;
}
