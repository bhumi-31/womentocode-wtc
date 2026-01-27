import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5001';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    eventType: 'workshop',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    isOnline: false,
    venue: '',
    city: '',
    registrationUrl: '',
    maxAttendees: '',
    image: '',
    status: 'upcoming'
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const token = localStorage.getItem('token');
    
    try {
      let response = await fetch(`${API_URL}/events/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        response = await fetch(`${API_URL}/events`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setEvents(data);
      } else if (data.success && Array.isArray(data.data)) {
        setEvents(data.data);
      } else if (data.events) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Fetch events error:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const url = editingEvent 
        ? `${API_URL}/events/${editingEvent._id}`
        : `${API_URL}/events`;
      
      const response = await fetch(url, {
        method: editingEvent ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showNotification(editingEvent ? 'Event updated successfully!' : 'Event added successfully!', 'success');
        fetchEvents();
        closeModal();
      } else {
        showNotification(data.message || 'Error saving event', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Error saving event. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        showNotification('Event deleted successfully!', 'success');
        fetchEvents();
      } else {
        showNotification('Error deleting event', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Error deleting event. Please try again.', 'error');
    }
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      eventType: 'workshop',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      isOnline: false,
      venue: '',
      city: '',
      registrationUrl: '',
      maxAttendees: '',
      image: '',
      status: 'upcoming'
    });
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      shortDescription: event.shortDescription || '',
      eventType: event.eventType || 'workshop',
      startDate: event.startDate ? event.startDate.split('T')[0] : '',
      endDate: event.endDate ? event.endDate.split('T')[0] : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      isOnline: event.isOnline || false,
      venue: event.venue || '',
      city: event.city || '',
      registrationUrl: event.registrationUrl || '',
      maxAttendees: event.maxAttendees || '',
      image: event.image || '',
      status: event.status || 'upcoming'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter || event.eventType === filter;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#F7D046';
      case 'ongoing': return '#4CAF50';
      case 'completed': return '#888';
      case 'cancelled': return '#f44336';
      default: return '#888';
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
      {/* Notification */}
      {notification.show && (
        <div className={`admin-notification ${notification.type}`}>
          <span className="notification-icon">
            {notification.type === 'success' ? '✓' : '✕'}
          </span>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">EVENTS MANAGEMENT</h1>
          <p className="page-subtitle">{events.length} total events</p>
        </div>
        <button className="add-btn" onClick={openAddModal}>
          + ADD EVENT
        </button>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {['all', 'upcoming', 'ongoing', 'completed', 'workshop', 'webinar', 'meetup'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="events-list">
        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <p>No events found</p>
            <button className="add-btn" onClick={openAddModal}>Create First Event</button>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event._id} className="event-card">
              <div className="event-date-block">
                <span className="event-month">{formatDate(event.startDate).split(' ')[0]}</span>
                <span className="event-day">{formatDate(event.startDate).split(' ')[1]?.replace(',', '')}</span>
              </div>
              <div className="event-info">
                <div className="event-header">
                  <h3 className="event-title">{event.title}</h3>
                  <span className="event-type">{event.eventType}</span>
                </div>
                <p className="event-desc">{event.shortDescription || event.description?.substring(0, 100)}</p>
                <div className="event-meta">
                  <span>{event.isOnline ? '🌐 Online' : `📍 ${event.venue || event.city || 'TBD'}`}</span>
                  {event.startTime && <span>🕐 {event.startTime}</span>}
                  {event.maxAttendees && <span>👥 Max: {event.maxAttendees}</span>}
                </div>
              </div>
              <div className="event-status" style={{ color: getStatusColor(event.status) }}>
                {event.status?.toUpperCase() || 'UPCOMING'}
              </div>
              <div className="event-actions">
                <button className="edit-btn" onClick={() => openEditModal(event)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(event._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'EDIT EVENT' : 'CREATE NEW EVENT'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Type</label>
                  <select
                    value={formData.eventType}
                    onChange={e => setFormData({...formData, eventType: e.target.value})}
                  >
                    <option value="workshop">Workshop</option>
                    <option value="webinar">Webinar</option>
                    <option value="meetup">Meetup</option>
                    <option value="conference">Conference</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="seminar">Seminar</option>
                    <option value="networking">Networking</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="draft">Draft</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={e => setFormData({...formData, shortDescription: e.target.value})}
                  placeholder="Brief description for cards..."
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label>Full Description *</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <div className="form-section-title">Date & Time</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    placeholder="e.g., 10:00 AM"
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                    placeholder="e.g., 4:00 PM"
                  />
                </div>
              </div>

              <div className="form-section-title">Location</div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isOnline}
                    onChange={e => setFormData({...formData, isOnline: e.target.checked})}
                  />
                  This is an online event
                </label>
              </div>
              {!formData.isOnline && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Venue</label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={e => setFormData({...formData, venue: e.target.value})}
                      placeholder="Venue name"
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="form-section-title">Additional Info</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Registration URL</label>
                  <input
                    type="text"
                    value={formData.registrationUrl}
                    onChange={e => setFormData({...formData, registrationUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label>Max Attendees</label>
                  <input
                    type="number"
                    value={formData.maxAttendees}
                    onChange={e => setFormData({...formData, maxAttendees: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Event Image</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({...formData, image: reader.result});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="submit-btn">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
