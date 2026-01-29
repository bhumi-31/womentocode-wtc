import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    type: 'Workshop',
    fullDate: '',
    date: '',
    month: '',
    year: '',
    startTime: '',
    time: '',
    location: '',
    isOnline: false,
    speaker: {
      name: '',
      role: '',
      image: ''
    },
    registrationLink: '',
    maxAttendees: '',
    image: '',
    status: 'upcoming'
  });

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

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
      // Try public events endpoint first
      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();
      
      console.log('Events API response:', data);
      
      if (Array.isArray(data)) {
        console.log('Setting events from array:', data.length);
        setEvents(data);
      } else if (data.success && Array.isArray(data.data)) {
        // Map backend fields to frontend expected format
        const mappedEvents = data.data.map(event => ({
          ...event,
          month: event.startDate ? new Date(event.startDate).toLocaleString('en', { month: 'short' }).toUpperCase() : event.month,
          date: event.startDate ? new Date(event.startDate).getDate() : event.date,
          year: event.startDate ? new Date(event.startDate).getFullYear() : event.year,
          location: event.venue || event.location || (event.isOnline ? 'Online' : 'TBD'),
          time: event.startTime || event.time
        }));
        console.log('Setting mapped events:', mappedEvents.length);
        setEvents(mappedEvents);
      } else if (data.events) {
        console.log('Setting events from data.events:', data.events.length);
        setEvents(data.events);
      } else {
        console.log('No events found in response');
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
    } finally {
      setDeleteConfirm({ show: false, id: null, title: '' });
    }
  };

  const confirmDelete = (event) => {
    setDeleteConfirm({ show: true, id: event._id, title: event.title });
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      type: 'Workshop',
      fullDate: '',
      date: '',
      month: '',
      year: new Date().getFullYear().toString(),
      startTime: '',
      time: '',
      location: '',
      isOnline: false,
      speaker: {
        name: '',
        role: '',
        image: ''
      },
      registrationLink: '#',
      maxAttendees: '',
      image: '',
      status: 'upcoming'
    });
    setShowModal(true);
  };

  const openEditModal = (event) => {
    // Create fullDate from existing date/month/year
    let fullDate = '';
    if (event.year && event.month && event.date) {
      const monthIndex = months.indexOf(event.month);
      if (monthIndex !== -1) {
        fullDate = `${event.year}-${String(monthIndex + 1).padStart(2, '0')}-${String(event.date).padStart(2, '0')}`;
      }
    }
    
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      shortDescription: event.shortDescription || '',
      type: event.type || 'Workshop',
      fullDate: fullDate,
      date: event.date || '',
      month: event.month || '',
      year: event.year || new Date().getFullYear().toString(),
      startTime: event.startTime || '',
      time: event.time || '',
      location: event.location || '',
      isOnline: event.isOnline || false,
      speaker: {
        name: event.speaker?.name || '',
        role: event.speaker?.role || '',
        image: event.speaker?.image || ''
      },
      registrationLink: event.registrationLink || '#',
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
    return event.status === filter || event.type === filter;
  });

  console.log('Events state:', events.length, 'Filtered:', filteredEvents.length);

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
    <div className="admin-events">
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
        {['all', 'upcoming', 'ongoing', 'completed', 'Workshop', 'Talk', 'Hackathon'].map(f => (
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
      <div className="events-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        
        {filteredEvents.map((event, index) => (
          <div key={event._id || index} style={{
            background: '#111111',
            border: '2px solid #F7D046',
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: '80px 1fr auto auto',
            gap: '1.5rem',
            alignItems: 'center',
            minHeight: '100px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '0.5rem',
              border: '1px solid #F7D046'
            }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#F7D046', textTransform: 'uppercase' }}>{event.month || 'TBD'}</span>
              <span style={{ display: 'block', fontSize: '2rem', color: '#FAF7F2' }}>{event.date || '--'}</span>
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#FAF7F2' }}>{event.title}</h3>
              <p style={{ color: '#888888', fontSize: '0.85rem', margin: '0.5rem 0' }}>{event.shortDescription || event.description?.substring(0, 100)}</p>
              <span style={{ color: '#888', fontSize: '0.8rem' }}>📍 {event.location || event.venue || 'TBD'}</span>
            </div>
            <div style={{ color: '#F7D046' }}>
              {event.status?.toUpperCase() || 'UPCOMING'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => openEditModal(event)} style={{ background: 'transparent', border: '1px solid #F7D046', color: '#F7D046', padding: '0.5rem 1rem', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => confirmDelete(event)} style={{ background: 'transparent', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '0.5rem 1rem', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
        
        {filteredEvents.length === 0 && (
          <div className="empty-state">
            <p>No events found</p>
            <button className="add-btn" onClick={openAddModal}>Create First Event</button>
          </div>
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
                  placeholder="e.g., React & Node.js Masterclass"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Type *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Talk">Talk</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Conference">Conference</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Networking">Networking</option>
                    <option value="Other">Other</option>
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
                  placeholder="Detailed event description..."
                  required
                />
              </div>

              <div className="form-section-title">Date & Time</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    value={formData.fullDate || ''}
                    onChange={e => {
                      const dateObj = new Date(e.target.value);
                      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                      setFormData({
                        ...formData,
                        fullDate: e.target.value,
                        date: dateObj.getDate().toString().padStart(2, '0'),
                        month: months[dateObj.getMonth()],
                        year: dateObj.getFullYear().toString()
                      });
                    }}
                    required
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                      value={formData.timeTBA ? 'TBA' : (formData.timeHour || '10')}
                      onChange={e => {
                        if (e.target.value === 'TBA') {
                          setFormData({
                            ...formData,
                            timeTBA: true,
                            time: 'To Be Announced',
                            startTime: ''
                          });
                        } else {
                          const hour = e.target.value;
                          const minute = formData.timeMinute || '00';
                          const period = formData.timePeriod || 'AM';
                          setFormData({
                            ...formData,
                            timeTBA: false,
                            timeHour: hour,
                            time: `${hour}:${minute} ${period}`,
                            startTime: `${period === 'PM' && hour !== '12' ? parseInt(hour) + 12 : hour}:${minute}`
                          });
                        }
                      }}
                      style={{ flex: 1, padding: '0.75rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                      required
                    >
                      <option value="TBA">To Be Announced</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={String(i+1).padStart(2, '0')}>{String(i+1).padStart(2, '0')}</option>
                      ))}
                    </select>
                    {!formData.timeTBA && (
                      <>
                        <span style={{ color: '#F7D046', fontSize: '1.2rem' }}>:</span>
                        <select
                          value={formData.timeMinute || '00'}
                          onChange={e => {
                            const hour = formData.timeHour || '10';
                            const minute = e.target.value;
                            const period = formData.timePeriod || 'AM';
                            setFormData({
                              ...formData,
                              timeMinute: minute,
                              time: `${hour}:${minute} ${period}`,
                              startTime: `${period === 'PM' && hour !== '12' ? parseInt(hour) + 12 : hour}:${minute}`
                            });
                          }}
                          style={{ flex: 1, padding: '0.75rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                        >
                          {['00', '15', '30', '45'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={formData.timePeriod || 'AM'}
                          onChange={e => {
                            const hour = formData.timeHour || '10';
                            const minute = formData.timeMinute || '00';
                            const period = e.target.value;
                            setFormData({
                              ...formData,
                              timePeriod: period,
                              time: `${hour}:${minute} ${period}`,
                              startTime: `${period === 'PM' && hour !== '12' ? parseInt(hour) + 12 : hour}:${minute}`
                            });
                          }}
                          style={{ flex: 1, padding: '0.75rem', background: '#1a1a1a', border: '1px solid #333', color: '#F7D046', fontWeight: 'bold' }}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section-title">Location</div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Online + LPU Campus, LPU Auditorium, Online"
                  required
                />
              </div>
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

              <div className="form-section-title">Speaker Info</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Speaker Name *</label>
                  <input
                    type="text"
                    value={formData.speaker.name}
                    onChange={e => setFormData({...formData, speaker: {...formData.speaker, name: e.target.value}})}
                    placeholder="e.g., Priya Sharma"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Speaker Role *</label>
                  <input
                    type="text"
                    value={formData.speaker.role}
                    onChange={e => setFormData({...formData, speaker: {...formData.speaker, role: e.target.value}})}
                    placeholder="e.g., Tech Lead, Ex-Google"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Speaker Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({...formData, speaker: {...formData.speaker, image: reader.result}});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ 
                    background: '#1a1a1a', 
                    border: '1px solid #333', 
                    padding: '0.75rem',
                    color: '#fff',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                />
                {formData.speaker.image && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <img 
                      src={formData.speaker.image} 
                      alt="Speaker preview" 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'cover', 
                        borderRadius: '50%',
                        border: '2px solid #F7D046'
                      }} 
                    />
                  </div>
                )}
              </div>

              <div className="form-section-title">Additional Info</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Registration Link</label>
                  <input
                    type="text"
                    value={formData.registrationLink}
                    onChange={e => setFormData({...formData, registrationLink: e.target.value})}
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
                <label>Event Image (JPG, JPEG, PNG, PDF)</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
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
                  style={{ colorScheme: 'dark' }}
                />
                {formData.image && formData.image.startsWith('data:image') && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" />
                  </div>
                )}
                {formData.image && formData.image.startsWith('data:application/pdf') && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(247, 208, 70, 0.1)', borderRadius: '8px' }}>
                    <span style={{ color: '#F7D046' }}>PDF file selected</span>
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
          onClick={() => setDeleteConfirm({ show: false, id: null, title: '' })}
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
                Delete Event?
              </h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong style={{ color: '#F7D046' }}>"{deleteConfirm.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setDeleteConfirm({ show: false, id: null, title: '' })}
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

export default AdminEvents;
