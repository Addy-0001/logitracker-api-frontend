import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
    baseURL: import.meta.env.VUE_APP_API_BASE_URL || 'http://localhost:5000/api/v1/',
    // /withCredentials: true, // Optional: use this if you're setting HTTP-only cookies
});

apiClient.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;