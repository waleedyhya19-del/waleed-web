'use client';

import type { ReactNode } from 'react';
import { RoleGate } from '@/components/auth/role-gate';
import { AppShell } from '@/components/layout/app-shell';
import { portalNav } from '@/lib/nav/registry';

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGate roles={['END_USER']}>
      <AppShell groups={portalNav} variant="portal">
        {children}
      </AppShell>
    </RoleGate>
  );
}
