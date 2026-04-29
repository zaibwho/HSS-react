import React from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import Addresses from './Addresses';
import Furniture from './Furniture';
import '../styles/Dashboard.css';

const CustomerDashboard = () => {
  const { customer, logout } = useCustomerAuth();

  if (!customer) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard-wrap">
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Welcome, {customer.name || customer.email}</h2>
          <p className="dashboard-sub">Manage your addresses and furniture</p>
        </div>
        <div>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="dashboard-column">
          <h3>Your Addresses</h3>
          <Addresses />
        </section>

        <section className="dashboard-column">
          <h3>Your Furniture</h3>
          <Furniture />
        </section>
      </main>
    </div>
  );
};

export default CustomerDashboard;
