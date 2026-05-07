import { apiClient } from './client';
import {
  ApiResponse,
  PaginatedResponse,
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateMePayload,
  UserListParams,
} from './types';

export const usersApi = {
  async list(params?: UserListParams): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>, UserListParams>(
      '/users',
      params
    );
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  async updateMe(data: UpdateMePayload): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(
      '/users/me',
      data
    );
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserPayload): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  async update(id: string, data: UpdateUserPayload): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(
      `/users/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
  },

  async registerDeviceToken(data: {
    token: string;
    platform?: string;
  }): Promise<void> {
    await apiClient.post<ApiResponse<{ message: string }>>(
      '/users/me/device-token',
      data
    );
  },
};
