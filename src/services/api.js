import axios from 'axios';

const API_URL = (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) 
  ? process.env.REACT_APP_API_URL 
  : 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    // Prefer admin token when present; fall back to customer token.
    const adminToken = localStorage.getItem('token');
    const customerToken = localStorage.getItem('customer_token');
    const token = adminToken ? adminToken : customerToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API calls
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, password_confirmation) =>
    api.post('/auth/register', { name, email, password, password_confirmation }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Customer-facing auth
export const customerAuthAPI = {
  register: (name, email, password, password_confirmation, phone) =>
    api.post('/customer/auth/register', { name, email, password, password_confirmation, phone }),
  login: (email, password) => api.post('/customer/auth/login', { email, password }),
  logout: () => api.post('/customer/auth/logout'),
  getCurrentCustomer: () => api.get('/customer/auth/me'),
};

// Address API calls
export const addressAPI = {
  getAll: (customerId) => api.get(`/addresses?customer_id=${customerId}`),
  getById: (id) => api.get(`/addresses/${id}`),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
};

// ESP Device API calls
export const espDeviceAPI = {
  getAll: () => api.get('/esp-devices'),
  getById: (id) => api.get(`/esp-devices/${id}`),
  create: (data) => api.post('/esp-devices', data),
  update: (id, data) => api.put(`/esp-devices/${id}`, data),
  delete: (id) => api.delete(`/esp-devices/${id}`),
};

// Furniture API calls
export const furnitureAPI = {
  getAll: (customerId) => api.get(`/furniture?customer_id=${customerId}`),
  getById: (id) => api.get(`/furniture/${id}`),
  create: (data) => api.post('/furniture', data),
  update: (id, data) => api.put(`/furniture/${id}`, data),
  delete: (id) => api.delete(`/furniture/${id}`),
};

// Furniture RFID Binding API calls
export const bindingAPI = {
  getBindings: (furnitureId) => api.get(`/furniture/${furnitureId}/rfid-bindings`),
  createBinding: (furnitureId, data) =>
    api.post(`/furniture/${furnitureId}/rfid-bindings`, data),
  getPendingBindings: () => api.get('/esp/rfid-bindings/pending'),
  completeBinding: (data) => api.post('/esp/rfid-bindings/complete', data),
};

// Customer API calls
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export default api;
