import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import './Events.css'
import { API_URL } from '../config'

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

// Skeleton Event Card
const SkeletonCard = ({ index }) => (
  <div className="event-card skeleton-card visible" style={{ '--delay': `${index * 0.1}s` }}>
    <div className="event-card-date skeleton-item">
      <div className="skeleton-shimmer"></div>
    </div>
    <div className="event-card-speaker">
      <div className="card-speaker-img skeleton-item"><div className="skeleton-shimmer"></div></div>
      <div className="card-speaker-info">
        <div className="skeleton-text skeleton-item" style={{ width: '80px', height: '14px' }}><div className="skeleton-shimmer"></div></div>
        <div className="skeleton-text skeleton-item" style={{ width: '60px', height: '10px', marginTop: '5px' }}><div className="skeleton-shimmer"></div></div>
      </div>
    </div>
    <div className="event-card-content">
      <div className="skeleton-text skeleton-item" style={{ width: '70px', height: '20px' }}><div className="skeleton-shimmer"></div></div>
      <div className="skeleton-text skeleton-item" style={{ width: '100%', height: '24px', marginTop: '10px' }}><div className="skeleton-shimmer"></div></div>
      <div className="skeleton-text skeleton-item" style={{ width: '100%', height: '40px', marginTop: '10px' }}><div className="skeleton-shimmer"></div></div>
      <div className="card-meta" style={{ marginTop: '15px' }}>
        <div className="skeleton-text skeleton-item" style={{ width: '80px', height: '14px' }}><div className="skeleton-shimmer"></div></div>
        <div className="skeleton-text skeleton-item" style={{ width: '100px', height: '14px' }}><div className="skeleton-shimmer"></div></div>
      </div>
      <div className="skeleton-text skeleton-item" style={{ width: '100px', height: '36px', marginTop: '15px', borderRadius: '20px' }}><div className="skeleton-shimmer"></div></div>
    </div>
  </div>
);

function Events() {
  const [loaded, setLoaded] = useState(false)
  const [filter, setFilter] = useState('all')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Helper function to parse event date for sorting
  const parseEventDate = (event) => {
    const months = {
      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
      'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };
    const year = parseInt(event.year) || new Date().getFullYear();
    const month = months[event.month?.toUpperCase()] ?? 0;
    const day = parseInt(event.date) || 1;
    return new Date(year, month, day);
  };

  // Sort events by date (nearest first)
  const sortEventsByDate = (eventsToSort) => {
    return [...eventsToSort].sort((a, b) => {
      const dateA = parseEventDate(a);
      const dateB = parseEventDate(b);
      return dateA - dateB; // Ascending order (nearest date first)
    });
  };

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/events`);
        const data = await response.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          // Transform and sort events
          const transformedEvents = data.data.map(transformEvent);
          const sortedEvents = sortEventsByDate(transformedEvents);
          setEvents(sortedEvents);
        } else if (Array.isArray(data) && data.length > 0) {
          const transformedEvents = data.map(transformEvent);
          const sortedEvents = sortEventsByDate(transformedEvents);
          setEvents(sortedEvents);
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
    : events.filter(event => event.type?.toLowerCase().trim() === filter)

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
          <div className="events-grid">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} index={i} />)}
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
                    loading="lazy"
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
