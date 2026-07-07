const AT_KEY = 'mmk_at';
const RT_KEY = 'mmk_rt';

export const tokenStorage = {
  read(): { accessToken: string | null; refreshToken: string | null } {
    if (typeof window === 'undefined')
      return { accessToken: null, refreshToken: null };
    return {
      accessToken: window.localStorage.getItem(AT_KEY),
      refreshToken: window.localStorage.getItem(RT_KEY),
    };
  },
  write(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(AT_KEY, accessToken);
    window.localStorage.setItem(RT_KEY, refreshToken);
  },
  clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(AT_KEY);
    window.localStorage.removeItem(RT_KEY);
  },
  keys: { AT_KEY, RT_KEY },
};
