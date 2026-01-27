import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5001';

const AdminTeam = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image: '',
    bio: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: '',
      instagram: ''
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
        body: JSON.stringify(formData)
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
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    
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
    }
  };

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      role: '',
      image: '',
      bio: '',
      socialLinks: { linkedin: '', twitter: '', github: '', instagram: '' },
      order: members.length,
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      role: member.role || '',
      image: member.image || '',
      bio: member.bio || '',
      socialLinks: member.socialLinks || { linkedin: '', twitter: '', github: '', instagram: '' },
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
            <div key={member._id} className="team-card">
              <div className="member-image">
                {member.image ? (
                  <img src={member.image} alt={member.name} />
                ) : (
                  <div className="member-initial">{member.name?.charAt(0)}</div>
                )}
                {!member.isActive && <span className="inactive-badge">Inactive</span>}
              </div>
              <div className="member-info">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                {member.bio && <p className="member-bio">{member.bio}</p>}
                <div className="member-socials">
                  {member.socialLinks?.linkedin && <span>LinkedIn</span>}
                  {member.socialLinks?.twitter && <span>Twitter</span>}
                  {member.socialLinks?.github && <span>GitHub</span>}
                </div>
              </div>
              <div className="member-actions">
                <button className="edit-btn" onClick={() => openEditModal(member)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(member._id)}>Delete</button>
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
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role/Position *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    placeholder="e.g., Founder, Developer"
                    required
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

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  placeholder="Short description about the member..."
                  rows={3}
                />
              </div>

              <div className="form-section-title">Social Links</div>
              <div className="form-row">
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="text"
                    value={formData.socialLinks.linkedin}
                    onChange={e => setFormData({
                      ...formData, 
                      socialLinks: {...formData.socialLinks, linkedin: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Twitter</label>
                  <input
                    type="text"
                    value={formData.socialLinks.twitter}
                    onChange={e => setFormData({
                      ...formData, 
                      socialLinks: {...formData.socialLinks, twitter: e.target.value}
                    })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>GitHub</label>
                  <input
                    type="text"
                    value={formData.socialLinks.github}
                    onChange={e => setFormData({
                      ...formData, 
                      socialLinks: {...formData.socialLinks, github: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Instagram</label>
                  <input
                    type="text"
                    value={formData.socialLinks.instagram}
                    onChange={e => setFormData({
                      ...formData, 
                      socialLinks: {...formData.socialLinks, instagram: e.target.value}
                    })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
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
    </div>
  );
};

export default AdminTeam;
