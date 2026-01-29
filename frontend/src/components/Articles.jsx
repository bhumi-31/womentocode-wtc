import { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import './Articles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const categories = ['All', 'Career', 'Tech', 'Community', 'Leadership', 'Tutorial'];

// Skeleton Article Card
const SkeletonCard = ({ index }) => (
  <div className="article-card skeleton-card visible" style={{ animationDelay: `${index * 0.1}s` }}>
    <div className="article-image skeleton-item">
      <div className="skeleton-shimmer"></div>
    </div>
    <div className="article-content">
      <div className="article-meta">
        <span className="skeleton-text skeleton-item" style={{ width: '60px', height: '20px' }}><div className="skeleton-shimmer"></div></span>
        <span className="skeleton-text skeleton-item" style={{ width: '70px', height: '16px' }}><div className="skeleton-shimmer"></div></span>
      </div>
      <div className="skeleton-text skeleton-item" style={{ width: '100%', height: '24px', marginTop: '10px' }}><div className="skeleton-shimmer"></div></div>
      <div className="skeleton-text skeleton-item" style={{ width: '100%', height: '40px', marginTop: '8px' }}><div className="skeleton-shimmer"></div></div>
      <div className="article-footer" style={{ marginTop: '15px' }}>
        <div className="article-author">
          <div className="skeleton-avatar skeleton-item"><div className="skeleton-shimmer"></div></div>
          <span className="skeleton-text skeleton-item" style={{ width: '80px', height: '14px' }}><div className="skeleton-shimmer"></div></span>
        </div>
        <span className="skeleton-text skeleton-item" style={{ width: '60px', height: '14px' }}><div className="skeleton-shimmer"></div></span>
      </div>
    </div>
  </div>
);

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleChars, setVisibleChars] = useState({ line1: 0, line2: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const animationStarted = useRef(false);

  const line1 = "INSIGHTS &";
  const line2 = "STORIES";

  // Fetch articles from backend
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/articles`);
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          // Map backend data to match frontend structure
          const mappedArticles = data.data.map(article => ({
            id: article._id,
            title: article.title,
            excerpt: article.excerpt || article.content?.substring(0, 150),
            coverImage: article.featuredImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            category: article.category?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Technology',
            readTime: `${article.readTime || 5} min read`,
            author: {
              name: article.authorName || 'WomenToCode',
              image: article.authorImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
            },
            publishedDate: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
            featured: article.isFeatured,
            mediumUrl: article.mediumUrl || 'https://medium.com/@womentocode'
          }));
          setArticles(mappedArticles);
          setFilteredArticles(mappedArticles);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Character animation
  useEffect(() => {
    if (animationStarted.current) return;
    animationStarted.current = true;

    let charIndex = 0;

    // Start animation after 500ms delay
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
                setTimeout(() => setIsVisible(true), 300);
              }
            }, 100);
          }, 200);
        }
      }, 100);
    }, 500);

    return () => { };
  }, []);

  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(article => article.category === activeCategory));
    }
  }, [activeCategory, articles]);

  const featuredArticle = articles.find(article => article.featured);
  const totalArticles = articles.length;

  return (
    <section className="articles-section">
      <Navbar />
      <div className="articles-container">
        {/* Header */}
        <div className="articles-header">
          <div className="articles-header-left">
            <span className={`articles-label ${visibleChars.line1 > 0 ? 'visible' : ''}`}>── FROM OUR MEDIUM</span>
            <h1 className="articles-title">
              <span className="title-line">
                {line1.split('').map((char, i) => (
                  <span
                    key={i}
                    className={`char-animate ${i < visibleChars.line1 ? 'visible' : ''}`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
              <span className="title-line highlight">
                {line2.split('').map((char, i) => (
                  <span
                    key={i}
                    className={`char-animate highlight-char ${i < visibleChars.line2 ? 'visible' : ''}`}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </h1>
            <p className={`articles-stats ${isVisible && !isLoading ? 'visible' : ''}`}>
              {isLoading ? '' : `${totalArticles} articles by our community`}
            </p>
          </div>

          <div className={`articles-header-right ${isVisible ? 'visible' : ''}`}>
            <a
              href="https://medium.com/@womentocode"
              target="_blank"
              rel="noopener noreferrer"
              className="medium-follow-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="medium-icon">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
              </svg>
              Follow on Medium
            </a>

            {/* Filter Chips */}
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

        {/* Featured Article */}
        {featuredArticle && activeCategory === 'All' && (
          <a
            href={featuredArticle.mediumUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`featured-article ${isVisible ? 'visible' : ''}`}
          >
            <div className="featured-image">
              <img src={featuredArticle.coverImage} alt={featuredArticle.title} />
              <div className="featured-overlay">
                <span className="featured-badge">Featured</span>
              </div>
            </div>
            <div className="featured-content">
              <div className="featured-meta">
                <span className="article-category">{featuredArticle.category}</span>
                <span className="article-read-time">{featuredArticle.readTime}</span>
              </div>
              <h2 className="featured-title">{featuredArticle.title}</h2>
              <p className="featured-excerpt">{featuredArticle.excerpt}</p>
              <div className="featured-author">
                <img src={featuredArticle.author.image} alt={featuredArticle.author.name} />
                <div className="author-info">
                  <span className="author-name">{featuredArticle.author.name}</span>
                  <span className="author-date">{featuredArticle.publishedDate}</span>
                </div>
              </div>
              <div className="read-on-medium">
                Read on Medium
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>
          </a>
        )}

        {/* Articles Grid */}
        <div className="articles-grid">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} index={i} />)
          ) : filteredArticles
            .filter(article => activeCategory !== 'All' || !article.featured)
            .map((article, index) => (
              <a
                key={article.id}
                href={article.mediumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`article-card ${isVisible ? 'visible' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="article-image">
                  <img src={article.coverImage} alt={article.title} />
                  <div className="article-overlay">
                    <div className="arrow-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="article-content">
                  <div className="article-meta">
                    <span className="article-category">{article.category}</span>
                    <span className="article-read-time">{article.readTime}</span>
                  </div>

                  <h3 className="article-title">{article.title}</h3>
                  <p className="article-excerpt">{article.excerpt}</p>

                  <div className="article-footer">
                    <div className="article-author">
                      <img src={article.author.image} alt={article.author.name} />
                      <span className="author-name">{article.author.name}</span>
                    </div>
                    <span className="article-date">{article.publishedDate}</span>
                  </div>
                </div>
              </a>
            ))}
        </div>

        {/* View All on Medium Button */}
        <div className={`medium-cta ${isVisible ? 'visible' : ''}`}>
          <a
            href="https://medium.com/@womentocode"
            target="_blank"
            rel="noopener noreferrer"
            className="medium-cta-btn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="medium-icon">
              <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
            </svg>
            View All Articles on Medium
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arrow">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Articles;
