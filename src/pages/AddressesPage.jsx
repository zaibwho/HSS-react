import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { addressAPI } from '../services/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Layout, Card, Button, Input, Alert, Loading, EmptyState } from '../components/Common';
import CustomerNavigation from '../components/CustomerNavigation.jsx';
import { formatDate } from '../utils/helpers';
import '../styles/Management.css';

export const AddressesPage = () => {
  const { customer } = useCustomerAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    contact_name: '',
    contact_phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressAPI.getAll(customer?.id);
      setAddresses(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load addresses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      label: '',
      contact_name: '',
      contact_phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_default: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressAPI.update(editingId, formData);
        setSuccess('Address updated successfully');
      } else {
        await addressAPI.create(formData);
        setSuccess('Address added successfully');
      }
      fetchAddresses();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label || '',
      contact_name: address.contact_name || '',
      contact_phone: address.contact_phone || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country || '',
      is_default: address.is_default || false,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressAPI.delete(id);
        setSuccess('Address deleted successfully');
        fetchAddresses();
      } catch (err) {
        setError('Failed to delete address');
      }
    }
  };

  return (
    <Layout title="Manage Addresses">
      <CustomerNavigation />
      {error && <Alert type="danger" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <div className="header">
        <h2>Your Addresses</h2>
        <Button
          variant={showForm ? 'secondary' : 'primary'}
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        >
          {showForm ? 'Cancel' : '+ Add Address'}
        </Button>
      </div>

      {showForm && (
        <Card className="form-section">
          <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <Input
                type="text"
                name="label"
                label="Address Label"
                placeholder="e.g., Home, Office"
                value={formData.label}
                onChange={handleInputChange}
              />
              <Input
                type="text"
                name="contact_name"
                label="Contact Name"
                placeholder="e.g., John Doe"
                value={formData.contact_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-row">
              <Input
                type="text"
                name="contact_phone"
                label="Contact Phone"
                placeholder="e.g., +92-300-1234567"
                value={formData.contact_phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-row">
              <Input
                type="text"
                name="line1"
                label="Street Address"
                placeholder="e.g., 123 Main Street"
                value={formData.line1}
                onChange={handleInputChange}
                required
              />
              <Input
                type="text"
                name="line2"
                label="Apt, Suite, etc (optional)"
                placeholder="e.g., Apartment 4B"
                value={formData.line2}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-row">
              <Input
                type="text"
                name="city"
                label="City"
                placeholder="e.g., Lahore"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <Input
                type="text"
                name="state"
                label="State/Province"
                placeholder="e.g., Punjab"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-row">
              <Input
                type="text"
                name="postal_code"
                label="Postal Code"
                placeholder="e.g., 54000"
                value={formData.postal_code}
                onChange={handleInputChange}
              />
              <Input
                type="text"
                name="country"
                label="Country"
                placeholder="e.g., Pakistan"
                value={formData.country}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                />
                Set as default address
              </label>
            </div>
            <Button type="submit" variant="primary" fullWidth>
              {editingId ? 'Update Address' : 'Add Address'}
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <Loading />
      ) : addresses.length === 0 ? (
        <EmptyState
          title="No Addresses Yet"
          description="Add your first address to get started"
          action={<Button onClick={() => setShowForm(true)}>Add Address</Button>}
        />
      ) : (
        <div className="list-grid">
          {addresses.map(address => (
            <Card key={address.id}>
              <div className="list-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3>{address.label || address.city}</h3>
                  {address.is_default && (
                    <span style={{ background: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      Default
                    </span>
                  )}
                </div>
                {address.contact_name && (
                  <p style={{ color: 'var(--gray-600)', marginBottom: '0.25rem', fontWeight: '500' }}>
                    {address.contact_name}
                  </p>
                )}
                <p style={{ color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                  {address.line1}
                </p>
                {address.line2 && (
                  <p style={{ color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                    {address.line2}
                  </p>
                )}
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  {address.city}{address.state ? ', ' + address.state : ''} {address.postal_code}
                </p>
                {address.country && (
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                    {address.country}
                  </p>
                )}
                {address.contact_phone && (
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    <strong>Phone:</strong> {address.contact_phone}
                  </p>
                )}
                <div className="actions">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(address)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(address.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};
