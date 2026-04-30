import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Layout, Card, Button, Loading, Alert } from '../components/Common';
import AdminNavigation from '../components/AdminNavigation.jsx';
import api from '../services/api';
import '../styles/Dashboard.css';

export const AdminDashboard = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ customers: 0, shifts: 0, furniture: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [customersRes, shiftsRes] = await Promise.all([
        api.get('/customers?limit=1'),
        api.get('/shifts?limit=1'),
      ]);
      setStats({
        customers: customersRes.data.meta?.total || 0,
        shifts: shiftsRes.data.meta?.total || 0,
        furniture: 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <Layout title={`Welcome, ${admin?.name}`}>
      <AdminNavigation />
      <div className="admin-dashboard-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Manage customers, shifts, and RFID bindings</p>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-3">
            <Card>
              <div className="admin-feature-card">
                <div className="admin-feature-icon">👥</div>
                <h3>Customers</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', margin: '0.5rem 0' }}>
                  {stats.customers}
                </p>
                <Button fullWidth variant="primary" size="sm" onClick={() => navigate('/admin/customers')}>
                  View Customers
                </Button>
              </div>
            </Card>

            <Card>
              <div className="admin-feature-card">
                <div className="admin-feature-icon">🚚</div>
                <h3>Shifting Jobs</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', margin: '0.5rem 0' }}>
                  {stats.shifts}
                </p>
                <Button fullWidth variant="primary" size="sm" onClick={() => navigate('/admin/shifts')}>
                  View Shifts
                </Button>
              </div>
            </Card>

            <Card>
              <div className="admin-feature-card">
                <div className="admin-feature-icon">📡</div>
                <h3>RFID Binding</h3>
                <p>Bind RFID tags to furniture</p>
                <Button fullWidth variant="primary" size="sm" onClick={() => navigate('/admin/rfid-binding')}>
                  RFID Binding
                </Button>
              </div>
            </Card>
          </div>

          <Card style={{ marginTop: '2rem' }}>
            <div className="admin-card-header">
              <h3>Admin Info</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
              <div>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Name</p>
                <p style={{ fontWeight: 500 }}>{admin?.name}</p>
              </div>
              <div>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Email</p>
                <p style={{ fontWeight: 500 }}>{admin?.email}</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </Layout>
  );
};
