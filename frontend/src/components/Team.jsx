import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './Team.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Typewriter Text Component - types character by character
const TypewriterText = ({ text, delay = 0, speed = 80, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      if (onComplete) onComplete();
    }
  }, [currentIndex, text, speed, started, onComplete]);

  return <>{displayedText}</>;
};

// Helper function to transform API member data to match frontend format
const transformMember = (member) => {
  return {
    ...member,
    id: member.id || member._id || member.name?.toLowerCase().replace(/\s+/g, '-'),
    firstName: member.firstName || member.name?.split(' ')[0] || '',
    lastName: member.lastName || member.name?.split(' ').slice(1).join(' ') || '',
    name: member.name || `${member.firstName} ${member.lastName}`,
    role: member.role || 'Team Member',
    image: member.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop',
    color: member.color || '#F7D046',
    techStack: member.techStack || '',
    bio: member.bio || member.quote || '',
    quote: member.quote || member.bio || '',
    social: member.social || member.socialLinks || {}
  };
};

// Preload images in background
const preloadImages = (members) => {
  members.forEach(member => {
    if (member.image) {
      const img = new Image();
      img.src = member.image;
    }
  });
};

function Team() {
  const [loaded, setLoaded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [expandedMember, setExpandedMember] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [imagesPreloaded, setImagesPreloaded] = useState(false)
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false)
  const [line1Done, setLine1Done] = useState(false)
  const [line2Done, setLine2Done] = useState(false)
  const containerRef = useRef(null)
  const hoverTimeoutRef = useRef(null)
  const navigate = useNavigate()

  // Number of visible cards in the stack
  const visibleCards = 5

  // Fetch team members from API
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/team`);
        const data = await response.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const transformedMembers = data.data.map(transformMember);
          setTeamMembers(transformedMembers);
          // Preload images while title animates
          preloadImages(transformedMembers);
          setTimeout(() => setImagesPreloaded(true), 1500);
        } else if (Array.isArray(data) && data.length > 0) {
          const transformedMembers = data.map(transformMember);
          setTeamMembers(transformedMembers);
          preloadImages(transformedMembers);
          setTimeout(() => setImagesPreloaded(true), 1500);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0)
    setTimeout(() => setLoaded(true), 100)
    // Title animation completes after ~2.5s (matches new slower animation)
    setTimeout(() => setTitleAnimationComplete(true), 2500)
  }, [])

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (expandedMember) {
        if (e.key === 'Escape') {
          handleClose()
        }
        return
      }
      if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [expandedMember, currentIndex])

  const handleNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % teamMembers.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handlePrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleCardClick = (member, index) => {
    if (isAnimating) return
    setIsAnimating(true)
    setExpandedMember({ ...member, clickedIndex: index })
  }

  // Handle hover on back cards - shuffle to bring them forward
  const handleCardHover = (stackIdx) => {
    // Only shuffle if hovering on a card that's not the front card
    if (stackIdx > 0 && !isAnimating && !expandedMember) {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }

      // Shorter delay for snappier response
      hoverTimeoutRef.current = setTimeout(() => {
        setIsAnimating(true)
        // Move by the number of positions the hovered card is from front
        setCurrentIndex((prev) => (prev + stackIdx) % teamMembers.length)
        setTimeout(() => setIsAnimating(false), 600)
      }, 100)
    }
    setHoveredIndex(stackIdx)
  }

  const handleCardLeave = () => {
    // Clear timeout if mouse leaves before shuffle triggers
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setHoveredIndex(null)
  }

  const handleClose = () => {
    setIsAnimating(true)
    setExpandedMember(null)
    setTimeout(() => setIsAnimating(false), 600)
  }

  // Get visible members for the stack
  const getVisibleMembers = () => {
    const members = []
    for (let i = 0; i < visibleCards; i++) {
      const index = (currentIndex + i) % teamMembers.length
      members.push({ ...teamMembers[index], stackIndex: i, actualIndex: index })
    }
    return members
  }

  const formatStatKey = (key) => {
    // Convert camelCase to readable format
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  return (
    <div className={`team-page ${expandedMember ? 'member-expanded' : ''}`}>
      <Navbar />

      {/* Loading State - Typewriter heading + Skeleton Cards */}
      {isLoading ? (
        <section className="team-showcase">
          <div className={`team-info ${loaded ? 'visible' : ''}`}>
            <span className="team-label">OUR TEAM</span>
            <h1 className="team-main-title">
              <span className="title-line">
                <TypewriterText
                  text="MEET THE"
                  delay={300}
                  speed={80}
                  onComplete={() => setLine1Done(true)}
                />
              </span>
              {line1Done && (
                <span className="title-line accent">
                  <TypewriterText
                    text="INCREDIBLE"
                    delay={100}
                    speed={70}
                    onComplete={() => setLine2Done(true)}
                  />
                </span>
              )}
              {line2Done && (
                <span className="title-line">
                  <TypewriterText
                    text="TEAM"
                    delay={100}
                    speed={80}
                    onComplete={() => setTitleAnimationComplete(true)}
                  />
                </span>
              )}
            </h1>
            {titleAnimationComplete && (
              <p className="team-description fade-in">
                Loading team members...
              </p>
            )}
          </div>
          <div className={`cards-container ${titleAnimationComplete ? 'photos-visible' : 'photos-hidden'}`}>
            <div className="card-stack">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="skeleton-card"
                  style={{
                    '--stack-index': idx,
                    zIndex: 5 - idx,
                  }}
                >
                  <div className="skeleton-image"></div>
                  <div className="skeleton-info">
                    <div className="skeleton-name"></div>
                    <div className="skeleton-role"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : teamMembers.length === 0 ? (
        <section className="team-showcase">
          <div className={`team-info ${loaded ? 'visible' : ''}`}>
            <span className="team-label">OUR TEAM</span>
            <h1 className="team-main-title">
              <span className="title-line">MEET THE</span>
              <span className="title-line accent">INCREDIBLE</span>
              <span className="title-line">TEAM</span>
            </h1>
            <p className="team-description">No team members found</p>
          </div>
        </section>
      ) : (
        <>
          {/* Main Team Section */}
          <section className="team-showcase">
            {/* Left Side - Title & Info */}
            <div className={`team-info ${loaded ? 'visible' : ''}`}>
              <span className="team-label">OUR TEAM</span>
              <h1 className="team-main-title">
                <span className="title-line">MEET THE</span>
                <span className="title-line accent">INCREDIBLE</span>
                <span className="title-line">TEAM</span>
              </h1>
              <p className="team-description fade-in">
                {teamMembers.length} passionate leaders driving innovation and empowering women in tech
              </p>

              {/* Navigation - appears after title animation */}
              <div className={`team-navigation ${titleAnimationComplete ? 'fade-in' : ''}`}>
                <button
                  className="nav-btn prev"
                  onClick={handlePrev}
                  disabled={isAnimating}
                  aria-label="Previous member"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="nav-counter">
                  <span className="current">{String(currentIndex + 1).padStart(2, '0')}</span>
                  <span className="divider">/</span>
                  <span className="total">{String(teamMembers.length).padStart(2, '0')}</span>
                </div>
                <button
                  className="nav-btn next"
                  onClick={handleNext}
                  disabled={isAnimating}
                  aria-label="Next member"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Progress Dots */}
              <div className={`progress-dots ${titleAnimationComplete ? 'fade-in' : ''}`}>
                {teamMembers.map((_, idx) => (
                  <button
                    key={idx}
                    className={`dot ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => !isAnimating && setCurrentIndex(idx)}
                    aria-label={`Go to member ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Side - Card Stack - appears AFTER title animation */}
            <div className={`cards-container ${titleAnimationComplete ? 'photos-visible' : 'photos-hidden'}`} ref={containerRef}>
              <div className="card-stack">
                {getVisibleMembers().map((member, idx) => (
                  <div
                    key={member.id}
                    className={`stack-card ${hoveredIndex === idx ? 'hovered' : ''} ${idx === 0 ? 'front-card' : 'back-card'}`}
                    style={{
                      '--stack-index': idx,
                      '--member-color': member.color,
                      zIndex: visibleCards - idx,
                    }}
                    onClick={() => idx === 0 && handleCardClick(member, idx)}
                    onMouseEnter={() => handleCardHover(idx)}
                    onMouseLeave={handleCardLeave}
                  >
                    <div className="card-inner">
                      <div className="card-image-wrapper">
                        <img src={member.image} alt={member.name} />
                        <div className="card-gradient-overlay" />
                      </div>

                      <div className="card-info">
                        <span className="card-role">{member.role}</span>
                        <h3 className="card-name">
                          <span className="first-name">{member.firstName}</span>
                          <span className="last-name">{member.lastName}</span>
                        </h3>
                      </div>

                      {/* Arrow Icon */}
                      <div className="card-arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </div>

                      {/* Color accent bar */}
                      <div className="card-accent-bar" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Expanded Member View */}
          {expandedMember && (
            <div
              className={`member-expanded-overlay ${expandedMember ? 'active' : ''}`}
              onClick={handleClose}
            >
              <div
                className="expanded-content"
                style={{ '--member-color': expandedMember.color }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button className="close-btn" onClick={handleClose}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>

                {/* Split Name - Top */}
                <div className="expanded-name-top">
                  <span className="expanded-first-name">{expandedMember.firstName}</span>
                </div>

                {/* Main Content Area */}
                <div className="expanded-main">
                  {/* Photo */}
                  <div className="expanded-photo-container">
                    <img src={expandedMember.image} alt={expandedMember.name} />
                    <div className="photo-frame" />
                  </div>

                  {/* Stats Box */}
                  <div className="expanded-stats-box">
                    <div className="stats-header">
                      <span className="stats-role">{expandedMember.role}</span>
                    </div>

                    {/* Tech Stack */}
                    {expandedMember.techStack && (
                      <div className="tech-stack-section">
                        <span className="tech-label">Tech Stack</span>
                        <div className="tech-tags">
                          {expandedMember.techStack.split(',').map((tech, idx) => (
                            <span key={idx} className="tech-tag">{tech.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="member-bio">"{expandedMember.bio || expandedMember.quote}"</p>

                    {/* Social Links */}
                    <div className="expanded-social">
                      {expandedMember.social?.linkedin && (
                        <a href={expandedMember.social.linkedin} target="_blank" rel="noopener noreferrer">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                      )}
                      {expandedMember.social?.twitter && (
                        <a href={expandedMember.social.twitter} target="_blank" rel="noopener noreferrer">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                      )}
                      {expandedMember.social?.github && (
                        <a href={expandedMember.social.github} target="_blank" rel="noopener noreferrer">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Split Name - Bottom */}
                <div className="expanded-name-bottom">
                  <span className="expanded-last-name">{expandedMember.lastName}</span>
                </div>
              </div>
            </div>
          )}

          {/* Team Grid (Alternative View for Mobile/Full List) */}
          <section className="team-full-grid">
            <div className="grid-header">
              <h2>All Team Members</h2>
              <p>Click on any card to learn more</p>
            </div>
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div
                  key={member.id}
                  className={`grid-card ${loaded ? 'visible' : ''}`}
                  style={{
                    '--delay': `${(index % 8) * 0.05}s`,
                    '--member-color': member.color
                  }}
                  onClick={() => handleCardClick(member, index)}
                >
                  <div className="grid-card-image">
                    <img src={member.image} alt={member.name} loading="lazy" />
                    <div className="grid-card-overlay">
                      <span className="view-text">View Profile</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                  </div>
                  <div className="grid-card-info">
                    <h4>{member.name}</h4>
                    <span>{member.role}</span>
                  </div>
                  <div className="grid-card-accent" />
                </div>
              ))}
            </div>
          </section>

          {/* Join Team CTA */}
          <section className="join-team-section">
            <div className="join-content">
              <h2>Want to Join Our Team?</h2>
              <p>We're always looking for passionate individuals to help us empower more women in tech.</p>
              <button className="join-btn">View Open Positions</button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default Team
