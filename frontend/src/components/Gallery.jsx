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

// Component for a single Bento Row - Clean fade-in
const BentoRow = ({ images, rowIndex }) => {
  // Get image URL safely
  const getImageUrl = (img) => img?.image || img?.src || '';
  const getImageAlt = (img) => img?.title || img?.alt || 'Gallery image';

  if (!images || images.length === 0) return null;

  return (
    <div className="gallery-grid fade-in" style={{ animationDelay: `${rowIndex * 0.1}s` }}>
      {/* Main Center Image */}
      {images[0] && (
        <div className="gallery-item main-image">
          <img src={getImageUrl(images[0])} alt={getImageAlt(images[0])} loading="eager" />
        </div>
      )}

      {/* Left Column */}
      {images[1] && (
        <div className="gallery-item left-top">
          <img src={getImageUrl(images[1])} alt={getImageAlt(images[1])} loading="eager" />
        </div>
      )}
      {images[2] && (
        <div className="gallery-item left-bottom">
          <img src={getImageUrl(images[2])} alt={getImageAlt(images[2])} loading="eager" />
        </div>
      )}

      {/* Right Column */}
      {images[3] && (
        <div className="gallery-item right-top">
          <img src={getImageUrl(images[3])} alt={getImageAlt(images[3])} loading="eager" />
        </div>
      )}
      {images[4] && (
        <div className="gallery-item right-bottom">
          <img src={getImageUrl(images[4])} alt={getImageAlt(images[4])} loading="eager" />
        </div>
      )}

      {/* Bottom Row */}
      {images[5] && (
        <div className="gallery-item bottom-left">
          <img src={getImageUrl(images[5])} alt={getImageAlt(images[5])} loading="lazy" />
        </div>
      )}
      {images[6] && (
        <div className="gallery-item bottom-right">
          <img src={getImageUrl(images[6])} alt={getImageAlt(images[6])} loading="lazy" />
        </div>
      )}
    </div>
  );
};

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

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
        // Trigger fade-in after images loaded
        setTimeout(() => setIsLoaded(true), 50);
      }
    };
    fetchImages();
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
    <section className="gallery-section">
      <Navbar />

      <div className="gallery-container">
        {/* Header */}
        <div className={`gallery-header ${isLoaded ? 'visible' : ''}`}>
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
          /* Bento Grid Rows */
          imageRows.map((rowImages, index) => (
            <BentoRow 
              key={index}
              images={rowImages}
              rowIndex={index}
            />
          ))
        )}

        {/* Image Count */}
        {!isLoading && galleryImages.length > 0 && (
          <div className={`gallery-count ${isLoaded ? 'visible' : ''}`}>
            <span>{galleryImages.length} MOMENTS CAPTURED</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
