import React, { useState, useEffect } from 'react';
import { espDeviceAPI } from '../services/api';
import '../styles/Management.css';

const EspDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    device_uid: '',
    name: '',
    device_token: '',
    is_active: true,
    notes: '',
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const response = await espDeviceAPI.getAll();
      setDevices(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load ESP devices');
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
        await espDeviceAPI.update(editingId, formData);
      } else {
        await espDeviceAPI.create(formData);
      }
      loadDevices();
      resetForm();
      setError('');
    } catch (err) {
      setError('Failed to save ESP device');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (device) => {
    setEditingId(device.id);
    setFormData({
      device_uid: device.device_uid,
      name: device.name,
      device_token: device.device_token || '',
      is_active: device.is_active,
      notes: device.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await espDeviceAPI.delete(id);
        loadDevices();
      } catch (err) {
        setError('Failed to delete device');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      device_uid: '',
      name: '',
      device_token: '',
      is_active: true,
      notes: '',
    });
    setShowForm(false);
  };

  return (
    <div className="management-container">
      <h1>ESP Devices</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="management-controls">
        <button
          className="btn-primary"
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        >
          {showForm ? 'Cancel' : 'Add Device'}
        </button>
      </div>

      {showForm && (
        <div className="form-section">
          <h2>{editingId ? 'Edit Device' : 'Add New Device'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="device_uid"
                placeholder="Device UID"
                value={formData.device_uid}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="name"
                placeholder="Device Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                name="device_token"
                placeholder="Device Token"
                value={formData.device_token}
                onChange={handleInputChange}
              />
              <textarea
                name="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Device'}
            </button>
          </form>
        </div>
      )}

      {loading && !showForm && <p>Loading devices...</p>}

      <div className="items-list">
        <h2>Devices ({devices.length})</h2>
        {devices.length === 0 ? (
          <p>No devices found.</p>
        ) : (
          <div className="list-grid">
            {devices.map((device) => (
              <div key={device.id} className="list-item">
                <h3>{device.name}</h3>
                <p>
                  <strong>UID:</strong> {device.device_uid}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span className={device.is_active ? 'status-active' : 'status-inactive'}>
                    {device.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
                {device.last_seen_at && (
                  <p>
                    <strong>Last Seen:</strong> {new Date(device.last_seen_at).toLocaleString()}
                  </p>
                )}
                {device.notes && (
                  <p>
                    <strong>Notes:</strong> {device.notes}
                  </p>
                )}
                <div className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(device)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(device.id)}
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

export default EspDevices;
