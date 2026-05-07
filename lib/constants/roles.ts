import { Role, ReportStatus } from '@/lib/api/types';
import type { Report } from '@/lib/api/types';

export { Role };

export function isAdmin(role: Role): boolean {
  return role === Role.ADMIN;
}

export function isModerator(role: Role): boolean {
  return role === Role.MODERATOR || role === Role.ADMIN;
}

export function isLawyer(role: Role): boolean {
  return role === Role.LAWYER;
}

export function canAccessRoute(role: Role, route: string): boolean {
  if (
    route.startsWith('/moderators') ||
    route.startsWith('/users/new') ||
    route.startsWith('/reports/new')
  ) {
    return role === Role.ADMIN;
  }
  if (route === '/' || route.startsWith('/reports')) {
    return (
      role === Role.MODERATOR ||
      role === Role.ADMIN ||
      role === Role.LAWYER
    );
  }
  if (route.startsWith('/users')) {
    return role === Role.MODERATOR || role === Role.ADMIN;
  }
  if (route === '/settings') {
    return role === Role.MODERATOR || role === Role.ADMIN;
  }
  return false;
}

export function canManageUsers(role: Role): boolean {
  return role === Role.ADMIN;
}

export function canEditReport(role: Role): boolean {
  return role === Role.ADMIN;
}

export function canLawyerActOnReport(
  role: Role,
  report: Pick<Report, 'assignedToId' | 'status'>,
  userId: string,
): boolean {
  return (
    role === Role.LAWYER &&
    report.assignedToId === userId &&
    report.status !== ReportStatus.CLOSED
  );
}
