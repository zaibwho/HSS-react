import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Loading, Alert, EmptyState } from '../components/Common';
import AdminNavigation from '../components/AdminNavigation.jsx';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import '../styles/Management.css';

export const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerDetailsMap, setCustomerDetailsMap] = useState({});
  const [detailsLoadingMap, setDetailsLoadingMap] = useState({});

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers');
      const loadedCustomers = response.data.data || [];
      setCustomers(loadedCustomers);
      setError('');

      if (loadedCustomers.length > 0) {
        await Promise.all(loadedCustomers.map((customer) => fetchCustomerDetails(customer.id)));
      }
    } catch (err) {
      setError('Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await api.get(`/customers/${customerId}`);
      setCustomerDetailsMap((prev) => ({
        ...prev,
        [customerId]: response.data.data,
      }));
    } catch (err) {
      setError('Failed to load customer details');
    } finally {
      setDetailsLoadingMap((prev) => ({
        ...prev,
        [customerId]: false,
      }));
    }
  };

  return (
    <Layout title="Registered Customers">
      <AdminNavigation />
      {error && <Alert type="danger" onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Loading />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No Customers"
          description="No customers registered yet"
        />
      ) : (
        <div className="management-table-container">
          <table className="management-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>CNIC</th>
                <th>Registered</th>
                <th>Addresses</th>
                <th>Furniture</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const details = customerDetailsMap[customer.id];
                const addresses = details?.addresses || [];
                const furnitureItems = details?.furniture_items || [];

                return (
                  <React.Fragment key={customer.id}>
                    <tr>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone || 'N/A'}</td>
                      <td>{customer.cnic || 'N/A'}</td>
                      <td>{formatDate(customer.created_at)}</td>
                      <td>{addresses.length}</td>
                      <td>{furnitureItems.length}</td>
                    </tr>
                    <tr>
                      <td colSpan="7" style={{ background: 'var(--gray-50)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1rem 0' }}>
                          <Card>
                            <div className="management-card-header">
                              <h3>Personal Details</h3>
                            </div>
                            <div className="management-detail-grid">
                              <div>
                                <p className="management-label">Name</p>
                                <p className="management-value">{customer.name}</p>
                              </div>
                              <div>
                                <p className="management-label">Email</p>
                                <p className="management-value">{customer.email}</p>
                              </div>
                              <div>
                                <p className="management-label">Phone</p>
                                <p className="management-value">{customer.phone || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="management-label">CNIC</p>
                                <p className="management-value">{customer.cnic || 'N/A'}</p>
                              </div>
                            </div>
                          </Card>

                          <Card>
                            <div className="management-card-header">
                              <h3>Related Data</h3>
                            </div>
                            <div className="management-detail-stack">
                              <div>
                                <p className="management-label">Addresses</p>
                                {addresses.length > 0 ? (
                                  addresses.map((address) => (
                                    <div key={address.id} className="management-subitem">
                                      <strong>{address.city}</strong>
                                      <div>{address.address}</div>
                                      <div>{address.postal_code}, {address.country}</div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="management-empty">No addresses added</p>
                                )}
                              </div>

                              <div>
                                <p className="management-label">Furniture</p>
                                {furnitureItems.length > 0 ? (
                                  furnitureItems.map((item) => (
                                    <div key={item.id} className="management-subitem">
                                      <strong>{item.furniture_type}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</strong>
                                      <div>{item.description || 'No description'}</div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="management-empty">No furniture added</p>
                                )}
                              </div>
                            </div>
                          </Card>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};
