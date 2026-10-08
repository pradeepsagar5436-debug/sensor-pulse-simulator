import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify/fetch latest user profile
        fetchProfile();
      } catch (e) {
        logout();
      }
    } else {
      setLoading(false);
    }

    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      if (res.data?.success && res.data?.data) {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.warn('Could not refresh profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { accessToken, refreshToken, user: userData } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (fullName, email, password, phone) => {
    const res = await api.post('/auth/register', { fullName, email, password, phone });
    if (res.data?.success) {
      const { accessToken, refreshToken, user: userData } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return res.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (fullName, phone) => {
    const res = await api.put('/user/profile', { fullName, phone });
    if (res.data?.success) {
      const updatedUser = res.data.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return res.data;
    }
    throw new Error(res.data?.message || 'Profile update failed');
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    if (res.data?.success) {
      return res.data;
    }
    throw new Error(res.data?.message || 'Password update failed');
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    if (res.data?.success) {
      return res.data;
    }
    throw new Error(res.data?.message || 'Forgot password request failed');
  };

  const resetPassword = async (token, newPassword) => {
    const res = await api.post('/auth/reset-password', { token, newPassword });
    if (res.data?.success) {
      return res.data;
    }
    throw new Error(res.data?.message || 'Reset password failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
