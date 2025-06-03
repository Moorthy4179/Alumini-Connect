import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import { FaBriefcase, FaPlusCircle } from "react-icons/fa";
import Navbar from "./navbar";
import { useAuth } from './AuthContext';
import "./CareerCenter.css";

const CareerCenter = () => {
  const { user, isAuthenticated } = useAuth();
  const [show, setShow] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, postId: null, postTitle: '' });
  const [deleting, setDeleting] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contact: "",
    post_type: "job"
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost/Alumni/career_posts.php', {
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
        setPosts(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch career posts');
      }
    } catch (error) {
      console.error("Fetch posts error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError("Unable to connect to server. Please check if the server is running.");
      } else {
        setError(error.message || "Failed to load career posts. Please try again.");
      }
      setPosts([
        {
          id: 1,
          alumni_name: "Sample Alumni 1",
          alumni_photo: "https://images.unsplash.com/photo-1573164574392-9d3d0eaf6d9e",
          title: "Software Developer Position",
          description: "We are looking for a talented software developer to join our team.",
          contact: "hr@techcompany.com",
          post_type: "job",
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
      alert('Please log in to post a career opportunity!');
      return;
    }
    setShow(true);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    setFormData({ title: "", description: "", contact: "", post_type: "job" });
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
      setError('Please log in to post a career opportunity');
      return;
    }

    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.contact.trim()) {
      setError('All fields are required');
      return;
    }

    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long');
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

      const postData = {
        student_id: user.student_id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        contact: formData.contact.trim(),
        post_type: formData.post_type
      };

      const response = await fetch('http://localhost/Alumni/career_posts.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(postData)
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
        setSuccess('Career opportunity posted successfully!');
        if (data.data) {
          setPosts(prevPosts => [data.data, ...prevPosts]);
        }
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to post career opportunity');
      }
    } catch (error) {
      console.error("Post career opportunity error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError("Unable to connect to server. Please check if the server is running.");
      } else {
        setError(error.message || "Failed to post career opportunity. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeletePost = async (postId) => {
    try {
      setDeleting(postId);
      setError('');
      const response = await fetch('http://localhost/Alumni/career_posts.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          post_id: postId,
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
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        setSuccess('Career post deleted successfully!');
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to delete career post');
      }
    } catch (error) {
      console.error("Delete post error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError("Unable to connect to server. Please check if the server is running.");
      } else {
        setError(error.message || "Failed to delete career post. Please try again.");
      }
    } finally {
      setDeleting(null);
      setDeleteConfirm({ show: false, postId: null, postTitle: '' });
    }
  };
  const showDeleteConfirm = (post) => {
    setDeleteConfirm({
      show: true,
      postId: post.id,
      postTitle: post.title.substring(0, 50) + (post.title.length > 50 ? '...' : '')
    });
  };
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, postId: null, postTitle: '' });
  };
  const getPostTypeColor = (type) => {
    switch(type) {
      case 'job': return '#28a745';
      case 'internship': return '#007bff';
      case 'mentorship': return '#6f42c1';
      case 'career_help': return '#fd7e14';
      default: return '#28a745';
    }
  };
  const getPostTypeLabel = (type) => {
    switch(type) {
      case 'job': return 'Job';
      case 'internship': return 'Internship';
      case 'mentorship': return 'Mentorship';
      case 'career_help': return 'Career Help';
      default: return 'Job';
    }
  };
  return (
    <>
      <Navbar />
      <div className="career-background">
        <div className="top-right-button">
          <Button variant="success" onClick={handleShow}>
            <FaPlusCircle className="me-2" />
            Post Job / Career Help
          </Button>
        </div>
        <Container fluid className="career-content py-5">
          <h2 className="text-center text-light mb-4">
            <FaBriefcase className="me-2" />
            Career Center
          </h2>
          <p className="text-center text-light mb-5">
            Connect with alumni for jobs, mentorship, and support.
          </p>
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
          {deleteConfirm.show && (
            <div className="form-popup delete-popup">
              <div className="form-box delete-confirm-box">
                <h3>🗑️ Delete Career Post</h3>
                <p>Are you sure you want to delete this career post?</p>
                <div className="story-preview">
                  "{deleteConfirm.postTitle}"
                </div>
                <p className="warning-text">This action cannot be undone.</p>   
                <div className="form-actions">
                  <button 
                    className="delete-confirm-btn"
                    onClick={() => handleDeletePost(deleteConfirm.postId)}
                    disabled={deleting === deleteConfirm.postId}
                  >
                    {deleting === deleteConfirm.postId ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button 
                    type="button" 
                    onClick={cancelDelete} 
                    className="cancel-btn"
                    disabled={deleting === deleteConfirm.postId}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <p className="text-center text-light">Loading career opportunities...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-light">No posts yet. Be the first to share!</p>
          ) : (
            <Row className="g-4">
              {posts.map((post) => (
                <Col md={3} key={post.id}>
                  <div className="post-box position-relative">             
                    <div className="d-flex align-items-center mb-3">
                      <br></br>
                      <div>
                        <h6 className="mb-0">{post.alumni_name}</h6>
                        <small className="text-muted">{post.department} ({post.batch_year})</small>
                      </div>
                      <span 
                        className="badge ms-auto"
                        style={{ backgroundColor: getPostTypeColor(post.post_type) }}
                      >
                        {getPostTypeLabel(post.post_type)}
                      </span>
                    </div>
                    <h5>{post.title}</h5>
                    <p>{post.description}</p>
                    <p><strong>Contact:</strong> {post.contact}</p>
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="post-date">Posted on {post.formatted_date}</small>
                        {isAuthenticated && user && user.student_id === post.student_id && (
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => showDeleteConfirm(post)}
                            disabled={deleting === post.id}
                            title="Delete this post"
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            {deleting === post.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Post a Job or Career Support</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {isAuthenticated && user && (
              <div className="user-info mb-3 p-3 bg-light rounded">
                <div className="d-flex align-items-center">
                  <div>
                    <strong>{user.name}</strong><br />
                    <small className="text-muted">ID: {user.student_id} | {user.department} ({user.batch_year})</small>
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
              <Form.Label>Post Type</Form.Label>
              <Form.Select
                name="post_type"
                value={formData.post_type}
                onChange={handleChange}
                disabled={submitting}
                required
              >
                <option value="job">Job</option>
                <option value="internship">Internship</option>
                <option value="mentorship">Mentorship</option>
                <option value="career_help">Career Help</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Web Developer Intern"
                disabled={submitting}
                maxLength="255"
                required
              />
              <div className="char-count mt-1">
                <small className="text-muted">{formData.title.length}/255 characters</small>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about the opportunity or support"
                disabled={submitting}
                maxLength="2000"
                required
              />
              <div className="char-count mt-1">
                <small className="text-muted">{formData.description.length}/500 characters</small>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact Info</Form.Label>
              <Form.Control
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Email or phone number"
                disabled={submitting}
                maxLength="255"
                required
              />
              <div className="char-count mt-1">
                <small className="text-muted">{formData.contact.length}/255 characters</small>
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
              disabled={submitting || !formData.title.trim() || !formData.description.trim() || !formData.contact.trim()}
              className={submitting ? 'submitting' : ''}
            >
              {submitting ? 'Posting...' : 'Post'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default CareerCenter;