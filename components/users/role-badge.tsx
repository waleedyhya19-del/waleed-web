'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Role } from '@/lib/api/types';

interface RoleBadgeProps {
  role: Role;
}

const roleColors: Record<Role, string> = {
  [Role.END_USER]: 'bg-slate-500/12 text-slate-700 dark:text-slate-300',
  [Role.MODERATOR]: 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300',
  [Role.ADMIN]: 'bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300',
  [Role.LAWYER]: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
};

const roleKeys: Record<Role, string> = {
  [Role.END_USER]: 'endUser',
  [Role.MODERATOR]: 'moderator',
  [Role.ADMIN]: 'admin',
  [Role.LAWYER]: 'lawyer',
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const t = useTranslations('roles');

  return (
    <Badge className={`rounded-full px-2.5 py-1 ${roleColors[role]}`}>
      {t(roleKeys[role])}
    </Badge>
  );
}
