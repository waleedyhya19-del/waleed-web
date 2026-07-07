'use client';

import type { ReactNode } from 'react';
import { RoleGate } from '@/components/auth/role-gate';
import { AppShell } from '@/components/layout/app-shell';
import { staffNav } from '@/lib/nav/registry';

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGate roles={['MODERATOR', 'ADMIN', 'LAWYER']}>
      <AppShell groups={staffNav} variant="staff">
        {children}
      </AppShell>
    </RoleGate>
  );
}
