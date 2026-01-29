import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './EventsPreview.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Helper function to transform API event data to match frontend format
const transformEvent = (event) => {
  // If event already has the new format fields, use them
  if (event.date && event.month && event.speaker?.name) {
    return event;
  }
  
  // Transform from old backend format to frontend format
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  let eventDate = event.startDate ? new Date(event.startDate) : new Date();
  
  return {
    ...event,
    id: event._id || event.id,
    date: event.date || String(eventDate.getDate()).padStart(2, '0'),
    month: event.month || months[eventDate.getMonth()],
    year: event.year || String(eventDate.getFullYear()),
    time: event.time || `${event.startTime || '10:00 AM'} - ${event.endTime || '12:00 PM'}`,
    location: event.location || event.venue || (event.isOnline ? 'Online' : 'TBA'),
    type: (event.type || event.eventType || 'workshop').toLowerCase(),
    speaker: event.speaker?.name ? event.speaker : {
      name: event.speakers?.[0]?.name || 'TBA',
      role: event.speakers?.[0]?.title || '',
      image: event.speakers?.[0]?.image || event.speaker?.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face'
    },
    registrationLink: event.registrationLink || '#'
  };
};

function EventsPreview() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const sectionRef = useRef(null)

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/events`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const transformedEvents = data.data.map(transformEvent);
          setEvents(transformedEvents);
        } else if (Array.isArray(data) && data.length > 0) {
          const transformedEvents = data.map(transformEvent);
          setEvents(transformedEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handlePrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex(prev => (prev === 0 ? events.length - 1 : prev - 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex(prev => (prev === events.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleDateClick = (index) => {
    if (isAnimating || index === activeIndex) return
    setIsAnimating(true)
    setActiveIndex(index)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const activeEvent = events[activeIndex] || events[0]

  if (!activeEvent) return null;

  return (
    <section 
      id="events" 
      className={`events-preview ${isVisible ? 'visible' : ''}`}
      ref={sectionRef}
    >
      <div className={`events-container ${isVisible ? 'animate-in' : ''}`}>
        {/* Header */}
        <div className="events-header">
          <h2 className="events-tag">
            {'UPCOMING EVENTS'.split('').map((char, index) => (
              <span 
                key={index} 
                className={`char ${isVisible ? 'animate' : ''}`}
                style={{ '--char-index': index }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>
          <div className={`events-nav-arrows ${isVisible ? 'animate-in' : ''}`}>
            <button 
              className="nav-arrow prev" 
              onClick={handlePrev}
              aria-label="Previous event"
            >
              ←
            </button>
            <button 
              className="nav-arrow next" 
              onClick={handleNext}
              aria-label="Next event"
            >
              →
            </button>
          </div>
        </div>

        {/* Main Event Card */}
        <div className={`event-showcase ${isVisible ? 'animate-in' : ''}`}>
          {/* Big Date Background */}
          <div className={`event-date-bg ${isVisible ? 'animate-in' : ''}`}>
            <span className="date-day">{activeEvent.date}</span>
            <span className="date-month">{activeEvent.month}</span>
          </div>

          {/* Event Content */}
          <div className={`event-content ${isAnimating ? 'animating' : ''}`}>
            {/* Speaker Image */}
            <div className={`speaker-image-wrapper ${isVisible ? 'animate-in' : ''}`}>
              <img 
                src={activeEvent.speaker?.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face'} 
                alt={activeEvent.speaker?.name || 'Speaker'}
                className="speaker-image"
              />
              <div className="speaker-image-glow"></div>
            </div>

            {/* Event Details */}
            <div className={`event-details ${isVisible ? 'animate-in' : ''}`}>
              <div className="speaker-info anim-item" style={{ '--item-index': 0 }}>
                <h3 className="speaker-name">{activeEvent.speaker?.name || 'TBA'}</h3>
                <p className="speaker-role">{activeEvent.speaker?.role || ''}</p>
              </div>

              <div className="event-title-wrapper anim-item" style={{ '--item-index': 1 }}>
                <span className="event-type">{activeEvent.type}</span>
                <h2 className="event-title">{activeEvent.title}</h2>
              </div>

              <p className="event-description anim-item" style={{ '--item-index': 2 }}>{activeEvent.description}</p>

              <div className="event-meta anim-item" style={{ '--item-index': 3 }}>
                <div className="meta-item">
                  <span className="meta-icon">📍</span>
                  <span>{activeEvent.location}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">⏱</span>
                  <span>{activeEvent.time}</span>
                </div>
              </div>

              <a href={activeEvent.registrationLink || '#'} className="register-btn anim-item" style={{ '--item-index': 4 }}>
                <span className="btn-icon">✦</span>
                <span>REGISTER NOW</span>
              </a>
            </div>
          </div>
        </div>

        {/* Mini Date Cards */}
        <div className={`event-timeline ${isVisible ? 'animate-in' : ''}`}>
          {events.map((event, index) => (
            <button
              key={event._id || event.id}
              className={`timeline-item ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleDateClick(index)}
              style={{ '--timeline-index': index }}
            >
              <span className="timeline-date">{event.date}</span>
              <span className="timeline-month">{event.month}</span>
            </button>
          ))}
        </div>

        {/* View All Link */}
        <Link to="/events" className={`view-all-link ${isVisible ? 'animate-in' : ''}`}>
          VIEW ALL EVENTS
          <span className="arrow">→</span>
        </Link>
      </div>
    </section>
  )
}

export default EventsPreview
