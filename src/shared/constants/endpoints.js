import { Platform } from 'react-native';

const getHost = () => {
    if (Platform.OS === 'android') {
        // 10.0.2.2 is the special IP for Android Emulator to connect to host localhost
        return '10.0.2.2';
    }
    return 'localhost';
};

const HOST = getHost();

export const ENDPOINTS = {
    AUTH: process.env.EXPO_PUBLIC_AUTH_URL ?? `http://${HOST}:8080/api`,
    ADMIN: process.env.EXPO_PUBLIC_ADMIN_URL ?? `http://${HOST}:3001/TCONECTA/v1`,
    CLIENT: process.env.EXPO_PUBLIC_CLIENT_URL ?? `http://${HOST}:3002/TRANSMETRO-CONECTA-CLIENTE/v1`,
    USER: process.env.EXPO_PUBLIC_USER_URL ?? `http://${HOST}:3003/TRANSMETRO-CONECTA-USUARIO/v1`
};
