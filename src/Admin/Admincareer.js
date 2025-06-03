import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaTrash, FaEye, FaCalendarAlt, FaBriefcase, FaGraduationCap, FaHandshake, FaQuestionCircle } from 'react-icons/fa';
import { MdWork } from 'react-icons/md';
import AdminNavbar from "./AdminNavbar";
import 'bootstrap/dist/css/bootstrap.min.css';

const Admincareer = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/Alumni/career_posts.php');
      const data = await response.json();
      
      if (data.status === 'success') {
        setPosts(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch career posts');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;

    try {
      setDeleting(true);
      const response = await fetch('http://localhost/Alumni/career_posts.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: selectedPost.id,
          admin_delete: true
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccess('Career post deleted successfully!');
        setPosts(posts.filter(post => post.id !== selectedPost.id));
        setShowDeleteModal(false);
        setSelectedPost(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete career post');
      }
    } catch (err) {
      setError('Failed to delete career post. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const truncateText = (text, maxLength = 60) => {
    return text.length <= maxLength ? text : text.substr(0, maxLength) + '...';
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'job':
        return <FaBriefcase className="me-1" />;
      case 'internship':
        return <FaGraduationCap className="me-1" />;
      case 'mentorship':
        return <FaHandshake className="me-1" />;
      case 'career_help':
        return <FaQuestionCircle className="me-1" />;
      default:
        return <FaBriefcase className="me-1" />;
    }
  };

  const getPostTypeBadge = (type) => {
    const badges = {
      'job': 'success',
      'internship': 'info',
      'mentorship': 'warning',
      'career_help': 'secondary'
    };
    return badges[type] || 'primary';
  };

  return (
    <>
      <AdminNavbar />
      <div 
        style={{
          backgroundImage: 'url(https://i.pinimg.com/736x/1c/88/ff/1c88ffdf4e53550073309d5f05c325e1.jpg)',
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
                <h2 className="text-black fw-bold">
                    <MdWork className="me-2" />
                    Manage Career Posts
                </h2>
                <Badge bg="light" text="dark" className="fs-6 px-3 py-2">
                  Total: {posts.length}
                </Badge>
              </div>

              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="light" size="lg" />
                  <p className="mt-3 text-white">Loading career posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <Card className="shadow-lg">
                  <Card.Body className="text-center py-5">
                    <h4 className="text-muted">No Career Posts Found</h4>
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
                          <th width="15%">Title</th>
                          <th width="20%">Description</th>
                          <th width="10%">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posts.map((post) => (
                          <tr key={post.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={post.alumni_photo}
                                  alt={post.alumni_name}
                                  className="rounded-circle me-2"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  onError={(e) => e.target.src = '/api/placeholder/40/40'}
                                />
                                <div>
                                  <div className="fw-bold small">{post.alumni_name}</div>
                                  <small className="text-muted">ID: {post.student_id}</small>
                                </div>
                              </div>
                            </td>
                            <td><Badge bg="secondary" className="small">{post.department}</Badge></td>
                            <td><Badge bg="primary" className="small">{post.batch_year}</Badge></td>
                            <td>
                              <Badge bg={getPostTypeBadge(post.post_type)} className="small">
                                {getPostTypeIcon(post.post_type)}
                                {post.post_type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </td>
                            <td><small className="fw-bold">{truncateText(post.title, 20)}</small></td>
                            <td><small>{truncateText(post.description)}</small></td>
                            <td>
                              <div className="d-flex">
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => { setSelectedPost(post); setShowViewModal(true); }}
                                >
                                  <FaEye size={12} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => { setSelectedPost(post); setShowDeleteModal(true); }}
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
          {selectedPost && (
            <>
              <div className="text-center mb-3">
                <FaTrash size={48} className="text-danger mb-3" />
                <h5>Delete this career post?</h5>
              </div>
              <div className="border rounded p-3 bg-light">
                <div className="d-flex align-items-center mb-2">
                  <img
                    src={selectedPost.alumni_photo}
                    alt={selectedPost.alumni_name}
                    className="rounded-circle me-3"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    onError={(e) => e.target.src = '/api/placeholder/40/40'}
                  />
                  <div>
                    <strong>{selectedPost.alumni_name}</strong><br />
                    <small className="text-muted">{selectedPost.department} - {selectedPost.batch_year}</small>
                  </div>
                </div>
                <div className="mb-2">
                  <Badge bg={getPostTypeBadge(selectedPost.post_type)}>
                    {getPostTypeIcon(selectedPost.post_type)}
                    {selectedPost.post_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <h6>{selectedPost.title}</h6>
                <p className="mt-2 mb-0">{truncateText(selectedPost.description, 100)}</p>
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
          {selectedPost && (
            <>
              <div className="d-flex align-items-center mb-4">
                <img
                  src={selectedPost.alumni_photo}
                  alt={selectedPost.alumni_name}
                  className="rounded-circle me-3"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  onError={(e) => e.target.src = '/api/placeholder/60/60'}
                />
                <div>
                  <h4>{selectedPost.alumni_name}</h4>
                  <div className="d-flex gap-2 mb-1">
                    <Badge bg="secondary">{selectedPost.department}</Badge>
                    <Badge bg="primary">{selectedPost.batch_year}</Badge>
                    <Badge bg={getPostTypeBadge(selectedPost.post_type)}>
                      {getPostTypeIcon(selectedPost.post_type)}
                      {selectedPost.post_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <small className="text-muted">
                    <FaCalendarAlt className="me-1" />
                    {selectedPost.formatted_date}
                  </small>
                </div>
              </div>
              <div className="border rounded p-3 bg-light mb-3">
                <h5 className="mb-3">{selectedPost.title}</h5>
                <p className="mb-3">{selectedPost.description}</p>
                <div className="border-top pt-3">
                  <strong>Contact Information:</strong>
                  <p className="mb-0 mt-1">{selectedPost.contact}</p>
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

export default Admincareer;