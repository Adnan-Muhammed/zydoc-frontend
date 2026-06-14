import axios from 'axios';

let store: any;

export const injectStore = (_store: any) => {
    store = _store;
};
// baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",

    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        if (store) {
            const state = store.getState();
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
            } catch (refreshError) {
                if (store) {
                    store.dispatch({ type: 'auth/clearCredentials' });
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
