import { apiRawRequest, apiRequest } from '../client';
import type { ReportPhoto, ReportPhotoCategory } from '../types';

export interface UploadPhotosPayload {
  reportId: string;
  category: ReportPhotoCategory;
  files: File[];
}

export const photosApi = {
  upload: (p: UploadPhotosPayload) => {
    const fd = new FormData();
    fd.append('category', p.category);
    p.files.forEach((f) => fd.append('photos', f));
    return apiRequest<ReportPhoto[]>(`/reports/${p.reportId}/photos`, { method: 'POST', formData: fd });
  },
  remove: (reportId: string, photoId: string) =>
    apiRawRequest<null>(`/reports/${reportId}/photos/${photoId}`, { method: 'DELETE' }),
};
