import { useState, useEffect } from 'react';

import { API_URL } from '../../config';

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    thumbnail: '',
    description: '',
    category: 'other',
    album: '',
    tags: '',
    photographer: '',
    dateTaken: '',
    order: 0,
    isActive: true,
    isFeatured: false
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/gallery/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setImages(data.data || []);
      } else {
        // Fallback to public route
        const publicRes = await fetch(`${API_URL}/gallery`);
        const publicData = await publicRes.json();
        setImages(publicData.data || []);
      }
    } catch (error) {
      console.error('Fetch images error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const submitData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      const url = editingImage
        ? `${API_URL}/gallery/${editingImage._id}`
        : `${API_URL}/gallery`;

      const response = await fetch(url, {
        method: editingImage ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(editingImage ? 'Image updated successfully!' : 'Image added successfully!', 'success');
        fetchImages();
        closeModal();
      } else {
        showNotification(data.message || 'Error saving image', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Error saving image. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showNotification('Image deleted successfully!', 'success');
        fetchImages();
      } else {
        showNotification('Error deleting image', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Error deleting image. Please try again.', 'error');
    } finally {
      setDeleteConfirm({ show: false, id: null, title: '' });
    }
  };

  const confirmDelete = (image) => {
    setDeleteConfirm({ show: true, id: image._id, title: image.title });
  };

  const openAddModal = () => {
    setEditingImage(null);
    setFormData({
      title: '',
      image: '',
      thumbnail: '',
      description: '',
      category: 'other',
      album: '',
      tags: '',
      photographer: '',
      dateTaken: '',
      order: 0,
      isActive: true,
      isFeatured: false
    });
    setShowModal(true);
  };

  const openEditModal = (image) => {
    setEditingImage(image);
    setFormData({
      title: image.title || '',
      image: image.image || '',
      thumbnail: image.thumbnail || '',
      description: image.description || '',
      category: image.category || 'other',
      album: image.album || '',
      tags: (image.tags || []).join(', '),
      photographer: image.photographer || '',
      dateTaken: image.dateTaken ? image.dateTaken.split('T')[0] : '',
      order: image.order || 0,
      isActive: image.isActive !== false,
      isFeatured: image.isFeatured || false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingImage(null);
  };

  const filteredImages = images.filter(image => {
    if (filter === 'all') return true;
    if (filter === 'featured') return image.isFeatured;
    return image.category === filter;
  });

  const categories = ['events', 'workshops', 'team', 'campus', 'students', 'achievements', 'other'];

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
            GALLERY MANAGEMENT
          </h1>
          <p style={{ color: '#888' }}>{images.length} total images</p>
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
          + ADD IMAGE
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['all', 'featured', ...categories].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '0.5rem 1rem',
              background: filter === cat ? '#F7D046' : 'transparent',
              color: filter === cat ? '#0a0a0a' : '#FAF7F2',
              border: `1px solid ${filter === cat ? '#F7D046' : '#333'}`,
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontSize: '0.85rem'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredImages.map(image => (
          <div
            key={image._id}
            style={{
              background: '#1a1a1a',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #222'
            }}
          >
            <div style={{ position: 'relative', paddingTop: '66.67%', background: '#111' }}>
              <img
                src={image.image || '/placeholder.jpg'}
                alt={image.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {image.isFeatured && (
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#F7D046',
                  color: '#0a0a0a',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  FEATURED
                </span>
              )}
              {!image.isActive && (
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: '#ff6b6b',
                  color: '#fff',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem'
                }}>
                  HIDDEN
                </span>
              )}
            </div>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ color: '#FAF7F2', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{image.title}</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
                {image.description?.substring(0, 60) || 'No description'}...
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{
                  background: '#222',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  color: '#F7D046'
                }}>
                  {image.category}
                </span>
                {image.album && (
                  <span style={{
                    background: '#222',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.7rem',
                    color: '#888'
                  }}>
                    📁 {image.album}
                  </span>
                )}
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '1rem',
              borderTop: '1px solid #222'
            }}>
              <button
                onClick={() => openEditModal(image)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #F7D046',
                  color: '#F7D046',
                  padding: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => confirmDelete(image)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #ff6b6b',
                  color: '#ff6b6b',
                  padding: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredImages.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#888' }}>
            <p>No images found</p>
            <button onClick={openAddModal} style={{ marginTop: '1rem', background: '#F7D046', color: '#0a0a0a', border: 'none', padding: '0.8rem 1.5rem', cursor: 'pointer' }}>
              Add First Image
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>{editingImage ? 'EDIT IMAGE' : 'ADD NEW IMAGE'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Image title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Upload Image *</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
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
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={formData.image} alt="Preview" style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Image description or caption"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Album</label>
                  <input
                    type="text"
                    value={formData.album}
                    onChange={e => setFormData({ ...formData, album: e.target.value })}
                    placeholder="e.g., Summer Bootcamp 2024"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="graduation, 2024, students"
                />
              </div>

              <div className="form-group">
                <label>Order (for sorting)</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
                <small style={{ color: '#888', fontSize: '0.75rem' }}>Lower numbers appear first in the gallery grid</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Photographer</label>
                  <input
                    type="text"
                    value={formData.photographer}
                    onChange={e => setFormData({ ...formData, photographer: e.target.value })}
                    placeholder="Photo by..."
                  />
                </div>
                <div className="form-group">
                  <label>Date Taken</label>
                  <input
                    type="date"
                    value={formData.dateTaken}
                    onChange={e => setFormData({ ...formData, dateTaken: e.target.value })}
                  />
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
                    Featured (show on homepage)
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
                  {editingImage ? 'Update Image' : 'Add Image'}
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
                Delete Image?
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

export default AdminGallery;
