import React, { useState, useEffect } from "react";
import "./home.css";
import Navbar from "./navbar"; 
import { useAuth } from "./AuthContext";
const API_BASE_URL = 'http://localhost/Alumni'; 
const IMAGES_BASE_URL = 'http://localhost/public';
const Home = () => {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    fetchImages();
  }, []);
  useEffect(() => {
    if (images.length > 0) {
      const sliderInterval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      return () => {
        clearInterval(sliderInterval);
      };
    }
  }, [images.length]);
  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/home_images.php`);
      const data = await response.json();   
      if (data.status === 'success' && data.images) {
        const processedImages = data.images.map(image => ({
          ...image,
          image_path: getFullImageUrl(image.image_path)
        }));     
        setImages(processedImages);
        setError(null);
      } else {
        setError('Failed to load images');
      }
    } catch (err) {
      setError('Failed to connect to server');
      setImages([
        { id: 1, image_path: "/api/placeholder/800/600", image_name: "Default 1" },
        { id: 2, image_path: "/api/placeholder/800/600", image_name: "Default 2" },
        { id: 3, image_path: "/api/placeholder/800/600", image_name: "Default 3" }
      ]);
    } finally {
      setLoading(false);
    }
  };
  const getFullImageUrl = (imagePath) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    if (imagePath.startsWith('/images/')) {
      return `${IMAGES_BASE_URL}${imagePath}`;
    }
    if (imagePath.startsWith('images/')) {
      return `${IMAGES_BASE_URL}/${imagePath}`;
    }   
    return `${IMAGES_BASE_URL}/images/${imagePath}`;
  };
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex + 1) % images.length
    );
  };
  const handleImageError = (e, imageIndex) => {
    const fallbackUrls = [
      '/api/placeholder/800/600',
      `${IMAGES_BASE_URL}/images/placeholder.jpg`,
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
    ]; 
    if (!e.target.dataset.fallbackIndex) {
      e.target.dataset.fallbackIndex = '0';
    }  
    const fallbackIndex = parseInt(e.target.dataset.fallbackIndex);
    if (fallbackIndex < fallbackUrls.length) {
      e.target.src = fallbackUrls[fallbackIndex];
      e.target.dataset.fallbackIndex = (fallbackIndex + 1).toString();
    }
  };
  if (loading) {
    return (
      <div className="home-container">
        <Navbar />
        <div className="loading-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          fontSize: '18px'
        }}>
          Loading images...
        </div>
      </div>
    );
  }
  if (images.length === 0) {
    return (
      <div className="home-container">
        <Navbar />
        <div className="error-container" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          fontSize: '18px',
          color: '#666'
        }}>
          <p>No images available to display</p>
          {error && <p style={{ color: '#ff6b6b', marginTop: '10px' }}>{error}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className="home-container">
      <Navbar />
      <div className="fullpage-slider">
        <img
          src={images[currentImageIndex]?.image_path}
          alt={images[currentImageIndex]?.image_name || `Slide ${currentImageIndex + 1}`}
          className="fullpage-image"
          onError={(e) => handleImageError(e, currentImageIndex)}
        />
        {images.length > 1 && (
          <>
            <div className="slider-arrows">
              <button className="arrow left-arrow" onClick={handlePrevImage}>
                &lt;
              </button>
              <button className="arrow right-arrow" onClick={handleNextImage}>
                &gt;
              </button>
            </div>
            <div className="dots">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => setCurrentImageIndex(index)}
                ></span>
              ))}
            </div>
          </>
        )}
        {error && (
          <div className="error-message" style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
export default Home;