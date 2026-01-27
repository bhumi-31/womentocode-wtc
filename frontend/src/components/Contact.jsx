import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import './Contact.css'

const API_URL = 'http://localhost:5001';

function Contact() {
  const [loaded, setLoaded] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  })
  const [focusedField, setFocusedField] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [activeAccordion, setActiveAccordion] = useState(null)
  const [visibleChars, setVisibleChars] = useState({ line1: 0, line2: 0 })
  const animationStarted = useRef(false)

  const line1 = "LET'S BUILD THE"
  const line2 = "FUTURE TOGETHER"

  useEffect(() => {
    window.scrollTo(0, 0)
    setTimeout(() => setLoaded(true), 100)

    // Character animation
    if (animationStarted.current) return;
    animationStarted.current = true;

    let charIndex = 0;
    
    setTimeout(() => {
      const animateLine1 = setInterval(() => {
        if (charIndex < line1.length) {
          setVisibleChars(prev => ({ ...prev, line1: charIndex + 1 }));
          charIndex++;
        } else {
          clearInterval(animateLine1);
          charIndex = 0;
          
          setTimeout(() => {
            const animateLine2 = setInterval(() => {
              if (charIndex < line2.length) {
                setVisibleChars(prev => ({ ...prev, line2: charIndex + 1 }));
                charIndex++;
              } else {
                clearInterval(animateLine2);
              }
            }, 50);
          }, 100);
        }
      }, 50);
    }, 500);
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true)
        // Reset after animation
        setTimeout(() => {
          setSubmitted(false)
          setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' })
        }, 3000)
      } else {
        alert(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      alert('Server error. Please try again later.');
    }
  }

  const contactInfo = [
    {
      icon: '📍',
      title: 'Visit Us',
      lines: ['Block-33, Lovely Professional University', 'Jalandhar-Delhi G.T. Road, Phagwara', 'Punjab (India) - 144411']
    },
    {
      icon: '✉️',
      title: 'Email Us',
      lines: ['info.womentocode@gmail.com']
    },
    {
      icon: '📞',
      title: 'Call Us',
      lines: ['+91 98765 43210', 'Mon-Fri: 9AM - 6PM']
    }
  ]

  const socialLinks = [
    { icon: '𝕏', name: 'Twitter', url: '#' },
    { icon: 'in', name: 'LinkedIn', url: '#' },
    { icon: '◎', name: 'Instagram', url: '#' },
    { icon: '▶', name: 'YouTube', url: '#' }
  ]

  const faqs = [
    {
      question: 'How do I join WomenToCode?',
      answer: 'Joining is easy! Simply click the "Join Now" button, fill out the registration form, and you\'ll get access to our community and resources immediately. We welcome women of all skill levels.'
    },
    {
      question: 'Are the programs free?',
      answer: 'We offer both free and paid programs. Our community events, basic workshops, and mentorship matching are completely free. Advanced bootcamps and certification courses have nominal fees with scholarship options available.'
    },
    {
      question: 'Do I need prior coding experience?',
      answer: 'Not at all! We have programs designed for complete beginners as well as advanced developers. Our beginner track starts from absolute zero and guides you step by step.'
    },
    {
      question: 'Can I become a mentor?',
      answer: 'Yes! If you have 2+ years of experience in tech and are passionate about helping others, we\'d love to have you as a mentor. Apply through our "Become a Mentor" program page.'
    },
    {
      question: 'Do you offer job placement support?',
      answer: 'Absolutely! We have partnerships with 50+ companies and offer resume reviews, mock interviews, and direct referrals. Our career counselors help you navigate the job market successfully.'
    }
  ]

  return (
    <div className="contact-page">
      <Navbar />
      
      {/* Floating Particles */}
      <div className="contact-particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              '--x': `${Math.random() * 100}%`,
              '--delay': `${Math.random() * 5}s`,
              '--duration': `${8 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className={`contact-hero ${loaded ? 'loaded' : ''}`}>
        <div className="contact-hero-content">
          <span className="contact-badge">✦ GET IN TOUCH</span>
          <h1 className="contact-title">
            <span className="line">
              {line1.split('').map((char, i) => (
                <span 
                  key={i} 
                  className={`char-animate ${i < visibleChars.line1 ? 'visible' : ''}`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
            <span className="line gradient">
              {line2.split('').map((char, i) => (
                <span 
                  key={i} 
                  className={`char-animate gradient-char ${i < visibleChars.line2 ? 'visible' : ''}`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </h1>
          <p className="contact-subtitle">
            Have questions? Want to collaborate? We'd love to hear from you!
          </p>
        </div>
        <div className="contact-hero-bg"></div>
      </section>

      {/* Main Contact Section */}
      <section className={`contact-main ${loaded ? 'loaded' : ''}`}>
        <div className="contact-grid">
          {/* Contact Info Side */}
          <div className="contact-info-side">
            {/* Info Cards */}
            {contactInfo.map((info, index) => (
              <div 
                key={index} 
                className="info-card"
                style={{ '--delay': `${index * 0.15}s` }}
              >
                <div className="info-icon">{info.icon}</div>
                <div className="info-content">
                  <h3>{info.title}</h3>
                  {info.lines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                <div className="info-card-glow"></div>
              </div>
            ))}

            {/* Social Links */}
            <div className="social-section">
              <h3>Follow Us</h3>
              <div className="social-links">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.url}
                    className="social-btn"
                    title={social.name}
                    style={{ '--delay': `${index * 0.1}s` }}
                  >
                    <span className="social-icon">{social.icon}</span>
                    <span className="social-bg"></span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="contact-form-side">
            <div className={`form-container ${submitted ? 'submitted' : ''}`}>
              <div className="form-header">
                <h2>Send a Message</h2>
                <p>Fill out the form and we'll get back to you within 24 hours</p>
              </div>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className={`form-group ${focusedField === 'firstName' || formData.firstName ? 'focused' : ''}`}>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                      <div className="input-line"></div>
                    </div>
                    <div className={`form-group ${focusedField === 'lastName' || formData.lastName ? 'focused' : ''}`}>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                      <div className="input-line"></div>
                    </div>
                  </div>

                  <div className={`form-group ${focusedField === 'email' || formData.email ? 'focused' : ''}`}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                    <div className="input-line"></div>
                  </div>

                  <div className={`form-group select-group ${focusedField === 'subject' || formData.subject ? 'focused' : ''}`}>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField(null)}
                      required
                    >
                      <option value="">Select Subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="programs">Programs & Courses</option>
                      <option value="partnership">Partnership</option>
                      <option value="mentorship">Mentorship</option>
                      <option value="careers">Careers</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="input-line"></div>
                    <span className="select-arrow">▼</span>
                  </div>

                  <div className={`form-group textarea-group ${focusedField === 'message' || formData.message ? 'focused' : ''}`}>
                    <textarea
                      name="message"
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      rows="5"
                      required
                    ></textarea>
                    <div className="input-line"></div>
                  </div>

                  <button type="submit" className="submit-btn">
                    <span className="btn-text">
                      <span className="btn-icon">✦</span>
                      Send Message
                      <span className="btn-arrow">→</span>
                    </span>
                    <span className="btn-shine"></span>
                  </button>
                </form>
              ) : (
                <div className="success-message">
                  <div className="success-icon">
                    <span className="checkmark">✓</span>
                    <div className="success-rings">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We'll get back to you soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`faq-section ${loaded ? 'loaded' : ''}`}>
        <div className="faq-container">
          <div className="section-header">
            <span className="section-badge">✦ FAQ</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={`faq-item ${activeAccordion === index ? 'active' : ''}`}
                style={{ '--delay': `${index * 0.1}s` }}
              >
                <button 
                  className="faq-question"
                  onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                >
                  <span className="question-text">{faq.question}</span>
                  <span className="faq-toggle">
                    <span className="toggle-line horizontal"></span>
                    <span className="toggle-line vertical"></span>
                  </span>
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="map-container">
          <div className="map-overlay">
            <div className="map-content">
              <h3>Find Us Here</h3>
              <p>Block-33, Lovely Professional University</p>
              <p className="address-detail">Jalandhar - Delhi G.T. Road, Phagwara, Punjab - 144411</p>
              <a 
                href="https://www.google.com/maps/dir//Block+33,+Lovely+Professional+University,+Phagwara,+Punjab+144411" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="directions-btn"
              >
                Get Directions →
              </a>
            </div>
          </div>
          <div className="map-embed">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3408.5853687775165!2d75.70028627557408!3d31.25284946426654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a5f5e9c489cf3%3A0x4049a5409d53c300!2sLovely%20Professional%20University!5e0!3m2!1sen!2sin!4v1706358000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="WomenToCode Location - LPU Block 33"
            ></iframe>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="contact-cta">
        <div className="cta-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of women transforming their careers in tech</p>
          <Link to="/" className="cta-btn">
            <span>Join WomenToCode</span>
            <span className="cta-arrow">→</span>
          </Link>
        </div>
        <div className="cta-bg"></div>
      </section>
    </div>
  )
}

export default Contact
