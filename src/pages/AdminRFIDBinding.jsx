import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Select, Input, Alert, Loading, EmptyState, TextArea } from '../components/Common';
import AdminNavigation from '../components/AdminNavigation.jsx';
import api, { espDeviceAPI, bindingAPI } from '../services/api';
import { formatDateTime } from '../utils/helpers';
import '../styles/Management.css';

export const RFIDBindingPage = () => {
  const [espDevices, setEspDevices] = useState([]);
  const [pendingBindings, setPendingBindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [formData, setFormData] = useState({
    esp_device_id: '',
    furniture_id: '',
  });
  const [deviceFormData, setDeviceFormData] = useState({
    device_uid: '',
    name: '',
    notes: '',
    is_active: true,
  });
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerFurniture, setCustomerFurniture] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerFurniture(selectedCustomer);
    }
  }, [selectedCustomer]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchESPDevices(),
        fetchPendingBindings(),
        fetchCustomers(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchESPDevices = async () => {
    try {
      const response = await espDeviceAPI.getAll();
      setEspDevices(response.data.data || []);
    } catch (err) {
      console.error('Failed to load ESP devices:', err);
    }
  };

  const fetchPendingBindings = async () => {
    try {
      const response = await bindingAPI.getPendingBindings();
      setPendingBindings(response.data.data || []);
    } catch (err) {
      console.error('Failed to load pending bindings:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  const fetchCustomerFurniture = async (customerId) => {
    try {
      const response = await api.get(`/customers/${customerId}`);
      setCustomerFurniture(response.data.data?.furniture_items || []);
    } catch (err) {
      console.error('Failed to load furniture:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeviceInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDeviceFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.esp_device_id || !formData.furniture_id) {
      setError('Please select both ESP device and furniture');
      return;
    }

    try {
      await bindingAPI.createBinding(formData.furniture_id, {
        esp_device_id: parseInt(formData.esp_device_id),
      });
      setSuccess('RFID binding initiated. Please wait for ESP device confirmation.');
      setFormData({ esp_device_id: '', furniture_id: '' });
      setShowForm(false);
      setSelectedCustomer('');
      fetchPendingBindings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create binding');
    }
  };

  const handleCompleteBinding = async (bindingId) => {
    try {
      await bindingAPI.completeBinding({ binding_id: bindingId });
      setSuccess('RFID binding completed successfully');
      fetchPendingBindings();
    } catch (err) {
      setError('Failed to complete binding');
    }
  };

  const handleDeviceSubmit = async (e) => {
    e.preventDefault();

    if (!deviceFormData.device_uid.trim()) {
      setError('Device UID is required');
      return;
    }

    try {
      const response = await espDeviceAPI.create({
        device_uid: deviceFormData.device_uid.trim(),
        name: deviceFormData.name.trim() || null,
        notes: deviceFormData.notes.trim() || null,
        is_active: deviceFormData.is_active,
      });

      setSuccess(`ESP device ${response.data.data.name || response.data.data.device_uid} added successfully`);
      setDeviceFormData({
        device_uid: '',
        name: '',
        notes: '',
        is_active: true,
      });
      setShowDeviceForm(false);
      fetchESPDevices();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add ESP device';
      setError(message);
    }
  };

  return (
    <Layout title="RFID Binding Management">
      <AdminNavigation />
      {error && <Alert type="danger" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Binding Form */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Create New Binding</h2>
            <Button
              variant={showForm ? 'secondary' : 'primary'}
              onClick={() => setShowForm(!showForm)}
              size="sm"
            >
              {showForm ? 'Cancel' : '+ New Binding'}
            </Button>
          </div>

          {showForm && (
            <Card>
              <form onSubmit={handleSubmit}>
                <Select
                  name="esp_device_id"
                  label="ESP Device"
                  value={formData.esp_device_id}
                  onChange={handleInputChange}
                  options={espDevices.map(device => ({
                    value: device.id,
                    label: `${device.device_name} (${device.mac_address})`,
                  }))}
                  required
                />

                <Select
                  name="selectCustomer"
                  label="Select Customer"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  options={customers.map(customer => ({
                    value: customer.id,
                    label: customer.name,
                  }))}
                />

                {selectedCustomer && (
                  <Select
                    name="furniture_id"
                    label="Furniture Item"
                    value={formData.furniture_id}
                    onChange={handleInputChange}
                    options={customerFurniture.map(item => ({
                      value: item.id,
                      label: `${item.furniture_type} - ${item.description}`,
                    }))}
                    required
                  />
                )}

                <Button type="submit" variant="primary" fullWidth>
                  Create Binding
                </Button>
              </form>
            </Card>
          )}

          <Card style={{ marginTop: '1.5rem' }}>
            <div className="management-card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0 }}>Add ESP Device</h3>
                <Button
                  variant={showDeviceForm ? 'secondary' : 'primary'}
                  onClick={() => setShowDeviceForm(!showDeviceForm)}
                  size="sm"
                >
                  {showDeviceForm ? 'Cancel' : '+ Add Device'}
                </Button>
              </div>
            </div>

            {showDeviceForm && (
              <form onSubmit={handleDeviceSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <Input
                  name="device_uid"
                  label="Device UID"
                  placeholder="e.g. ESP-001-A1B2C3"
                  value={deviceFormData.device_uid}
                  onChange={handleDeviceInputChange}
                  required
                />

                <Input
                  name="name"
                  label="Device Name"
                  placeholder="e.g. Warehouse ESP 1"
                  value={deviceFormData.name}
                  onChange={handleDeviceInputChange}
                />

                <TextArea
                  name="notes"
                  label="Notes"
                  placeholder="Optional notes about the device location or purpose"
                  value={deviceFormData.notes}
                  onChange={handleDeviceInputChange}
                />

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={deviceFormData.is_active}
                    onChange={handleDeviceInputChange}
                    style={{ width: 'auto' }}
                  />
                  Active device
                </label>

                <Button type="submit" variant="primary" fullWidth>
                  Save ESP Device
                </Button>
              </form>
            )}
          </Card>

          <Card style={{ marginTop: '1.5rem' }}>
            <div className="management-card-header">
              <h3>ESP Devices</h3>
            </div>
            {loading ? (
              <Loading />
            ) : espDevices.length === 0 ? (
              <p style={{ color: 'var(--gray-500)', marginBottom: 0 }}>No ESP devices available</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {espDevices.map(device => (
                  <div
                    key={device.id}
                    style={{
                      padding: '1rem',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-md)',
                      border: selectedDevice?.id === device.id ? '2px solid var(--primary)' : 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <p style={{ fontWeight: 500, margin: 0, marginBottom: '0.25rem' }}>
                      {device.device_name}
                    </p>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>
                      MAC: {device.mac_address}
                    </p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                      Location: {device.location || 'Not specified'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Pending Bindings */}
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>Pending Bindings</h2>
          {loading ? (
            <Loading />
          ) : pendingBindings.length === 0 ? (
            <Card>
              <p style={{ color: 'var(--gray-500)', textAlign: 'center', marginBottom: 0 }}>
                No pending bindings
              </p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
              {pendingBindings.map(binding => (
                <Card key={binding.id}>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 500, margin: 0, marginBottom: '0.25rem' }}>
                      {binding.furniture?.furniture_type}
                    </p>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>
                      {binding.furniture?.description}
                    </p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: 0, marginBottom: '0.5rem' }}>
                      Device: {binding.esp_device?.device_name}
                    </p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', margin: 0 }}>
                      Created: {formatDateTime(binding.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    fullWidth
                    onClick={() => handleCompleteBinding(binding.id)}
                  >
                    Mark as Complete
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
