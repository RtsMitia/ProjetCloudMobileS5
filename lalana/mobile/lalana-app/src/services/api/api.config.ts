import axios, { AxiosInstance } from 'axios';
import { auth } from '@/services/firebase/firebase';

// Backend API URL - Change this based on your environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Axios instance for backend API calls
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

/**
 * Request interceptor to add Firebase token
 */
apiClient.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            try {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error('Error getting Firebase token:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            console.error('API Error:', error.response.status, error.response.data);

            if (error.response.status === 401) {
                // Unauthorized - redirect to login
                console.error('Unauthorized - please login again');
            }
        } else if (error.request) {
            // Request made but no response
            console.error('No response from server:', error.request);
        } else {
            console.error('Request error:', error.message);
        }
        return Promise.reject(error);
    }
);

export { apiClient, API_BASE_URL };
