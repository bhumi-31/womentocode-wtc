import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Admin.css';

import { API_URL } from '../../config';

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(storedUser);

    if (userData.role !== 'admin') {
      setAccessDenied(true);
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    setUser(userData);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'OVERVIEW', exact: true },
    { path: '/admin/users', label: 'USERS' },
    { path: '/admin/messages', label: 'MESSAGES' },
    { path: '/admin/membership', label: 'MEMBERSHIP' },
    { path: '/admin/team', label: 'TEAM' },
    { path: '/admin/events', label: 'EVENTS' },
    { path: '/admin/projects', label: 'PROJECTS' },
    { path: '/admin/gallery', label: 'GALLERY' },
    { path: '/admin/articles', label: 'ARTICLES' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-content">
          <span className="loading-logo">W</span>
          <p>LOADING...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid #ff6b6b'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255, 107, 107, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '2px solid #ff6b6b'
          }}>
            <span style={{ fontSize: '2.5rem' }}>🚫</span>
          </div>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '2rem',
            color: '#ff6b6b',
            marginBottom: '0.5rem',
            letterSpacing: '2px'
          }}>
            ACCESS DENIED
          </h2>
          <p style={{ color: '#888', marginBottom: '1rem' }}>
            Admin access only. Redirecting to homepage...
          </p>
          <div style={{
            width: '100px',
            height: '4px',
            background: '#333',
            borderRadius: '2px',
            margin: '0 auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: '#F7D046',
              animation: 'shrink 3s linear forwards'
            }} />
          </div>
          <style>{`
            @keyframes shrink {
              from { transform: translateX(0); }
              to { transform: translateX(-100%); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <Link to="/" className="admin-brand">
            <span className="brand-icon">W</span>
            <div className="brand-text">
              <span>WOMEN TO CODE</span>
              <span className="brand-sub">ADMIN PANEL</span>
            </div>
          </Link>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-right">
          <div className="user-badge">
            <span className="user-avatar">{user?.firstName?.charAt(0)}</span>
            <span className="user-name">{user?.firstName}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            LOGOUT →
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="admin-footer">
        <p>© 2026 WomenToCode. All rights reserved.</p>
        <Link to="/" className="back-to-site">← Back to Website</Link>
      </footer>
    </div>
  );
};

export default AdminLayout;
