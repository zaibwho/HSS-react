import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Layout, Input, Button, Alert } from '../components/Common';
import '../styles/Auth.css';

export const CustomerLogin = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useCustomerAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setLocalError('Email and password are required');
      return;
    }
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/customer/dashboard');
    } else {
      setLocalError(result.error);
    }
  };

  return (
    <Layout>
      <div className="authContainer">
        <div className="authBox">
          <h1>Welcome Back</h1>
          <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>Sign in to your account</p>

          {error && <Alert type="danger">{error}</Alert>}
          {localError && <Alert type="danger">{localError}</Alert>}

          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              Don't have an account? <Link to="/customer/register">Sign up</Link>
            </p>
            <p style={{ color: 'var(--gray-600)', marginBottom: '0.5rem' }}>Are you an admin?</p>
            <Link to="/admin/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>
              Admin Sign In →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};
