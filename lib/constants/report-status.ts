import { ReportStatus } from '@/lib/api/types';

export const VALID_TRANSITIONS: Readonly<Record<ReportStatus, readonly ReportStatus[]>> = {
  [ReportStatus.RECEIVED]: [ReportStatus.REVIEWING, ReportStatus.ESCALATED, ReportStatus.REJECTED],
  [ReportStatus.REVIEWING]: [ReportStatus.ESCALATED, ReportStatus.REJECTED, ReportStatus.RESOLVED],
  [ReportStatus.ESCALATED]: [ReportStatus.RESOLVED, ReportStatus.REJECTED],
  [ReportStatus.RESOLVED]: [ReportStatus.CLOSED],
  [ReportStatus.REJECTED]: [ReportStatus.CLOSED, ReportStatus.REVIEWING],
  [ReportStatus.CLOSED]: [],
};