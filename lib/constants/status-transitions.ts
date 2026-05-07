import { ReportStatus } from '@/lib/api/types';

export const VALID_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  [ReportStatus.RECEIVED]: [
    ReportStatus.REVIEWING,
    ReportStatus.ESCALATED,
    ReportStatus.REJECTED,
  ],
  [ReportStatus.REVIEWING]: [
    ReportStatus.ESCALATED,
    ReportStatus.REJECTED,
    ReportStatus.RESOLVED,
  ],
  [ReportStatus.ESCALATED]: [ReportStatus.RESOLVED, ReportStatus.REJECTED],
  [ReportStatus.REJECTED]: [ReportStatus.CLOSED, ReportStatus.REVIEWING],
  [ReportStatus.RESOLVED]: [ReportStatus.CLOSED],
  [ReportStatus.CLOSED]: [],
};

export function canTransition(
  fromStatus: ReportStatus,
  toStatus: ReportStatus
): boolean {
  const allowedTransitions = VALID_TRANSITIONS[fromStatus];
  return allowedTransitions?.includes(toStatus) ?? false;
}
