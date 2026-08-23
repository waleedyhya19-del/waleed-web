import { apiPaginated, apiRawRequest, apiRequest } from '../client';
import type {
  Paginated,
  PaginationQuery,
  Report,
  ReportCategory,
  ReportStatus,
  ReportType,
  ResolvedWipeState,
  RewardAuditEntry,
} from '../types';

export interface ListReportsQuery extends PaginationQuery {
  status?: ReportStatus;
  type?: ReportType;
  reportCategory?: ReportCategory;
  assignedToId?: string;
  assignedToMe?: boolean;
  search?: string;
}

export interface CreateReportPayload {
  type: ReportType;
  reportCategory: ReportCategory;
  imei1?: string;
  imei2?: string;
  phoneBrand?: string;
  phoneModel?: string;
  lastPhoneNumber1?: string;
  lastPhoneNumber2?: string;
  description?: string;
  lossDate?: string;
  lossArea?: string;
  lossAddress?: string;
  reporterFullName?: string;
  witnessFullName?: string;
  witnessLocation?: string;
  contactPhoneNumber?: string;
  paymentPhoneNumber?: string;
  hasReward?: boolean;
  rewardIfDataIntact?: number | null;
  rewardIfWiped?: number | null;
  userId?: string;
}

export interface CreateReportFiles {
  phoneBoxPhotos: File[];
  paymentReceiptPhoto?: File[];
  policeReportPhoto?: File[];
}

export type UpdateReportPayload = Partial<CreateReportPayload>;

export interface UpdateStatusPayload {
  status: ReportStatus;
  note?: string;
  resolvedWipeState?: ResolvedWipeState;
}

export interface AssignReportPayload {
  assignedToId: string | null;
}

export interface BulkAssignReportsPayload {
  reportIds: string[];
  assignedToId: string | null;
}

function buildCreateFormData(payload: CreateReportPayload, files: CreateReportFiles) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    fd.append(k, String(v));
  });
  files.phoneBoxPhotos.forEach((f) => fd.append('phoneBoxPhotos', f));
  files.paymentReceiptPhoto?.forEach((f) => fd.append('paymentReceiptPhoto', f));
  files.policeReportPhoto?.forEach((f) => fd.append('policeReportPhoto', f));
  return fd;
}

export const reportsApi = {
  list: (q: ListReportsQuery = {}): Promise<Paginated<Report>> =>
    apiPaginated<Report>('/reports', {
      query: q as Record<string, string | number | boolean | undefined>,
    }),
  get: (id: string) => apiRequest<Report>(`/reports/${id}`),
  rewardAudit: (id: string, q: PaginationQuery = {}) =>
    apiPaginated<RewardAuditEntry>(`/reports/${id}/reward-audit`, {
      query: q as Record<string, string | number | undefined>,
    }),
  create: (payload: CreateReportPayload, files: CreateReportFiles) =>
    apiRequest<Report>('/reports', {
      method: 'POST',
      formData: buildCreateFormData(payload, files),
    }),
  update: (id: string, p: UpdateReportPayload) =>
    apiRequest<Report>(`/reports/${id}`, { method: 'PATCH', body: p }),
  updateStatus: (id: string, p: UpdateStatusPayload) =>
    apiRequest<Report>(`/reports/${id}/status`, { method: 'PATCH', body: p }),
  assign: (id: string, p: AssignReportPayload) =>
    apiRequest<{
      reportId: string;
      assignedModerator: { id: string; displayName: string; assignedAt: string } | null;
    }>(`/reports/${id}/assignment`, { method: 'PATCH', body: p }),
  bulkAssign: (p: BulkAssignReportsPayload) =>
    apiRequest<{
      updatedCount: number;
      reports: Array<{ id: string; assignedModerator: { id: string; displayName: string; assignedAt: string } | null }>;
    }>('/reports/assignments/bulk', { method: 'POST', body: p }),
  remove: (id: string) =>
    apiRawRequest<{ message: string }>(`/reports/${id}`, { method: 'DELETE' }),
};
