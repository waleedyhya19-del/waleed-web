'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSessionStore } from '@/stores/session-store';
import { useRouter } from '@/lib/i18n/routing';
import type { Role } from '@/lib/api/types';
import { PageSpinner } from '@/components/shared/page-spinner';

interface RoleGateProps {
  roles: Role[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGate({ roles, fallback, children }: RoleGateProps) {
  const { user, status } = useSessionStore();
  const router = useRouter();

  useEffect(() => {
    if (status === 'guest') {
      router.replace('/login');
      return;
    }
    if (status === 'authed' && user && !roles.includes(user.role)) {
      router.replace('/forbidden');
    }
  }, [status, user, roles, router]);

  if (status === 'idle' || status === 'loading') {
    return fallback ?? <PageSpinner />;
  }
  if (!user || !roles.includes(user.role)) {
    return fallback ?? <PageSpinner />;
  }
  return <>{children}</>;
}
