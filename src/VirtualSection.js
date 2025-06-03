import React, { useState, useEffect } from "react";
import "./VirtualSection.css";
import Navbar from "./navbar";
import { useAuth } from "./AuthContext"; // Import useAuth

const VirtualSection = () => {
  const { user, isAuthenticated } = useAuth(); // Get user data
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(false);
  
  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    year: "",
    contact: "",
    interest: "",
  });
  
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const API_BASE = "http://localhost/Alumni";
  
  const populateFormFromUser = () => {
    if (user && !user.isAdmin) {
      setFormData(prevData => ({
        ...prevData,
        name: user.name || "",
        department: user.department || "",
        year: user.batch_year || "",
        contact: prevData.contact, // Keep existing contact if any
        interest: prevData.interest // Keep existing interest if any
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
  
  const checkExistingRegistration = async (eventId) => {
    if (!user || !eventId) return false;
    try {
      setCheckingRegistration(true);
      const response = await fetch(`${API_BASE}/virtual.php?action=get_event_details&event_id=${eventId}`);
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
  
  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/virtual.php?action=get_upcoming_events`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setUpcomingEvents(data.events);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch upcoming events');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching upcoming events:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const registerForEvent = async (registrationData) => {
    try {
      setSubmitting(true);
      const dataToSend = {
        action: 'register_for_event',
        event_id: selectedEvent.id,
        name: registrationData.name,
        department: registrationData.department,
        year: registrationData.year,
        contact: registrationData.contact,
        interest: registrationData.interest
      };
      
      console.log('Sending registration data:', dataToSend);
      
      const response = await fetch(`${API_BASE}/virtual.php`, {
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
    fetchUpcomingEvents();
  }, []);
  
  // Auto-populate form when user data is available and form is shown
  useEffect(() => {
    if (user && showForm && selectedEvent) {
      populateFormFromUser();
    }
  }, [user, showForm, selectedEvent]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      showNotification("No event selected for registration.", "error");
      return;
    }
    
    const result = await registerForEvent(formData);
    
    if (result.success) {
      showNotification("Registration Successful!\n" + result.message, "success");
      setFormData({
        name: "",
        department: "",
        year: "",
        contact: "",
        interest: "",
      });
      setShowForm(false);
      setSelectedEvent(null);
    } else {
      if (result.message.toLowerCase().includes('already registered')) {
        showNotification("⚠️ Already Registered!\n" + result.message, "warning");
      } else if (result.message.toLowerCase().includes('fully booked')) {
        showNotification("😞 Event Full!\n" + result.message, "error");
      } else {
        showNotification("Registration Failed!\n" + result.message, "error");
      }
    }
  };
  
  const handleJoinEvent = async (event) => {
    if (!isAuthenticated) {
      showNotification("Please log in to register for the event.", "error");
      return;
    }
    
    const isAlreadyRegistered = await checkExistingRegistration(event.id);
    
    if (isAlreadyRegistered) {
      showNotification(
        "⚠️ Already Registered!\nYou have already registered for this event.",
        "warning"
      );
      return;
    }
    
    setSelectedEvent(event);
    // Set the interest field to the event title initially
    setFormData(prevData => ({
      ...prevData,
      interest: event.title
    }));
    setShowForm(true);
    // The useEffect will handle auto-populating other fields
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01 ${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="virtual-background">
          <div className="virtual-content">
            <div className="loading">Loading virtual events...</div>
          </div>
        </div>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Navbar />
        <div className="virtual-background">
          <div className="virtual-content">
            <h1 className="virtual-title">💻 Virtual Meetups & Webinars</h1>
            <div className="error-message">
              Error: {error}
            </div>
            <button onClick={fetchUpcomingEvents} className="retry-btn">
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
      <div className="virtual-background">
        <div className="virtual-content">
          <h1 className="virtual-title">💻 Virtual Meetups & Webinars</h1>
          <p className="virtual-description">
            Stay connected from anywhere in the world! Attend webinars, panel discussions, and virtual meetups exclusively for our alumni network.
          </p>
          
          {upcomingEvents.length === 0 ? (
            <div className="no-events">
              <h3>No upcoming virtual events at this time.</h3>
              <p>Check back later for new events and opportunities to connect with fellow alumni!</p>
            </div>
          ) : (
            <div className="events-list">
              <h2>Upcoming Events:</h2>
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <span className="platform-badge">{event.platform}</span>
                  </div>
                  <div className="event-details">
                    <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
                    <p><strong>Time:</strong> {formatTime(event.event_time)}</p>
                    <p><strong>Host:</strong> {event.host}</p>
                    <p><strong>Max Participants:</strong> {event.max_participants}</p>
                  </div>
                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}
                  <button 
                    className="join-btn" 
                    onClick={() => handleJoinEvent(event)}
                    disabled={submitting || checkingRegistration}
                  >
                    {checkingRegistration ? "Checking..." : 
                     submitting ? "Processing..." : "Join This Event"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Registration Form Modal */}
      {showForm && selectedEvent && (
        <div className="modal-overlay" onClick={() => !submitting && setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span 
              className="close-btn" 
              onClick={() => !submitting && setShowForm(false)}
            >
              &times;
            </span>
            <form className="virtual-form" onSubmit={handleSubmit}>
              <h2>Join the Virtual Event</h2>
              <p className="event-title">{selectedEvent.title}</p>
              
              {/* Display-only fields for auto-filled data */}
              <div className="form-display-field">
                <label className="field-label">Your Name</label>
                <div className="field-value">{formData.name}</div>
              </div>
              
              <div className="form-display-field">
                <label className="field-label">Department</label>
                <div className="field-value">{formData.department}</div>
              </div>
              
              <div className="form-display-field">
                <label className="field-label">Batch Year</label>
                <div className="field-value">{formData.year}</div>
              </div>
              
              {/* Editable field for contact */}
              <input
                type="text"
                name="contact"
                placeholder="Your Contact Number"
                value={formData.contact}
                onChange={handleChange}
                required
                disabled={submitting}
              />
              
              {/* Display-only field for event interest */}
              <div className="form-display-field">
                <label className="field-label">Event Interest</label>
                <div className="field-value">{formData.interest}</div>
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? "Registering..." : "Join Now"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notification Popup */}
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

export default VirtualSection;