import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="logo">
          <span className="logo-icon">W</span>
          <span className="logo-text">WomenToCode</span>
        </Link>

        <a href="#join" className="nav-register-btn">
          <span>✦</span> JOIN NOW
        </a>
        
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          {isHomePage ? (
            <>
              <a href="#home" onClick={() => setMenuOpen(false)}>HOME</a>
              <a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a>
              <a href="#programs" onClick={() => setMenuOpen(false)}>PROGRAMS</a>
            </>
          ) : (
            <Link to="/" onClick={() => setMenuOpen(false)}>HOME</Link>
          )}
          <Link to="/team" onClick={() => setMenuOpen(false)}>TEAM</Link>
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
