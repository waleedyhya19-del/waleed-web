import { apiRequest } from '../client';
import type { PlatformSettings } from '../types';

export interface UpdatePlatformSettingsPayload {
  defaultLawyerDepositAmount?: number | null;
  maxRewardAmount?: number | null;
  serialLookupRateLimit?: number | null;
}

export const platformSettingsApi = {
  getReportWorkflow: () =>
    apiRequest<PlatformSettings>('/platform-settings/report-workflow'),
  updateReportWorkflow: (p: UpdatePlatformSettingsPayload) =>
    apiRequest<PlatformSettings>('/platform-settings/report-workflow', {
      method: 'PATCH',
      body: p,
    }),
};
