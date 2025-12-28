import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchAdmin();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchAdmin = async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdmin(res.data.admin);
        } catch (error) {
            // Only logout on 401 Unauthorized (invalid/expired token)
            // Keep user logged in for network errors or other temporary failures
            if (error.response?.status === 401) {
                console.error('Auth error:', error);
                logout();
            } else {
                console.error('Network error:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        const { token: newToken, admin: adminData } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setAdmin(adminData);
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
        const { token: newToken, admin: adminData } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setAdmin(adminData);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
