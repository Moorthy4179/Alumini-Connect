import React, { useState } from "react";
import { Container, Row, Col, Button, Modal, Form, Card } from "react-bootstrap";
import { FaHandHoldingHeart, FaPlusCircle } from "react-icons/fa";
import Navbar from "./navbar";
import emailjs from "emailjs-com";
import "./AlumniNeeds.css";

const AlumniNeeds = () => {
  const [show, setShow] = useState(false);
  const [requests, setRequests] = useState([
    {
      name: "Baby",
      contact: "baby@example.com",
      type: "Job",
      description: "Looking for a software developer role.",
      createdAt: new Date() 
    },
   {
    name: "Tamil",
    contact: 9873201456,
    type: "Medical",
    description: "Need assistance with medical bills for treatment.",
    createdAt: new Date()
  },
  {
    name: "Alice",
    contact: "alice@example.com",
    type: "Internship",
    description: "Looking for an internship in marketing.",
    createdAt: new Date()
  }
  ]);
  const [form, setForm] = useState({ name: "", contact: "", type: "", description: "" });
  const [selectedType, setSelectedType] = useState("");

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setForm({ name: "", contact: "", type: "", description: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Add to local state with created date
    const newRequest = { ...form, createdAt: new Date() }; 
    const newRequests = [...requests, newRequest];
    setRequests(newRequests);

    // Send email
    const templateParams = {
      name: form.name,
      contact: form.contact,
      type: form.type,
      description: form.description
    };

    emailjs
      .send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams, "YOUR_USER_ID")
      .then(() => alert("Request submitted & email sent successfully!"))
      .catch((error) => alert("Email sending failed: " + error.text));

    handleClose();
  };

  const filteredRequests = requests.filter((r) =>
    selectedType ? r.type === selectedType : true
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <>
      <Navbar />
      <div className="alumni-background d-flex flex-column min-vh-100">
        <Container fluid className="py-5 text-light">
          {/* Heading and search/filter layout */}
          <Row className="mb-4">
            <Col xs={12}>
              <h2 className="alumni-title">
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

          <Row>
            {filteredRequests.map((req, index) => (
              <Col md={6} lg={4} key={index} className="mb-4">
                <Card className="alumni-card h-100">
                  <Card.Body>
                    <Card.Title className="mb-2 text-muted">
                      <strong>{req.name}</strong> - {req.type}
                    </Card.Title>
                    <Card.Text>{req.description}</Card.Text>
                    <small className="text-muted">Contact: {req.contact}</small>
                    <div className="mt-2">
                      <small className="text-muted">
                        Created on: {formatDate(req.createdAt)}
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Support Request</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Info</Form.Label>
              <Form.Control
                type="text"
                placeholder="Phone or Email"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Request Type</Form.Label>
              <Form.Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="">Select</option>
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
                rows={3}
                placeholder="Describe your request"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              Submit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AlumniNeeds;
