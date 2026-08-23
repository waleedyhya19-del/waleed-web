import { authApi } from '@/lib/api/endpoints';
import { tokenStorage } from '@/lib/auth/token-storage';
import { useSessionStore } from '@/stores/session-store';
import type { AuthResponse } from '@/lib/api/types';

export function commitAuthResponse(res: AuthResponse) {
  if (res.accessToken && res.refreshToken) {
    tokenStorage.write(res.accessToken, res.refreshToken);
  }
  if (res.user) {
    useSessionStore.getState().setUser(res.user);
    useSessionStore.getState().markFresh();
  }
}

export async function loginAndCommit(email: string, password: string) {
  const res = await authApi.login({ email, password });
  commitAuthResponse(res);
  return res;
}

export async function signup(payload: {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
}) {
  return authApi.signup(payload);
}

export async function googleOAuthAndCommit(idToken: string) {
  const res = await authApi.googleOAuth({ idToken });
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
