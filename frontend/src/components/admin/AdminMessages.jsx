import { useState, useEffect } from 'react';

import { API_URL } from '../../config';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, subject: '' });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/contact`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    const token = localStorage.getItem('token');

    try {
      await fetch(`${API_URL}/contact/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'read' })
      });

      setMessages(messages.map(msg =>
        msg._id === messageId ? { ...msg, status: 'read' } : msg
      ));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleDelete = async (messageId) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/contact/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setMessages(messages.filter(msg => msg._id !== messageId));
        if (selectedMessage?._id === messageId) {
          setSelectedMessage(null);
        }
        showNotification('Message deleted successfully!', 'success');
      } else {
        showNotification('Error deleting message', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Error deleting message', 'error');
    } finally {
      setDeleteConfirm({ show: false, id: null, subject: '' });
    }
  };

  const confirmDelete = (message) => {
    setDeleteConfirm({ show: true, id: message._id, subject: message.subject || 'this message' });
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return msg.status === 'unread';
    if (filter === 'read') return msg.status === 'read';
    return true;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="admin-messages">
      {/* Page Title */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">MESSAGES</h1>
          <span className="count-tag">{messages.length} TOTAL</span>
        </div>
        <div className="title-line"></div>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          ALL
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          UNREAD ({unreadCount})
        </button>
        <button
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          READ
        </button>
      </div>

      {/* Messages Layout */}
      <div className="messages-layout">
        {/* Messages List */}
        <div className="messages-list">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <div
                key={msg._id}
                className={`message-item ${msg.status === 'unread' ? 'unread' : ''} ${selectedMessage?._id === msg._id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedMessage(msg);
                  if (msg.status === 'unread') {
                    handleMarkAsRead(msg._id);
                  }
                }}
              >
                {msg.status === 'unread' && <span className="unread-indicator"></span>}
                <div className="msg-header">
                  <span className="msg-initial">{msg.name?.charAt(0)}</span>
                  <div className="msg-meta">
                    <span className="msg-name">{msg.name?.toUpperCase()}</span>
                    <span className="msg-time">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="msg-subject">{msg.subject}</p>
                <p className="msg-preview">{msg.message?.substring(0, 60)}...</p>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>NO MESSAGES</p>
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="message-detail">
          {selectedMessage ? (
            <>
              <div className="detail-header">
                <div className="sender-info">
                  <span className="sender-initial">{selectedMessage.name?.charAt(0)}</span>
                  <div className="sender-details">
                    <h3>{selectedMessage.name?.toUpperCase()}</h3>
                    <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                  </div>
                </div>
                <div className="detail-actions">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="btn-reply"
                  >
                    REPLY →
                  </a>
                  <button
                    className="btn-delete"
                    onClick={() => confirmDelete(selectedMessage)}
                  >
                    DELETE
                  </button>
                </div>
              </div>

              <div className="detail-subject">
                <span className="label">SUBJECT</span>
                <p>{selectedMessage.subject}</p>
              </div>

              <div className="detail-body">
                <span className="label">MESSAGE</span>
                <p>{selectedMessage.message}</p>
              </div>

              <div className="detail-footer">
                <span>Received: {new Date(selectedMessage.createdAt).toLocaleString()}</span>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <span className="arrow">←</span>
              <p>SELECT A MESSAGE TO VIEW</p>
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          background: notification.type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 107, 107, 0.9)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 3000,
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}>
          <span>{notification.type === 'success' ? '✓' : '✕'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setDeleteConfirm({ show: false, id: null, subject: '' })}
        >
          <div
            style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              border: '1px solid #333',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255, 107, 107, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                border: '2px solid #ff6b6b'
              }}>
                <span style={{ fontSize: '1.8rem' }}>🗑️</span>
              </div>
              <h3 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.5rem',
                color: '#fff',
                marginBottom: '0.5rem',
                letterSpacing: '1px'
              }}>
                Delete Message?
              </h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong style={{ color: '#F7D046' }}>"{deleteConfirm.subject}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null, subject: '' })}
                style={{
                  flex: 1,
                  padding: '0.8rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid #555',
                  color: '#fff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                style={{
                  flex: 1,
                  padding: '0.8rem 1.5rem',
                  background: '#ff6b6b',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
