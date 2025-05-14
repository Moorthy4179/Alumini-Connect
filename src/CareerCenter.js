import React, { useState } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import { FaBriefcase, FaPlusCircle } from "react-icons/fa";
import Navbar from "./navbar";
import "./CareerCenter.css";

const CareerCenter = () => {
  const [show, setShow] = useState(false);
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contact: "",
  });

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setFormData({ title: "", description: "", contact: "" });
    setShow(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPosts([formData, ...posts]);
    alert("Career opportunity posted successfully!");
    handleClose();
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

          {posts.length === 0 ? (
            <p className="text-center text-light">No posts yet. Be the first to share!</p>
          ) : (
            <Row className="g-4">
              {posts.map((post, index) => (
                <Col md={6} key={index}>
                  <div className="post-box">
                    <h5>{post.title}</h5>
                    <p>{post.description}</p>
                    <p><strong>Contact:</strong> {post.contact}</p>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>

      {/* Post Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Post a Job or Career Support</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Web Developer Intern"
                required
              />
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
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Info</Form.Label>
              <Form.Control
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Email or phone number"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="success" type="submit">Post</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default CareerCenter;
