import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import './Events.css'

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
    type: event.type || (event.eventType ? event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1) : 'Workshop'),
    speaker: event.speaker?.name ? event.speaker : {
      name: event.speakers?.[0]?.name || 'TBA',
      role: event.speakers?.[0]?.title || '',
      image: event.speakers?.[0]?.image || event.speaker?.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face'
    },
    registrationLink: event.registrationLink || '#'
  };
};

function Events() {
  const [loaded, setLoaded] = useState(false)
  const [filter, setFilter] = useState('all')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/events`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          // Transform events to match frontend format
          const transformedEvents = data.data.map(transformEvent);
          setEvents(transformedEvents);
        } else if (Array.isArray(data) && data.length > 0) {
          const transformedEvents = data.map(transformEvent);
          setEvents(transformedEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0)
    setTimeout(() => setLoaded(true), 100)
  }, [])

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.type?.toLowerCase() === filter)

  return (
    <div className="events-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className={`events-hero ${loaded ? 'loaded' : ''}`}>
        <div className="events-hero-content">
          <span className="events-badge">✦ EVENTS & WORKSHOPS</span>
          <h1 className="events-page-title">
            <span className="line">LEARN.</span>
            <span className="line gradient">GROW.</span>
            <span className="line">CONNECT.</span>
          </h1>
          <p className="events-page-subtitle">
            Join our workshops, talks, and hackathons to level up your skills
          </p>
        </div>
        <div className="events-hero-bg"></div>
      </section>

      {/* Filter Tabs */}
      <section className="events-filter-section">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Events
          </button>
          <button 
            className={`filter-tab ${filter === 'workshop' ? 'active' : ''}`}
            onClick={() => setFilter('workshop')}
          >
            Workshops
          </button>
          <button 
            className={`filter-tab ${filter === 'talk' ? 'active' : ''}`}
            onClick={() => setFilter('talk')}
          >
            Talks
          </button>
          <button 
            className={`filter-tab ${filter === 'hackathon' ? 'active' : ''}`}
            onClick={() => setFilter('hackathon')}
          >
            Hackathons
          </button>
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-grid-section">
        {loading ? (
          <div className="events-loading">
            <div className="loader"></div>
            <p>Loading events...</p>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event, index) => (
              <div 
                key={event._id || event.id}
                className={`event-card ${loaded ? 'visible' : ''}`}
                style={{ '--delay': `${index * 0.1}s` }}
              >
                {/* Date Badge */}
                <div className="event-card-date">
                  <span className="card-day">{event.date}</span>
                  <span className="card-month">{event.month}</span>
                </div>

                {/* Speaker */}
                <div className="event-card-speaker">
                  <img 
                    src={event.speaker?.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face'} 
                    alt={event.speaker?.name || 'Speaker'}
                    className="card-speaker-img"
                  />
                  <div className="card-speaker-info">
                    <h4>{event.speaker?.name || 'TBA'}</h4>
                    <p>{event.speaker?.role || ''}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="event-card-content">
                  <span className="card-type">{event.type}</span>
                  <h3 className="card-title">{event.title}</h3>
                  <p className="card-description">{event.description}</p>
                  
                  <div className="card-meta">
                    <span>📍 {event.location}</span>
                    <span>⏱ {event.time}</span>
                  </div>

                  <a href={event.registrationLink || '#'} className="card-register-btn">
                    Register →
                  </a>
                </div>

                <div className="event-card-glow"></div>
              </div>
            ))}
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="no-events">
            <p>No events found in this category.</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="events-cta-section">
        <div className="events-cta-content">
          <h2>Want to Host an Event?</h2>
          <p>Have an idea for a workshop or talk? We'd love to help you share your knowledge!</p>
          <Link to="/contact" className="events-cta-btn">Get in Touch</Link>
        </div>
      </section>
    </div>
  )
}

export default Events
