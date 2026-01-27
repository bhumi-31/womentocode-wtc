import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Admin.css';

const API_URL = 'http://localhost:5001';

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
      alert('Access Denied! Admin only.');
      navigate('/');
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
    { path: '/admin/team', label: 'TEAM' },
    { path: '/admin/events', label: 'EVENTS' },
    { path: '/admin/projects', label: 'PROJECTS' },
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
