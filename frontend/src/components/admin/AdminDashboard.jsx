import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { API_URL } from '../../config';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');

    try {
      const usersRes = await fetch(`${API_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();

      const messagesRes = await fetch(`${API_URL}/contact`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const messagesData = await messagesRes.json();

      const unreadRes = await fetch(`${API_URL}/contact/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const unreadData = await unreadRes.json();

      setStats({
        totalUsers: Array.isArray(usersData.data) ? usersData.data.length : (usersData.count || 0),
        totalMessages: Array.isArray(messagesData.data) ? messagesData.data.length : (messagesData.count || 0),
        unreadMessages: unreadData.data?.unreadCount || unreadData.unreadCount || 0,
      });

      const usersArray = Array.isArray(usersData.data) ? usersData.data : (Array.isArray(usersData) ? usersData : []);
      const messagesArray = Array.isArray(messagesData.data) ? messagesData.data : (Array.isArray(messagesData) ? messagesData : []);

      if (messagesArray.length > 0) setRecentMessages(messagesArray.slice(0, 4));
      if (usersArray.length > 0) setRecentUsers(usersArray.slice(0, 4));

    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Page Title */}
      <div className="page-header">
        <h1 className="page-title">OVERVIEW</h1>
        <div className="title-line"></div>
      </div>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-block">
          <span className="stat-number">{stats.totalUsers}</span>
          <div className="stat-divider"></div>
          <span className="stat-label">USERS</span>
        </div>
        <div className="stat-block">
          <span className="stat-number">{stats.totalMessages}</span>
          <div className="stat-divider"></div>
          <span className="stat-label">MESSAGES</span>
        </div>
        <div className="stat-block highlight">
          <span className="stat-number">{stats.unreadMessages}</span>
          <div className="stat-divider"></div>
          <span className="stat-label">UNREAD</span>
        </div>
      </section>

      {/* Inbox Preview */}
      <section className="content-section">
        <div className="section-header">
          <h2>INBOX</h2>
          <Link to="/admin/messages" className="view-all-link">VIEW ALL →</Link>
        </div>
        <div className="section-line"></div>

        <div className="messages-grid">
          {recentMessages.length > 0 ? (
            recentMessages.map((msg, index) => (
              <div
                key={msg._id || index}
                className={`message-card ${msg.status === 'unread' ? 'unread' : ''}`}
              >
                {msg.status === 'unread' && <span className="new-badge">NEW</span>}
                <div className="message-sender">
                  <span className="sender-initial">{msg.name?.charAt(0) || '?'}</span>
                  <span className="sender-name">{msg.name?.toUpperCase()}</span>
                </div>
                <p className="message-subject">{msg.subject}</p>
                <p className="message-preview">"{msg.message?.substring(0, 80)}..."</p>
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>NO MESSAGES YET</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Users */}
      <section className="content-section">
        <div className="section-header">
          <h2>RECENT USERS</h2>
          <Link to="/admin/users" className="view-all-link">VIEW ALL →</Link>
        </div>
        <div className="section-line"></div>

        <div className="users-list">
          {recentUsers.length > 0 ? (
            recentUsers.map((user, index) => (
              <div key={user._id || index} className="user-row">
                <div className="user-info">
                  <span className="user-initial">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
                  <div className="user-details">
                    <span className="user-name">{user.firstName} {user.lastName}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                </div>
                <span className={`role-tag ${user.role}`}>{user.role?.toUpperCase()}</span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>NO USERS YET</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="actions-section">
        <Link to="/admin/team" className="action-card">
          <span className="action-icon">+</span>
          <span className="action-label">ADD TEAM MEMBER</span>
        </Link>
        <Link to="/admin/events" className="action-card">
          <span className="action-icon">+</span>
          <span className="action-label">CREATE EVENT</span>
        </Link>
        <Link to="/admin/projects" className="action-card">
          <span className="action-icon">+</span>
          <span className="action-label">ADD PROJECT</span>
        </Link>
      </section>
    </div>
  );
};

export default AdminDashboard;
