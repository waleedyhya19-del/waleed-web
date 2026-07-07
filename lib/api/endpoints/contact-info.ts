import { apiPaginated, apiRawRequest, apiRequest } from '../client';
import type { ContactInfo, ContactInfoType, Paginated, PaginationQuery } from '../types';

export interface ListContactInfoQuery extends PaginationQuery {
  type?: ContactInfoType;
}
export interface CreateContactInfoPayload {
  type: ContactInfoType;
  label: string;
  value: string;
  sortOrder?: number;
}
export type UpdateContactInfoPayload = Partial<CreateContactInfoPayload>;

export const contactInfoApi = {
  list: (q: ListContactInfoQuery = {}): Promise<Paginated<ContactInfo>> =>
    apiPaginated<ContactInfo>('/contact-info', {
      query: q as Record<string, string | number | undefined>,
    }),
  get: (id: string) => apiRequest<ContactInfo>(`/contact-info/${id}`),
  create: (p: CreateContactInfoPayload) =>
    apiRequest<ContactInfo>('/contact-info', { method: 'POST', body: p }),
  update: (id: string, p: UpdateContactInfoPayload) =>
    apiRequest<ContactInfo>(`/contact-info/${id}`, { method: 'PATCH', body: p }),
  remove: (id: string) =>
    apiRawRequest<{ message: string }>(`/contact-info/${id}`, { method: 'DELETE' }),
};
