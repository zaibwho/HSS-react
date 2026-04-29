import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Addresses from './pages/Addresses';
import EspDevices from './pages/EspDevices';
import Furniture from './pages/Furniture';
import RfidBinding from './pages/RfidBinding';
import CustomerRegister from './pages/CustomerRegister';
import CustomerLogin from './pages/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomerAuthProvider>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              {/* Customer-facing routes (default) */}
              <Route path="/login" element={<CustomerLogin />} />
              <Route path="/register" element={<CustomerRegister />} />
              <Route
                path="/dashboard"
                element={
                  <CustomerProtectedRoute>
                    <CustomerDashboard />
                  </CustomerProtectedRoute>
                }
              />

              {/* Admin / user routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/register" element={<Register />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/addresses"
                element={
                  <ProtectedRoute>
                    <Addresses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/esp-devices"
                element={
                  <ProtectedRoute>
                    <EspDevices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/furniture"
                element={
                  <ProtectedRoute>
                    <Furniture />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bindings"
                element={
                  <ProtectedRoute>
                    <RfidBinding />
                  </ProtectedRoute>
                }
              />

              {/* Default route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        </CustomerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
