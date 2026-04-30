import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setAdmin(response.data.data);
      setError(null);
    } catch (err) {
      localStorage.removeItem('admin_token');
      setToken(null);
      setAdmin(null);
      setError('Token expired or invalid');
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, user: adminData } = response.data.data;
      localStorage.setItem('admin_token', newToken);
      setToken(newToken);
      setAdmin(adminData);
      return { success: true, admin: adminData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(
        data.name,
        data.email,
        data.password,
        data.password_confirmation
      );
      const { token: newToken, user: adminData } = response.data.data;
      localStorage.setItem('admin_token', newToken);
      setToken(newToken);
      setAdmin(adminData);
      return { success: true, admin: adminData };
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = 'Registration failed';
      if (errorData) {
        if (errorData.errors) {
          errorMessage = Object.values(errorData.errors).flat().join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      setError(errorMessage);
      return { success: false, error: errorMessage, errors: errorData?.errors };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Admin logout error:', err);
    } finally {
      localStorage.removeItem('admin_token');
      setToken(null);
      setAdmin(null);
      setError(null);
    }
  }, []);

  return (
    <AdminAuthContext.Provider 
      value={{ 
        admin, 
        token, 
        loading, 
        error, 
        login, 
        register, 
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
