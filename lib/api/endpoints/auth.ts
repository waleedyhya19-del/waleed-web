import { apiRequest, apiRawRequest } from '../client';
import type { AuthResponse, AuthTokens, Language, User } from '../types';

export interface SignupPayload {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  preferredLanguage?: Language;
}
export interface LoginPayload {
  email: string;
  password: string;
}
export interface GoogleOAuthPayload {
  idToken: string;
  preferredLanguage?: Language;
}
export interface ForgotPasswordPayload {
  email: string;
}
export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}
export interface ConfirmEmailPayload {
  token: string;
  email: string;
}
export interface ResendConfirmationPayload {
  email: string;
}
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
export interface SetPasswordPayload {
  newPassword: string;
}
export interface CreatePasswordPayload {
  newPassword: string;
}
export interface LinkEmailPayload {
  email: string;
  password: string;
}
export interface RefreshPayload {
  refreshToken: string;
}

export const authApi = {
  signup: (p: SignupPayload) =>
    apiRequest<AuthResponse>('/auth/signup', { method: 'POST', body: p, skipAuth: true }),
  login: (p: LoginPayload) =>
    apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: p, skipAuth: true }),
  googleOAuth: (p: GoogleOAuthPayload) =>
    apiRequest<AuthResponse>('/auth/oauth/google', {
      method: 'POST',
      body: p,
      skipAuth: true,
    }),
  forgotPassword: (p: ForgotPasswordPayload) =>
    apiRawRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: p,
      skipAuth: true,
    }),
  resetPassword: (p: ResetPasswordPayload) =>
    apiRawRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: p,
      skipAuth: true,
    }),
  confirmEmail: (p: ConfirmEmailPayload) =>
    apiRawRequest<{ message: string }>('/auth/confirm-email', {
      method: 'POST',
      body: p,
      skipAuth: true,
    }),
  resendConfirmation: (p: ResendConfirmationPayload) =>
    apiRawRequest<{ message: string }>('/auth/resend-confirmation', {
      method: 'POST',
      body: p,
      skipAuth: true,
    }),
  changePassword: (p: ChangePasswordPayload) =>
    apiRawRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: p,
    }),
  setPassword: (p: SetPasswordPayload) =>
    apiRawRequest<{ message: string }>('/auth/set-password', {
      method: 'POST',
      body: p,
    }),
  createPassword: (p: CreatePasswordPayload) =>
    apiRawRequest<{ message: string }>('/auth/create-password', {
      method: 'POST',
      body: p,
    }),
  linkEmail: (p: LinkEmailPayload) =>
    apiRawRequest<{ message: string }>('/auth/link-email', {
      method: 'POST',
      body: p,
    }),
  refresh: (p: RefreshPayload) =>
    apiRequest<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: p,
      skipAuth: true,
    }),
  logout: () => apiRawRequest<{ message: string }>('/auth/logout', { method: 'POST' }),
  session: () => apiRequest<User>('/users/me'),
  getMe: () => apiRequest<User>('/users/me'),
};
