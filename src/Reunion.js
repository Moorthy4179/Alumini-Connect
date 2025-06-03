import React, { useState, useEffect } from "react";
import "./Reunion.css";
import Navbar from "./navbar";
import { useAuth } from "./AuthContext"; // Import useAuth

const Reunion = () => {
  const { user, isAuthenticated } = useAuth(); // Get user data
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(false); // New state for checking registration
  // Added popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    batch: "",
    location: "",
    participants: "",
  });
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const batches = [
    "2015-2019",
    "2016-2020",
    "2017-2021",
    "2018-2022",
    "2019-2023",
    "2020-2024",
    "2021-2025"
  ];
  
  const API_BASE = "http://localhost/Alumni"; 
  const populateFormFromUser = () => {
    if (user && !user.isAdmin) {
      let batchValue = "";
      if (user.batch_year) {
        const endYear = parseInt(user.batch_year);
        const startYear = endYear - 4;
        batchValue = `${startYear}-${endYear}`;
        if (!batches.includes(batchValue)) {
          batchValue = ""; 
        }
      }
      setFormData(prevData => ({
        ...prevData,
        name: user.name || "",
        department: user.department || "",
        batch: batchValue,
        location: prevData.location,
        participants: prevData.participants
      }));
    }
  };
  const showNotification = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 4000);
  };
  const checkExistingRegistration = async () => {
    if (!user || !upcomingEvent) return false;
    try {
      setCheckingRegistration(true);
      const response = await fetch(`${API_BASE}/reunion.php?action=get_event_details&event_id=${upcomingEvent.id}`);
      const data = await response.json();
      if (data.status === 'success' && data.event.registrations) {
        const existingRegistration = data.event.registrations.find(reg => 
          reg.name.toLowerCase() === user.name.toLowerCase() &&
          reg.department.toLowerCase() === user.department.toLowerCase() &&
          reg.year === user.batch_year
        );    
        return existingRegistration !== undefined;
      }     
      return false;
    } catch (err) {
      console.error('Error checking registration:', err);
      return false;
    } finally {
      setCheckingRegistration(false);
    }
  };
  const fetchUpcomingEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/reunion.php?action=get_upcoming_event`);
      const data = await response.json();     
      if (data.status === 'success') {
        setUpcomingEvent(data.event);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch upcoming event');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching upcoming event:', err);
    } finally {
      setLoading(false);
    }
  };
  const registerForEvent = async (registrationData) => {
    try {
      setSubmitting(true);
      const dataToSend = {
        action: 'register_for_event',
        event_id: upcomingEvent.id,
        name: registrationData.name,
        department: registrationData.department,
        year: user?.batch_year || registrationData.batch, 
        location: registrationData.location,
        participants: registrationData.participants
      };
      console.log('Sending registration data:', dataToSend); 
      const response = await fetch(`${API_BASE}/reunion.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });
      const data = await response.json();
      console.log('Registration response:', data); 
      if (data.status === 'success') {
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Failed to register for event');
      }
    } catch (err) {
      console.error('Registration error:', err); 
      return { success: false, message: err.message };
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    fetchUpcomingEvent();
  }, []);
  useEffect(() => {
    if (user && showForm) {
      populateFormFromUser();
    }
  }, [user, showForm]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!upcomingEvent) {
      showNotification("No upcoming event available for registration.", "error");
      return;
    }
    const result = await registerForEvent(formData);
    if (result.success) {
      showNotification("Registered Successfully!\n" + result.message, "success");
      setFormData({
        name: "",
        department: "",
        batch: "",
        location: "",
        participants: "",
      });
      setShowForm(false);
    } else {
      if (result.message.toLowerCase().includes('already registered')) {
        showNotification("⚠️ Already Registered!\n" + result.message, "warning");
      } else {
        showNotification("Registration Failed!\n" + result.message, "error");
      }
    }
  };
  const handleRegisterClick = async () => {
    if (!isAuthenticated) {
      showNotification("Please log in to register for the event.", "error");
      return;
    }
    const isAlreadyRegistered = await checkExistingRegistration();  
    if (isAlreadyRegistered) {
      showNotification(
        "⚠️ Already Registered!\nYou have already registered for this event.", 
        "warning"
      );
      return;
    }   
    setShowForm(true);
  }; 
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }; 
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="reunion-background">
          <div className="reunion-content">
            <div className="loading">Loading event information...</div>
          </div>
        </div>
      </>
    );
  }  
  if (error || !upcomingEvent) {
    return (
      <>
        <Navbar />
        <div className="reunion-background">
          <div className="reunion-content">
            <h1 className="reunion-title">🎓 Alumni Reunion</h1>
            <div className="error-message">
              {error ? `Error: ${error}` : "No upcoming reunion events at this time."}
            </div>
            <button onClick={fetchUpcomingEvent} className="retry-btn">
              Refresh
            </button>
          </div>
        </div>
      </>
    );
  } 
  return (
    <>
      <Navbar />
      <div className="reunion-background">
        <div className="reunion-content">
          <h1 className="reunion-title">🎓 {upcomingEvent.title}</h1>
          <p className="reunion-description">
            {upcomingEvent.description || "Let's celebrate the bond we've shared over the years. Join your fellow alumni for an evening of memories, joy, and connections!"}
          </p>
          <div className="event-details">
            <p><strong>Date:</strong> {formatDate(upcomingEvent.event_date)}</p>
            <p><strong>Time:</strong> {upcomingEvent.event_time}</p>
            <p><strong>Venue:</strong> {upcomingEvent.venue}</p>
            <p><strong>Highlights:</strong> Speeches, Dinner, Dance, and a Walk Down Memory Lane 🎉</p>
          </div>
          <button 
            className="register-btn" 
            onClick={handleRegisterClick}
            disabled={submitting || checkingRegistration}
          >
            {checkingRegistration ? "Checking Registration..." : 
             submitting ? "Processing..." : "Register Now"}
          </button>
        </div>
      </div> 
      {showForm && (
        <div className="modal-overlay" onClick={() => !submitting && setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span 
              className="close-btn" 
              onClick={() => !submitting && setShowForm(false)}
            >
              &times;
            </span>
           <form className="reunion-form" onSubmit={handleSubmit}>
              <h2>Registration Form</h2>
              <p className="event-title">{upcomingEvent.title}</p>             
              <div className="form-display-field">
                <label className="field-label">Student Name</label>
                <div className="field-value">{formData.name}</div>
              </div>            
              <div className="form-display-field">
                <label className="field-label">Department</label>
                <div className="field-value">{formData.department}</div>
              </div>          
              <div className="form-display-field">
                <label className="field-label">Batch</label>
                <div className="field-value">{user?.batch_year || formData.batch}</div>
              </div>
              <input
                type="text"
                name="location"
                placeholder="Current Location"
                value={formData.location}
                onChange={handleChange}
                required
                disabled={submitting}
              />
              <input
                type="number"
                name="participants"
                placeholder="Number of Participants (including yourself)"
                value={formData.participants}
                onChange={handleChange}
                min="1"
                required
                disabled={submitting}
              />  
              <button 
                type="submit" 
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? "Registering..." : "Enroll Now"}
              </button>
            </form>
          </div>
        </div>
      )}     
      <div className={`popup ${showPopup ? 'show' : ''} ${popupType}`}>
        <div className="popup-header">
          <h4 className={`popup-title ${popupType}`}>
            {popupType === "success" ? "✅ Success!" : 
             popupType === "warning" ? "⚠️ Warning!" : "❌ Error!"}
          </h4>
          <button 
            className="popup-close"
            onClick={() => setShowPopup(false)}
          >
            ×
          </button>
        </div>
        <p className="popup-message">{popupMessage}</p>
      </div>
    </>
  );
};
export default Reunion;