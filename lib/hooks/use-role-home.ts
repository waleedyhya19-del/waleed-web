import type { Role } from '@/lib/api/types';

export function roleHomeHref(role: Role): string {
  switch (role) {
    case 'END_USER':
      return '/portal';
    case 'MODERATOR':
    case 'ADMIN':
    case 'LAWYER':
      return '/staff';
    default:
      return '/login';
  }
}
