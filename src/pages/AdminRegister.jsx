import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Layout, Input, Button, Alert } from '../components/Common';
import '../styles/Auth.css';

export const AdminRegister = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAdminAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [localError, setLocalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.name || !formData.email || !formData.password) {
      setLocalError('All fields are required');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setLocalError('Passwords do not match');
      return;
    }

    const result = await register(formData);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      if (result.errors) {
        setFieldErrors(result.errors);
      } else {
        setLocalError(result.error);
      }
    }
  };

  return (
    <Layout>
      <div className="authContainer">
        <div className="authBox">
          <h1>Admin Registration</h1>
          <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>Create an admin account</p>

          {error && <Alert type="danger">{error}</Alert>}
          {localError && <Alert type="danger">{localError}</Alert>}

          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              name="name"
              label="Full Name"
              placeholder="Admin Name"
              value={formData.name}
              onChange={handleChange}
              error={fieldErrors.name?.[0]}
              required
            />

            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email?.[0]}
              required
            />

            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password?.[0]}
              required
            />

            <Input
              type="password"
              name="password_confirmation"
              label="Confirm Password"
              placeholder="••••••••"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
            />

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create Admin Account
            </Button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p>
              Already have an account? <Link to="/admin/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
