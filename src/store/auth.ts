import { create } from 'zustand';

import { User } from '../types/user';

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const getInitialToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  };

  return {
    token: getInitialToken(),
    user: null,
    setToken: (token) => {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
      set({ token });
    },
    setUser: (user) => {
      set({ user });
    },
  };
});
