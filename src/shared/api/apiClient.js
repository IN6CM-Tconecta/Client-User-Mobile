import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const createApiClient = (baseURL) => {
    const client = axios.create({
        baseURL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
    });

    client.interceptors.request.use(
        (config) => {
            const token = useAuthStore.getState().token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return client;
};
