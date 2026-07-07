import { apiPaginated, apiRawRequest, apiRequest } from '../client';
import type { Language, Paginated, PaginationQuery, Role, User } from '../types';

export interface CreateUserPayload {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  role: Role;
  preferredLanguage?: Language;
}
export interface AdminUpdateUserPayload {
  displayName?: string;
  phone?: string;
  role?: Role;
  preferredLanguage?: Language;
}
export interface UpdateProfilePayload {
  displayName?: string;
  phone?: string;
  preferredLanguage?: Language;
}
export interface ListUsersQuery extends PaginationQuery {
  role?: Role;
  search?: string;
}
export interface DeviceTokenPayload {
  token: string;
  platform?: string;
}

export const usersApi = {
  create: (p: CreateUserPayload) =>
    apiRequest<User>('/users', { method: 'POST', body: p }),
  list: (q: ListUsersQuery = {}): Promise<Paginated<User>> =>
    apiPaginated<User>('/users', { query: q as Record<string, string | number | undefined> }),
  me: () => apiRequest<User>('/users/me'),
  updateMe: (p: UpdateProfilePayload) =>
    apiRequest<User>('/users/me', { method: 'PATCH', body: p }),
  uploadMePhoto: (file: File) => {
    const fd = new FormData();
    fd.append('photo', file);
    return apiRequest<{ profilePhotoUrl: string }>('/users/me/photo', { method: 'PATCH', formData: fd });
  },
  deleteMePhoto: () =>
    apiRawRequest<{ message: string }>('/users/me/photo', { method: 'DELETE' }),
  deleteMe: () => apiRawRequest<{ message: string }>('/users/me', { method: 'DELETE' }),
  getById: (id: string) => apiRequest<User>(`/users/${id}`),
  updateById: (id: string, p: AdminUpdateUserPayload) =>
    apiRequest<User>(`/users/${id}`, { method: 'PATCH', body: p }),
  deleteById: (id: string) =>
    apiRawRequest<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
  registerDeviceToken: (p: DeviceTokenPayload) =>
    apiRawRequest<{ message: string }>('/users/me/device-token', {
      method: 'POST',
      body: p,
    }),
  unregisterDeviceToken: (token: string) =>
    apiRawRequest<{ message: string }>('/users/me/device-token', {
      method: 'DELETE',
      body: { token },
    }),
};
