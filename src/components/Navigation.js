import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navigation.css';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/admin/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/admin" className="navbar-brand" onClick={closeMenu}>
          HSS System (Admin)
        </Link>

        <button className="hamburger-btn" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/admin" className="nav-link" onClick={closeMenu}>
            Dashboard
          </Link>
          <Link to="/admin/addresses" className="nav-link" onClick={closeMenu}>
            Addresses
          </Link>
          <Link to="/admin/esp-devices" className="nav-link" onClick={closeMenu}>
            ESP Devices
          </Link>
          <Link to="/admin/furniture" className="nav-link" onClick={closeMenu}>
            Furniture
          </Link>
          <Link to="/admin/bindings" className="nav-link" onClick={closeMenu}>
            Bindings
          </Link>
           <button onClick={handleLogout} className="btn-logout-mobile">
             Logout
           </button>
        </div>

        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
