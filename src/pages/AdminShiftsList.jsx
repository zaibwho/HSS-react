import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Card, Button, Select, Alert, Loading, EmptyState, Badge } from '../components/Common';
import AdminNavigation from '../components/AdminNavigation.jsx';
import api from '../services/api';
import { formatDateTime, getStatusLabel } from '../utils/helpers';
import '../styles/Management.css';

const SHIFT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'done', label: 'Done' },
];

export const AdminShiftsList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedShifts, setExpandedShifts] = useState({});

  const fetchShifts = useCallback(async ({ quiet = false } = {}) => {
    try {
      if (quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let url = '/shifts';
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }
      const response = await api.get(url);
      setShifts(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load shifts');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchShifts({ quiet: true });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchShifts]);

  const handleStatusUpdate = async (shiftId, newStatus) => {
    try {
      setUpdatingId(shiftId);
      await api.put(`/shifts/${shiftId}`, { status: newStatus });
      setSuccess('Shift status updated successfully');
      fetchShifts({ quiet: true });
    } catch (err) {
      setError('Failed to update shift status');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (shiftId) => {
    setExpandedShifts(prev => ({ ...prev, [shiftId]: !prev[shiftId] }));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in_progress':
      case 'inprogress':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <Layout title="Shifting Jobs Management">
      <AdminNavigation />
      {error && <Alert type="danger" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <h3 style={{ marginBottom: '1rem' }}>Filter by Status</h3>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              ...SHIFT_STATUSES,
            ]}
          />
          <Button variant="secondary" onClick={() => fetchShifts({ quiet: true })} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : shifts.length === 0 ? (
        <EmptyState
          title="No Shifts"
          description={statusFilter ? 'No shifts with this status' : 'No shifting jobs created yet'}
        />
      ) : (
        <div className="management-table-container">
          <table className="management-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Customer</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Items</th>
                <th>Weight (kg)</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map(shift => (
                <React.Fragment key={shift.id}>
                <tr>
                  <td>#{shift.id}</td>
                  <td>{shift.customer?.name}</td>
                  <td>{shift.pickup_address?.city}</td>
                  <td>{shift.destination_address?.city}</td>
                  <td>
                    <Badge variant={getStatusColor(shift.status)}>
                      {getStatusLabel(shift.status)}
                    </Badge>
                  </td>
                  <td>{shift.total_items || '-'}</td>
                  <td>{shift.total_weight_kg || '-'}</td>
                  <td style={{ fontSize: '0.875rem' }}>{formatDateTime(shift.requested_at)}</td>
                  <td>
                    <Select
                      value={shift.status}
                      onChange={(e) => handleStatusUpdate(shift.id, e.target.value)}
                      options={SHIFT_STATUSES}
                      disabled={updatingId === shift.id}
                      style={{ fontSize: '0.875rem' }}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleExpand(shift.id)}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      {expandedShifts[shift.id] ? 'Hide Details' : 'Details'}
                    </Button>
                  </td>
                </tr>
                {expandedShifts[shift.id] && (
                  <tr key={`${shift.id}-details`}>
                    <td colSpan={9}>
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
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};
