import { useState, useEffect } from 'react'

import { API_URL } from '../../config'

function AdminMembership() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyData, setReplyData] = useState({ subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/membership`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setApplications(data.data)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/membership/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      const data = await response.json()
      if (data.success) {
        setApplications(prev =>
          prev.map(app => app._id === id ? { ...app, status } : app)
        )
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const deleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/membership/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setApplications(prev => prev.filter(app => app._id !== id))
      }
    } catch (error) {
      console.error('Error deleting application:', error)
    }
  }

  const openReplyModal = (app) => {
    setSelectedApp(app)
    setReplyData({
      subject: `Re: Your WomenToCode Membership Application`,
      message: `Dear ${app.name},\n\nThank you for your interest in joining WomenToCode!\n\n`
    })
    setShowReplyModal(true)
  }

  const sendReply = async () => {
    if (!replyData.subject || !replyData.message) {
      alert('Please fill in subject and message')
      return
    }

    setSending(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/membership/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: selectedApp.email,
          name: selectedApp.name,
          subject: replyData.subject,
          message: replyData.message
        })
      })
      const data = await response.json()
      if (data.success) {
        alert('Email sent successfully!')
        setShowReplyModal(false)
        setReplyData({ subject: '', message: '' })
      } else {
        alert('Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Error sending email')
    } finally {
      setSending(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#22c55e'
      case 'rejected': return '#ef4444'
      default: return '#F7D046'
    }
  }

  const getDomainLabel = (domain) => {
    const labels = {
      'tech': 'Tech',
      'research': 'Research',
      'content': 'Content',
      'guest-relation': 'Guest Relation',
      'administration': 'Administration'
    }
    return labels[domain] || domain
  }

  if (loading) {
    return <div className="admin-loading">Loading applications...</div>
  }

  return (
    <div className="admin-membership">
      <div className="admin-header">
        <h1>Membership Applications</h1>
        <div className="filter-tabs">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({applications.length})
          </button>
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approved ({applications.filter(a => a.status === 'approved').length})
          </button>
          <button
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({applications.filter(a => a.status === 'rejected').length})
          </button>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="no-data">
          <p>No applications found</p>
        </div>
      ) : (
        <div className="applications-grid">
          {filteredApplications.map(app => (
            <div key={app._id} className="application-card">
              <div className="card-header">
                <div className="applicant-info">
                  <h3>{app.name}</h3>
                  <span className="domain-badge">{getDomainLabel(app.domain)}</span>
                </div>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(app.status) }}
                >
                  {app.status}
                </span>
              </div>

              <div className="card-details">
                <div className="detail-row">
                  <span className="label">Registration No:</span>
                  <span className="value">{app.registrationNo}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{app.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Mobile:</span>
                  <span className="value">{app.mobile}</span>
                </div>
                <div className="detail-row full">
                  <span className="label">Why Join:</span>
                  <p className="reason">{app.whyJoin}</p>
                </div>
                <div className="detail-row">
                  <span className="label">Applied:</span>
                  <span className="value">{new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="card-actions">
                {app.status === 'pending' && (
                  <>
                    <button
                      className="btn-approve"
                      onClick={() => updateStatus(app._id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => updateStatus(app._id, 'rejected')}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  className="btn-reply"
                  onClick={() => openReplyModal(app)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Reply
                </button>
                <button
                  className="btn-delete"
                  onClick={() => deleteApplication(app._id)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="reply-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reply to {selectedApp?.name}</h2>
              <button className="close-btn" onClick={() => setShowReplyModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="recipient">To: {selectedApp?.email}</p>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={replyData.subject}
                  onChange={e => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={replyData.message}
                  onChange={e => setReplyData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Write your message..."
                  rows="8"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowReplyModal(false)}>
                Cancel
              </button>
              <button
                className="btn-send"
                onClick={sendReply}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-membership {
          padding: 20px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .admin-header h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          letter-spacing: 2px;
          color: #fff;
        }

        .filter-tabs {
          display: flex;
          gap: 10px;
        }

        .filter-tabs button {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.85rem;
        }

        .filter-tabs button:hover,
        .filter-tabs button.active {
          background: #F7D046;
          color: #0a0a0a;
          border-color: #F7D046;
        }

        .applications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        .application-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s;
        }

        .application-card:hover {
          border-color: rgba(247, 208, 70, 0.3);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .applicant-info h3 {
          font-size: 1.2rem;
          color: #fff;
          margin-bottom: 8px;
        }

        .domain-badge {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(247, 208, 70, 0.1);
          color: #F7D046;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #0a0a0a;
        }

        .card-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          gap: 10px;
        }

        .detail-row.full {
          flex-direction: column;
        }

        .detail-row .label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          min-width: 120px;
        }

        .detail-row .value {
          color: #fff;
          font-size: 0.9rem;
        }

        .detail-row .reason {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          line-height: 1.5;
          margin-top: 5px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .card-actions button {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
          border: none;
        }

        .card-actions button svg {
          width: 16px;
          height: 16px;
        }

        .btn-approve {
          background: #22c55e;
          color: #fff;
        }

        .btn-approve:hover {
          background: #16a34a;
        }

        .btn-reject {
          background: #ef4444;
          color: #fff;
        }

        .btn-reject:hover {
          background: #dc2626;
        }

        .btn-reply {
          background: #3b82f6;
          color: #fff;
        }

        .btn-reply:hover {
          background: #2563eb;
        }

        .btn-delete {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 8px !important;
        }

        .btn-delete:hover {
          background: #ef4444;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .reply-modal {
          background: #1a1a1a;
          border-radius: 20px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header h2 {
          font-size: 1.3rem;
          color: #fff;
        }

        .close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 2rem;
          cursor: pointer;
          line-height: 1;
        }

        .close-btn:hover {
          color: #fff;
        }

        .modal-body {
          padding: 24px;
        }

        .recipient {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 20px;
          font-size: 0.9rem;
        }

        .modal-body .form-group {
          margin-bottom: 20px;
        }

        .modal-body label {
          display: block;
          color: #F7D046;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .modal-body input,
        .modal-body textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 0.95rem;
          font-family: inherit;
        }

        .modal-body input:focus,
        .modal-body textarea:focus {
          outline: none;
          border-color: #F7D046;
        }

        .modal-body textarea {
          resize: vertical;
          min-height: 150px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-cancel {
          padding: 10px 24px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
        }

        .btn-send {
          padding: 10px 24px;
          background: #F7D046;
          border: none;
          border-radius: 8px;
          color: #0a0a0a;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-send:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .no-data {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        .admin-loading {
          text-align: center;
          padding: 60px 20px;
          color: #F7D046;
        }

        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .filter-tabs {
            flex-wrap: wrap;
          }

          .applications-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default AdminMembership
