import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaTrash, FaEye, FaCalendarAlt, FaBriefcase, FaGraduationCap, FaHandsHelping, FaHeartbeat } from 'react-icons/fa';
import { MdSupport } from 'react-icons/md';
import AdminNavbar from "./AdminNavbar";
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminAlumniNeeds = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/Alumni/alumni_needs.php');
      const data = await response.json();
      
      if (data.status === 'success') {
        setRequests(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch alumni needs');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedRequest) return;

    try {
      setDeleting(true);
      const response = await fetch('http://localhost/Alumni/alumni_needs.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: selectedRequest.id,
          student_id: selectedRequest.student_id
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccess('Alumni need request deleted successfully!');
        setRequests(requests.filter(request => request.id !== selectedRequest.id));
        setShowDeleteModal(false);
        setSelectedRequest(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete alumni need request');
      }
    } catch (err) {
      setError('Failed to delete alumni need request. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const truncateText = (text, maxLength = 60) => {
    return text.length <= maxLength ? text : text.substr(0, maxLength) + '...';
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'Job':
        return <FaBriefcase className="me-1" />;
      case 'Internship':
        return <FaGraduationCap className="me-1" />;
      case 'Guidance':
        return <FaHandsHelping className="me-1" />;
      case 'Medical':
        return <FaHeartbeat className="me-1" />;
      default:
        return <FaHandsHelping className="me-1" />;
    }
  };

  const getRequestTypeBadge = (type) => {
    const badges = {
      'Job': 'success',
      'Internship': 'info',
      'Guidance': 'warning',
      'Medical': 'danger'
    };
    return badges[type] || 'primary';
  };

  return (
    <>
      <AdminNavbar />
      <div 
        style={{
          backgroundImage: 'url(https://img.pikbest.com/backgrounds/20190411/graduation-ceremony-poster-hd-background_1816770.jpg!sw800)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          padding: '2rem 0'
        }}
      >
        <Container fluid>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-white fw-bold">
                  <MdSupport className="me-2" />
                  Manage Alumni Needs
                </h2>
                <Badge bg="light" text="dark" className="fs-6 px-3 py-2">
                  Total: {requests.length}
                </Badge>
              </div>

              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="light" size="lg" />
                  <p className="mt-3 text-white">Loading alumni needs...</p>
                </div>
              ) : requests.length === 0 ? (
                <Card className="shadow-lg">
                  <Card.Body className="text-center py-5">
                    <h4 className="text-muted">No Alumni Need Requests Found</h4>
                  </Card.Body>
                </Card>
              ) : (
                <Card className="shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                  <Card.Body className="p-0">
                    <Table striped hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th width="25%">Alumni Info</th>
                          <th width="12%">Department</th>
                          <th width="10%">Batch</th>
                          <th width="8%">Type</th>
                          <th width="15%">Contact</th>
                          <th width="20%">Description</th>
                          <th width="10%">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request) => (
                          <tr key={request.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={request.alumni_photo}
                                  alt={request.alumni_name}
                                  className="rounded-circle me-2"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  onError={(e) => e.target.src = '/api/placeholder/40/40'}
                                />
                                <div>
                                  <div className="fw-bold small">{request.alumni_name}</div>
                                  <small className="text-muted">ID: {request.student_id}</small>
                                </div>
                              </div>
                            </td>
                            <td><Badge bg="secondary" className="small">{request.department}</Badge></td>
                            <td><Badge bg="primary" className="small">{request.batch_year}</Badge></td>
                            <td>
                              <Badge bg={getRequestTypeBadge(request.request_type)} className="small">
                                {getRequestTypeIcon(request.request_type)}
                                {request.request_type}
                              </Badge>
                            </td>
                            <td><small>{truncateText(request.contact, 25)}</small></td>
                            <td><small>{truncateText(request.description)}</small></td>
                            <td>
                              <div className="d-flex">
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => { setSelectedRequest(request); setShowViewModal(true); }}
                                >
                                  <FaEye size={12} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => { setSelectedRequest(request); setShowDeleteModal(true); }}
                                >
                                  <FaTrash size={12} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <div className="text-center mb-3">
                <FaTrash size={48} className="text-danger mb-3" />
                <h5>Delete this support request?</h5>
              </div>
              <div className="border rounded p-3 bg-light">
                <div className="d-flex align-items-center mb-2">
                  <img
                    src={selectedRequest.alumni_photo}
                    alt={selectedRequest.alumni_name}
                    className="rounded-circle me-3"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    onError={(e) => e.target.src = '/api/placeholder/40/40'}
                  />
                  <div>
                    <strong>{selectedRequest.alumni_name}</strong><br />
                    <small className="text-muted">{selectedRequest.department} - {selectedRequest.batch_year}</small>
                  </div>
                </div>
                <div className="mb-2">
                  <Badge bg={getRequestTypeBadge(selectedRequest.request_type)}>
                    {getRequestTypeIcon(selectedRequest.request_type)}
                    {selectedRequest.request_type}
                  </Badge>
                </div>
                <p className="mt-2 mb-0">{truncateText(selectedRequest.description, 100)}</p>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? <><Spinner size="sm" className="me-2" />Deleting...</> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Body>
          {selectedRequest && (
            <>
              <div className="d-flex align-items-center mb-4">
                <img
                  src={selectedRequest.alumni_photo}
                  alt={selectedRequest.alumni_name}
                  className="rounded-circle me-3"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  onError={(e) => e.target.src = '/api/placeholder/60/60'}
                />
                <div>
                  <h4>{selectedRequest.alumni_name}</h4>
                  <div className="d-flex gap-2 mb-1">
                    <Badge bg="secondary">{selectedRequest.department}</Badge>
                    <Badge bg="primary">{selectedRequest.batch_year}</Badge>
                    <Badge bg={getRequestTypeBadge(selectedRequest.request_type)}>
                      {getRequestTypeIcon(selectedRequest.request_type)}
                      {selectedRequest.request_type}
                    </Badge>
                  </div>
                  <small className="text-muted">
                    <FaCalendarAlt className="me-1" />
                    {selectedRequest.formatted_date}
                  </small>
                </div>
              </div>
              <div className="border rounded p-3 bg-light mb-3">
                <h5 className="mb-3">Support Request Details</h5>
                <div className="mb-3">
                  <strong>Request Type:</strong>
                  <div className="mt-1">
                    <Badge bg={getRequestTypeBadge(selectedRequest.request_type)} className="fs-6">
                      {getRequestTypeIcon(selectedRequest.request_type)}
                      {selectedRequest.request_type}
                    </Badge>
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Description:</strong>
                  <p className="mb-0 mt-1">{selectedRequest.description}</p>
                </div>
                <div className="border-top pt-3">
                  <strong>Contact Information:</strong>
                  <p className="mb-0 mt-1">{selectedRequest.contact}</p>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminAlumniNeeds;