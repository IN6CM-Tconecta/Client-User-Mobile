import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const createApiClient = (baseURL) => {
    const client = axios.create({
        baseURL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
    });

    client.interceptors.request.use(
        async (config) => {
            const token = await AsyncStorage.getItem('tconecta_mobile_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return client;
};

