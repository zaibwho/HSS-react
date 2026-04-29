import React, { useState, useEffect } from 'react';
import { furnitureAPI, customerAPI } from '../services/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import '../styles/Management.css';

const Furniture = () => {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    furniture_type: '',
    rfid_uid: '',
    description: '',
    default_weight_kg: '',
    length_cm: '',
    width_cm: '',
    height_cm: '',
    fragile: false,
    stackable: true,
  });

  const { customer } = useCustomerAuth();

  useEffect(() => {
    if (customer) {
      setFormData((f) => ({ ...f, customer_id: customer.id }));
      return;
    }
    loadCustomers();
  }, [customer]);

  useEffect(() => {
    if (formData.customer_id) {
      loadFurniture();
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

  const loadFurniture = async () => {
    setLoading(true);
    try {
      const response = await furnitureAPI.getAll(formData.customer_id);
      setItems(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load furniture');
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
        await furnitureAPI.update(editingId, formData);
      } else {
        await furnitureAPI.create(formData);
      }
      loadFurniture();
      resetForm();
      setError('');
    } catch (err) {
      setError('Failed to save furniture');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await furnitureAPI.delete(id);
        loadFurniture();
      } catch (err) {
        setError('Failed to delete furniture');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      customer_id: formData.customer_id,
      furniture_type: '',
      rfid_uid: '',
      description: '',
      default_weight_kg: '',
      length_cm: '',
      width_cm: '',
      height_cm: '',
      fragile: false,
      stackable: true,
    });
    setShowForm(false);
  };

  return (
    <div className="management-container">
      <h1>Furniture Management</h1>

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
            {showForm ? 'Cancel' : 'Add Furniture'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-section">
          <h2>{editingId ? 'Edit Furniture' : 'Add New Furniture'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="furniture_type"
                placeholder="Furniture Type (e.g., Chair, Table)"
                value={formData.furniture_type}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="rfid_uid"
                placeholder="RFID UID"
                value={formData.rfid_uid}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-row">
              <input
                type="number"
                step="0.01"
                name="default_weight_kg"
                placeholder="Weight (kg)"
                value={formData.default_weight_kg}
                onChange={handleInputChange}
              />
              <input
                type="number"
                step="0.01"
                name="length_cm"
                placeholder="Length (cm)"
                value={formData.length_cm}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <input
                type="number"
                step="0.01"
                name="width_cm"
                placeholder="Width (cm)"
                value={formData.width_cm}
                onChange={handleInputChange}
              />
              <input
                type="number"
                step="0.01"
                name="height_cm"
                placeholder="Height (cm)"
                value={formData.height_cm}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="fragile"
                  checked={formData.fragile}
                  onChange={handleInputChange}
                />
                Fragile
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="stackable"
                  checked={formData.stackable}
                  onChange={handleInputChange}
                />
                Stackable
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Furniture'}
            </button>
          </form>
        </div>
      )}

      {loading && !showForm && <p>Loading furniture...</p>}

      <div className="items-list">
        <h2>Furniture Items ({items.length})</h2>
        {items.length === 0 ? (
          <p>No furniture found.</p>
        ) : (
          <div className="list-grid">
            {items.map((item) => (
              <div key={item.id} className="list-item">
                <h3>{item.furniture_type}</h3>
                {item.rfid_uid && (
                  <p>
                    <strong>RFID:</strong> {item.rfid_uid}
                  </p>
                )}
                {item.description && (
                  <p>
                    <strong>Description:</strong> {item.description}
                  </p>
                )}
                <p>
                  <strong>Dimensions:</strong> {item.length_cm} × {item.width_cm} × {item.height_cm} cm
                </p>
                <p>
                  <strong>Weight:</strong> {item.default_weight_kg} kg
                </p>
                <div className="flags">
                  {item.fragile && <span className="flag-fragile">Fragile</span>}
                  {item.stackable && <span className="flag-stackable">Stackable</span>}
                </div>
                <div className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(item.id)}
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

export default Furniture;
