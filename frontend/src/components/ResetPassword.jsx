import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './Auth.css';

import { API_URL } from '../config';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/reset-password/${token}/verify`);
        const data = await response.json();

        if (data.valid) {
          setTokenValid(true);
        } else {
          setError('This reset link is invalid or has expired. Please request a new one.');
        }
      } catch (err) {
        setError('Something went wrong. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: formData.password })
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        setSuccess('Password reset successful! Redirecting...');

        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className="auth-page">
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
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="loading-state">
              <span className="loader large"></span>
              <p>Verifying reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="auth-page">
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
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="error-state">
              <div className="error-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 className="form-title">LINK EXPIRED</h2>
              <p className="form-subtitle">{error}</p>
              <Link to="/forgot-password" className="submit-btn" style={{ display: 'inline-block', textAlign: 'center', marginTop: '20px' }}>
                REQUEST NEW LINK
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <span className="code-keyword">function</span> resetPassword() {'{'}
            </div>
            <div className="code-line indent">
              <span className="code-keyword">const</span> newPassword = secure();
            </div>
            <div className="code-line indent">
              <span className="code-keyword">return</span> <span className="code-string">'Success!'</span>;
            </div>
            <div className="code-line">
              {'}'}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          {!success ? (
            <>
              <h2 className="form-title">SET NEW PASSWORD</h2>
              <p className="form-subtitle">Create a strong password for your account</p>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="New Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="password-requirements">
                  <p>Password must be at least 6 characters</p>
                </div>

                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <span className="loader"></span>
                  ) : (
                    'RESET PASSWORD'
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
              <h2 className="form-title">PASSWORD RESET!</h2>
              <p className="form-subtitle">{success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
