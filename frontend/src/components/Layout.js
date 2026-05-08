import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

const Layout = ({ children }) => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === '/';

  return (
    <div className="app-layout">
      {!isLoginPage && isAuthenticated && (
        <header className="app-header">
          <div className="header-container">
            <Link to="/dashboard" className="logo">
              IssueTracker
            </Link>

            <nav className="nav-links">
              <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                Dashboard
              </Link>
              <Link to="/issues" className={location.pathname.startsWith('/issues') ? 'active' : ''}>
                Issues
              </Link>
              {isAdmin && (
                <>
                  <Link to="/admin/users" className={location.pathname === '/admin/users' ? 'active' : ''}>
                    Users
                  </Link>
                  <Link to="/admin/teams" className={location.pathname.startsWith('/admin/teams') ? 'active' : ''}>
                    Teams
                  </Link>
                </>
              )}
            </nav>

            <div className="header-user">
              <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-user'}`}>
                {isAdmin ? 'Admin' : 'User'}
              </span>
              <span className="user-name-sm">{user?.name || 'User'}</span>
              <button
                className="btn-logout-sm"
                onClick={() => { logout(); navigate('/'); }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={`app-main ${isLoginPage ? 'login-main' : ''}`}>
        {children}
      </main>

      {!isLoginPage && isAuthenticated && (
        <footer className="app-footer">
          <div className="footer-container">
            <span>© 2026 IssueTracker</span>
            <span className="footer-links">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/issues">Issues</Link>
              {isAdmin && (
                <>
                  <Link to="/admin/users">Users</Link>
                  <Link to="/admin/teams">Teams</Link>
                </>
              )}
            </span>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
