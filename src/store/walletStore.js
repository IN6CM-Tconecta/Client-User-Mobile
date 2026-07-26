import { create } from 'zustand';
import axios from 'axios';
import { API_URLS } from '../api/config';
import { useAuthStore } from './authStore';

export const useWalletStore = create((set, get) => ({
    balance: 0,
    courtesyTrips: 5,
    loading: false,

    fetchBalance: async () => {
        try {
            const token = useAuthStore.getState().token;
            if (!token) return;

            const response = await axios.get(`${API_URLS.CLIENT}/wallets/balance`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const bal = response.data?.data?.balance ?? 0;
            const trips = response.data?.data?.courtesyTrips ?? 5;

            set({ balance: bal, courtesyTrips: trips });
            return bal;
        } catch (error) {
            console.error('Error obteniendo saldo:', error.message);
            return 0;
        }
    },

    purchaseCard: async (cardNumber, expirationDate, cvv) => {
        try {
            set({ loading: true });
            const token = useAuthStore.getState().token;

            const response = await axios.post(
                `${API_URLS.AUTH}/Transaction/purchase-card`,
                { cardNumber, expirationDate, cvv, amount: 20.00 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await get().fetchBalance();
            set({ loading: false });
            return { success: true, message: response.data?.message || 'Tarjeta Ciudadana adquirida exitosamente.' };
        } catch (error) {
            set({ loading: false });
            const message = error.response?.data?.message || 'Error al comprar la tarjeta';
            return { success: false, message };
        }
    },

    rechargeWallet: async (cardNumber, expirationDate, cvv, amount) => {
        try {
            set({ loading: true });
            const token = useAuthStore.getState().token;

            const response = await axios.post(
                `${API_URLS.AUTH}/Transaction/recharge`,
                { cardNumber, expirationDate, cvv, amount: parseFloat(amount) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await get().fetchBalance();
            set({ loading: false });
            return { success: true, message: response.data?.message || 'Recarga procesada exitosamente.' };
        } catch (error) {
            set({ loading: false });
            const message = error.response?.data?.message || 'Error al recargar saldo';
            return { success: false, message };
        }
    }
}));
