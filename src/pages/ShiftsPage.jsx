import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Layout, Card, Button, Select, Alert, Loading, EmptyState, Badge } from '../components/Common';
import CustomerNavigation from '../components/CustomerNavigation.jsx';
import { addressAPI, furnitureAPI, customerApi } from '../services/api';
import { formatDateTime, getStatusLabel, getStatusColor } from '../utils/helpers';
import '../styles/Management.css';

export const ShiftsPage = () => {
  const { customer } = useCustomerAuth();
  const [shifts, setShifts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [furniture, setFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pickup_address_id: '',
    destination_address_id: '',
    notes: '',
  });
  const [selectedFurniture, setSelectedFurniture] = useState([]);
  const [furnitureQuantities, setFurnitureQuantities] = useState({});
  const [expandedShifts, setExpandedShifts] = useState({});

  useEffect(() => {
    Promise.all([
      fetchShifts(),
      fetchAddresses(),
      fetchFurniture(),
    ]);
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await customerApi.get('/shifts');
      setShifts(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to load shifts:', err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAll(customer?.id);
      setAddresses(response.data.data || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const fetchFurniture = async () => {
    try {
      const response = await furnitureAPI.getAll(customer?.id);
      setFurniture(response.data.data || []);
    } catch (err) {
      console.error('Failed to load furniture:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFurnitureSelect = (furnitureId) => {
    setSelectedFurniture(prev => {
      if (prev.includes(furnitureId)) {
        return prev.filter(id => id !== furnitureId);
      } else {
        return [...prev, furnitureId];
      }
    });
  };

  const handleQuantityChange = (furnitureId, qty) => {
    const item = furniture.find(f => f.id === furnitureId);
    if (qty <= item.quantity && qty > 0) {
      setFurnitureQuantities(prev => ({ ...prev, [furnitureId]: qty }));
    }
  };

  const resetForm = () => {
    setFormData({
      pickup_address_id: '',
      destination_address_id: '',
      notes: '',
    });
    setSelectedFurniture([]);
    setFurnitureQuantities({});
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pickup_address_id || !formData.destination_address_id) {
      setError('Please select both pickup and destination addresses');
      return;
    }

    if (selectedFurniture.length === 0) {
      setError('Please select at least one furniture item');
      return;
    }

    try {
      const shiftData = {
        customer_id: customer?.id,
        pickup_address_id: parseInt(formData.pickup_address_id),
        destination_address_id: parseInt(formData.destination_address_id),
        notes: formData.notes,
        furniture_lines: selectedFurniture.map(id => ({
          furniture_id: id,
          quantity: furnitureQuantities[id] || furniture.find(f => f.id === id)?.quantity || 1,
        })),
      };

      await customerApi.post('/shifts/initiate', shiftData);
      setSuccess('Shifting job created successfully');
      fetchShifts();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shifting job');
    }
  };

  const getAddressLabel = (id) => {
    const addr = addresses.find(a => a.id === parseInt(id));
    return addr ? `${addr.city} - ${addr.line1}` : '';
  };

  return (
    <Layout title="Shifting Jobs">
      <CustomerNavigation />
      {error && <Alert type="danger" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <div className="header">
        <h2>Your Shifting Jobs</h2>
        <Button
          variant={showForm ? 'secondary' : 'primary'}
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        >
          {showForm ? 'Cancel' : '+ Create Shift'}
        </Button>
      </div>

      {showForm && (
        <Card className="form-section">
          <h3>Create New Shifting Job</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <Select
                name="pickup_address_id"
                label="Pickup Address"
                value={formData.pickup_address_id}
                onChange={handleAddressChange}
                options={addresses.map(a => ({
                  value: a.id,
                  label: `${a.city} - ${a.line1}`,
                }))}
                required
              />
              <Select
                name="destination_address_id"
                label="Destination Address"
                value={formData.destination_address_id}
                onChange={handleAddressChange}
                options={addresses.map(a => ({
                  value: a.id,
                  label: `${a.city} - ${a.line1}`,
                }))}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: '600', marginBottom: '1rem', display: 'block' }}>
                Select Furniture Items
              </label>
              {furniture.length === 0 ? (
                <p style={{ color: 'var(--gray-500)' }}>No furniture items available. Add furniture first.</p>
              ) : (
                <div style={{ 
                  border: '1px solid var(--gray-300)', 
                  borderRadius: 'var(--radius-md)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}>
                  {furniture.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--gray-200)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedFurniture.includes(item.id)}
                          onChange={() => handleFurnitureSelect(item.id)}
                          style={{ width: 'auto' }}
                        />
                        <span>
                          {item.furniture_type} - {item.description}
                        </span>
                      </label>
                      {selectedFurniture.includes(item.id) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, (furnitureQuantities[item.id] || 1) - 1)}
                            style={{ padding: '0.25rem 0.5rem', border: 'none', background: 'var(--gray-200)', cursor: 'pointer', borderRadius: '4px' }}
                          >
                            -
                          </button>
                          <span style={{ minWidth: '30px', textAlign: 'center' }}>
                            {furnitureQuantities[item.id] || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, (furnitureQuantities[item.id] || 1) + 1)}
                            style={{ padding: '0.25rem 0.5rem', border: 'none', background: 'var(--gray-200)', cursor: 'pointer', borderRadius: '4px' }}
                            disabled={(furnitureQuantities[item.id] || 1) >= item.quantity}
                          >
                            +
                          </button>
                          <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                            / {item.quantity}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                placeholder="Special instructions or notes for this shift..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                style={{ minHeight: '80px' }}
              />
            </div>

            <Button type="submit" variant="primary" fullWidth>
              Create Shifting Job
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <Loading />
      ) : shifts.length === 0 ? (
        <EmptyState
          title="No Shifting Jobs Yet"
          description="Create your first shifting job to get started"
          action={<Button onClick={() => setShowForm(true)}>Create Shift</Button>}
        />
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {shifts.map(shift => (
            <Card key={shift.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Job #{shift.id}</h3>
                  <Badge variant={shift.status?.toLowerCase()}>{getStatusLabel(shift.status)}</Badge>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    {formatDateTime(shift.requested_at)}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setExpandedShifts(prev => ({ ...prev, [shift.id]: !prev[shift.id] }))}
                  >
                    {expandedShifts[shift.id] ? 'Hide Details' : 'Details'}
                  </Button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>From</p>
                  <p style={{ fontWeight: '500' }}>{getAddressLabel(shift.pickup_address_id)}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>To</p>
                  <p style={{ fontWeight: '500' }}>{getAddressLabel(shift.destination_address_id)}</p>
                </div>
                {shift.total_weight_kg && (
                  <div>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Weight</p>
                    <p style={{ fontWeight: '500' }}>{shift.total_weight_kg} kg</p>
                  </div>
                )}
              </div>

              {shift.notes && (
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontStyle: 'italic', marginBottom: '1rem' }}>
                  <strong>Notes:</strong> {shift.notes}
                </p>
              )}

              {expandedShifts[shift.id] && (
                <Card>
                  <h4 style={{ marginTop: 0 }}>Furniture Items</h4>
                  {(!shift.furniture || shift.furniture.length === 0) ? (
                    <p style={{ color: 'var(--gray-500)' }}>No furniture listed for this job.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {shift.furniture.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.furniture_type}</div>
                            <div style={{ color: 'var(--gray-600)' }}>{item.description || 'No description'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.875rem' }}>Qty: {item.pivot?.quantity || '-'}</div>
                            {item.rfid_uid ? (
                              <div style={{ color: 'var(--gray-700)', fontFamily: 'monospace' }}>{item.rfid_uid}</div>
                            ) : (
                              <div style={{ color: 'var(--danger)', fontWeight: 700 }}>Not bind</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};
