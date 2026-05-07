import { apiClient } from './client';
import { ApiResponse, PlatformSettings } from './types';

export const platformSettingsApi = {
  async getReportWorkflow(): Promise<PlatformSettings> {
    const response = await apiClient.get<ApiResponse<PlatformSettings>>('/platform-settings/report-workflow');
    return response.data;
  },

  async updateReportWorkflow(data: { defaultLawyerDepositAmount: number | null }): Promise<PlatformSettings> {
    const response = await apiClient.patch<ApiResponse<PlatformSettings>>('/platform-settings/report-workflow', data);
    return response.data;
  },
};