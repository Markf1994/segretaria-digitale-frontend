import { create } from 'zustand';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const getInitialToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  };

  return {
    token: getInitialToken(),
    setToken: (token) => {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
      set({ token });
    },
  };
});
