import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Button } from './Common';
import '../styles/CustomerNavigation.css';

export const CustomerNavigation = () => {
  const navigate = useNavigate();
  const { customer, logout } = useCustomerAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/customer/login');
  };

  return (
    <div className="customer-nav-shell">
      <div className="customer-nav-branding">
        <div>
          <div className="customer-nav-kicker">Customer</div>
          <div className="customer-nav-title">HSS Dashboard</div>
        </div>
        <div className="customer-nav-user">
          <span>{customer?.name || 'You'}</span>
        </div>
      </div>

      <nav className="customer-nav-links" aria-label="Customer navigation">
        <NavLink to="/customer/dashboard" end className={({ isActive }) => isActive ? 'customer-nav-link active' : 'customer-nav-link'}>
          Dashboard
        </NavLink>
        <NavLink to="/customer/addresses" className={({ isActive }) => isActive ? 'customer-nav-link active' : 'customer-nav-link'}>
          Addresses
        </NavLink>
        <NavLink to="/customer/furniture" className={({ isActive }) => isActive ? 'customer-nav-link active' : 'customer-nav-link'}>
          Furniture
        </NavLink>
        <NavLink to="/customer/shifts" className={({ isActive }) => isActive ? 'customer-nav-link active' : 'customer-nav-link'}>
          Shifts
        </NavLink>
      </nav>

      <div className="customer-nav-actions">
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default CustomerNavigation;
