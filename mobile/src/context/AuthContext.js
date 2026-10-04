import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkStoredAuth();
    }, []);

    const checkStoredAuth = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user_data');
            const token = await AsyncStorage.getItem('access_token');
            if (storedUser && token) {
                setUser(JSON.parse(storedUser));
                // Verify latest profile from API
                fetchProfile();
            }
        } catch (e) {
            console.log('Error restoring auth:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile/');
            setUser(res.data);
            await AsyncStorage.setItem('user_data', JSON.stringify(res.data));
        } catch (e) {
            console.log('Profile fetch error:', e);
        }
    };

    const login = async (phone_number, password) => {
        const response = await api.post('/auth/login/', { phone_number, password });
        const { access, refresh, user: userData } = response.data;

        await AsyncStorage.setItem('access_token', access);
        await AsyncStorage.setItem('refresh_token', refresh);

        // Fetch full profile info
        const profileRes = await api.get('/auth/profile/', {
            headers: { Authorization: `Bearer ${access}` }
        });

        const fullUser = profileRes.data;
        setUser(fullUser);
        await AsyncStorage.setItem('user_data', JSON.stringify(fullUser));
        return fullUser;
    };

    const register = async (phone_number, full_name, password, confirm_password, role) => {
        await api.post('/auth/register/', {
            phone_number,
            full_name,
            password,
            confirm_password,
            role
        });
        // Auto login after registration
        return await login(phone_number, password);
    };

    const logout = async () => {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
