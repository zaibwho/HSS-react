import React, { useState, useEffect } from 'react';
import { addressAPI, customerAPI } from '../services/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import '../styles/Management.css';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    label: '',
    contact_name: '',
    contact_phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    latitude: '',
    longitude: '',
    is_default: false,
  });

  const { customer } = useCustomerAuth();

  useEffect(() => {
    // If customer context exists, default to that customer and skip loading all customers
    if (customer) {
      setFormData((f) => ({ ...f, customer_id: customer.id }));
      return;
    }
    loadCustomers();
  }, [customer]);

  useEffect(() => {
    if (formData.customer_id) {
      loadAddresses();
    }
  }, [formData.customer_id]);

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data.data || []);
    } catch (err) {
      setError('Failed to load customers');
      console.error(err);
    }
  };

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const response = await addressAPI.getAll(formData.customer_id);
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await addressAPI.update(editingId, formData);
      } else {
        await addressAPI.create(formData);
      }
      loadAddresses();
      resetForm();
      setError('');
    } catch (err) {
      setError('Failed to save address');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setFormData(address);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await addressAPI.delete(id);
        loadAddresses();
      } catch (err) {
        setError('Failed to delete address');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      customer_id: formData.customer_id,
      label: '',
      contact_name: '',
      contact_phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      latitude: '',
      longitude: '',
      is_default: false,
    });
    setShowForm(false);
  };

  return (
    <div className="management-container">
      <h1>Manage Addresses</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="management-controls">
        {!customer && (
          <div className="customer-selector">
            <label htmlFor="customer">Select Customer:</label>
            <select
              id="customer"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleInputChange}
            >
              <option value="">-- Choose a customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.customer_id && (
          <button
            className="btn-primary"
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
          >
            {showForm ? 'Cancel' : 'Add Address'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-section">
          <h2>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="label"
                placeholder="Address Label"
                value={formData.label}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="contact_name"
                placeholder="Contact Name"
                value={formData.contact_name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <input
                type="tel"
                name="contact_phone"
                placeholder="Contact Phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="line1"
                placeholder="Address Line 1"
                value={formData.line1}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                name="line2"
                placeholder="Address Line 2"
                value={formData.line2}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="postal_code"
                placeholder="Postal Code"
                value={formData.postal_code}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleInputChange}
              />
              <input
                type="number"
                step="0.000001"
                name="latitude"
                placeholder="Latitude"
                value={formData.latitude}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <input
                type="number"
                step="0.000001"
                name="longitude"
                placeholder="Longitude"
                value={formData.longitude}
                onChange={handleInputChange}
              />
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                />
                Set as Default
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </form>
        </div>
      )}

      {loading && !showForm && <p>Loading addresses...</p>}

      <div className="items-list">
        <h2>Addresses ({addresses.length})</h2>
        {addresses.length === 0 ? (
          <p>No addresses found.</p>
        ) : (
          <div className="list-grid">
            {addresses.map((address) => (
              <div key={address.id} className="list-item">
                <h3>{address.label}</h3>
                <p>
                  <strong>Contact:</strong> {address.contact_name}
                </p>
                <p>
                  <strong>Phone:</strong> {address.contact_phone}
                </p>
                <p>
                  <strong>Address:</strong> {address.line1}, {address.city}, {address.state}
                </p>
                {address.is_default && <span className="badge-default">Default</span>}
                <div className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(address)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(address.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;
