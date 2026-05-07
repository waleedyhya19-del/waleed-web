import { apiClient } from './client';
import {
  ApiResponse,
  CreateReportPayload,
  PaginatedResponse,
  Report,
  ReportListParams,
  UpdateReportPayload,
  UpdateReportStatusPayload,
  ReportPhoto,
  ReportPhotoCategory,
} from './types';

export const reportsApi = {
  async create(data: FormData | CreateReportPayload): Promise<Report> {
    const response = await apiClient.post<ApiResponse<Report>>('/reports', data);
    return response.data;
  },

  async list(
    params?: ReportListParams
  ): Promise<PaginatedResponse<Report>> {
    return apiClient.get<PaginatedResponse<Report>, ReportListParams>(
      '/reports',
      params
    );
  },

  async getById(id: string): Promise<Report> {
    const response = await apiClient.get<ApiResponse<Report>>(`/reports/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateReportPayload): Promise<Report> {
    const response = await apiClient.patch<ApiResponse<Report>>(
      `/reports/${id}`,
      data
    );
    return response.data;
  },

  async updateStatus(
    id: string,
    data: UpdateReportStatusPayload
  ): Promise<Report> {
    const response = await apiClient.patch<ApiResponse<Report>>(
      `/reports/${id}/status`,
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/reports/${id}`);
  },

  async assign(reportId: string, assignedToId: string): Promise<Report> {
    const response = await apiClient.patch<ApiResponse<Report>>(
      `/reports/${reportId}/assignment`,
      { assignedToId }
    );
    return response.data;
  },

  async bulkAssign(reportIds: string[], assignedToId: string): Promise<{ updatedCount: number }> {
    const response = await apiClient.post<ApiResponse<{ updatedCount: number }>>(
      '/reports/assignments/bulk',
      { reportIds, assignedToId }
    );
    return response.data;
  },

  async uploadPhotos(
    reportId: string,
    category: ReportPhotoCategory,
    files: File[]
  ): Promise<ReportPhoto[]> {
    const formData = new FormData();
    formData.append('category', category);
    files.forEach((file) => {
      formData.append('photos', file);
    });

    const response = await apiClient.post<ApiResponse<ReportPhoto[]>>(
      `/reports/${reportId}/photos`,
      formData
    );
    return response.data;
  },

  async deletePhoto(reportId: string, photoId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(
      `/reports/${reportId}/photos/${photoId}`
    );
  },
};