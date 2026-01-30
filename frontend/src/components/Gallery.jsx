import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './Gallery.css';

import { API_URL } from '../config';

// Helper: Split images into chunks of 7 for bento rows
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

// Typewriter Text Component
const TypewriterText = ({ text, delay = 0, speed = 50, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

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
      setDone(true);
      if (onComplete) onComplete();
    }
  }, [currentIndex, text, speed, started, onComplete]);

  return <>{displayedText}{!done && <span className="typewriter-cursor">|</span>}</>;
};

// Skeleton Bento Grid
const SkeletonBento = () => (
  <div className="gallery-grid skeleton-grid visible">
    <div className="gallery-item main-image skeleton-item"><div className="skeleton-shimmer"></div></div>
    <div className="gallery-item left-top skeleton-item"><div className="skeleton-shimmer"></div></div>
    <div className="gallery-item left-bottom skeleton-item"><div className="skeleton-shimmer"></div></div>
    <div className="gallery-item right-top skeleton-item"><div className="skeleton-shimmer"></div></div>
    <div className="gallery-item right-bottom skeleton-item"><div className="skeleton-shimmer"></div></div>
    <div className="gallery-item bottom-left skeleton-item"><div className="skeleton-shimmer"></div></div>
    <div className="gallery-item bottom-right skeleton-item"><div className="skeleton-shimmer"></div></div>
  </div>
);

// Component for a single Bento Row
const BentoRow = ({ images, rowIndex, showImages }) => {
  const getImageUrl = (img) => img?.image || img?.src || '';
  const getImageAlt = (img) => img?.title || img?.alt || 'Gallery image';

  if (!images || images.length === 0) return null;

  return (
    <div
      className={`gallery-grid ${showImages ? 'visible' : ''}`}
      style={{ animationDelay: `${rowIndex * 0.15}s` }}
    >
      {images[0] && (
        <div className="gallery-item main-image" style={{ animationDelay: `${rowIndex * 0.15}s` }}>
          <img src={getImageUrl(images[0])} alt={getImageAlt(images[0])} loading="eager" />
        </div>
      )}
      {images[1] && (
        <div className="gallery-item left-top" style={{ animationDelay: `${rowIndex * 0.15 + 0.05}s` }}>
          <img src={getImageUrl(images[1])} alt={getImageAlt(images[1])} loading="eager" />
        </div>
      )}
      {images[2] && (
        <div className="gallery-item left-bottom" style={{ animationDelay: `${rowIndex * 0.15 + 0.1}s` }}>
          <img src={getImageUrl(images[2])} alt={getImageAlt(images[2])} loading="eager" />
        </div>
      )}
      {images[3] && (
        <div className="gallery-item right-top" style={{ animationDelay: `${rowIndex * 0.15 + 0.05}s` }}>
          <img src={getImageUrl(images[3])} alt={getImageAlt(images[3])} loading="eager" />
        </div>
      )}
      {images[4] && (
        <div className="gallery-item right-bottom" style={{ animationDelay: `${rowIndex * 0.15 + 0.1}s` }}>
          <img src={getImageUrl(images[4])} alt={getImageAlt(images[4])} loading="eager" />
        </div>
      )}
      {images[5] && (
        <div className="gallery-item bottom-left" style={{ animationDelay: `${rowIndex * 0.15 + 0.15}s` }}>
          <img src={getImageUrl(images[5])} alt={getImageAlt(images[5])} loading="lazy" />
        </div>
      )}
      {images[6] && (
        <div className="gallery-item bottom-right" style={{ animationDelay: `${rowIndex * 0.15 + 0.15}s` }}>
          <img src={getImageUrl(images[6])} alt={getImageAlt(images[6])} loading="lazy" />
        </div>
      )}
    </div>
  );
};

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [headingComplete, setHeadingComplete] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [line1Done, setLine1Done] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/gallery`);
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setGalleryImages(data.data);
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  // Show images after heading is complete
  useEffect(() => {
    if (headingComplete) {
      const timer = setTimeout(() => setShowImages(true), 300);
      return () => clearTimeout(timer);
    }
  }, [headingComplete]);

  const imageRows = chunkArray(galleryImages, 7);

  return (
    <section className="gallery-section">
      <Navbar />

      <div className="gallery-container">
        {/* Header with Typewriter */}
        <div className="gallery-header visible">
          <span className="gallery-label">── OUR GALLERY</span>
          <h1 className="gallery-title">
            <span className="title-line">
              <TypewriterText
                text="MOMENTS OF"
                delay={300}
                speed={60}
                onComplete={() => setLine1Done(true)}
              />
            </span>
            {line1Done && (
              <span className="title-line highlight">
                <TypewriterText
                  text="EMPOWERMENT"
                  delay={100}
                  speed={50}
                  onComplete={() => setHeadingComplete(true)}
                />
              </span>
            )}
          </h1>
        </div>

        {/* Skeleton while loading or waiting for heading */}
        {(!showImages || isLoading) && <SkeletonBento />}

        {/* Images after heading complete and loaded */}
        {showImages && !isLoading && galleryImages.length > 0 && (
          imageRows.map((rowImages, index) => (
            <BentoRow
              key={index}
              images={rowImages}
              rowIndex={index}
              showImages={showImages}
            />
          ))
        )}

        {/* Image Count */}
        {showImages && !isLoading && galleryImages.length > 0 && (
          <div className="gallery-count">
            <span>{galleryImages.length} MOMENTS CAPTURED</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
