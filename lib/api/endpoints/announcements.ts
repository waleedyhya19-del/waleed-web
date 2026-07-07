import { apiPaginated, apiRawRequest, apiRequest } from '../client';
import type { Announcement, Paginated, PaginationQuery } from '../types';

export interface ListAnnouncementsQuery extends PaginationQuery {
  isActive?: boolean;
}
export interface CreateAnnouncementPayload {
  title: string;
  body: string;
  isActive?: boolean;
  sortOrder?: number;
}
export type UpdateAnnouncementPayload = Partial<CreateAnnouncementPayload>;

export const announcementsApi = {
  list: (q: ListAnnouncementsQuery = {}): Promise<Paginated<Announcement>> =>
    apiPaginated<Announcement>('/announcements', {
      query: q as Record<string, string | number | boolean | undefined>,
    }),
  get: (id: string) => apiRequest<Announcement>(`/announcements/${id}`),
  create: (p: CreateAnnouncementPayload) =>
    apiRequest<Announcement>('/announcements', { method: 'POST', body: p }),
  update: (id: string, p: UpdateAnnouncementPayload) =>
    apiRequest<Announcement>(`/announcements/${id}`, { method: 'PATCH', body: p }),
  remove: (id: string) =>
    apiRawRequest<{ message: string }>(`/announcements/${id}`, { method: 'DELETE' }),
};
