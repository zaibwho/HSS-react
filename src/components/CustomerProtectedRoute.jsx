import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Loading } from './Common';

export const CustomerProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useCustomerAuth();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/customer/login" replace />;

  return children;
};

export default CustomerProtectedRoute;
