import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import './JoinUs.css'

import { API_URL } from '../config';

function JoinUs() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    registrationNo: '',
    mobile: '',
    email: '',
    domain: '',
    whyJoin: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const domains = [
    { value: 'tech', label: 'Tech' },
    { value: 'research', label: 'Research' },
    { value: 'content', label: 'Content' },
    { value: 'guest-relation', label: 'Guest Relation' },
    { value: 'administration', label: 'Administration' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch(`${API_URL}/membership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          registrationNo: '',
          mobile: '',
          email: '',
          domain: '',
          whyJoin: ''
        })
      } else {
        setSubmitStatus(data.message || 'error')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="joinus-page">
      <Navbar />

      <main className="joinus-main">
        {/* Background Elements */}
        <div className="joinus-bg-elements">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-line line-1"></div>
          <div className="bg-line line-2"></div>
        </div>

        <div className="joinus-container">
          {/* Left Side - Info */}
          <div className="joinus-info">
            <span className="joinus-label">JOIN US</span>
            <h1 className="joinus-title">
              <span className="title-line">BECOME A</span>
              <span className="title-line accent">MEMBER</span>
            </h1>
            <p className="joinus-description">
              Join our community of passionate women in tech. Together, we learn, grow, and empower each other to achieve greatness.
            </p>

            <div className="joinus-benefits">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <span>Access to exclusive workshops</span>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <span>Networking opportunities</span>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <span>Mentorship programs</span>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <span>Real-world project experience</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="joinus-form-container">
            <form onSubmit={handleSubmit} className="joinus-form">
              <h2 className="form-title">Registration Form</h2>

              {submitStatus === 'success' && (
                <div className="alert alert-success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Application submitted successfully! We'll get back to you soon.</span>
                </div>
              )}

              {submitStatus && submitStatus !== 'success' && (
                <div className="alert alert-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <span>{submitStatus === 'error' ? 'Something went wrong. Please try again.' : submitStatus}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="registrationNo">Registration Number</label>
                <input
                  type="text"
                  id="registrationNo"
                  name="registrationNo"
                  value={formData.registrationNo}
                  onChange={handleChange}
                  placeholder="Enter your registration number"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="mobile">Mobile Number</label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="domain">Select Domain</label>
                <div className="select-wrapper">
                  <select
                    id="domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose your domain</option>
                    {domains.map(domain => (
                      <option key={domain.value} value={domain.value}>
                        {domain.label}
                      </option>
                    ))}
                  </select>
                  <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="whyJoin">Why do you want to join WomenToCode?</label>
                <textarea
                  id="whyJoin"
                  name="whyJoin"
                  value={formData.whyJoin}
                  onChange={handleChange}
                  placeholder="Tell us about yourself and why you want to be part of our community..."
                  rows="4"
                  required
                />
              </div>

              <button
                type="submit"
                className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default JoinUs
