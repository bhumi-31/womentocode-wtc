import { useState, useEffect } from 'react';

import { API_URL } from '../../config';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    creatorName: '',
    creatorRole: '',
    creatorImage: '',
    graduationYear: '',
    category: 'web',
    projectType: 'personal',
    technologies: '',
    liveUrl: '',
    githubUrl: '',
    image: '',
    status: 'in-progress',
    isFeatured: false,
    isVisible: true
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const token = localStorage.getItem('token');

    try {
      let response = await fetch(`${API_URL}/projects/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        response = await fetch(`${API_URL}/projects`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setProjects(data);
      } else if (data.success && Array.isArray(data.data)) {
        setProjects(data.data);
      } else if (data.projects) {
        setProjects(data.projects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Fetch projects error:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const submitData = {
      ...formData,
      technologies: formData.technologies.split(',').map(t => t.trim()).filter(t => t)
    };

    try {
      const url = editingProject
        ? `${API_URL}/projects/${editingProject._id}`
        : `${API_URL}/projects`;

      const response = await fetch(url, {
        method: editingProject ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        fetchProjects();
        closeModal();
        showNotification(
          editingProject ? 'Project updated successfully!' : 'Project added successfully!',
          'success'
        );
      } else {
        showNotification(data.message || 'Error saving project', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Error saving project. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showNotification('Project deleted successfully!', 'success');
        fetchProjects();
      } else {
        showNotification('Error deleting project', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Error deleting project. Please try again.', 'error');
    } finally {
      setDeleteConfirm({ show: false, id: null, title: '' });
    }
  };

  const confirmDelete = (project) => {
    setDeleteConfirm({ show: true, id: project._id, title: project.title });
  };

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      creatorName: '',
      creatorRole: '',
      creatorImage: '',
      graduationYear: '',
      category: 'web',
      projectType: 'personal',
      technologies: '',
      liveUrl: '',
      githubUrl: '',
      image: '',
      status: 'in-progress',
      isFeatured: false,
      isVisible: true
    });
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      shortDescription: project.shortDescription || '',
      creatorName: project.creatorName || '',
      creatorRole: project.creatorRole || '',
      creatorImage: project.creatorImage || '',
      graduationYear: project.graduationYear || '',
      category: project.category || 'web',
      projectType: project.projectType || 'personal',
      technologies: (project.technologies || []).join(', '),
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      image: project.image || '',
      status: project.status || 'in-progress',
      isFeatured: project.isFeatured || false,
      isVisible: project.isVisible !== false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'featured') return project.isFeatured;
    return project.category === filter || project.status === filter;
  });

  console.log('Projects:', projects.length, 'Filtered:', filteredProjects.length);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#F7D046';
      case 'on-hold': return '#ff9800';
      case 'archived': return '#888';
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
          <h1 className="page-title">PROJECTS MANAGEMENT</h1>
          <p className="page-subtitle">{projects.length} total projects</p>
        </div>
        <button className="add-btn" onClick={openAddModal}>
          + ADD PROJECT
        </button>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {['all', 'featured', 'web', 'mobile', 'data-science', 'completed', 'in-progress'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase().replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>

        {filteredProjects.map((project, index) => (
          <div key={project._id || index} style={{
            background: '#111111',
            border: '2px solid #F7D046',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              height: '180px',
              background: '#222222',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {project.image ? (
                <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '3rem' }}>📁</span>
              )}
              {project.isFeatured && (
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#F7D046', color: '#000', padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>⭐ Featured</span>
              )}
            </div>
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#FAF7F2' }}>{project.title}</h3>
                <span style={{ color: getStatusColor(project.status), fontSize: '0.8rem' }}>
                  {project.status?.replace('-', ' ').toUpperCase() || 'IN PROGRESS'}
                </span>
              </div>
              {project.creatorName && (
                <p style={{ color: '#F7D046', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                  By <strong>{project.creatorName}</strong>
                  {project.graduationYear && ` • Class of ${project.graduationYear}`}
                </p>
              )}
              <p style={{ color: '#888888', fontSize: '0.85rem', margin: '0.5rem 0' }}>{project.shortDescription || project.description?.substring(0, 100)}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                <span style={{ background: '#222222', padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#F7D046' }}>{project.category}</span>
                {Array.isArray(project.technologies) && project.technologies.slice(0, 3).map(tech => (
                  <span key={tech} style={{ background: '#222222', padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#888' }}>{tech}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem', borderTop: '1px solid #222222' }}>
              <button onClick={() => openEditModal(project)} style={{ flex: 1, background: 'transparent', border: '1px solid #F7D046', color: '#F7D046', padding: '0.5rem', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => confirmDelete(project)} style={{ flex: 1, background: 'transparent', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '0.5rem', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="empty-state">
            <p>No projects found</p>
            <button className="add-btn" onClick={openAddModal}>Add First Project</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? 'EDIT PROJECT' : 'ADD NEW PROJECT'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-section-title">Creator Information</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Creator Name *</label>
                  <input
                    type="text"
                    value={formData.creatorName}
                    onChange={e => setFormData({ ...formData, creatorName: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Creator Role / Title</label>
                  <input
                    type="text"
                    value={formData.creatorRole}
                    onChange={e => setFormData({ ...formData, creatorRole: e.target.value })}
                    placeholder="e.g., Full Stack Developer"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year of Graduation</label>
                  <input
                    type="text"
                    value={formData.graduationYear}
                    onChange={e => setFormData({ ...formData, graduationYear: e.target.value })}
                    placeholder="e.g., 2024"
                    maxLength={4}
                  />
                </div>
                <div className="form-group">
                  <label>Creator Photo URL</label>
                  <input
                    type="text"
                    value={formData.creatorImage}
                    onChange={e => setFormData({ ...formData, creatorImage: e.target.value })}
                    placeholder="https://... or leave blank"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="desktop">Desktop</option>
                    <option value="data-science">Data Science</option>
                    <option value="machine-learning">Machine Learning</option>
                    <option value="iot">IoT</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Project Type</label>
                  <select
                    value={formData.projectType}
                    onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                  >
                    <option value="personal">Personal</option>
                    <option value="client">Client</option>
                    <option value="open-source">Open Source</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="academic">Academic</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description for cards..."
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label>Full Description *</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label>Technologies (comma separated)</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={e => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="React, Node.js, MongoDB, etc."
                />
              </div>

              <div className="form-section-title">Links</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Live Demo URL</label>
                  <input
                    type="text"
                    value={formData.liveUrl}
                    onChange={e => setFormData({ ...formData, liveUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label>GitHub URL</label>
                  <input
                    type="text"
                    value={formData.githubUrl}
                    onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Project Image</label>
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

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    Featured Project (show on homepage)
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={e => setFormData({ ...formData, isVisible: e.target.checked })}
                    />
                    Visible on website
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="submit-btn">
                  {editingProject ? 'Update Project' : 'Add Project'}
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
                Delete Project?
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
                  fontWeight: '500',
                  transition: 'all 0.2s'
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
                  fontWeight: '500',
                  transition: 'all 0.2s'
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

export default AdminProjects;
