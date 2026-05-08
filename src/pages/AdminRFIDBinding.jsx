import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Select, Input, Alert, Loading, TextArea } from '../components/Common';
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
  const [newDeviceToken, setNewDeviceToken] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [revealedTokens, setRevealedTokens] = useState({});
  const [tokenLoadingByDevice, setTokenLoadingByDevice] = useState({});
  const [formData, setFormData] = useState({
    esp_device_id: '',
    shift_id: '',
    furniture_id: '',
  });
  const [deviceFormData, setDeviceFormData] = useState({
    device_uid: '',
    name: '',
    notes: '',
    is_active: true,
  });
  const [inProgressShifts, setInProgressShifts] = useState([]);
  const [shiftFurniture, setShiftFurniture] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!formData.shift_id) {
      setShiftFurniture([]);
      setFormData(prev => ({ ...prev, furniture_id: '' }));
      return;
    }

    const selectedShift = inProgressShifts.find(shift => String(shift.id) === String(formData.shift_id));
    const furnitureItems = selectedShift?.furniture || [];
    setShiftFurniture(furnitureItems);

    if (!furnitureItems.some(item => String(item.id) === String(formData.furniture_id))) {
      setFormData(prev => ({ ...prev, furniture_id: '' }));
    }
  }, [formData.shift_id, inProgressShifts]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchESPDevices(),
        fetchPendingBindings(),
        fetchInProgressShifts(),
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

  const fetchInProgressShifts = async () => {
    try {
      const response = await api.get('/shifts?status=in_progress');
      setInProgressShifts(response.data.data || []);
    } catch (err) {
      console.error('Failed to load in-progress shifts:', err);
    }
  };

  const getDeviceDisplayName = (device) => device.name || device.device_uid;

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
    setError('');
    setSuccess('');
    setNewDeviceToken('');

    if (!formData.esp_device_id || !formData.shift_id || !formData.furniture_id) {
      setError('Please select ESP device, in-progress shift, and furniture');
      return;
    }

    try {
      await bindingAPI.createBinding(formData.furniture_id, {
        esp_device_id: parseInt(formData.esp_device_id),
        shift_id: parseInt(formData.shift_id),
      });
      setSuccess('RFID binding initiated. Please wait for ESP device confirmation.');
      setFormData({ esp_device_id: '', shift_id: '', furniture_id: '' });
      setShowForm(false);
      fetchPendingBindings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create binding');
    }
  };

  const handleDeviceSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setNewDeviceToken('');

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
      setNewDeviceToken(response.data.data.device_token || '');
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

  const handleRevealToken = async (deviceId) => {
    if (revealedTokens[deviceId]) {
      setRevealedTokens(prev => {
        const next = { ...prev };
        delete next[deviceId];
        return next;
      });
      return;
    }

    try {
      setError('');
      setTokenLoadingByDevice(prev => ({ ...prev, [deviceId]: true }));
      const response = await espDeviceAPI.revealToken(deviceId);
      const token = response.data?.data?.device_token || '';

      if (!token) {
        setError('No device token found for this ESP device');
        return;
      }

      setRevealedTokens(prev => ({ ...prev, [deviceId]: token }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reveal ESP token');
    } finally {
      setTokenLoadingByDevice(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  return (
    <Layout title="RFID Binding Management">
      <AdminNavigation />
      {error && <Alert type="danger" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {newDeviceToken && (
        <Alert type="info" onClose={() => setNewDeviceToken('')}>
          New device token (save this now): <span style={{ fontFamily: 'monospace' }}>{newDeviceToken}</span>
        </Alert>
      )}

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
                    label: `${getDeviceDisplayName(device)} (${device.device_uid})${device.is_active ? '' : ' [Inactive]'}`,
                  }))}
                  required
                />

                <Select
                  name="shift_id"
                  label="In-Progress Shift"
                  value={formData.shift_id}
                  onChange={handleInputChange}
                  options={inProgressShifts.map(shift => ({
                    value: shift.id,
                    label: `Job #${shift.id} - ${shift.customer?.name || 'Unknown Customer'}`,
                  }))}
                  required
                />

                {formData.shift_id && (
                  <Select
                    name="furniture_id"
                    label="Shift Furniture Item"
                    value={formData.furniture_id}
                    onChange={handleInputChange}
                    options={shiftFurniture.map(item => ({
                      value: item.id,
                      label: `${item.furniture_type} - ${item.description || 'No description'}`,
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
                    <p style={{ fontWeight: 600, margin: 0, marginBottom: '0.5rem' }}>{getDeviceDisplayName(device)}</p>
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                      <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>
                        UID: {device.device_uid}
                      </p>
                      <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>
                        Status: {device.is_active ? 'Active' : 'Inactive'}
                      </p>
                      <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: 0 }}>
                        Last Seen: {device.last_seen_at ? formatDateTime(device.last_seen_at) : 'Never'}
                      </p>
                      <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', margin: 0 }}>
                        Notes: {device.notes || 'None'}
                      </p>
                      <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', margin: 0 }}>
                        Added: {device.created_at ? formatDateTime(device.created_at) : 'N/A'}
                      </p>
                      <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', margin: 0 }}>
                        Updated: {device.updated_at ? formatDateTime(device.updated_at) : 'N/A'}
                      </p>
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                      <Button
                        type="button"
                        size="sm"
                        variant={revealedTokens[device.id] ? 'secondary' : 'primary'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRevealToken(device.id);
                        }}
                        disabled={!!tokenLoadingByDevice[device.id]}
                      >
                        {tokenLoadingByDevice[device.id]
                          ? 'Loading token...'
                          : revealedTokens[device.id]
                            ? 'Hide Token'
                            : 'Reveal Token'}
                      </Button>

                      {revealedTokens[device.id] && (
                        <p
                          style={{
                            margin: 0,
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            color: 'var(--gray-700)',
                            wordBreak: 'break-all',
                          }}
                        >
                          Token: {revealedTokens[device.id]}
                        </p>
                      )}
                    </div>
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
                      Device: {binding.esp_device?.name || binding.esp_device?.device_uid}
                    </p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', margin: 0, marginBottom: '0.25rem' }}>
                      Device UID: {binding.esp_device?.device_uid || 'N/A'}
                    </p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', margin: 0, marginBottom: '0.25rem' }}>
                      Shift: {binding.shift?.id ? `#${binding.shift.id}` : 'N/A'}
                    </p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', margin: 0 }}>
                      Requested: {formatDateTime(binding.requested_at || binding.created_at)}
                    </p>
                  </div>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', margin: 0 }}>
                    Waiting for ESP to submit scanned RFID tag.
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
