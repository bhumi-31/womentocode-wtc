import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './Gallery.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Helper: Split images into chunks of 7 for bento rows
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

// Component for a single Bento Row
const BentoRow = ({ images, rowIndex, animationStage, isFirstRow }) => {
  // Show items when stage >= 2
  const showItems = animationStage >= 2;

  // Get image URL safely
  const getImageUrl = (img) => img?.image || img?.src || '';
  const getImageAlt = (img) => img?.title || img?.alt || 'Gallery image';

  // If not enough images for a complete row, render partial
  if (!images || images.length === 0) return null;

  return (
    <div className={`gallery-grid ${!isFirstRow ? 'additional-row' : ''} ${showItems ? 'visible' : ''}`}>
      {/* Main Center Image (index 0) */}
      {images[0] && (
        <div className={`gallery-item main-image ${showItems ? 'visible' : ''}`}>
          <img src={getImageUrl(images[0])} alt={getImageAlt(images[0])} loading="eager" />
        </div>
      )}

      {/* Left Column (index 1, 2) */}
      {images[1] && (
        <div className={`gallery-item left-top ${showItems ? 'visible' : ''}`} style={{animationDelay: '0.05s'}}>
          <img src={getImageUrl(images[1])} alt={getImageAlt(images[1])} loading="eager" />
        </div>
      )}
      {images[2] && (
        <div className={`gallery-item left-bottom ${showItems ? 'visible' : ''}`} style={{animationDelay: '0.1s'}}>
          <img src={getImageUrl(images[2])} alt={getImageAlt(images[2])} loading="eager" />
        </div>
      )}

      {/* Right Column (index 3, 4) */}
      {images[3] && (
        <div className={`gallery-item right-top ${showItems ? 'visible' : ''}`} style={{animationDelay: '0.05s'}}>
          <img src={getImageUrl(images[3])} alt={getImageAlt(images[3])} loading="eager" />
        </div>
      )}
      {images[4] && (
        <div className={`gallery-item right-bottom ${showItems ? 'visible' : ''}`} style={{animationDelay: '0.1s'}}>
          <img src={getImageUrl(images[4])} alt={getImageAlt(images[4])} loading="eager" />
        </div>
      )}

      {/* Bottom Row (index 5, 6) */}
      {images[5] && (
        <div className={`gallery-item bottom-left ${showItems ? 'visible' : ''}`} style={{animationDelay: '0.15s'}}>
          <img src={getImageUrl(images[5])} alt={getImageAlt(images[5])} loading="lazy" />
        </div>
      )}
      {images[6] && (
        <div className={`gallery-item bottom-right ${showItems ? 'visible' : ''}`} style={{animationDelay: '0.15s'}}>
          <img src={getImageUrl(images[6])} alt={getImageAlt(images[6])} loading="lazy" />
        </div>
      )}
    </div>
  );
};

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [animationStage, setAnimationStage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  // Stage 0: Initial
  // Stage 1: Main image appears
  // Stage 2: Grid visible
  // Stage 3: All complete

  useEffect(() => {
    // Fetch gallery images from backend
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

    // Fast animation sequence
    // Stage 0 -> 1: Quick start
    const timer1 = setTimeout(() => {
      setAnimationStage(1);
    }, 100);

    // Stage 1 -> 2: Show grid
    const timer2 = setTimeout(() => {
      setAnimationStage(2);
    }, 400);

    // Stage 2 -> 3: Complete
    const timer3 = setTimeout(() => {
      setAnimationStage(3);
    }, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Split images into rows of 7
  const imageRows = chunkArray(galleryImages, 7);

  // Skeleton for loading state
  const SkeletonGrid = () => (
    <div className="gallery-grid skeleton-grid">
      <div className="gallery-item main-image skeleton-item"><div className="skeleton-shimmer"></div></div>
      <div className="gallery-item left-top skeleton-item"><div className="skeleton-shimmer"></div></div>
      <div className="gallery-item left-bottom skeleton-item"><div className="skeleton-shimmer"></div></div>
      <div className="gallery-item right-top skeleton-item"><div className="skeleton-shimmer"></div></div>
      <div className="gallery-item right-bottom skeleton-item"><div className="skeleton-shimmer"></div></div>
      <div className="gallery-item bottom-left skeleton-item"><div className="skeleton-shimmer"></div></div>
      <div className="gallery-item bottom-right skeleton-item"><div className="skeleton-shimmer"></div></div>
    </div>
  );

  return (
    <section className={`gallery-section stage-${animationStage}`}>
      {/* Navbar - shows immediately */}
      <Navbar />

      {/* Gallery Container */}
      <div className="gallery-container">
        {/* Header - shows quickly */}
        <div className={`gallery-header ${animationStage >= 1 ? 'visible' : ''}`}>
          <span className="gallery-label">── OUR GALLERY</span>
          <h1 className="gallery-title">
            <span className="title-line">MOMENTS OF</span>
            <span className="title-line highlight">EMPOWERMENT</span>
          </h1>
        </div>

        {/* Loading Skeleton or Images */}
        {isLoading ? (
          <SkeletonGrid />
        ) : galleryImages.length === 0 ? (
          <div className="gallery-empty">
            <p>No images yet. Add some from Admin Dashboard!</p>
          </div>
        ) : (
          /* Render all Bento Rows */
          imageRows.map((rowImages, index) => (
            <BentoRow 
              key={index}
              images={rowImages}
              rowIndex={index}
              animationStage={animationStage}
              isFirstRow={index === 0}
            />
          ))
        )}

        {/* Image Count */}
        {animationStage >= 2 && galleryImages.length > 0 && (
          <div className="gallery-count">
            <span>{galleryImages.length} MOMENTS CAPTURED</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
