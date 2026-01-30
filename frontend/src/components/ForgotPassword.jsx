import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

import { API_URL } from '../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setEmailSent(true);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Side - Branding */}
      <div className="auth-left">
        <Link to="/" className="auth-logo">
          WOMENTOCODE
        </Link>

        <div className="auth-branding">
          <h1 className="brand-title">
            <span>WOMEN</span>
            <span>TO</span>
            <span className="highlight">CODE</span>
          </h1>

          <div className="brand-divider"></div>

          <p className="brand-tagline">
            Building a community of <span className="highlight">5000+</span> women in tech
          </p>

          <div className="code-animation">
            <div className="code-line">
              <span className="code-keyword">if</span> (forgotPassword) {'{'}
            </div>
            <div className="code-line indent">
              <span className="code-keyword">const</span> resetLink = sendEmail();
            </div>
            <div className="code-line indent">
              <span className="code-keyword">await</span> checkInbox();
            </div>
            <div className="code-line indent">
              setNewPassword();
            </div>
            <div className="code-line">
              {'}'}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="form-tabs">
            <Link to="/login" className="tab">Login</Link>
            <Link to="/signup" className="tab">Sign Up</Link>
          </div>

          {!emailSent ? (
            <>
              <h2 className="form-title">FORGOT PASSWORD</h2>
              <p className="form-subtitle">Enter your email and we'll send you a reset link</p>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <span className="loader"></span>
                  ) : (
                    'SEND RESET LINK'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="success-state">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="form-title">CHECK YOUR EMAIL</h2>
              <p className="form-subtitle">
                We've sent a password reset link to<br />
                <strong style={{ color: '#F7D046' }}>{email}</strong>
              </p>
              <p className="form-subtitle" style={{ fontSize: '0.85rem', marginTop: '20px', opacity: 0.7 }}>
                Didn't receive the email? Check your spam folder or
              </p>
              <button
                className="submit-btn secondary"
                onClick={() => setEmailSent(false)}
                style={{ marginTop: '10px' }}
              >
                TRY AGAIN
              </button>
            </div>
          )}

          <p className="switch-text">
            Remember your password? <Link to="/login">Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
