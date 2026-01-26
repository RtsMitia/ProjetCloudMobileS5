import { apiClient } from './api.config';
import type { Signalement, SignalementRequest } from '@/types/firestore';

export const signalementApi = {
    /**
     * Get all signalements
     */
    async getAll(): Promise<Signalement[]> {
        const response = await apiClient.get('/api/signalements');
        return response.data;
    },

    /**
     * Get signalement by ID
     */
    async getById(id: string): Promise<Signalement> {
        const response = await apiClient.get(`/api/signalements/${id}`);
        return response.data;
    },

    /**
     * Get user's signalements
     */
    async getUserSignalements(): Promise<Signalement[]> {
        const response = await apiClient.get('/api/signalements/user');
        return response.data;
    },

    /**
     * Create new signalement
     */
    async create(data: SignalementRequest): Promise<Signalement> {
        const response = await apiClient.post('/api/signalements', data);
        return response.data;
    },

    /**
     * Update signalement status
     */
    async updateStatus(id: string, statusLibelle: string): Promise<Signalement> {
        const response = await apiClient.put(`/api/signalements/${id}/status`, { statusLibelle });
        return response.data;
    },

    /**
     * Delete signalement
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/signalements/${id}`);
    },

    /**
     * Get signalements by status
     */
    async getByStatus(status: string): Promise<Signalement[]> {
        const response = await apiClient.get(`/api/signalements/status/${status}`);
        return response.data;
    },
};
