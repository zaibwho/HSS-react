import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';

const CustomerProtectedRoute = ({ children }) => {
  const { token, loading } = useCustomerAuth();

  if (loading) return <div className="loading-container">Loading...</div>;

  if (!token) return <Navigate to="/login" replace />;

  return children;
};

export default CustomerProtectedRoute;
