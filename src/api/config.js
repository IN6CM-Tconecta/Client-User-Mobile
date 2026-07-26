import { Platform } from 'react-native';

const getHost = () => {
    if (Platform.OS === 'android') {
        // 10.0.2.2 es la IP especial de Android Emulator para conectarse al localhost de la máquina host
        return '10.0.2.2';
    }
    return 'localhost';
};

const HOST = getHost();

export const API_URLS = {
    AUTH: `http://${HOST}:8080/api`,
    ADMIN: `http://${HOST}:3001/TCONECTA/v1`,
    CLIENT: `http://${HOST}:3002/TRANSMETRO-CONECTA-CLIENTE/v1`,
    USER: `http://${HOST}:3003/TRANSMETRO-CONECTA-USUARIO/v1`
};
