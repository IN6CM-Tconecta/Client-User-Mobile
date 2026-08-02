import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getHost = () => {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
    if (hostUri) {
        const ip = hostUri.split(':')[0];
        if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
            return ip;
        }
    }
    if (Platform.OS === 'android') {
        return '10.0.2.2';
    }
    return 'localhost';
};

const resolveUrl = (envUrl, defaultPort, defaultPath) => {
    const host = getHost();
    if (envUrl) {
        if (Platform.OS !== 'web' && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
            return envUrl.replace(/localhost|127\.0\.0\.1/g, host);
        }
        return envUrl;
    }
    return `http://${host}:${defaultPort}${defaultPath}`;
};

export const ENDPOINTS = {
    AUTH: resolveUrl(process.env.EXPO_PUBLIC_AUTH_URL, '8080', '/api'),
    ADMIN: resolveUrl(process.env.EXPO_PUBLIC_ADMIN_URL, '3001', '/TCONECTA/v1'),
    CLIENT: resolveUrl(process.env.EXPO_PUBLIC_CLIENT_URL, '3002', '/TRANSMETRO-CONECTA-CLIENTE/v1'),
    USER: resolveUrl(process.env.EXPO_PUBLIC_USER_URL, '3003', '/TRANSMETRO-CONECTA-USUARIO/v1')
};

