import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Alert, Table, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaImage } from 'react-icons/fa';
import AdminNavbar from './AdminNavbar';

const API_BASE_URL = 'http://localhost/Alumni';
const IMAGES_BASE_URL = 'http://localhost/public';

const AdminHomeImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [uploadingFile, setUploadingFile] = useState(false);

  const [formData, setFormData] = useState({
    image_name: '',
    image_path: '',
    display_order: 0,
    is_active: 1
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/home_images.php?admin=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setImages(Array.isArray(data.images) ? data.images : []);
      } else {
        showAlert(data.message || 'Failed to fetch images', 'danger');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      showAlert('Error connecting to server', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  const handleShowModal = (image = null) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        image_name: image.image_name || '',
        image_path: image.image_path || '',
        display_order: image.display_order || 0,
        is_active: image.is_active || 1
      });
    } else {
      setEditingImage(null);
      setFormData({
        image_name: '',
        image_path: '',
        display_order: images.length,
        is_active: 1
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingImage(null);
    setFormData({
      image_name: '',
      image_path: '',
      display_order: 0,
      is_active: 1
    });
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '/api/placeholder/60/45';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/images/')) {
      return `${IMAGES_BASE_URL}${imagePath}`;
    }
    
    if (imagePath.startsWith('images/')) {
      return `${IMAGES_BASE_URL}/${imagePath}`;
    }
    
    return `${IMAGES_BASE_URL}/images/${imagePath}`;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showAlert('Please select a valid image file (JPEG, PNG, GIF, WebP)', 'danger');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('File size must be less than 5MB', 'danger');
      return;
    }

    setUploadingFile(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload_image.php`, {
        method: 'POST',
        body: uploadFormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setFormData(prev => ({
          ...prev,
          image_path: data.path,
          image_name: prev.image_name || file.name.split('.')[0]
        }));
        showAlert('Image uploaded successfully', 'success');
      } else {
        showAlert(data.message || 'Upload failed', 'danger');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showAlert('Upload failed. Please try again.', 'danger');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.image_name.trim()) {
      showAlert('Image name is required', 'danger');
      return;
    }
    
    if (!formData.image_path.trim()) {
      showAlert('Image path is required', 'danger');
      return;
    }
    
    try {
      const url = `${API_BASE_URL}/home_images.php`;
      const method = editingImage ? 'PUT' : 'POST';
      const body = editingImage 
        ? { ...formData, id: editingImage.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        showAlert(editingImage ? 'Image updated successfully' : 'Image added successfully', 'success');
        handleCloseModal();
        fetchImages();
      } else {
        showAlert(data.message || 'Operation failed', 'danger');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showAlert('Operation failed. Please try again.', 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/home_images.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        showAlert('Image deleted successfully', 'success');
        fetchImages();
      } else {
        showAlert(data.message || 'Delete failed', 'danger');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showAlert('Delete failed. Please try again.', 'danger');
    }
  };

  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div>
      <AdminNavbar />
      <Container fluid className="py-4">
        <Row className="justify-content-center">
          <Col lg={10} xl={9}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <FaImage className="me-2" />
                  Home Page Images
                </h4>
                <Button variant="primary" onClick={() => handleShowModal()}>
                  <FaPlus className="me-2" />
                  Add New Image
                </Button>
              </Card.Header>
              <Card.Body>
                {alert.show && (
                  <Alert variant={alert.type} dismissible onClose={() => setAlert(prev => ({ ...prev, show: false }))}>
                    {alert.message}
                  </Alert>
                )}

                {loading ? (
                  <div className="text-center py-4">Loading images...</div>
                ) : (
                  <div>
                    <Table striped bordered hover responsive style={{ fontSize: '0.95rem' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '60px' }}>Preview</th>
                          <th style={{ width: '250px' }}>Image Name</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>Order</th>
                          <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                          <th style={{ width: '120px' }}>Upload Date</th>
                          <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {images.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-3">
                              No images found. Add your first image!
                            </td>
                          </tr>
                        ) : (
                          images.map((image) => (
                            <tr key={image.id || `image-${Math.random()}`}>
                              <td>
                                <img
                                  src={getFullImageUrl(image.image_path)}
                                  alt={image.image_name || 'Image'}
                                  style={{
                                    width: '60px',
                                    height: '45px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                  }}
                                  onError={(e) => {
                                    e.target.src = '/api/placeholder/60/45';
                                  }}
                                />
                              </td>
                              <td>
                                <div style={{ fontSize: '1rem', fontWeight: '500' }}>{image.image_name || 'Untitled'}</div>
                                <small className="text-muted" style={{ fontSize: '0.85rem' }}>{image.image_path || 'No path'}</small>
                              </td>
                              <td className="text-center" style={{ fontSize: '1rem', fontWeight: '500' }}>{image.display_order || 0}</td>
                              <td className="text-center">
                                <Badge bg={image.is_active ? 'success' : 'secondary'} pill>
                                  {image.is_active ? 'Active' : 'Hidden'}
                                </Badge>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.9rem' }}>
                                  {image.uploaded_at || image.created_at 
                                    ? new Date(image.uploaded_at || image.created_at).toLocaleDateString()
                                    : 'N/A'
                                  }
                                </div>
                              </td>
                              <td>
                                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40px' }}>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => handleShowModal(image)}
                                    title="Edit"
                                    className="me-2"
                                    style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                                  >
                                    <FaEdit />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => handleDelete(image.id)}
                                    title="Delete"
                                    style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                                  >
                                    <FaTrash />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingImage ? 'Edit Image' : 'Add New Image'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Image Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.image_name}
                      onChange={(e) => handleFormDataChange('image_name', e.target.value)}
                      required
                      placeholder="Enter image name"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Display Order</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => handleFormDataChange('display_order', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={formData.is_active}
                      onChange={(e) => handleFormDataChange('is_active', parseInt(e.target.value))}
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Hidden</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Upload New Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
                <Form.Text className="text-muted">
                  {uploadingFile ? 'Uploading...' : 'Select an image file (JPEG, PNG, GIF, WebP - Max 5MB)'}
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Image Path *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.image_path}
                  onChange={(e) => handleFormDataChange('image_path', e.target.value)}
                  required
                  placeholder="/images/filename.jpg"
                  readOnly={uploadingFile}
                />
              </Form.Group>

              {formData.image_path && (
                <Form.Group className="mb-3">
                  <Form.Label>Preview</Form.Label>
                  <div>
                    <img
                      src={getFullImageUrl(formData.image_path)}
                      alt="Preview"
                      style={{
                        maxWidth: '300px',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/200';
                      }}
                    />
                  </div>
                </Form.Group>
              )}

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={uploadingFile}>
                  {uploadingFile ? 'Processing...' : (editingImage ? 'Update Image' : 'Add Image')}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminHomeImages;