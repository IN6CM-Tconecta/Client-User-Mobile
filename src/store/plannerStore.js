import { create } from 'zustand';
import axios from 'axios';
import { API_URLS } from '../api/config';
import { useAuthStore } from './authStore';
import { useWalletStore } from './walletStore';

export const usePlannerStore = create((set, get) => ({
    history: [],
    loading: false,

    planTrip: async (originLat, originLon, destLat, destLon, systemType = 'TRANSMETRO') => {
        try {
            set({ loading: true });
            const token = useAuthStore.getState().token;

            const response = await axios.post(
                `${API_URLS.CLIENT}/tours/plan`,
                {
                    originLat: parseFloat(originLat),
                    originLon: parseFloat(originLon),
                    destLat: parseFloat(destLat),
                    destLon: parseFloat(destLon),
                    systemType
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refrescar saldo en wallet store
            await useWalletStore.getState().fetchBalance();
            await get().fetchHistory();

            set({ loading: false });
            return { success: true, data: response.data?.data, warning: response.data?.warning };
        } catch (error) {
            set({ loading: false });
            const message = error.response?.data?.message || 'Error al planificar el viaje';
            return { success: false, message };
        }
    },

    fetchHistory: async () => {
        try {
            const token = useAuthStore.getState().token;
            if (!token) return;

            const response = await axios.get(`${API_URLS.CLIENT}/tours/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            set({ history: response.data?.data || [] });
        } catch (error) {
            console.error('Error al obtener historial de viajes:', error.message);
        }
    }
}));
