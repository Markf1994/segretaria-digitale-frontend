import { create } from 'zustand';
interface NotificheState { count: number; setCount: (n: number) => void; }
export const useNotificheStore = create<NotificheState>(set => ({ count: 0, setCount: (n) => set({ count: n }) }));