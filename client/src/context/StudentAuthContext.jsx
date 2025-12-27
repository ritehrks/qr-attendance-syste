import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

const StudentAuthContext = createContext();

export const StudentAuthProvider = ({ children }) => {
    const [student, setStudent] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('studentToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchStudent();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchStudent = async () => {
        try {
            const res = await axios.get(`${API_URL}/student-auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudent(res.data.data);
        } catch (error) {
            localStorage.removeItem('studentToken');
            setToken(null);
            setStudent(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/student-auth/login`, { email, password });
        const { token: newToken, ...studentData } = res.data.data;
        localStorage.setItem('studentToken', newToken);
        setToken(newToken);
        setStudent(studentData);
        return res.data;
    };

    const register = async (rollNo, name, email, password, phone, batch) => {
        const res = await axios.post(`${API_URL}/student-auth/register`, {
            rollNo, name, email, password, phone, batch
        });
        const { token: newToken, ...studentData } = res.data.data;
        localStorage.setItem('studentToken', newToken);
        setToken(newToken);
        setStudent(studentData);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('studentToken');
        setToken(null);
        setStudent(null);
    };

    const updateProfile = async (data) => {
        const res = await axios.put(`${API_URL}/student-auth/profile`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setStudent(res.data.data);
        return res.data;
    };

    const changePassword = async (currentPassword, newPassword) => {
        const res = await axios.put(`${API_URL}/student-auth/password`,
            { currentPassword, newPassword },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data;
    };

    const forgotPassword = async (email) => {
        const res = await axios.post(`${API_URL}/student-auth/forgot-password`, { email });
        return res.data;
    };

    const resetPassword = async (resetToken, password) => {
        const res = await axios.put(`${API_URL}/student-auth/reset-password/${resetToken}`, { password });
        return res.data;
    };

    const getAttendance = async () => {
        const res = await axios.get(`${API_URL}/student-auth/attendance`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    };

    return (
        <StudentAuthContext.Provider value={{
            student,
            token,
            loading,
            login,
            register,
            logout,
            updateProfile,
            changePassword,
            forgotPassword,
            resetPassword,
            getAttendance
        }}>
            {children}
        </StudentAuthContext.Provider>
    );
};

export const useStudentAuth = () => useContext(StudentAuthContext);

export default StudentAuthContext;
