import { apiClient } from './api.config';

export interface SyncResponse {
    success: boolean;
    message: string;
    firestoreToPostgres?: number;
    postgresToFirestore?: number;
}

export const syncApi = {
    /**
     * Sync Firestore to PostgreSQL
     */
    async syncFirestoreToPostgres(): Promise<SyncResponse> {
        const response = await apiClient.post('/api/sync/firestore-to-postgres');
        return response.data;
    },

    /**
     * Sync PostgreSQL to Firestore
     */
    async syncPostgresToFirestore(): Promise<SyncResponse> {
        const response = await apiClient.post('/api/sync/postgres-to-firestore');
        return response.data;
    },

    /**
     * Full bi-directional sync
     */
    async syncBidirectional(): Promise<SyncResponse> {
        const response = await apiClient.post('/api/sync/bidirectional');
        return response.data;
    },
};
