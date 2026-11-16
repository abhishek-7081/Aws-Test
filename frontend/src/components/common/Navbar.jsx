import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    info('You have been logged out.');
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="tf-navbar navbar navbar-expand-lg sticky-top">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary" to="/" onClick={closeMenu}>
          <span
            style={{
              backgroundColor: 'var(--primary)',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: '700',
            }}
          >
            ✓
          </span>
          <span style={{ letterSpacing: '-0.5px', fontSize: '1.25rem', color: '#0f172a' }}>TaskFlow</span>
        </Link>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Navigation links & User actions */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarContent">
          {isAuthenticated ? (
            <>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
                <li className="nav-item">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) => `nav-link px-3 ${isActive ? 'fw-bold text-primary' : 'text-secondary'}`}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/tasks"
                    className={({ isActive }) => `nav-link px-3 ${isActive ? 'fw-bold text-primary' : 'text-secondary'}`}
                    onClick={closeMenu}
                  >
                    Tasks
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/categories"
                    className={({ isActive }) => `nav-link px-3 ${isActive ? 'fw-bold text-primary' : 'text-secondary'}`}
                    onClick={closeMenu}
                  >
                    Categories
                  </NavLink>
                </li>
              </ul>

              <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
                <Link
                  to="/profile"
                  className="d-flex align-items-center gap-2 text-decoration-none text-dark"
                  onClick={closeMenu}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      border: '1px solid var(--border-focus)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="fw-medium small d-none d-sm-inline">{user?.name || 'My Account'}</span>
                </Link>

                <button
                  type="button"
                  className="tf-btn tf-btn-secondary tf-btn-sm"
                  onClick={handleLogout}
                  title="Log out of TaskFlow"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-nav ms-auto d-flex flex-row align-items-center gap-2 mt-3 mt-lg-0">
              <Link to="/login" className="tf-btn tf-btn-secondary tf-btn-sm" onClick={closeMenu}>
                Log In
              </Link>
              <Link to="/register" className="tf-btn tf-btn-primary tf-btn-sm" onClick={closeMenu}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

