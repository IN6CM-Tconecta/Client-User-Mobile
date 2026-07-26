import { create } from 'zustand';
import axios from 'axios';
import { API_URLS } from '../api/config';
import { useAuthStore } from './authStore';

export const useAlertsStore = create((set) => ({
    alerts: [],
    loading: false,

    fetchAlerts: async () => {
        try {
            set({ loading: true });
            const token = useAuthStore.getState().token;

            const response = await axios.get(`${API_URLS.ADMIN}/alerts`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            set({ alerts: response.data?.data || [], loading: false });
        } catch (error) {
            console.error('Error al obtener alertas:', error.message);
            set({ loading: false });
        }
    }
}));
