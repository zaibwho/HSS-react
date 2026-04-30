import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Button } from './Common';
import '../styles/AdminNavigation.css';

export const AdminNavigation = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-nav-shell">
      <div className="admin-nav-branding">
        <div>
          <div className="admin-nav-kicker">Admin Panel</div>
          <div className="admin-nav-title">HSS Control Center</div>
        </div>
        <div className="admin-nav-user">
          <span>{admin?.name || 'Administrator'}</span>
        </div>
      </div>

      <nav className="admin-nav-links" aria-label="Admin navigation">
        <NavLink to="/admin/dashboard" end className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/customers" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
          Customers
        </NavLink>
        <NavLink to="/admin/shifts" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
          Shifts
        </NavLink>
        <NavLink to="/admin/rfid-binding" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
          RFID Binding
        </NavLink>
      </nav>

      <div className="admin-nav-actions">
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminNavigation;