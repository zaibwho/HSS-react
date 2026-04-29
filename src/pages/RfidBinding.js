import React, { useState, useEffect } from 'react';
import { bindingAPI, furnitureAPI, espDeviceAPI, customerAPI } from '../services/api';
import '../styles/Management.css';

const RfidBinding = () => {
  const [bindings, setBindings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [espDevices, setEspDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [formData, setFormData] = useState({
    furniture_id: '',
    esp_device_id: '',
  });

  useEffect(() => {
    loadCustomers();
    loadEspDevices();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      loadFurniture();
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (selectedFurniture) {
      loadBindings();
    }
  }, [selectedFurniture]);

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
    try {
      const response = await furnitureAPI.getAll(selectedCustomer);
      setFurnitureItems(response.data.data || []);
    } catch (err) {
      setError('Failed to load furniture');
      console.error(err);
    }
  };

  const loadEspDevices = async () => {
    try {
      const response = await espDeviceAPI.getAll();
      setEspDevices(response.data.data || []);
    } catch (err) {
      setError('Failed to load ESP devices');
      console.error(err);
    }
  };

  const loadBindings = async () => {
    setLoading(true);
    try {
      const response = await bindingAPI.getBindings(selectedFurniture);
      setBindings(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load bindings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFurniture) {
      setError('Please select furniture');
      return;
    }

    setLoading(true);
    try {
      await bindingAPI.createBinding(selectedFurniture, formData);
      loadBindings();
      setFormData({
        furniture_id: '',
        esp_device_id: '',
      });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('Failed to create binding');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'assigned':
        return '#2196f3';
      case 'completed':
        return '#4caf50';
      case 'failed':
        return '#f44336';
      default:
        return '#999';
    }
  };

  return (
    <div className="management-container">
      <h1>Furniture RFID-ESP Bindings</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="management-controls">
        <div className="selector">
          <label htmlFor="customer">Customer:</label>
          <select
            id="customer"
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setSelectedFurniture('');
            }}
          >
            <option value="">-- Select Customer --</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCustomer && (
          <div className="selector">
            <label htmlFor="furniture">Furniture:</label>
            <select
              id="furniture"
              value={selectedFurniture}
              onChange={(e) => setSelectedFurniture(e.target.value)}
            >
              <option value="">-- Select Furniture --</option>
              {furnitureItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.furniture_type}
                  {item.rfid_uid ? ` (${item.rfid_uid})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedFurniture && (
          <button
            className="btn-primary"
            onClick={() => (showForm ? setShowForm(false) : setShowForm(true))}
          >
            {showForm ? 'Cancel' : 'Create Binding'}
          </button>
        )}
      </div>

      {showForm && selectedFurniture && (
        <div className="form-section">
          <h2>Create New RFID-ESP Binding</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div>
                <label htmlFor="esp_device">Select ESP Device:</label>
                <select
                  id="esp_device"
                  name="esp_device_id"
                  value={formData.esp_device_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Choose Device --</option>
                  {espDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} ({device.device_uid})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Binding'}
            </button>
          </form>
        </div>
      )}

      {selectedFurniture && (
        <div className="items-list">
          <h2>Bindings for Selected Furniture ({bindings.length})</h2>
          {loading && !showForm && <p>Loading bindings...</p>}
          {bindings.length === 0 && !loading && <p>No bindings found.</p>}
          {bindings.length > 0 && (
            <div className="list-grid">
              {bindings.map((binding) => (
                <div key={binding.id} className="list-item">
                  <h3>Binding #{binding.id}</h3>
                  <p>
                    <strong>Furniture:</strong> {binding.furniture?.furniture_type}
                  </p>
                  <p>
                    <strong>ESP Device:</strong> {binding.esp_device?.name}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <span
                      style={{
                        color: 'white',
                        backgroundColor: getStatusColor(binding.status),
                        padding: '4px 8px',
                        borderRadius: '4px',
                        marginLeft: '8px',
                      }}
                    >
                      {binding.status}
                    </span>
                  </p>
                  {binding.scanned_rfid_uid && (
                    <p>
                      <strong>Scanned RFID:</strong> {binding.scanned_rfid_uid}
                    </p>
                  )}
                  {binding.requested_at && (
                    <p>
                      <strong>Requested:</strong>{' '}
                      {new Date(binding.requested_at).toLocaleString()}
                    </p>
                  )}
                  {binding.completed_at && (
                    <p>
                      <strong>Completed:</strong>{' '}
                      {new Date(binding.completed_at).toLocaleString()}
                    </p>
                  )}
                  {binding.notes && (
                    <p>
                      <strong>Notes:</strong> {binding.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RfidBinding;
