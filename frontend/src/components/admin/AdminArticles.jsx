import { useState, useEffect } from 'react';

import { API_URL } from '../../config';

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    featuredImage: '',
    mediumUrl: '',
    authorName: '',
    authorImage: '',
    category: 'other',
    readTime: 5,
    status: 'published',
    isActive: true,
    isFeatured: false
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/articles/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setArticles(data.data || []);
      } else {
        // Fallback to public route
        const publicRes = await fetch(`${API_URL}/articles`);
        const publicData = await publicRes.json();
        setArticles(publicData.data || []);
      }
    } catch (error) {
      console.error('Fetch articles error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const submitData = {
      ...formData,
      content: formData.excerpt || formData.title,
      publishedAt: formData.status === 'published' ? new Date() : null
    };

    try {
      const url = editingArticle
        ? `${API_URL}/articles/${editingArticle._id}`
        : `${API_URL}/articles`;

      const response = await fetch(url, {
        method: editingArticle ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(editingArticle ? 'Article updated successfully!' : 'Article created successfully!', 'success');
        fetchArticles();
        closeModal();
      } else {
        showNotification(data.message || 'Error saving article', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Error saving article. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/articles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showNotification('Article deleted successfully!', 'success');
        fetchArticles();
      } else {
        showNotification('Error deleting article', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Error deleting article. Please try again.', 'error');
    } finally {
      setDeleteConfirm({ show: false, id: null, title: '' });
    }
  };

  const togglePublish = async (article) => {
    const token = localStorage.getItem('token');
    const newStatus = article.status === 'published' ? 'draft' : 'published';

    try {
      const response = await fetch(`${API_URL}/articles/${article._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          publishedAt: newStatus === 'published' ? new Date() : null
        })
      });

      if (response.ok) {
        showNotification(`Article ${newStatus === 'published' ? 'published' : 'unpublished'}!`, 'success');
        fetchArticles();
      }
    } catch (error) {
      console.error('Toggle publish error:', error);
    }
  };

  const confirmDelete = (article) => {
    setDeleteConfirm({ show: true, id: article._id, title: article.title });
  };

  const openAddModal = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      excerpt: '',
      featuredImage: '',
      mediumUrl: '',
      authorName: '',
      authorImage: '',
      category: 'other',
      readTime: 5,
      status: 'published',
      isActive: true,
      isFeatured: false
    });
    setShowModal(true);
  };

  const openEditModal = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || '',
      excerpt: article.excerpt || '',
      featuredImage: article.featuredImage || '',
      mediumUrl: article.mediumUrl || '',
      authorName: article.authorName || '',
      authorImage: article.authorImage || '',
      category: article.category || 'other',
      readTime: article.readTime || 5,
      status: article.status || 'published',
      isActive: article.isActive !== false,
      isFeatured: article.isFeatured || false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingArticle(null);
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'all') return true;
    if (filter === 'featured') return article.isFeatured;
    if (filter === 'published') return article.status === 'published';
    if (filter === 'draft') return article.status === 'draft';
    return article.category === filter;
  });

  const categories = ['technology', 'career', 'tutorials', 'news', 'events', 'success-stories', 'tips', 'other'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return '#4CAF50';
      case 'draft': return '#F7D046';
      case 'scheduled': return '#2196F3';
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

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#FAF7F2', letterSpacing: '2px' }}>
            ARTICLES MANAGEMENT
          </h1>
          <p style={{ color: '#888' }}>{articles.length} total articles</p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            background: '#F7D046',
            color: '#0a0a0a',
            border: 'none',
            padding: '0.8rem 1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '1px',
            fontSize: '1rem'
          }}
        >
          + NEW ARTICLE
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['all', 'published', 'draft', 'featured'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1rem',
              background: filter === f ? '#F7D046' : 'transparent',
              color: filter === f ? '#0a0a0a' : '#FAF7F2',
              border: `1px solid ${filter === f ? '#F7D046' : '#333'}`,
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontSize: '0.85rem'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Articles List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredArticles.map(article => (
          <div
            key={article._id}
            style={{
              background: '#1a1a1a',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #222',
              display: 'grid',
              gridTemplateColumns: '150px 1fr auto auto',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '1rem'
            }}
          >
            {/* Image */}
            <div style={{
              width: '150px',
              height: '100px',
              background: '#111',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              {article.featuredImage ? (
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#444',
                  fontSize: '2rem'
                }}>
                  📝
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{
                  background: getStatusColor(article.status),
                  color: '#fff',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  borderRadius: '3px'
                }}>
                  {article.status?.toUpperCase()}
                </span>
                {article.isFeatured && (
                  <span style={{ color: '#F7D046', fontSize: '0.8rem' }}>⭐ Featured</span>
                )}
              </div>
              <h3 style={{ color: '#FAF7F2', margin: '0 0 0.5rem', fontSize: '1.2rem' }}>{article.title}</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
                {article.excerpt || article.content?.substring(0, 100)}...
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: '#666', fontSize: '0.8rem' }}>
                <span>📁 {article.category}</span>
                <span>⏱ {article.readTime || 5} min read</span>
                {article.authorName && <span>✍️ {article.authorName}</span>}
                {article.mediumUrl && (
                  <a href={article.mediumUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#F7D046', textDecoration: 'none' }}>
                    🔗 Medium
                  </a>
                )}
              </div>
            </div>

            {/* Publish Toggle */}
            <button
              onClick={() => togglePublish(article)}
              style={{
                padding: '0.5rem 1rem',
                background: article.status === 'published' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(247, 208, 70, 0.2)',
                color: article.status === 'published' ? '#4CAF50' : '#F7D046',
                border: `1px solid ${article.status === 'published' ? '#4CAF50' : '#F7D046'}`,
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              {article.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => openEditModal(article)}
                style={{
                  background: 'transparent',
                  border: '1px solid #F7D046',
                  color: '#F7D046',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => confirmDelete(article)}
                style={{
                  background: 'transparent',
                  border: '1px solid #ff6b6b',
                  color: '#ff6b6b',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredArticles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
            <p>No articles found</p>
            <button onClick={openAddModal} style={{ marginTop: '1rem', background: '#F7D046', color: '#0a0a0a', border: 'none', padding: '0.8rem 1.5rem', cursor: 'pointer' }}>
              Write First Article
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>{editingArticle ? 'EDIT ARTICLE' : 'NEW ARTICLE'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Article title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Medium URL *</label>
                <input
                  type="url"
                  value={formData.mediumUrl}
                  onChange={e => setFormData({ ...formData, mediumUrl: e.target.value })}
                  placeholder="https://medium.com/@womentocode/your-article-slug"
                  required
                />
                <small style={{ color: '#888', fontSize: '0.75rem' }}>Paste the link to your Medium article - clicking the card will redirect here</small>
              </div>

              <div className="form-group">
                <label>Excerpt (Short Preview) *</label>
                <textarea
                  value={formData.excerpt}
                  onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief summary that appears on article cards..."
                  rows={3}
                  maxLength={300}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cover Image *</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, featuredImage: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {formData.featuredImage && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={formData.featuredImage} alt="Preview" style={{ maxWidth: '300px', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Read Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.readTime}
                    onChange={e => setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })}
                    min="1"
                    max="60"
                  />
                </div>
              </div>

              <div className="form-section-title">Author Information</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Author Name *</label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={e => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="Author's name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Author Photo</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, authorImage: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {formData.authorImage && (
                    <img src={formData.authorImage} alt="Author" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginTop: '0.5rem' }} />
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    Featured Article (shows larger on page)
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Visible on website
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="submit-btn">
                  {editingArticle ? 'Update Article' : 'Add Article'}
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
                Delete Article?
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

export default AdminArticles;
