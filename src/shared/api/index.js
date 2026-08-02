import { ENDPOINTS } from '../constants/endpoints';
import { createApiClient } from './apiClient';

export const authClient = createApiClient(ENDPOINTS.AUTH);
export const userClient = createApiClient(ENDPOINTS.USER);
export const adminClient = createApiClient(ENDPOINTS.ADMIN);
export const clientClient = createApiClient(ENDPOINTS.CLIENT);
