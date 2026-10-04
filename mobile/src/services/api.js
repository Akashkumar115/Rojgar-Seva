import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL pointing to local Django REST server
export const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatic JWT Access Token injection
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Automatic JWT Token Refresh on 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if (refreshToken) {
                    const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                        refresh: refreshToken,
                    });
                    if (res.data.access) {
                        await AsyncStorage.setItem('access_token', res.data.access);
                        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshErr) {
                await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
