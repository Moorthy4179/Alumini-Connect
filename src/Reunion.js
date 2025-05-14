import React, { useState } from "react";
import "./Reunion.css";
import Navbar from "./navbar";

const Reunion = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    year: "",
    location: "",
    participants: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Registered Successfully!\n" + JSON.stringify(formData, null, 2));
    setFormData({
      name: "",
      department: "",
      year: "",
      location: "",
      participants: "",
    });
    setShowForm(false);
  };

  return (
    <>
      <Navbar />
      <div className="reunion-background">
        <div className="reunion-content">
          <h1 className="reunion-title">🎓 Alumni Reunion 2025</h1>
          <p className="reunion-description">
            Let’s celebrate the bond we’ve shared over the years. Join your fellow alumni for an evening of memories, joy, and connections!
          </p>
          <div className="event-details">
            <p><strong>Date:</strong> December 20, 2025</p>
            <p><strong>Time:</strong> 5:00 PM - 9:00 PM</p>
            <p><strong>Venue:</strong> College Auditorium, ABC University</p>
            <p><strong>Highlights:</strong> Speeches, Dinner, Dance, and a Walk Down Memory Lane 🎉</p>
          </div>
          <button className="register-btn" onClick={() => setShowForm(true)}>
            Register Now
          </button>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowForm(false)}>&times;</span>
            <form className="reunion-form" onSubmit={handleSubmit}>
              <h2>Registration Form</h2>
              <input
                type="text"
                name="name"
                placeholder="Student Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="year"
                placeholder="Year"
                value={formData.year}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="location"
                placeholder="Current Location"
                value={formData.location}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="participants"
                placeholder="Number of Participants"
                value={formData.participants}
                onChange={handleChange}
                required
              />
              <button type="submit" className="submit-btn">Enroll Now</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Reunion;
