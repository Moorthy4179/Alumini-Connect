import React, { useState, useEffect } from "react";
import "./AdminReunion.css";
import AdminNavbar from "./AdminNavbar";

const AdminReunion = () => {
  const [activeTab, setActiveTab] = useState("scheduled");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: "",
    event_date: "",
    event_time: "",
    venue: "",
    description: ""
  });
  const [events, setEvents] = useState({
    scheduled: [],
    past: []
  });
  const [summaryData, setSummaryData] = useState({
    byDepartment: {},
    byBatch: {},
    totalParticipants: 0
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const API_BASE = "http://localhost/Alumni";

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/reunion.php?action=get_events`);
      const data = await response.json();     
      if (data.status === 'success') {
        setEvents(data.events);
        setError(null);
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

  const fetchEventDetails = async (eventId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/reunion.php?action=get_event_details&event_id=${eventId}`);
      const data = await response.json();      
      if (data.status === 'success') {
        setSelectedEvent(data.event);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch event details');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await fetch(`${API_BASE}/reunion.php`, {
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
        await fetchEvents();
        return true;
      } else {
        throw new Error(data.message || 'Failed to create event');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creating event:', err);
      return false;
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also delete all registrations.')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/reunion.php?action=delete_event&event_id=${eventId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.status === 'success') {
        await fetchEvents();
        if (selectedEvent && selectedEvent.id == eventId) {
          setSelectedEvent(null);
        }
      } else {
        throw new Error(data.message || 'Failed to delete event');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting event:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent && selectedEvent.registrations) {
      const byDepartment = {};
      const byBatch = {};
      let totalParticipants = 0;

      selectedEvent.registrations.forEach(reg => {
        // Department summary
        byDepartment[reg.department] = byDepartment[reg.department] || { count: 0, participants: 0 };
        byDepartment[reg.department].count += 1;
        byDepartment[reg.department].participants += parseInt(reg.participants);

        // Batch summary (using year field which contains batch info)
        byBatch[reg.year] = byBatch[reg.year] || { count: 0, participants: 0 };
        byBatch[reg.year].count += 1;
        byBatch[reg.year].participants += parseInt(reg.participants);

        totalParticipants += parseInt(reg.participants);
      });

      setSummaryData({ byDepartment, byBatch, totalParticipants });
    }
  }, [selectedEvent]);

  const handleEventSelect = async (event) => {
    await fetchEventDetails(event.id);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
  };

  const handleCreateModalOpen = () => {
    setShowCreateModal(true);
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    setNewEventData({
      title: "",
      event_date: "",
      event_time: "",
      venue: "",
      description: ""
    });
  };

  const handleCreateEventChange = (e) => {
    setNewEventData({ ...newEventData, [e.target.name]: e.target.value });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const success = await createEvent(newEventData);
    if (success) {
      handleCreateModalClose();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading && !selectedEvent) {
    return (
      <>
        <AdminNavbar />
        <div className="admin-reunion-container">
          <div className="loading">Loading events...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-reunion-container">
        <h1 className="admin-title">Alumni Reunions</h1>
        {error && (
          <div className="error-message">
            Error: {error}
            <button onClick={fetchEvents}>Retry</button>
          </div>
        )}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
          >
            Scheduled Events ({events.scheduled.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Events ({events.past.length})
          </button>
        </div>
        <div className="admin-actions">
          <button className="create-event-btn" onClick={handleCreateModalOpen}>
            <span className="btn-icon">+</span> Create New Reunion
          </button>
        </div>
        <div className="admin-content">
          {!selectedEvent ? (
            <div className="event-list">
              <h2>{activeTab === 'scheduled' ? 'Upcoming Reunions' : 'Past Reunions'}</h2>
              {events[activeTab].length === 0 ? (
                <p className="no-events">No {activeTab} events found.</p>
              ) : (
                events[activeTab].map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-summary">
                      <h3>{event.title}</h3>
                      <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
                      <p><strong>Time:</strong> {event.event_time}</p>
                      <p><strong>Venue:</strong> {event.venue}</p>
                      <p><strong>Registrations:</strong> {event.registration_count}</p>
                      <p><strong>Total Participants:</strong> {event.total_participants}</p>
                    </div>
                    <div className="event-actions">
                      <button className="view-details-btn" onClick={() => handleEventSelect(event)}>
                        View Details
                      </button>
                      <button className="delete-btn" onClick={() => deleteEvent(event.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="event-details-view">
              {loading ? (
                <div className="loading">Loading event details...</div>
              ) : (
                <>
                  <button className="back-btn" onClick={handleBackToList}>
                    &larr; Back to List
                  </button>
                  <h2>{selectedEvent.title} - Details</h2>
                  <div className="event-info">
                    <p><strong>Date:</strong> {formatDate(selectedEvent.event_date)}</p>
                    <p><strong>Time:</strong> {selectedEvent.event_time}</p>
                    <p><strong>Venue:</strong> {selectedEvent.venue}</p>
                    {selectedEvent.description && (
                      <p><strong>Description:</strong> {selectedEvent.description}</p>
                    )}
                  </div>
                  {selectedEvent.registrations && selectedEvent.registrations.length > 0 ? (
                    <>
                      <div className="stats-container">
                        <div className="stats-card">
                          <h3>Department Summary</h3>
                          <table className="stats-table">
                            <thead>
                              <tr>
                                <th>Department</th>
                                <th>Registrations</th>
                                <th>Participants</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(summaryData.byDepartment).map(([dept, data]) => (
                                <tr key={dept}>
                                  <td>{dept}</td>
                                  <td>{data.count}</td>
                                  <td>{data.participants}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="stats-card">
                          <h3>Batch Summary</h3>
                          <table className="stats-table">
                            <thead>
                              <tr>
                                <th>Batch</th>
                                <th>Registrations</th>
                                <th>Participants</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(summaryData.byBatch).map(([batch, data]) => (
                                <tr key={batch}>
                                  <td>{batch}</td>
                                  <td>{data.count}</td>
                                  <td>{data.participants}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="registrations-section">
                        <h3>All Registrations</h3>
                        <p><strong>Total Participants:</strong> {summaryData.totalParticipants}</p>
                        <table className="registrations-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Department</th>
                              <th>Batch</th>
                              <th>Location</th>
                              <th>Participants</th>
                              <th>Registered</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEvent.registrations.map((reg) => (
                              <tr key={reg.id}>
                                <td>{reg.name}</td>
                                <td>{reg.department}</td>
                                <td>{reg.year}</td>
                                <td>{reg.location}</td>
                                <td>{reg.participants}</td>
                                <td>{new Date(reg.registered_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="no-registrations">
                      <p>No registrations yet for this event.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>     
      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCreateModalClose}>
          <div className="modal-content create-event-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={handleCreateModalClose}>&times;</span>
            <h2>Create New Reunion Event</h2>
            <form className="create-event-form" onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label htmlFor="title">Event Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newEventData.title}
                  onChange={handleCreateEventChange}
                  placeholder="Enter event title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="event_date">Date</label>
                <input
                  type="date"
                  id="event_date"
                  name="event_date"
                  value={newEventData.event_date}
                  onChange={handleCreateEventChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="event_time">Time</label>
                <input
                  type="text"
                  id="event_time"
                  name="event_time"
                  value={newEventData.event_time}
                  onChange={handleCreateEventChange}
                  placeholder="e.g. 5:00 PM - 9:00 PM"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="venue">Venue</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={newEventData.venue}
                  onChange={handleCreateEventChange}
                  placeholder="Enter venue details"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newEventData.description}
                  onChange={handleCreateEventChange}
                  placeholder="Enter event description"
                  rows="4"
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCreateModalClose}>
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
    </>
  );
};

export default AdminReunion;