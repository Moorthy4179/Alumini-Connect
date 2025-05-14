import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./home.css";
import Navbar from "./navbar"; 

const images = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgBzIWfoqTRlPCl2B0bEeV0yhhZ3ytD6rTOg&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvw24pVIgq4ZOs1UmNExrR2PNeREspXHMW0g&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ96CUbP_gzPpJzQtaWsPMvflRgVrW4Ch1NoQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ96CUbP_gzPpJzQtaWsPMvflRgVrW4Ch1NoQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS86f4vnxkMmuusNJNkuQh7XiODgLftExkoiQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS86f4vnxkMmuusNJNkuQh7XiODgLftExkoiQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS86f4vnxkMmuusNJNkuQh7XiODgLftExkoiQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS86f4vnxkMmuusNJNkuQh7XiODgLftExkoiQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh8xq9hYECMhlsH-KpddtiJbITlQZJFw-4qA&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh8xq9hYECMhlsH-KpddtiJbITlQZJFw-4qA&s"
];

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      {/* Shared Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="text-content">
          <h1>Welcome</h1>
          <p>Dear Alumni</p>
          <Link to="/">
            <button className="login-btn">Log In</button>
          </Link>
        </div>

        {/* Image Slider */}
        <div className="image-slider-container">
          <div className="image-slider">
            <img src={images[currentImageIndex]} alt={`Slide ${currentImageIndex + 1}`} />
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentImageIndex ? "active" : ""}`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Home;
