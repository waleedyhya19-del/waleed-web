export interface ReportStatusUpdatedEvent {
  reportId: string;
  status: string;
  actionSummary: string;
  note?: string;
  deliveredVia: string;
  timestamp: string;
}

export const REALTIME_EVENTS = {
  REPORT_STATUS_UPDATED: 'report.status.updated',
} as const;