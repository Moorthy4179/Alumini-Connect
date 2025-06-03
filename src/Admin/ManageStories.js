import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaTrash, FaEye, FaCalendarAlt } from 'react-icons/fa';
import { MdSchool } from 'react-icons/md';
import AdminNavbar from "./AdminNavbar";
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/Alumni/stories.php');
      const data = await response.json();
      
      if (data.status === 'success') {
        setStories(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch stories');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedStory) return;

    try {
      setDeleting(true);
      const response = await fetch('http://localhost/Alumni/stories.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: selectedStory.id,
          student_id: selectedStory.student_id
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccess('Story deleted successfully!');
        setStories(stories.filter(story => story.id !== selectedStory.id));
        setShowDeleteModal(false);
        setSelectedStory(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete story');
      }
    } catch (err) {
      setError('Failed to delete story. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const truncateText = (text, maxLength = 60) => {
    return text.length <= maxLength ? text : text.substr(0, maxLength) + '...';
  };

  return (
    <>
      <AdminNavbar />
      <div 
        style={{
          backgroundImage: 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuboocuYVlJUrtWo6-cj5G5_VYCEoyc6heig&s)',
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
                  <MdSchool className="me-2" />
                  Manage Alumni Stories
                </h2>
                <Badge bg="light" text="dark" className="fs-6 px-3 py-2">
                  Total: {stories.length}
                </Badge>
              </div>

              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="light" size="lg" />
                  <p className="mt-3 text-white">Loading stories...</p>
                </div>
              ) : stories.length === 0 ? (
                <Card className="shadow-lg">
                  <Card.Body className="text-center py-5">
                    <h4 className="text-muted">No Stories Found</h4>
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
                          <th width="33%">Story Preview</th>
                          <th width="10%">Date</th>
                          <th width="10%">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stories.map((story) => (
                          <tr key={story.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={story.alumni_photo}
                                  alt={story.alumni_name}
                                  className="rounded-circle me-2"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  onError={(e) => e.target.src = '/api/placeholder/40/40'}
                                />
                                <div>
                                  <div className="fw-bold small">{story.alumni_name}</div>
                                  <small className="text-muted">ID: {story.student_id}</small>
                                </div>
                              </div>
                            </td>
                            <td><Badge bg="secondary" className="small">{story.department}</Badge></td>
                            <td><Badge bg="primary" className="small">{story.batch_year}</Badge></td>
                            <td><small>{truncateText(story.story_text)}</small></td>
                            <td>
                              <small className="text-muted">
                                <FaCalendarAlt className="me-1" />
                                {story.formatted_date}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex">
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => { setSelectedStory(story); setShowViewModal(true); }}
                                >
                                  <FaEye size={12} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => { setSelectedStory(story); setShowDeleteModal(true); }}
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
          {selectedStory && (
            <>
              <div className="text-center mb-3">
                <FaTrash size={48} className="text-danger mb-3" />
                <h5>Delete this story?</h5>
              </div>
              <div className="border rounded p-3 bg-light">
                <div className="d-flex align-items-center mb-2">
                  <img
                    src={selectedStory.alumni_photo}
                    alt={selectedStory.alumni_name}
                    className="rounded-circle me-3"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    onError={(e) => e.target.src = '/api/placeholder/40/40'}
                  />
                  <div>
                    <strong>{selectedStory.alumni_name}</strong><br />
                    <small className="text-muted">{selectedStory.department} - {selectedStory.batch_year}</small>
                  </div>
                </div>
                <p className="mt-2 mb-0">{truncateText(selectedStory.story_text, 100)}</p>
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
        {/* <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>View Story</Modal.Title>
        </Modal.Header> */}
        <Modal.Body>
          {selectedStory && (
            <>
              <div className="d-flex align-items-center mb-4">
                <img
                  src={selectedStory.alumni_photo}
                  alt={selectedStory.alumni_name}
                  className="rounded-circle me-3"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  onError={(e) => e.target.src = '/api/placeholder/60/60'}
                />
                <div>
                  <h4>{selectedStory.alumni_name}</h4>
                  <div className="d-flex gap-2 mb-1">
                    <Badge bg="secondary">{selectedStory.department}</Badge>
                    <Badge bg="primary">{selectedStory.batch_year}</Badge>
                  </div>
                  <small className="text-muted">
                    <FaCalendarAlt className="me-1" />
                    {selectedStory.formatted_date}
                  </small>
                </div>
              </div>
              <div className="border rounded p-3 bg-light">
                <p className="mb-0">{selectedStory.story_text}</p>
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

export default ManageStories;