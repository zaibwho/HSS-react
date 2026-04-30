import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Select, Alert, Loading, EmptyState, Badge } from '../components/Common';
import AdminNavigation from '../components/AdminNavigation.jsx';
import api from '../services/api';
import { formatDateTime, getStatusLabel } from '../utils/helpers';
import '../styles/Management.css';

const SHIFT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'done', label: 'Done' },
];

export const AdminShiftsList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchShifts();
  }, [statusFilter]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
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
    }
  };

  const handleStatusUpdate = async (shiftId, newStatus) => {
    try {
      setUpdatingId(shiftId);
      await api.put(`/shifts/${shiftId}`, { status: newStatus });
      setSuccess('Shift status updated successfully');
      fetchShifts();
    } catch (err) {
      setError('Failed to update shift status');
    } finally {
      setUpdatingId(null);
    }
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

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Filter by Status</h3>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            ...SHIFT_STATUSES,
          ]}
        />
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
                <tr key={shift.id}>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};
