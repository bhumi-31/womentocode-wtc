import { useState, useEffect } from 'react';

import { API_URL } from '../../config';

const AdminTeam = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    image: '',
    color: '#F7D046',
    quote: '',
    techStack: '',
    social: {
      linkedin: '',
      twitter: '',
      github: ''
    },
    order: 0,
    isActive: true
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/team`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setMembers(data);
      } else if (data.success && Array.isArray(data.data)) {
        setMembers(data.data);
      } else if (data.members) {
        setMembers(data.members);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Fetch team error:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
      image: formData.image,
      color: formData.color,
      quote: formData.quote,
      techStack: formData.techStack,
      social: formData.social,
      order: formData.order,
      isActive: formData.isActive
    };

    try {
      const url = editingMember
        ? `${API_URL}/team/${editingMember._id}`
        : `${API_URL}/team`;

      const response = await fetch(url, {
        method: editingMember ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(editingMember ? 'Member updated successfully!' : 'Member added successfully!', 'success');
        fetchMembers();
        closeModal();
      } else {
        showNotification(data.message || 'Error saving member', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Error saving member. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showNotification('Member deleted successfully!', 'success');
        fetchMembers();
      } else {
        showNotification('Error deleting member', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Error deleting member. Please try again.', 'error');
    } finally {
      setDeleteConfirm({ show: false, id: null, name: '' });
    }
  };

  const confirmDelete = (member) => {
    setDeleteConfirm({ show: true, id: member._id, name: `${member.firstName} ${member.lastName}` });
  };

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      firstName: '',
      lastName: '',
      role: '',
      image: '',
      color: '#F7D046',
      quote: '',
      techStack: '',
      social: {
        linkedin: '',
        twitter: '',
        github: ''
      },
      order: members.length,
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    const socialData = member.social || member.socialLinks || {};

    setFormData({
      firstName: member.firstName || member.name?.split(' ')[0] || '',
      lastName: member.lastName || member.name?.split(' ').slice(1).join(' ') || '',
      role: member.role || '',
      image: member.image || '',
      color: member.color || '#F7D046',
      quote: member.quote || '',
      techStack: member.techStack || '',
      social: {
        linkedin: socialData.linkedin || '',
        twitter: socialData.twitter || '',
        github: socialData.github || ''
      },
      order: member.order || 0,
      isActive: member.isActive !== false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
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
          <h1 className="page-title">TEAM MANAGEMENT</h1>
          <p className="page-subtitle">{members.length} team members</p>
        </div>
        <button className="add-btn" onClick={openAddModal}>
          + ADD MEMBER
        </button>
      </div>

      {/* Team Grid */}
      <div className="team-grid">
        {members.length === 0 ? (
          <div className="empty-state">
            <p>No team members yet</p>
            <button className="add-btn" onClick={openAddModal}>Add First Member</button>
          </div>
        ) : (
          members.map(member => (
            <div key={member._id} className="team-card" style={{ borderLeft: `4px solid ${member.color || '#F7D046'}` }}>
              <div className="member-image">
                {member.image ? (
                  <img src={member.image} alt={member.name || `${member.firstName} ${member.lastName}`} />
                ) : (
                  <div className="member-initial">{member.firstName?.charAt(0) || member.name?.charAt(0)}</div>
                )}
                {!member.isActive && <span className="inactive-badge">Inactive</span>}
              </div>
              <h3 style={{ color: '#FAF7F2', fontSize: '1.4rem', margin: '0.5rem 0' }}>
                {member.name || `${member.firstName || ''} ${member.lastName || ''}` || 'No Name'}
              </h3>
              <p style={{ color: '#F7D046', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                {member.role || 'No role'}
              </p>
              {member.quote && <p style={{ fontStyle: 'italic', color: '#888' }}>"{member.quote}"</p>}
              <div className="member-actions">
                <button className="edit-btn" onClick={() => openEditModal(member)}>Edit</button>
                <button className="delete-btn" onClick={() => confirmDelete(member)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMember ? 'EDIT MEMBER' : 'ADD NEW MEMBER'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role/Position *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Founder & CEO, Lead Developer"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Card Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    style={{ height: '40px', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Profile Image</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, image: reader.result });
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

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={formData.quote}
                  onChange={e => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Write a short bio about this team member..."
                  rows="4"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label>Tech Stack</label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={e => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="e.g., React, Node.js, Python, MongoDB"
                />
              </div>

              <div className="form-section-title">Social Links (Optional)</div>
              <div className="form-row">
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="text"
                    value={formData.social.linkedin}
                    onChange={e => setFormData({
                      ...formData,
                      social: { ...formData.social, linkedin: e.target.value }
                    })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="form-group">
                  <label>GitHub</label>
                  <input
                    type="text"
                    value={formData.social.github}
                    onChange={e => setFormData({
                      ...formData,
                      social: { ...formData.social, github: e.target.value }
                    })}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Twitter</label>
                <input
                  type="text"
                  value={formData.social.twitter}
                  onChange={e => setFormData({
                    ...formData,
                    social: { ...formData.social, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Active (visible on website)
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="submit-btn">
                  {editingMember ? 'Update Member' : 'Add Member'}
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
          onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
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
                Delete Team Member?
              </h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong style={{ color: '#F7D046' }}>"{deleteConfirm.name}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
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

export default AdminTeam;
