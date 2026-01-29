import { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import './Projects.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const categories = ['All', 'Web Development', 'Mobile', 'Data Science', 'AI/ML', 'Design'];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleChars, setVisibleChars] = useState({ line1: 0, line2: 0, line3: 0 });
  const animationStarted = useRef(false);

  const line1 = "WOMEN";
  const line2 = "BUILDING THE";
  const line3 = "FUTURE";

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setProjects(data);
          setFilteredProjects(data);
        } else if (data.success && Array.isArray(data.data)) {
          setProjects(data.data);
          setFilteredProjects(data.data);
        } else if (data.projects) {
          setProjects(data.projects);
          setFilteredProjects(data.projects);
        } else {
          setProjects([]);
          setFilteredProjects([]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Character by character animation for heading
  useEffect(() => {
    if (animationStarted.current) return;
    animationStarted.current = true;

    let charIndex = 0;

    // Start animation after 500ms delay
    setTimeout(() => {
      // Animate line 1
      const animateLine1 = setInterval(() => {
        if (charIndex < line1.length) {
          setVisibleChars(prev => ({ ...prev, line1: charIndex + 1 }));
          charIndex++;
        } else {
          clearInterval(animateLine1);
          charIndex = 0;

          // Animate line 2
          setTimeout(() => {
            const animateLine2 = setInterval(() => {
              if (charIndex < line2.length) {
                setVisibleChars(prev => ({ ...prev, line2: charIndex + 1 }));
                charIndex++;
              } else {
                clearInterval(animateLine2);
                charIndex = 0;

                // Animate line 3
                setTimeout(() => {
                  const animateLine3 = setInterval(() => {
                    if (charIndex < line3.length) {
                      setVisibleChars(prev => ({ ...prev, line3: charIndex + 1 }));
                      charIndex++;
                    } else {
                      clearInterval(animateLine3);
                      setTimeout(() => setIsVisible(true), 300);
                    }
                  }, 100);
                }, 200);
              }
            }, 100);
          }, 200);
        }
      }, 100);
    }, 500);

    return () => { };
  }, []);

  // Filter projects based on category and search
  useEffect(() => {
    let filtered = projects;

    if (activeCategory !== 'All') {
      filtered = filtered.filter(project => {
        const cat = project.category?.toLowerCase() || '';
        const activeCat = activeCategory.toLowerCase();
        return cat.includes(activeCat) || activeCat.includes(cat);
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.technologies || []).some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredProjects(filtered);
  }, [activeCategory, searchQuery, projects]);

  const openProject = (project) => {
    setSelectedProject(project);
    setTimeout(() => setIsModalOpen(true), 10);
    document.body.style.overflow = 'hidden';
  };

  const closeProject = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedProject(null);
      document.body.style.overflow = 'auto';
    }, 400);
  };

  const totalProjects = projects.length;
  const uniqueCreators = projects.length;

  // Skeleton Card Component
  const SkeletonCard = ({ index }) => (
    <div
      className="project-card skeleton-card"
      style={{
        animationDelay: `${index * 0.1}s`,
        background: '#111',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      <div style={{
        width: '100%',
        height: '200px',
        background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }}></div>
      <div style={{ padding: '1.5rem' }}>
        <div style={{
          width: '80%',
          height: '24px',
          background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '4px',
          marginBottom: '0.75rem'
        }}></div>
        <div style={{
          width: '60%',
          height: '16px',
          background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              width: '60px',
              height: '24px',
              background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '12px'
            }}></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="projects-section">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <Navbar />
      <div className="projects-container">
        {/* Header */}
        <div className="projects-header">
          <div className="projects-header-left">
            <span className={`projects-label ${visibleChars.line1 > 0 ? 'visible' : ''}`}>── OUR PROJECTS</span>
            <h1 className="projects-title">
              <span className="title-line">
                {line1.split('').map((char, i) => (
                  <span
                    key={i}
                    className={`char-animate ${i < visibleChars.line1 ? 'visible' : ''}`}
                  >
                    {char}
                  </span>
                ))}
              </span>
              <span className="title-line">
                {line2.split('').map((char, i) => (
                  <span
                    key={i}
                    className={`char-animate ${i < visibleChars.line2 ? 'visible' : ''}`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
              <span className="title-line highlight">
                {line3.split('').map((char, i) => (
                  <span
                    key={i}
                    className={`char-animate highlight-char ${i < visibleChars.line3 ? 'visible' : ''}`}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </h1>
            <p className={`projects-stats ${isVisible ? 'visible' : ''}`}>
              {totalProjects} projects by {uniqueCreators} incredible women
            </p>
          </div>

          <div className={`projects-header-right ${isVisible ? 'visible' : ''}`}>
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search projects, tech, or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-chips">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-chip ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {loading ? (
            // Show skeleton cards while loading
            [...Array(6)].map((_, index) => (
              <SkeletonCard key={index} index={index} />
            ))
          ) : filteredProjects.length === 0 ? (
            <div className="no-results">
              <p>No projects found. Add some projects from Admin Dashboard!</p>
            </div>
          ) : (
            filteredProjects.map((project, index) => (
              <div
                key={project._id || index}
                className={`project-card ${isVisible ? 'visible' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => openProject(project)}
              >
                <div className="project-image-container">
                  <img
                    src={project.image || '/placeholder-project.jpg'}
                    alt={project.title}
                    className="project-image"
                    loading="lazy"
                  />
                  <div className="project-overlay">
                    <div className="arrow-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                  </div>
                  {project.isFeatured && (
                    <span className="featured-badge">Featured</span>
                  )}
                </div>

                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>

                  {project.creatorName && (
                    <div className="project-creator">
                      <span className="creator-name">By {project.creatorName}</span>
                      {project.graduationYear && <span className="creator-year">Class of {project.graduationYear}</span>}
                    </div>
                  )}

                  <div className="project-tech-stack">
                    {(project.technologies || []).slice(0, 3).map((tech, i) => (
                      <span key={i} className="tech-pill">{tech}</span>
                    ))}
                    {(project.technologies || []).length > 3 && (
                      <span className="tech-pill more">+{project.technologies.length - 3}</span>
                    )}
                  </div>

                  <p className="project-short-desc">{project.shortDescription || project.description?.substring(0, 100)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* No Results */}
        {filteredProjects.length === 0 && searchQuery && (
          <div className="no-results">
            <p>No projects found matching your criteria.</p>
            <button onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className={`project-modal-backdrop ${isModalOpen ? 'open' : ''}`} onClick={closeProject}>
          <div className={`project-modal ${isModalOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProject}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="modal-content">
              <div className="modal-image-section">
                <img
                  src={selectedProject.image || '/placeholder-project.jpg'}
                  alt={selectedProject.title}
                  className="modal-image"
                  loading="lazy"
                />
              </div>

              <div className="modal-info-section">
                <span className="modal-category">{selectedProject.category}</span>

                <h2 className="modal-title">{selectedProject.title}</h2>

                <p className="modal-description">{selectedProject.description}</p>

                <div className="modal-tech-section">
                  <h4 className="modal-section-title">Tech Stack</h4>
                  <div className="modal-tech-stack">
                    {(selectedProject.technologies || []).map((tech, i) => (
                      <span key={i} className="modal-tech-pill">{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="modal-links">
                  {selectedProject.liveUrl && (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-link demo"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Live Demo
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-link github"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                  )}
                </div>

                {/* Creator Info Section */}
                {selectedProject.creatorName && (
                  <div className="modal-creator">
                    <div className="creator-avatar">
                      {selectedProject.creatorImage ? (
                        <img src={selectedProject.creatorImage} alt={selectedProject.creatorName} />
                      ) : (
                        <span className="avatar-initials">
                          {selectedProject.creatorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="creator-details">
                      <span className="creator-label">Created by</span>
                      <span className="creator-name">{selectedProject.creatorName}</span>
                      {selectedProject.creatorRole && (
                        <span className="creator-role">{selectedProject.creatorRole}</span>
                      )}
                      {selectedProject.graduationYear && (
                        <span className="creator-year">Class of {selectedProject.graduationYear}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="modal-status">
                  <span className={`status-badge ${selectedProject.status}`}>
                    {selectedProject.status === 'completed' ? '✓ Completed' :
                      selectedProject.status === 'in-progress' ? '🔄 In Progress' : selectedProject.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
