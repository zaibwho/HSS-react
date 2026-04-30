import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Layout, Card, Button, Badge } from '../components/Common';
import CustomerNavigation from '../components/CustomerNavigation.jsx';
import '../styles/Dashboard.css';

export const CustomerDashboard = () => {
  const { customer, logout } = useCustomerAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/customer/login');
  };

  return (
    <Layout title={`Welcome, ${customer?.name}`}>
      <CustomerNavigation />
      <div className="admin-dashboard-header">
        <div>
          <h2>Your Moving Dashboard</h2>
          <p>Manage your addresses, furniture, and shifting jobs</p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid grid-3">
        <Card>
          <div className="admin-feature-card">
            <div className="admin-feature-icon">📍</div>
            <h3>Addresses</h3>
            <p>Manage your pickup and delivery addresses</p>
            <Link to="/customer/addresses">
              <Button fullWidth variant="primary" size="sm">
                Manage Addresses
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="admin-feature-card">
            <div className="admin-feature-icon">🪑</div>
            <h3>Furniture</h3>
            <p>Add and manage your furniture items</p>
            <Link to="/customer/furniture">
              <Button fullWidth variant="primary" size="sm">
                Manage Furniture
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="admin-feature-card">
            <div className="admin-feature-icon">🚚</div>
            <h3>Shifting Jobs</h3>
            <p>Create and track your shifting jobs</p>
            <Link to="/customer/shifts">
              <Button fullWidth variant="primary" size="sm">
                View Shifts
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card style={{ marginTop: '2rem' }}>
        <div className="admin-card-header">
          <h3>Quick Info</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
          <div>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Email</p>
            <p style={{ fontWeight: 500 }}>{customer?.email}</p>
          </div>
          <div>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Phone</p>
            <p style={{ fontWeight: 500 }}>{customer?.phone || 'Not provided'}</p>
          </div>
          <div>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>CNIC</p>
            <p style={{ fontWeight: 500 }}>{customer?.cnic || 'Not provided'}</p>
          </div>
        </div>
      </Card>
    </Layout>
  );
};
