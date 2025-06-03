import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Modal, Form, Card } from "react-bootstrap";
import { FaHandHoldingHeart, FaPlusCircle } from "react-icons/fa";
import Navbar from "./navbar";
import { useAuth } from './AuthContext';
import "./AlumniNeeds.css";

const AlumniNeeds = () => {
  const { user, isAuthenticated } = useAuth();
  const [show, setShow] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, requestId: null, requestTitle: '' });
  const [deleting, setDeleting] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    contact: "",
    type: "",
    description: ""
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost/Alumni/alumni_needs.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server response is not JSON:", text);
        throw new Error("Server returned invalid response format");
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setRequests(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch support requests');
      }
    } catch (error) {
      console.error("Fetch requests error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError("Unable to connect to server. Please check if the server is running.");
      } else {
        setError(error.message || "Failed to load support requests. Please try again.");
      }
      // Sample data for testing
      setRequests([
        {
          id: 1,
          alumni_name: "Sample Alumni 1",
          alumni_photo: "https://images.unsplash.com/photo-1573164574392-9d3d0eaf6d9e",
          name: "Baby",
          contact: "baby@example.com",
          request_type: "Job",
          description: "Looking for a software developer role.",
          student_id: "STU001",
          department: "Computer Science",
          batch_year: "2020",
          formatted_date: "Sample Date"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => {
    if (!isAuthenticated) {
      alert('Please log in to create a support request!');
      return;
    }
    setShow(true);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    setFormData({ contact: "", type: "", description: "" });
    setShow(false);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setError('Please log in to create a support request');
      return;
    }

    // Validation
    if (!formData.contact.trim() || !formData.type || !formData.description.trim()) {
      setError('All fields are required');
      return;
    }

    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    if (formData.contact.trim().length < 5) {
      setError('Contact information must be at least 5 characters long');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const requestData = {
        student_id: user.student_id,
        name: user.name, // Use the logged-in user's name
        contact: formData.contact.trim(),
        request_type: formData.type,
        description: formData.description.trim()
      };

      const response = await fetch('http://localhost/Alumni/alumni_needs.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server response is not JSON:", text);
        throw new Error("Server returned invalid response format");
      }

      const data = await response.json();

      if (data.status === 'success') {
        setSuccess('Support request submitted successfully!');
        
        // Add new request to the beginning of the list
        if (data.data) {
          setRequests(prevRequests => [data.data, ...prevRequests]);
        }
        
        // Close form after a short delay
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to submit support request');
      }
    } catch (error) {
      console.error("Submit request error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError("Unable to connect to server. Please check if the server is running.");
      } else {
        setError(error.message || "Failed to submit support request. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      setDeleting(requestId);
      setError('');

      const response = await fetch('http://localhost/Alumni/alumni_needs.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          request_id: requestId,
          student_id: user.student_id 
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server response is not JSON:", text);
        throw new Error("Server returned invalid response format");
      }

      const data = await response.json();

      if (data.status === 'success') {
        setRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
        setSuccess('Support request deleted successfully!');
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to delete support request');
      }
    } catch (error) {
      console.error("Delete request error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError("Unable to connect to server. Please check if the server is running.");
      } else {
        setError(error.message || "Failed to delete support request. Please try again.");
      }
    } finally {
      setDeleting(null);
      setDeleteConfirm({ show: false, requestId: null, requestTitle: '' });
    }
  };

  const showDeleteConfirm = (request) => {
    setDeleteConfirm({
      show: true,
      requestId: request.id,
      requestTitle: request.description.substring(0, 50) + (request.description.length > 50 ? '...' : '')
    });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, requestId: null, requestTitle: '' });
  };

  const getRequestTypeColor = (type) => {
    switch(type) {
      case 'Job': return '#28a745';
      case 'Internship': return '#007bff';
      case 'Guidance': return '#6f42c1';
      case 'Medical': return '#dc3545';
      default: return '#28a745';
    }
  };

  const filteredRequests = requests.filter((r) =>
    selectedType ? r.request_type === selectedType : true
  );

  return (
    <>
      <Navbar />
      <div className="alumni-background d-flex flex-column min-vh-100">
        <Container fluid className="py-5 text-light">
          {/* Heading and search/filter layout */}
          <Row className="mb-4">
            <Col xs={12}>
              <h2 className="alumni-title text-center">
                <FaHandHoldingHeart className="me-2" />
                Alumni Needs & Support Requests
              </h2>
            </Col>
          </Row>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center w-50">
              <Form.Select
                className="me-2"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Requests</option>
                <option value="Job">Need for Job</option>
                <option value="Internship">Need for Internship</option>
                <option value="Guidance">Need for Guidance</option>
                <option value="Medical">Medical Assistance</option>
              </Form.Select>
            </div>

            <div>
              <Button variant="success" onClick={handleShow}>
                <FaPlusCircle className="me-2" />
                Create Request
              </Button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger text-center mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success text-center mb-4">
              {success}
            </div>
          )}

          {/* Delete Confirmation Popup */}
          {deleteConfirm.show && (
            <div className="form-popup delete-popup">
              <div className="form-box delete-confirm-box">
                <h3>🗑️ Delete Support Request</h3>
                <p>Are you sure you want to delete this support request?</p>
                <div className="story-preview">
                  "{deleteConfirm.requestTitle}"
                </div>
                <p className="warning-text">This action cannot be undone.</p>
                
                <div className="form-actions">
                  <button 
                    className="delete-confirm-btn"
                    onClick={() => handleDeleteRequest(deleteConfirm.requestId)}
                    disabled={deleting === deleteConfirm.requestId}
                  >
                    {deleting === deleteConfirm.requestId ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button 
                    type="button" 
                    onClick={cancelDelete} 
                    className="cancel-btn"
                    disabled={deleting === deleteConfirm.requestId}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-center text-light">Loading support requests...</p>
          ) : filteredRequests.length === 0 ? (
            <p className="text-center text-light">No requests yet. Be the first to share!</p>
          ) : (
            <Row>
              {filteredRequests.map((req) => (
                <Col md={6} lg={4} key={req.id} className="mb-4">
                  <Card className="alumni-card h-100">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className="flex-grow-1">
                          <Card.Title className="mb-1">
                            <strong>{req.alumni_name} </strong>
                            <span 
                              className="badge ms-2"
                              style={{ backgroundColor: getRequestTypeColor(req.request_type) }}
                            >
                              {req.request_type}
                            </span>
                          </Card.Title>
                          <small className="text-muted">
                             {req.department} ({req.batch_year})
                          </small>
                        </div>
                      </div>
                      
                      <Card.Text>{req.description}</Card.Text>
                      <div className="mb-2">
                        <small className="text-muted">
                          <strong>Contact:</strong> {req.contact}
                        </small>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          Created on: {req.formatted_date}
                        </small>
                        {isAuthenticated && user && user.student_id === req.student_id && (
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => showDeleteConfirm(req)}
                            disabled={deleting === req.id}
                            title="Delete this request"
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            {deleting === req.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Support Request</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {isAuthenticated && user && (
              <div className="user-info mb-3 p-3 bg-light rounded">
                <div className="d-flex align-items-center">
                  <div>
                    <strong>{user.name}</strong><br />
                    <small className="text-muted">ID: {user.student_id} | {user.department} - {user.batch_year}</small>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Contact Info</Form.Label>
              <Form.Control
                type="text"
                name="contact"
                placeholder="Phone or Email"
                value={formData.contact}
                onChange={handleChange}
                disabled={submitting}
                maxLength="255"
                required
              />
              <div className="char-count mt-1">
                <small className="text-muted">{formData.contact.length}/255 characters</small>
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Request Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={submitting}
                required
              >
                <option value="">Select Request Type</option>
                <option value="Job">Need for Job</option>
                <option value="Internship">Need for Internship</option>
                <option value="Guidance">Need for Guidance</option>
                <option value="Medical">Medical Assistance</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                placeholder="Describe your request in detail"
                value={formData.description}
                onChange={handleChange}
                disabled={submitting}
                maxLength="1000"
                required
              />
              <div className="char-count mt-1">
                <small className="text-muted">{formData.description.length}/1000 characters</small>
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              variant="success" 
              type="submit"
              disabled={submitting || !formData.contact.trim() || !formData.type || !formData.description.trim()}
              className={submitting ? 'submitting' : ''}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};
export default AlumniNeeds;