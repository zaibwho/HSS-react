import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Loading } from './Common';

export const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return children;
};

export default AdminProtectedRoute;
