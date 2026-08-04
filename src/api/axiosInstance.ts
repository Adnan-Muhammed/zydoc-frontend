// src/api/axiosInstance.ts
import axios, { AxiosInstance } from 'axios';
import type { Store } from '@reduxjs/toolkit';

// Lazily injected store — avoids circular imports between store and axios
let store: Store;

export const injectStore = (_store: Store) => {
    store = _store;
}; 

const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        if (store) {
            const state = store.getState() as { auth: { accessToken: string | null } };
            const token = state.auth.accessToken;
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Detect CORS / network-level errors (no response received)
        if (!error.response) {
            console.error(
                `[Axios] Network/CORS error on ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
                '\nThis is likely a CORS block or the backend is unreachable.',
                error.code
            );
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshResponse = await axios.post(
                    `${axiosInstance.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                const { accessToken } = refreshResponse.data;
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch {   
                if (store) {
                    store.dispatch({ type: 'auth/clearCredentials' });
                }
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
