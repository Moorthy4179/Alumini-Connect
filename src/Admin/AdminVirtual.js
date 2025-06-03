import React, { useState, useEffect } from "react";
import "./AdminVirtual.css";
import AdminNavbar from "./AdminNavbar";

const AdminVirtual = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  
  // Form data
  const [newEventData, setNewEventData] = useState({
    title: "",
    event_date: "",
    event_time: "",
    host: "",
    platform: "Zoom",
    description: "",
    max_participants: "100",
    meeting_link: ""
  });
  
  const [editEventData, setEditEventData] = useState({});
  
  // Events data
  const [events, setEvents] = useState({
    upcoming: [],
    past: []
  });
  
  // Summary statistics state
  const [summaryData, setSummaryData] = useState({
    byDepartment: {},
    byYear: {},
    byInterest: {},
    totalParticipants: 0
  });
  
  // Selected event for operations
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventToCancel, setEventToCancel] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  
  // Notification state
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  
  const API_BASE = "http://localhost/Alumni";
  
  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 4000);
  };
  
  // Fetch all events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/virtual.php?action=get_events`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setEvents(data.events);
        setError(null);
        calculateSummaryStats(data.events);
      } else {
        throw new Error(data.message || 'Failed to fetch events');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate summary statistics
  const calculateSummaryStats = (eventsData) => {
    const allEvents = [...eventsData.upcoming, ...eventsData.past];
    let totalParticipants = 0;
    const departmentStats = {};
    const yearStats = {};
    const interestStats = {};
  
    allEvents.forEach(event => {
      totalParticipants += event.registration_count || 0;
      
      if (event.registrations && event.registrations.length > 0) {
        event.registrations.forEach(reg => {
          // Department stats
          departmentStats[reg.department] = (departmentStats[reg.department] || 0) + 1;
          
          // Year stats
          yearStats[reg.year] = (yearStats[reg.year] || 0) + 1;
          
          // Interest stats
          interestStats[reg.interest] = (interestStats[reg.interest] || 0) + 1;
        });
      }
    });
  
    setSummaryData({
      byDepartment: departmentStats,
      byYear: yearStats,
      byInterest: interestStats,
      totalParticipants
    });
  };
  
  // Fetch event details
  const fetchEventDetails = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE}/virtual.php?action=get_event_details&event_id=${eventId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        return data.event;
      } else {
        throw new Error(data.message || 'Failed to fetch event details');
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      return null;
    }
  };
  
  // Create new event
  const createEvent = async (eventData) => {
    try {
      const response = await fetch(`${API_BASE}/virtual.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_event',
          ...eventData
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        showNotification("Event created successfully!", "success");
        fetchEvents(); // Refresh events list
        return true;
      } else {
        throw new Error(data.message || 'Failed to create event');
      }
    } catch (err) {
      showNotification("Failed to create event: " + err.message, "error");
      return false;
    }
  };
  
  // Update event
  const updateEvent = async (eventId, eventData) => {
    try {
      const response = await fetch(`${API_BASE}/virtual.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_event',
          event_id: eventId,
          ...eventData
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        showNotification("Event updated successfully!", "success");
        fetchEvents(); // Refresh events list
        return true;
      } else {
        throw new Error(data.message || 'Failed to update event');
      }
    } catch (err) {
      showNotification("Failed to update event: " + err.message, "error");
      return false;
    }
  };
  
  // Cancel event
  const cancelEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE}/virtual.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_event',
          event_id: eventId,
          status: 'cancelled'
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        showNotification("Event cancelled successfully!", "success");
        fetchEvents(); // Refresh events list
        return true;
      } else {
        throw new Error(data.message || 'Failed to cancel event');
      }
    } catch (err) {
      showNotification("Failed to cancel event: " + err.message, "error");
      return false;
    }
  };
  
  // Delete event
  const deleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE}/virtual.php?action=delete_event&event_id=${eventId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        showNotification("Event deleted successfully!", "success");
        fetchEvents(); // Refresh events list
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete event');
      }
    } catch (err) {
      showNotification("Failed to delete event: " + err.message, "error");
      return false;
    }
  };
  
  // Event handlers
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const success = await createEvent(newEventData);
    if (success) {
      setShowCreateModal(false);
      setNewEventData({
        title: "",
        event_date: "",
        event_time: "",
        host: "",
        platform: "Zoom",
        description: "",
        max_participants: "100",
        meeting_link: ""
      });
    }
  };
  
  const handleEditEvent = async (e) => {
    e.preventDefault();
    const success = await updateEvent(eventToEdit.id, editEventData);
    if (success) {
      setShowEditModal(false);
      setEditEventData({});
      setEventToEdit(null);
    }
  };
  
  const handleCancelEvent = async () => {
    if (eventToCancel) {
      const success = await cancelEvent(eventToCancel.id);
      if (success) {
        setShowCancelConfirm(false);
        setEventToCancel(null);
      }
    }
  };
  
  const handleDeleteEvent = async () => {
    if (eventToDelete) {
      const success = await deleteEvent(eventToDelete.id);
      if (success) {
        setShowDeleteConfirm(false);
        setEventToDelete(null);
      }
    }
  };
  
  const handleViewDetails = async (event) => {
    const eventDetails = await fetchEventDetails(event.id);
    if (eventDetails) {
      setSelectedEvent(eventDetails);
      setShowEventDetails(true);
    }
  };
  
  const openEditModal = (event) => {
    setEventToEdit(event);
    setEditEventData({
      title: event.title,
      event_date: event.event_date,
      event_time: event.event_time,
      host: event.host,
      platform: event.platform,
      description: event.description,
      max_participants: event.max_participants.toString(),
      meeting_link: event.meeting_link
    });
    setShowEditModal(true);
  };
  
  // Format functions
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
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="admin-virtual-container">
          <div className="loading">Loading virtual events...</div>
        </div>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <AdminNavbar />
        <div className="admin-virtual-container">
          <div className="error-message">
            Error: {error}
            <button onClick={fetchEvents} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <AdminNavbar />
      <div className="admin-virtual-container">
        <div className="admin-virtual-header">
          <h1>Virtual Events Management</h1>
          <button 
            className="create-event-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + Create New Event
          </button>
        </div>
        
        {/* Summary Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Events</h3>
            <div className="stat-number">{events.upcoming.length + events.past.length}</div>
          </div>
          <div className="stat-card">
            <h3>Upcoming Events</h3>
            <div className="stat-number">{events.upcoming.length}</div>
          </div>
          <div className="stat-card">
            <h3>Total Participants</h3>
            <div className="stat-number">{summaryData.totalParticipants}</div>
          </div>
          <div className="stat-card">
            <h3>Active Registrations</h3>
            <div className="stat-number">
              {events.upcoming.reduce((sum, event) => sum + (event.registration_count || 0), 0)}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Events ({events.upcoming.length})
            </button>
            <button 
              className={`tab ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past Events ({events.past.length})
            </button>
            <button 
              className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'upcoming' && (
            <div className="events-grid">
              {events.upcoming.length === 0 ? (
                <div className="no-events">
                  <h3>No upcoming events</h3>
                  <p>Create your first virtual event to get started!</p>
                </div>
              ) : (
                events.upcoming.map(event => (
                  <div key={event.id} className={`event-card ${event.status}`}>
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <span className={`status-badge ${event.status}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="event-info">
                      <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
                      <p><strong>Time:</strong> {formatTime(event.event_time)}</p>
                      <p><strong>Host:</strong> {event.host}</p>
                      <p><strong>Platform:</strong> {event.platform}</p>
                      <p><strong>Participants:</strong> {event.registration_count}/{event.max_participants}</p>
                    </div>
                    <div className="event-actions">
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewDetails(event)}
                      >
                        View Details
                      </button>
                      <button 
                        className="action-btn edit"
                        onClick={() => openEditModal(event)}
                      >
                        Edit
                      </button>
                      {event.status !== 'cancelled' && (
                        <button 
                          className="action-btn cancel"
                          onClick={() => {
                            setEventToCancel(event);
                            setShowCancelConfirm(true);
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        className="action-btn delete"
                        onClick={() => {
                          setEventToDelete(event);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {activeTab === 'past' && (
            <div className="events-grid">
              {events.past.length === 0 ? (
                <div className="no-events">
                  <h3>No past events</h3>
                  <p>Past events will appear here after they're completed.</p>
                </div>
              ) : (
                events.past.map(event => (
                  <div key={event.id} className="event-card past">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <span className={`status-badge ${event.status}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="event-info">
                      <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
                      <p><strong>Time:</strong> {formatTime(event.event_time)}</p>
                      <p><strong>Host:</strong> {event.host}</p>
                      <p><strong>Platform:</strong> {event.platform}</p>
                      <p><strong>Participants:</strong> {event.registration_count}/{event.max_participants}</p>
                    </div>
                    <div className="event-actions">
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewDetails(event)}
                      >
                        View Details
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => {
                          setEventToDelete(event);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="analytics-content">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Participants by Department</h3>
                  <div className="analytics-list">
                    {Object.entries(summaryData.byDepartment).map(([dept, count]) => (
                      <div key={dept} className="analytics-item">
                        <span>{dept}</span>
                        <span className="count">{count}</span>
                      </div>
                    ))}
                    {Object.keys(summaryData.byDepartment).length === 0 && (
                      <p>No data available</p>
                    )}
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Participants by Year</h3>
                  <div className="analytics-list">
                    {Object.entries(summaryData.byYear).map(([year, count]) => (
                      <div key={year} className="analytics-item">
                        <span>{year}</span>
                        <span className="count">{count}</span>
                      </div>
                    ))}
                    {Object.keys(summaryData.byYear).length === 0 && (
                      <p>No data available</p>
                    )}
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Popular Event Topics</h3>
                  <div className="analytics-list">
                    {Object.entries(summaryData.byInterest)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 10)
                      .map(([interest, count]) => (
                      <div key={interest} className="analytics-item">
                        <span>{interest}</span>
                        <span className="count">{count}</span>
                      </div>
                    ))}
                    {Object.keys(summaryData.byInterest).length === 0 && (
                      <p>No data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Virtual Event</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="event-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Event Title *</label>
                  <input
                    type="text"
                    value={newEventData.title}
                    onChange={(e) => setNewEventData({...newEventData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Host Name *</label>
                  <input
                    type="text"
                    value={newEventData.host}
                    onChange={(e) => setNewEventData({...newEventData, host: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    value={newEventData.event_date}
                    onChange={(e) => setNewEventData({...newEventData, event_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Event Time *</label>
                  <input
                    type="time"
                    value={newEventData.event_time}
                    onChange={(e) => setNewEventData({...newEventData, event_time: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Platform *</label>
                  <select
                    value={newEventData.platform}
                    onChange={(e) => setNewEventData({...newEventData, platform: e.target.value})}
                    required
                  >
                    <option value="Zoom">Zoom</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="WebEx">WebEx</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Max Participants</label>
                  <input
                    type="number"
                    value={newEventData.max_participants}
                    onChange={(e) => setNewEventData({...newEventData, max_participants: e.target.value})}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Meeting Link</label>
                <input
                  type="url"
                  value={newEventData.meeting_link}
                  onChange={(e) => setNewEventData({...newEventData, meeting_link: e.target.value})}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newEventData.description}
                  onChange={(e) => setNewEventData({...newEventData, description: e.target.value})}
                  rows="4"
                  placeholder="Event description, agenda, or additional details..."
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Event Modal */}
      {showEditModal && eventToEdit && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Event</h2>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditEvent} className="event-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Event Title *</label>
                  <input
                    type="text"
                    value={editEventData.title}
                    onChange={(e) => setEditEventData({...editEventData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Host Name *</label>
                  <input
                    type="text"
                    value={editEventData.host}
                    onChange={(e) => setEditEventData({...editEventData, host: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    value={editEventData.event_date}
                    onChange={(e) => setEditEventData({...editEventData, event_date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Event Time *</label>
                  <input
                    type="time"
                    value={editEventData.event_time}
                    onChange={(e) => setEditEventData({...editEventData, event_time: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Platform *</label>
                  <select
                    value={editEventData.platform}
                    onChange={(e) => setEditEventData({...editEventData, platform: e.target.value})}
                    required
                  >
                    <option value="Zoom">Zoom</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="WebEx">WebEx</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Max Participants</label>
                  <input
                    type="number"
                    value={editEventData.max_participants}
                    onChange={(e) => setEditEventData({...editEventData, max_participants: e.target.value})}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Meeting Link</label>
                <input
                  type="url"
                  value={editEventData.meeting_link}
                  onChange={(e) => setEditEventData({...editEventData, meeting_link: e.target.value})}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editEventData.description}
                  onChange={(e) => setEditEventData({...editEventData, description: e.target.value})}
                  rows="4"
                  placeholder="Event description, agenda, or additional details..."
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventDetails(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Event Details</h2>
              <button 
                className="close-btn"
                onClick={() => setShowEventDetails(false)}
              >
                ×
              </button>
            </div>
            <div className="event-details-content">
              <div className="event-details-grid">
                <div className="detail-section">
                  <h3>Event Information</h3>
                  <div className="detail-item">
                    <strong>Title:</strong> {selectedEvent.title}
                  </div>
                  <div className="detail-item">
                    <strong>Date:</strong> {formatDate(selectedEvent.event_date)}
                  </div>
                  <div className="detail-item">
                    <strong>Time:</strong> {formatTime(selectedEvent.event_time)}
                  </div>
                  <div className="detail-item">
                    <strong>Host:</strong> {selectedEvent.host}
                  </div>
                  <div className="detail-item">
                    <strong>Platform:</strong> {selectedEvent.platform}
                  </div>
                  <div className="detail-item">
                    <strong>Max Participants:</strong> {selectedEvent.max_participants}
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong> 
                    <span className={`status-badge ${selectedEvent.status}`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                  {selectedEvent.meeting_link && (
                    <div className="detail-item">
                      <strong>Meeting Link:</strong> 
                      <a href={selectedEvent.meeting_link} target="_blank" rel="noopener noreferrer">
                        {selectedEvent.meeting_link}
                      </a>
                    </div>
                  )}
                  {selectedEvent.description && (
                    <div className="detail-item">
                      <strong>Description:</strong>
                      <p>{selectedEvent.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="detail-section">
                  <h3>Registrations ({selectedEvent.registrations ? selectedEvent.registrations.length : 0})</h3>
                  <div className="registrations-list">
                    {selectedEvent.registrations && selectedEvent.registrations.length > 0 ? (
                      selectedEvent.registrations.map((reg, index) => (
                        <div key={index} className="registration-item">
                          <div className="reg-name">{reg.name}</div>
                          <div className="reg-details">
                            {reg.department} • {reg.year} • {reg.contact}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No registrations yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && eventToCancel && (
        <div className="modal-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cancel Event</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCancelConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="confirm-content">
              <p>Are you sure you want to cancel the event:</p>
              <p><strong>"{eventToCancel.title}"</strong></p>
              <p>This action will mark the event as cancelled but won't delete it.</p>
              <div className="confirm-actions">
                <button 
                  type="button" 
                  onClick={() => setShowCancelConfirm(false)}
                >
                  No, Keep Event
                </button>
                <button 
                  type="button" 
                  className="danger-btn"
                  onClick={handleCancelEvent}
                >
                  Yes, Cancel Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && eventToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Event</h2>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="confirm-content">
              <p>Are you sure you want to permanently delete the event:</p>
              <p><strong>"{eventToDelete.title}"</strong></p>
              <p className="warning">⚠️ This action cannot be undone. All registrations will also be deleted.</p>
              <div className="confirm-actions">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="danger-btn"
                  onClick={handleDeleteEvent}
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span>{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminVirtual;