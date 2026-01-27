import { apiClient } from './api.config';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    idToken: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    email: string;
}

export const authApi = {
    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await apiClient.post('/api/auth/login', { email, password });
        return response.data;
    },

    /**
     * Verify Firebase token
     */
    async verifyToken(idToken: string): Promise<any> {
        const response = await apiClient.post('/api/auth/verify', { idToken });
        return response.data;
    },
};
