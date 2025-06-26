import { create } from 'zustand';
import api from '../api/axios';
import { useAuthStore } from './auth';

export interface Notification {
  id: number;
  message: string;
  read?: boolean;
}

interface NotificheState {
  notifications: Notification[];
  fetch: () => Promise<void>;
}

export const useNotificheStore = create<NotificheState>((set) => ({
  notifications: [],
  fetch: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    const res = await api.get('/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    set({ notifications: res.data });
  }
}));
