import axios from 'axios';

/**
 * Wizard-specific API client that uses Next.js API routes
 * This is separate from the main API client which uses NestJS backend for auth
 */
const wizardApi = axios.create({
    baseURL: '/api', // Relative path - uses same origin (Next.js)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests (same as main API client)
wizardApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 (Unauthorized)
wizardApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default wizardApi;
