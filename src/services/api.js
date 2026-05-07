import axios from 'axios';

const API_URL = (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) 
  ? process.env.REACT_APP_API_URL 
  : 'http://localhost:8000/api';

// Shared API instance for admin routes
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Customer-specific API instance
export const customerApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add admin token to shared requests
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add customer token to customer requests
customerApi.interceptors.request.use(
  (config) => {
    const customerToken = localStorage.getItem('customer_token');
    if (customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`;
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
    customerApi.post('/customer/auth/register', { name, email, password, password_confirmation, phone }),
  login: (email, password) => customerApi.post('/customer/auth/login', { email, password }),
  logout: () => customerApi.post('/customer/auth/logout'),
  getCurrentCustomer: () => customerApi.get('/customer/auth/me'),
};

// Address API calls
export const addressAPI = {
  getAll: (customerId) => customerId ? customerApi.get(`/addresses?customer_id=${customerId}`) : customerApi.get('/addresses'),
  getById: (id) => customerApi.get(`/addresses/${id}`),
  create: (data) => customerApi.post('/addresses', data),
  update: (id, data) => customerApi.put(`/addresses/${id}`, data),
  delete: (id) => customerApi.delete(`/addresses/${id}`),
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
  getAll: (customerId) => customerId ? customerApi.get(`/furniture?customer_id=${customerId}`) : customerApi.get('/furniture'),
  getById: (id) => customerApi.get(`/furniture/${id}`),
  create: (data) => customerApi.post('/furniture', data),
  update: (id, data) => customerApi.put(`/furniture/${id}`, data),
  delete: (id) => customerApi.delete(`/furniture/${id}`),
};

// Furniture RFID Binding API calls
export const bindingAPI = {
  getBindings: (furnitureId) => customerApi.get(`/furniture/${furnitureId}/rfid-bindings`),
  createBinding: (furnitureId, data) =>
    customerApi.post(`/furniture/${furnitureId}/rfid-bindings`, data),
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
