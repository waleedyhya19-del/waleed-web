import { authApi } from '@/lib/api/endpoints';
import { tokenStorage } from '@/lib/auth/token-storage';
import { useSessionStore } from '@/stores/session-store';
import type { AuthResponse } from '@/lib/api/types';

export function commitAuthResponse(res: AuthResponse) {
  tokenStorage.write(res.accessToken, res.refreshToken);
  useSessionStore.getState().setUser(res.user);
  useSessionStore.getState().markFresh();
}

export async function loginAndCommit(email: string, password: string) {
  const res = await authApi.login({ email, password });
  commitAuthResponse(res);
  return res;
}

export async function signupAndCommit(payload: {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
}) {
  const res = await authApi.signup(payload);
  commitAuthResponse(res);
  return res;
}

export async function logoutAndReset() {
  try {
    await authApi.logout();
  } catch {
    /* ignore */
  }
  useSessionStore.getState().reset();
}
