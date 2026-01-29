import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './TeamMember.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function TeamMember() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)
  const [member, setMember] = useState(null)
  const [allMembers, setAllMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch team members from API
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_URL}/team`)
        const data = await response.json()
        
        let members = []
        if (data.success && Array.isArray(data.data)) {
          members = data.data
        } else if (Array.isArray(data)) {
          members = data
        }
        
        setAllMembers(members)
        const foundMember = members.find(m => m.id === memberId || m._id === memberId)
        setMember(foundMember)
      } catch (error) {
        console.error('Error fetching team members:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTeamMembers()
  }, [memberId])
  
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0)
    
    // Trigger animations
    setTimeout(() => setLoaded(true), 100)
  }, [memberId])

  if (isLoading) {
    return (
      <div className="member-page">
        <Navbar />
        <div className="member-not-found">
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="member-page">
        <Navbar />
        <div className="member-not-found">
          <h1>Member Not Found</h1>
          <Link to="/team" className="back-btn">← Back to Team</Link>
        </div>
      </div>
    )
  }

  // Get social icon
  const getSocialIcon = (platform) => {
    const icons = {
      twitter: '𝕏',
      linkedin: 'in',
      instagram: '◎',
      github: '⌘',
      youtube: '▶',
      dribbble: '◉',
      email: '✉'
    }
    return icons[platform] || '●'
  }

  return (
    <div className="member-page">
      <Navbar />
      
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/team')}>
        <span className="back-arrow">←</span>
        <span>Back to Team</span>
      </button>

      {/* Hero Section */}
      <section className={`member-hero ${loaded ? 'loaded' : ''}`}>
        <div className="member-hero-grid">
          {/* Image */}
          <div className="member-image-container">
            <div className="image-frame">
              <img src={member.image} alt={member.name} className="member-image" />
              <div className="image-glow"></div>
            </div>
          </div>

          {/* Info */}
          <div className="member-info">
            <h1 className="member-name">{member.name}</h1>
            <p className="member-role">{member.role}</p>
            
            <blockquote className="member-quote">
              "{member.quote}"
            </blockquote>

            {/* Social Links */}
            <div className="member-social">
              {Object.entries(member.social).map(([platform, url]) => (
                <a 
                  key={platform}
                  href={platform === 'email' ? `mailto:${url}` : url}
                  target={platform === 'email' ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  className="social-link"
                  title={platform}
                >
                  {getSocialIcon(platform)}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="hero-bg-gradient"></div>
      </section>

      {/* Details Section */}
      <section className={`member-details ${loaded ? 'loaded' : ''}`}>
        <div className="details-grid">
          {/* About */}
          <div className="detail-block about-block">
            <h2 className="detail-title">About</h2>
            <div className="bio-text">
              {member.bio.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="detail-block skills-block">
            <h2 className="detail-title">Skills</h2>
            <div className="skills-list">
              {member.skills.map((skill, i) => (
                <span key={i} className="skill-tag" style={{ '--i': i }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className={`achievements-section ${loaded ? 'loaded' : ''}`}>
        <h2 className="section-title">Achievements</h2>
        <div className="achievements-grid">
          {member.achievements.map((achievement, i) => (
            <div key={i} className="achievement-card" style={{ '--delay': `${i * 0.15}s` }}>
              <span className="achievement-icon">{achievement.icon}</span>
              <h3 className="achievement-title">{achievement.title}</h3>
              <p className="achievement-subtitle">{achievement.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Other Team Members */}
      <section className="other-members-section">
        <h2 className="section-title">Meet More Team Members</h2>
        <div className="other-members-grid">
          {allMembers
            .filter(m => (m.id || m._id) !== (member.id || member._id))
            .slice(0, 4)
            .map((otherMember) => (
              <Link 
                to={`/team/${otherMember.id || otherMember._id}`} 
                key={otherMember.id || otherMember._id}
                className="other-member-card"
              >
                <img src={otherMember.image} alt={otherMember.name} />
                <div className="other-member-info">
                  <h4>{otherMember.name}</h4>
                  <p>{otherMember.role}</p>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </div>
  )
}

export default TeamMember
