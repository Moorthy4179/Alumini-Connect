import React, { useState } from "react";
import "./VirtualSection.css";
import Navbar from "./navbar";

const VirtualSection = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    year: "",
    contact: "",
    interest: "Tech Trends in 2025",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true); // Show confirmation popup
  };

  const closeAllPopups = () => {
    setShowConfirmation(false);
    setShowPopup(false);
    setFormData({
      name: "",
      department: "",
      year: "",
      contact: "",
      interest: "Tech Trends in 2025",
    });
  };

  return (
    <>
      <Navbar />
      <div className="virtual-background">
        <div className="virtual-content">
          <h1 className="virtual-title">💻 Virtual Meetups & Webinars</h1>
          <p className="virtual-description">
            Stay connected from anywhere in the world! Attend webinars, panel discussions, and virtual meetups exclusively for our alumni network.
          </p>
          <div className="virtual-highlights">
            <ul>
              <li>Upcoming: Tech Trends in 2025</li>
              <li>Past Event: Entrepreneurship & Innovation</li>
              <li>Monthly Virtual Coffee Chat ☕</li>
            </ul>
          </div>
          <button className="join-btn" onClick={() => setShowPopup(true)}>
            Join Upcoming Session
          </button>
        </div>
      </div>

      {/* Registration Popup */}
      {showPopup && (
        <div className="modal-overlay" onClick={() => setShowPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowPopup(false)}>&times;</span>
            <form className="virtual-form" onSubmit={handleSubmit}>
              <h2>Join the Webinar</h2>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="department"
                placeholder="Your Department"
                value={formData.department}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="year"
                placeholder="Your Year"
                value={formData.year}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="contact"
                placeholder="Your Contact Number"
                value={formData.contact}
                onChange={handleChange}
                required
              />
              <select name="interest" value={formData.interest} onChange={handleChange}>
                <option value="Tech Trends in 2025">Tech Trends in 2025</option>
                <option value="Virtual Coffee Chat">Virtual Coffee Chat</option>
              </select>
              <button type="submit" className="submit-btn">Join Now</button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="modal-overlay" onClick={closeAllPopups}>
          <div className="modal-content confirmation" onClick={(e) => e.stopPropagation()}>
            <h3>✅ Thank You!</h3>
            <p>We will inform you before the event.</p>
            <button className="submit-btn" onClick={closeAllPopups}>OK</button>
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualSection;
