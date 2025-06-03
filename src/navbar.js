import React, { useState } from "react";
import {
  Navbar, Nav, NavDropdown, Container, Button, Modal, Form, Alert, Spinner, Offcanvas
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome, FaBookOpen, FaUserFriends, FaHandHoldingHeart, FaDonate, 
  FaUserAlt, FaSignInAlt, FaSignOutAlt, FaEye, FaEyeSlash, FaBars
} from "react-icons/fa";
import {
  MdEventAvailable, MdConnectWithoutContact
} from "react-icons/md";
import { GiGraduateCap } from "react-icons/gi";
import { useAuth } from "./AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
const navbarStyle = {
  background: "linear-gradient(90deg, #4b6cb7, #182848)",
  padding: "10px 0",
};
const linkStyle = {
  color: "#fff",
  fontSize: "18px",
  fontWeight: "500",
  transition: "color 0.3s ease, transform 0.2s ease",
  textDecoration: "none",
};
const linkHoverStyle = {
  filter: "brightness(1.4)",
  transform: "scale(1.05)",
};
const buttonStyle = {
  backgroundColor: "#ff5733",
  borderColor: "#ff5733",
  fontSize: "16px",
  fontWeight: "bold",
};
const loginButtonStyle = {
  backgroundColor: "#4CAF50",
  borderColor: "#4CAF50",
  fontSize: "16px",
  fontWeight: "bold",
};
const profileImageStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid white"
};
const passwordInputStyle = {
  position: "relative"
};
const eyeIconStyle = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
  zIndex: 1
};
const offcanvasStyle = {
  background: "linear-gradient(180deg, #4b6cb7, #182848)",
  color: "#fff"
};
const offcanvasLinkStyle = {
  color: "#fff",
  fontSize: "18px",
  fontWeight: "500",
  padding: "15px 20px",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  display: "block",
  textDecoration: "none",
  transition: "all 0.3s ease"
};
const CustomNavbar = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleClose = () => {
    setShowLoginModal(false);
    setEmail("");
    setDob("");
    setError("");
    setSuccess("");
    setShowPassword(false);
    setLoading(false);
  };
  const handleShow = () => setShowLoginModal(true);
  const handleOffcanvasClose = () => setShowOffcanvas(false);
  const handleOffcanvasShow = () => setShowOffcanvas(true);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!email.trim() || !dob.trim()) {
        throw new Error("Please enter both name/email and date of birth");
      }
      const isAdminLogin = 
        (email.toLowerCase().trim() === "admin" || email.toLowerCase().trim() === "admin@alumni.com") &&
        dob.toLowerCase().trim() === "admin";
      if (isAdminLogin) {
        const userData = {
          id: 0,
          name: "Admin",
          email: "admin@alumni.com",
          isAdmin: true
        };
        setSuccess("Admin login successful!");
        login(userData);
        setTimeout(() => {
          handleClose();
          navigate("/admin-dashboard");
        }, 1000);
        return;
      }
      const response = await fetch('http://localhost/Alumni/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          dob: dob.trim()
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
        setSuccess(data.message || "Login successful!");
        login(data.user);
        setTimeout(() => {
          handleClose();
          const redirectPath = sessionStorage.getItem("redirectAfterLogin");
          if (redirectPath) {
            sessionStorage.removeItem("redirectAfterLogin");
            navigate(redirectPath);
          }
        }, 1000);
      } else {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError("Unable to connect to server. Please check if the server is running.");
      } else {
        setError(error.message || "Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    logout();
    navigate("/");
    setShowOffcanvas(false);
  };
  const handleNavLinkClick = (isProtected, path) => {
    if (isProtected && !isAuthenticated) {
      alert("Please log in to access this page!");
      sessionStorage.setItem("redirectAfterLogin", path);
      handleShow();
      setShowOffcanvas(false);
      return false;
    } else {
      navigate(path);
      setShowOffcanvas(false);
      return true;
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <>
      <Navbar expand="lg" variant="dark" style={navbarStyle} className="w-100 shadow">
        <Container fluid className="px-3">
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-white">
            <MdConnectWithoutContact className="me-2" size={32} />
            ALUMNI CONNECT
          </Navbar.Brand>
          <div className="d-flex align-items-center">
            <div className="d-lg-none me-3">
              {isAuthenticated && user ? (
                <>
                  {!user.isAdmin && (
                    <div className="text-white d-flex align-items-center">
                      <img 
                        src={user.photo || '/api/placeholder/150/150'} 
                        alt="Profile" 
                        style={profileImageStyle} 
                        onError={(e) => {
                          e.target.src = '/api/placeholder/150/150';
                        }}
                      />
                      <span className="ms-2 d-none d-sm-inline">{user.name}</span>
                    </div>
                  )}
                  {user.isAdmin && (
                    <span className="text-white">Welcome, {user.name}</span>
                  )}
                </>
              ) : null}
            </div>
            <Button 
              variant="outline-light" 
              className="d-lg-none border-0"
              onClick={handleOffcanvasShow}
            >
              <FaBars size={20} />
            </Button>
          </div>
          <Navbar.Collapse id="navbar-nav" className="d-none d-lg-block">
            <Nav className="me-auto justify-content-center flex-grow-1">
              <Nav.Link as={Link} to="/" style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
              >
                <FaHome className="me-2" /> Home
              </Nav.Link>
              <Nav.Link style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
                onClick={() => handleNavLinkClick(true, "/stories")}
              >
                <FaBookOpen className="me-2" /> Stories
              </Nav.Link>
              <NavDropdown title={<><MdEventAvailable className="me-2" /> Events</>}
                id="eventsDropdown" className="fs-5"
              >
                <NavDropdown.Item onClick={() => handleNavLinkClick(true, "/reunion")}>
                  <GiGraduateCap className="me-2" /> Reunion
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleNavLinkClick(true, "/virtualsection")}>
                  <MdEventAvailable className="me-2" /> Virtual Section
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
                onClick={() => handleNavLinkClick(true, "/community")}
              >
                <GiGraduateCap className="me-2" /> Community
              </Nav.Link>
              <NavDropdown title={<><FaHandHoldingHeart className="me-2" /> Support</>}
                id="supportDropdown" className="fs-5"
              >
                <NavDropdown.Item onClick={() => handleNavLinkClick(true, "/careercenter")}>
                  <FaHandHoldingHeart className="me-2" /> Career Center
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleNavLinkClick(true, "/alumnineeds")}>
                  <FaHandHoldingHeart className="me-2" /> Alumni Needs
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
                onClick={() => handleNavLinkClick(true, "/donate")}
              >
                <FaDonate className="me-2" /> Donate
              </Nav.Link>
              {isAuthenticated && user && user.isAdmin && (
                <Nav.Link as={Link} to="/admin-dashboard" style={linkStyle}
                  onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
                >
                  <FaUserAlt className="me-2" /> Admin Panel
                </Nav.Link>
              )}
            </Nav>
            <Nav className="ms-auto">
              <div className="d-flex align-items-center">
                {isAuthenticated && user ? (
                  <>
                    {!user.isAdmin && (
                      <div className="me-3 text-white d-flex align-items-center">
                        <img 
                          src={user.photo || '/api/placeholder/150/150'} 
                          alt="Profile" 
                          style={profileImageStyle} 
                          onError={(e) => {
                            e.target.src = '/api/placeholder/150/150';
                          }}
                        />
                        <span className="ms-2 d-none d-md-inline">{user.name}</span>
                      </div>
                    )}
                    {user.isAdmin && (
                      <span className="text-white me-3">Welcome, {user.name}</span>
                    )}
                    <Button variant="danger" style={buttonStyle} onClick={handleLogout}>
                      <FaSignOutAlt className="me-2" /> LOG OUT
                    </Button>
                  </>
                ) : (
                  <Button variant="success" style={loginButtonStyle} onClick={handleShow}>
                    <FaSignInAlt className="me-2" /> LOG IN
                  </Button>
                )}
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Offcanvas show={showOffcanvas} onHide={handleOffcanvasClose} placement="end" style={offcanvasStyle}>
        <Offcanvas.Header closeButton className="border-bottom border-secondary">
          <Offcanvas.Title className="text-white">
            <MdConnectWithoutContact className="me-2" size={24} />
            ALUMNI CONNECT
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <div className="d-flex flex-column">
            <Link to="/" style={offcanvasLinkStyle} onClick={() => setShowOffcanvas(false)}
              onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              <FaHome className="me-3" /> Home
            </Link>
            <div style={offcanvasLinkStyle} onClick={() => handleNavLinkClick(true, "/stories")}
              onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              <FaBookOpen className="me-3" /> Stories
            </div>
            <div className="border-bottom border-secondary pb-2">
              <div style={{...offcanvasLinkStyle, borderBottom: "none", paddingBottom: "10px", color: "#ccc"}}>
                <MdEventAvailable className="me-3" /> Events
              </div>
              <div style={{...offcanvasLinkStyle, paddingLeft: "40px", fontSize: "16px"}} 
                onClick={() => handleNavLinkClick(true, "/reunion")}
                onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                <GiGraduateCap className="me-3" /> Reunion
              </div>
              <div style={{...offcanvasLinkStyle, paddingLeft: "40px", fontSize: "16px", borderBottom: "none"}} 
                onClick={() => handleNavLinkClick(true, "/virtualsection")}
                onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                <MdEventAvailable className="me-3" /> Virtual Section
              </div>
            </div>
            <div style={offcanvasLinkStyle} onClick={() => handleNavLinkClick(true, "/community")}
              onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              <GiGraduateCap className="me-3" /> Community
            </div>
            <div className="border-bottom border-secondary pb-2">
              <div style={{...offcanvasLinkStyle, borderBottom: "none", paddingBottom: "10px", color: "#ccc"}}>
                <FaHandHoldingHeart className="me-3" /> Support
              </div>
              <div style={{...offcanvasLinkStyle, paddingLeft: "40px", fontSize: "16px"}} 
                onClick={() => handleNavLinkClick(true, "/careercenter")}
                onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                <FaHandHoldingHeart className="me-3" /> Career Center
              </div>
              <div style={{...offcanvasLinkStyle, paddingLeft: "40px", fontSize: "16px", borderBottom: "none"}} 
                onClick={() => handleNavLinkClick(true, "/alumnineeds")}
                onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                <FaHandHoldingHeart className="me-3" /> Alumni Needs
              </div>
            </div>
            <div style={offcanvasLinkStyle} onClick={() => handleNavLinkClick(true, "/donate")}
              onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              <FaDonate className="me-3" /> Donate
            </div>
            {isAuthenticated && user && user.isAdmin && (
              <Link to="/admin-dashboard" style={offcanvasLinkStyle} onClick={() => setShowOffcanvas(false)}
                onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                <FaUserAlt className="me-3" /> Admin Panel
              </Link>
            )}
            <div className="mt-auto p-3 border-top border-secondary">
              {isAuthenticated && user ? (
                <Button variant="danger" style={buttonStyle} onClick={handleLogout} className="w-100">
                  <FaSignOutAlt className="me-2" /> LOG OUT
                </Button>
              ) : (
                <Button variant="success" style={loginButtonStyle} onClick={() => {handleShow(); setShowOffcanvas(false);}} className="w-100">
                  <FaSignInAlt className="me-2" /> LOG IN
                </Button>
              )}
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
      <Modal show={showLoginModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login to Alumni Connect</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Name or Email Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name or email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <Form.Text className="text-muted">
                Enter your name or email address 
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicDOB">
              <Form.Label>Date of Birth</Form.Label>
              <div style={passwordInputStyle}>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="DDMMYYYY"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  disabled={loading}
                  style={{ paddingRight: "40px" }}
                />
                <div style={eyeIconStyle} onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </div>
              </div>
              <Form.Text className="text-muted">
                Format: DDMMYYYY (e.g., 23102001) 
              </Form.Text>
            </Form.Group>
            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                className="d-flex align-items-center justify-content-center"
              >
                {loading && <Spinner animation="border" size="sm" className="me-2" />}
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};
export default CustomNavbar;