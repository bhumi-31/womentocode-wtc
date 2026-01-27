import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5001';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all');

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
    if (!confirm('Delete this message?')) return;
    
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
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
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
                    onClick={() => handleDelete(selectedMessage._id)}
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
    </div>
  );
};

export default AdminMessages;
