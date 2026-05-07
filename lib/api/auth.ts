import { apiClient } from './client';
import {
  ApiResponse,
  LoginCredentials,
  AuthResponse,
  RefreshResponse,
  PasswordResetRequest,
  PasswordReset,
  ChangePassword,
  ConfirmEmail,
  ResendConfirmation,
  MessageResponse,
  User,
} from './types';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials,
      { skipAuthRefresh: true }
    );
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/auth/logout');
  },

  async forgotPassword(
    data: PasswordResetRequest
  ): Promise<ApiResponse<MessageResponse>> {
    return apiClient.post<ApiResponse<MessageResponse>>(
      '/auth/forgot-password',
      data,
      { skipAuthRefresh: true }
    );
  },

  async resetPassword(data: PasswordReset): Promise<ApiResponse<MessageResponse>> {
    return apiClient.post<ApiResponse<MessageResponse>>(
      '/auth/reset-password',
      data,
      { skipAuthRefresh: true }
    );
  },

  async confirmEmail(data: ConfirmEmail): Promise<ApiResponse<MessageResponse>> {
    return apiClient.post<ApiResponse<MessageResponse>>(
      '/auth/confirm-email',
      data,
      { skipAuthRefresh: true }
    );
  },

  async resendConfirmation(
    data: ResendConfirmation,
  ): Promise<ApiResponse<MessageResponse>> {
    return apiClient.post<ApiResponse<MessageResponse>>(
      '/auth/resend-confirmation',
      data,
      { skipAuthRefresh: true },
    );
  },

  async changePassword(
    data: ChangePassword
  ): Promise<ApiResponse<MessageResponse>> {
    return apiClient.post<ApiResponse<MessageResponse>>('/auth/change-password', data);
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await apiClient.post<ApiResponse<RefreshResponse>>(
      '/auth/refresh',
      { refreshToken },
      {
        skipAuthHeader: true,
        skipAuthRefresh: true,
      }
    );
    return response.data;
  },

  async getSession(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data;
  },
};
