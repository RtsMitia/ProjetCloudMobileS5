import { apiClient } from './api.config';

export interface Probleme {
    id: string;
    libelle: string;
    created_at?: string;
}

export const problemeApi = {
    /**
     * Get all problemes
     */
    async getAll(): Promise<Probleme[]> {
        const response = await apiClient.get('/api/problemes');
        return response.data;
    },

    /**
     * Get probleme by ID
     */
    async getById(id: string): Promise<Probleme> {
        const response = await apiClient.get(`/api/problemes/${id}`);
        return response.data;
    },

    /**
     * Create new probleme
     */
    async create(libelle: string): Promise<Probleme> {
        const response = await apiClient.post('/api/problemes', { libelle });
        return response.data;
    },

    /**
     * Update probleme
     */
    async update(id: string, libelle: string): Promise<Probleme> {
        const response = await apiClient.put(`/api/problemes/${id}`, { libelle });
        return response.data;
    },

    /**
     * Delete probleme
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/problemes/${id}`);
    },
};
