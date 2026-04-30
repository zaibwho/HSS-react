import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Components
import CustomerProtectedRoute from './components/CustomerProtectedRoute.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';

// Customer Pages
import { CustomerLogin } from './pages/CustomerLogin.jsx';
import { CustomerRegister } from './pages/CustomerRegister.jsx';
import { CustomerDashboard } from './pages/CustomerDashboard.jsx';
import { AddressesPage } from './pages/AddressesPage.jsx';
import { FurniturePage } from './pages/FurniturePage.jsx';
import { ShiftsPage } from './pages/ShiftsPage.jsx';

// Admin Pages
import { AdminLogin } from './pages/AdminLogin.jsx';
import { AdminRegister } from './pages/AdminRegister.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { CustomersList } from './pages/AdminCustomersList.jsx';
import { AdminShiftsList } from './pages/AdminShiftsList.jsx';
import { RFIDBindingPage } from './pages/AdminRFIDBinding.jsx';

// Styles
import './styles/global.css';
import './App.css';

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <CustomerAuthProvider>
          <Routes>
            {/* Redirect root to customer login */}
            <Route path="/" element={<Navigate to="/customer/login" replace />} />

            {/* ===== CUSTOMER ROUTES ===== */}
            {/* Public customer routes */}
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/register" element={<CustomerRegister />} />

            {/* Protected customer routes */}
            <Route
              path="/customer/dashboard"
              element={
                <CustomerProtectedRoute>
                  <CustomerDashboard />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="/customer/addresses"
              element={
                <CustomerProtectedRoute>
                  <AddressesPage />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="/customer/furniture"
              element={
                <CustomerProtectedRoute>
                  <FurniturePage />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="/customer/shifts"
              element={
                <CustomerProtectedRoute>
                  <ShiftsPage />
                </CustomerProtectedRoute>
              }
            />

            {/* ===== ADMIN ROUTES ===== */}
            {/* Public admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />

            {/* Protected admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <AdminProtectedRoute>
                  <CustomersList />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/shifts"
              element={
                <AdminProtectedRoute>
                  <AdminShiftsList />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/rfid-binding"
              element={
                <AdminProtectedRoute>
                  <RFIDBindingPage />
                </AdminProtectedRoute>
              }
            />

            {/* Catch all - redirect to customer login */}
            <Route path="*" element={<Navigate to="/customer/login" replace />} />
          </Routes>
        </CustomerAuthProvider>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
