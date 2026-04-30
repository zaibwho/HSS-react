import React, { useState, useEffect } from 'react';
import { furnitureAPI } from '../services/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Layout, Card, Button, Input, Select, Alert, Loading, EmptyState, TextArea } from '../components/Common';
import CustomerNavigation from '../components/CustomerNavigation.jsx';
import '../styles/Management.css';

const FURNITURE_TYPES = [
  { value: 'sofa', label: 'Sofa' },
  { value: 'chair', label: 'Chair' },
  { value: 'table', label: 'Table' },
  { value: 'bed', label: 'Bed' },
  { value: 'wardrobe', label: 'Wardrobe' },
  { value: 'desk', label: 'Desk' },
  { value: 'bookshelf', label: 'Bookshelf' },
  { value: 'tv_stand', label: 'TV Stand' },
  { value: 'other', label: 'Other' },
];

export const FurniturePage = () => {
  const { customer } = useCustomerAuth();
  const [furniture, setFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    furniture_type: '',
    description: '',
    quantity: 1,
    default_weight_kg: '',
    length_cm: '',
    width_cm: '',
    height_cm: '',
    fragile: false,
    stackable: false,
  });

  useEffect(() => {
    fetchFurniture();
  }, []);

  const fetchFurniture = async () => {
    try {
      setLoading(true);
      const response = await furnitureAPI.getAll(customer?.id);
      setFurniture(response.data.data || []);
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      furniture_type: '',
      description: '',
      quantity: 1,
      default_weight_kg: '',
      length_cm: '',
      width_cm: '',
      height_cm: '',
      fragile: false,
      stackable: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        default_weight_kg: formData.default_weight_kg ? parseFloat(formData.default_weight_kg) : null,
        length_cm: formData.length_cm ? parseFloat(formData.length_cm) : null,
        width_cm: formData.width_cm ? parseFloat(formData.width_cm) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
      };

      if (editingId) {
        await furnitureAPI.update(editingId, submitData);
        setSuccess('Furniture updated successfully');
      } else {
        await furnitureAPI.create(submitData);
        setSuccess('Furniture added successfully');
      }
      fetchFurniture();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save furniture');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      furniture_type: item.furniture_type,
      description: item.description,
      quantity: item.quantity || 1,
      default_weight_kg: item.default_weight_kg || '',
      length_cm: item.length_cm || '',
      width_cm: item.width_cm || '',
      height_cm: item.height_cm || '',
      fragile: item.fragile || false,
      stackable: item.stackable || false,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this furniture item?')) {
      try {
        await furnitureAPI.delete(id);
        setSuccess('Furniture deleted successfully');
        fetchFurniture();
      } catch (err) {
        setError('Failed to delete furniture');
      }
    }
  };

  return (
    <Layout title="Manage Furniture">
      <CustomerNavigation />
      {error && <Alert type="danger" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <div className="header">
        <h2>Your Furniture</h2>
        <Button
          variant={showForm ? 'secondary' : 'primary'}
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        >
          {showForm ? 'Cancel' : '+ Add Furniture'}
        </Button>
      </div>

      {showForm && (
        <Card className="form-section">
          <h3>{editingId ? 'Edit Furniture' : 'Add New Furniture'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <Select
                name="furniture_type"
                label="Furniture Type"
                value={formData.furniture_type}
                onChange={handleInputChange}
                options={FURNITURE_TYPES}
                required
              />
              <Input
                type="number"
                name="quantity"
                label="Quantity"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <TextArea
                name="description"
                label="Description"
                placeholder="e.g., Black leather sofa in good condition"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Dimensions & Weight</h4>
            <div className="form-row">
              <Input
                type="number"
                name="length_cm"
                label="Length (cm)"
                placeholder="e.g., 200"
                step="0.01"
                value={formData.length_cm}
                onChange={handleInputChange}
              />
              <Input
                type="number"
                name="width_cm"
                label="Width (cm)"
                placeholder="e.g., 100"
                step="0.01"
                value={formData.width_cm}
                onChange={handleInputChange}
              />
              <Input
                type="number"
                name="height_cm"
                label="Height (cm)"
                placeholder="e.g., 80"
                step="0.01"
                value={formData.height_cm}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <Input
                type="number"
                name="default_weight_kg"
                label="Weight (kg)"
                placeholder="e.g., 50"
                step="0.01"
                value={formData.default_weight_kg}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="fragile"
                  checked={formData.fragile}
                  onChange={handleInputChange}
                  style={{ width: 'auto' }}
                />
                <span>Fragile</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="stackable"
                  checked={formData.stackable}
                  onChange={handleInputChange}
                  style={{ width: 'auto' }}
                />
                <span>Stackable</span>
              </label>
            </div>

            <Button type="submit" variant="primary" fullWidth>
              {editingId ? 'Update Furniture' : 'Add Furniture'}
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <Loading />
      ) : furniture.length === 0 ? (
        <EmptyState
          title="No Furniture Yet"
          description="Add your furniture items to get started"
          action={<Button onClick={() => setShowForm(true)}>Add Furniture</Button>}
        />
      ) : (
        <div className="list-grid">
          {furniture.map(item => (
            <Card key={item.id}>
              <div className="list-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3>{item.furniture_type}</h3>
                    {item.description && (
                      <p style={{ color: 'var(--gray-600)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span style={{ 
                    background: 'var(--primary)', 
                    color: 'white', 
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}>
                    Qty: {item.quantity}
                  </span>
                </div>

                {item.default_weight_kg && (
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Weight: {item.default_weight_kg} kg
                  </p>
                )}

                {(item.length_cm || item.width_cm || item.height_cm) && (
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                    Size: {item.length_cm || '-'} × {item.width_cm || '-'} × {item.height_cm || '-'} cm
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {item.fragile && (
                    <span style={{ 
                      background: '#fef2f2', 
                      color: '#7f1d1d', 
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}>
                      🚨 Fragile
                    </span>
                  )}
                  {item.stackable && (
                    <span style={{ 
                      background: '#ecfdf5', 
                      color: '#065f46', 
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}>
                      ✓ Stackable
                    </span>
                  )}
                </div>

                <div className="actions">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(item.id)}
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
