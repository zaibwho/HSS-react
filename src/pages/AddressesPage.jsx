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
    address: '',
    city: '',
    postal_code: '',
    country: '',
    notes: '',
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
      address: '',
      city: '',
      postal_code: '',
      country: '',
      notes: '',
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
      address: address.address,
      city: address.city,
      postal_code: address.postal_code,
      country: address.country,
      notes: address.notes || '',
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
                name="address"
                label="Street Address"
                placeholder="e.g., 123 Main Street"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
              <Input
                type="text"
                name="city"
                label="City"
                placeholder="e.g., Lahore"
                value={formData.city}
                onChange={handleInputChange}
                required
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
              <textarea
                name="notes"
                placeholder="Additional notes (optional)"
                value={formData.notes}
                onChange={handleInputChange}
                style={{ minHeight: '80px' }}
              />
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
                <h3>{address.city}</h3>
                <p style={{ color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                  {address.address}
                </p>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  {address.postal_code}, {address.country}
                </p>
                {address.notes && (
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    <strong>Notes:</strong> {address.notes}
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
