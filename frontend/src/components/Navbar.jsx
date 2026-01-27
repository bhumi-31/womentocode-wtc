import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check for logged in user
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [location]) // Re-check when route changes

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const handleJoinClick = (e) => {
    e.preventDefault()
    navigate('/signup')
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="logo">
          <span className="logo-icon">W</span>
          <span className="logo-text">WomenToCode</span>
        </Link>

        {!user ? (
          <>
            <button onClick={handleJoinClick} className="nav-register-btn">
              <span>✦</span> JOIN NOW
            </button>
            <Link to="/login" className="nav-login-btn">
              LOGIN
            </Link>
          </>
        ) : (
          <div className="nav-user-section">
            <span className="nav-user-name">Hi, {user.firstName}!</span>
            <button onClick={handleLogout} className="nav-logout-btn">
              LOGOUT
            </button>
          </div>
        )}
        
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          {isHomePage ? (
            <>
              <a href="#home" onClick={() => setMenuOpen(false)}>HOME</a>
              <a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a>
            </>
          ) : (
            <Link to="/" onClick={() => setMenuOpen(false)}>HOME</Link>
          )}
          <Link to="/events" onClick={() => setMenuOpen(false)}>EVENTS</Link>
          <Link to="/team" onClick={() => setMenuOpen(false)}>TEAM</Link>
          <Link to="/projects" onClick={() => setMenuOpen(false)}>PROJECTS</Link>
          <Link to="/gallery" onClick={() => setMenuOpen(false)}>GALLERY</Link>
          <Link to="/articles" onClick={() => setMenuOpen(false)}>ARTICLES</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>CONTACT</Link>
        </div>

        <button 
          className={`menu-toggle ${menuOpen ? 'active' : ''}`} 
          onClick={() => setMenuOpen(!menuOpen)} 
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
