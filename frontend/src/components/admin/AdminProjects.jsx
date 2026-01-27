import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5001';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    creatorName: '',
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
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
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
    }
  };

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      creatorName: '',
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
      <div className="projects-grid">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found</p>
            <button className="add-btn" onClick={openAddModal}>Add First Project</button>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project._id} className="project-card">
              <div className="project-image">
                {project.image ? (
                  <img src={project.image} alt={project.title} />
                ) : (
                  <div className="project-placeholder">📁</div>
                )}
                {project.isFeatured && <span className="featured-badge">⭐ Featured</span>}
                {!project.isVisible && <span className="hidden-badge">Hidden</span>}
              </div>
              <div className="project-info">
                <div className="project-header">
                  <h3 className="project-title">{project.title}</h3>
                  <span 
                    className="project-status"
                    style={{ color: getStatusColor(project.status) }}
                  >
                    {project.status?.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                {project.creatorName && (
                  <p className="project-creator-info">
                    By <strong>{project.creatorName}</strong>
                    {project.graduationYear && ` • Class of ${project.graduationYear}`}
                  </p>
                )}
                <p className="project-desc">{project.shortDescription || project.description?.substring(0, 100)}</p>
                <div className="project-meta">
                  <span className="project-category">{project.category}</span>
                  {Array.isArray(project.technologies) && project.technologies.slice(0, 3).map(tech => (
                    <span key={tech} className="tech-tag">{tech}</span>
                  ))}
                </div>
                <div className="project-links">
                  {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">🔗 Live</a>}
                  {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">📦 GitHub</a>}
                </div>
              </div>
              <div className="project-actions">
                <button className="edit-btn" onClick={() => openEditModal(project)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(project._id)}>Delete</button>
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
              <h2>{editingProject ? 'EDIT PROJECT' : 'ADD NEW PROJECT'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Creator Name *</label>
                  <input
                    type="text"
                    value={formData.creatorName}
                    onChange={e => setFormData({...formData, creatorName: e.target.value})}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Year of Graduation</label>
                  <input
                    type="text"
                    value={formData.graduationYear}
                    onChange={e => setFormData({...formData, graduationYear: e.target.value})}
                    placeholder="e.g., 2024"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
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
                    onChange={e => setFormData({...formData, projectType: e.target.value})}
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
                    onChange={e => setFormData({...formData, status: e.target.value})}
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

              <div className="form-group">
                <label>Technologies (comma separated)</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={e => setFormData({...formData, technologies: e.target.value})}
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
                    onChange={e => setFormData({...formData, liveUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label>GitHub URL</label>
                  <input
                    type="text"
                    value={formData.githubUrl}
                    onChange={e => setFormData({...formData, githubUrl: e.target.value})}
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

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                    />
                    Featured Project (show on homepage)
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={e => setFormData({...formData, isVisible: e.target.checked})}
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
    </div>
  );
};

export default AdminProjects;
