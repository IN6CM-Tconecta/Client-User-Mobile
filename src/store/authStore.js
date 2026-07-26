import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URLS } from '../api/config';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,

    initAuth: async () => {
        try {
            const savedToken = await AsyncStorage.getItem('tconecta_mobile_token');
            const savedUser = await AsyncStorage.getItem('tconecta_mobile_user');

            if (savedToken) {
                set({
                    token: savedToken,
                    user: savedUser ? JSON.parse(savedUser) : null,
                    isAuthenticated: true
                });
            }
        } catch (e) {
            console.error('Error inicializando auth:', e);
        }
    },

    login: async (cui, password) => {
        try {
            set({ loading: true });
            const response = await axios.post(`${API_URLS.AUTH}/Auth/login`, { cui, password });
            const { token, userId, role } = response.data;

            const userData = { id: userId, cui, role };

            await AsyncStorage.setItem('tconecta_mobile_token', token);
            await AsyncStorage.setItem('tconecta_mobile_user', JSON.stringify(userData));

            set({
                token,
                user: userData,
                isAuthenticated: true,
                loading: false
            });

            return { success: true };
        } catch (error) {
            set({ loading: false });
            const message = error.response?.data?.message || 'Error al iniciar sesión';
            return { success: false, message };
        }
    },

    register: async (cui, email, password) => {
        try {
            set({ loading: true });
            const response = await axios.post(`${API_URLS.AUTH}/Auth/register`, { cui, email, password });
            const { token, userId, role } = response.data;

            const userData = { id: userId, cui, role };

            await AsyncStorage.setItem('tconecta_mobile_token', token);
            await AsyncStorage.setItem('tconecta_mobile_user', JSON.stringify(userData));

            set({
                token,
                user: userData,
                isAuthenticated: true,
                loading: false
            });

            return { success: true };
        } catch (error) {
            set({ loading: false });
            const message = error.response?.data?.message || 'Error al registrar usuario';
            return { success: false, message };
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem('tconecta_mobile_token');
        await AsyncStorage.removeItem('tconecta_mobile_user');
        set({ user: null, token: null, isAuthenticated: false });
    }
}));
