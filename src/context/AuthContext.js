import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
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
      setUser(response.data.data);
      setError(null);
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setError('Token expired or invalid');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(name, email, password, password_confirmation);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      console.error('Auth register error:', err);
      const errorData = err.response?.data;
      let errorMessage = 'Registration failed';
      if (errorData) {
        if (errorData.errors) {
          errorMessage = Object.values(errorData.errors).flat().join(' ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        errors: errorData?.errors,
        raw: err.response?.data ?? err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
