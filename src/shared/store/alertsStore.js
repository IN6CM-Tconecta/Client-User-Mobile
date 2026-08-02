import { create } from 'zustand';
import { adminClient } from '../api';
import { useAuthStore } from './authStore';

export const useAlertsStore = create((set) => ({
    alerts: [],
    loading: false,

    fetchAlerts: async () => {
        try {
            set({ loading: true });
            const token = useAuthStore.getState().token;

            const response = await adminClient.get(`/alerts`);

            set({ alerts: response.data?.data || [], loading: false });
        } catch (error) {
            console.error('Error al obtener alertas:', error.message);
            set({ loading: false });
        }
    }
}));
