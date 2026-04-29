import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Home Smart System Management</p>
      </div>

      <div className="dashboard-grid">
        <Link to="/admin/addresses" className="dashboard-card">
          <div className="card-icon">📍</div>
          <h2>Addresses</h2>
          <p>Manage delivery addresses</p>
        </Link>

        <Link to="/admin/esp-devices" className="dashboard-card">
          <div className="card-icon">📡</div>
          <h2>ESP Devices</h2>
          <p>Manage IoT devices</p>
        </Link>

        <Link to="/admin/furniture" className="dashboard-card">
          <div className="card-icon">🛋️</div>
          <h2>Furniture</h2>
          <p>Manage furniture items</p>
        </Link>

        <Link to="/admin/bindings" className="dashboard-card">
          <div className="card-icon">🔗</div>
          <h2>Bindings</h2>
          <p>Bind furniture with ESP & RFID</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
