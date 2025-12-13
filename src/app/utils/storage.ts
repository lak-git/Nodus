

const STORAGE_KEYS = {
  REPORTS: 'field_responder_reports',
  USER: 'field_responder_user',
  AUTH_TOKEN: 'field_responder_auth',
};

export const storage = {
  // Auth
  setAuthToken: (token: string) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  
  getAuthToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  
  clearAuthToken: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  
  // User
  setUser: (user: { email: string; name: string }) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  
  getUser: (): { email: string; name: string } | null => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },
  
  clearUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  
  clearAllData: () => {
    localStorage.clear();
  },
};
