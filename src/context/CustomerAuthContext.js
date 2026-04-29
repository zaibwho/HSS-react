import React, { createContext, useState, useContext, useEffect } from 'react';
import { customerAuthAPI } from '../services/api';

const CustomerAuthContext = createContext();

export const CustomerAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('customer_token'));
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
      const response = await customerAuthAPI.getCurrentCustomer();
      setCustomer(response.data.data.customer);
      setError(null);
    } catch (err) {
      localStorage.removeItem('customer_token');
      setToken(null);
      setUser(null);
      setCustomer(null);
      setError('Token expired or invalid');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerAuthAPI.login(email, password);
      const { token, customer } = response.data.data;
      localStorage.setItem('customer_token', token);
      setToken(token);
      setCustomer(customer);
      return { success: true, customer };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, password_confirmation, phone) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerAuthAPI.register(name, email, password, password_confirmation, phone);
      const { token, customer } = response.data.data;
      localStorage.setItem('customer_token', token);
      setToken(token);
      setCustomer(customer);
      return { success: true, customer };
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = 'Registration failed';
      if (errorData) {
        if (errorData.errors) {
          errorMessage = Object.values(errorData.errors).flat().join(' ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      setError(errorMessage);
      return { success: false, error: errorMessage, errors: errorData?.errors };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await customerAuthAPI.logout();
    } catch (err) {
      console.error('Customer logout error:', err);
    } finally {
      localStorage.removeItem('customer_token');
      setToken(null);
      setUser(null);
      setCustomer(null);
      setError(null);
    }
  };

  return (
    <CustomerAuthContext.Provider value={{ user, customer, token, loading, error, login, register, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return context;
};
