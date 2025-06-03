import {
  Navbar, Nav, Container, Button, NavDropdown
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome, FaUserFriends, FaChartBar, FaDonate, FaCalendarAlt, FaSignOutAlt, FaImage, FaBook, FaHandHoldingHeart
} from "react-icons/fa";
import { MdEventAvailable, MdDashboard } from "react-icons/md";
import { GiGraduateCap } from "react-icons/gi";
import { useAuth } from "../AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const navbarStyle = {
  background: "linear-gradient(90deg, #182848, #4b6cb7)",
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

const profileImageStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid white"
};

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); 
  };

  return (
    <Navbar expand="lg" variant="dark" style={navbarStyle} className="w-100 shadow">
      <Container fluid>
        <Navbar.Brand as={Link} to="/admin-dashboard" className="fw-bold fs-4 ms-3 text-white">
          <MdDashboard className="me-2" size={32} />
          ADMIN PANEL
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="mx-auto gap-4">
            <Nav.Link as={Link} to="/admin-dashboard" style={linkStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
            >
            </Nav.Link>
            <Nav.Link as={Link} to="/manage-users" style={linkStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
            >
              <FaUserFriends className="me-2" /> Manage Alumni
            </Nav.Link>
            <Nav.Link as={Link} to="/managestories" style={linkStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
            >
              <FaBook className="me-2" /> Manage Stories
            </Nav.Link>
            <NavDropdown title={<><MdEventAvailable className="me-2" /> Events</>}
              id="eventsDropdown" className="fs-5"
            >
              <NavDropdown.Item as={Link} to="/adminreunion">
                <GiGraduateCap className="me-2" /> Reunion
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/adminvirtual">
                <FaCalendarAlt className="me-2" /> Virtual Meetings
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title={<><FaHandHoldingHeart className="me-2" /> Support</>}
              id="supportDropdown" className="fs-5"
            >
              <NavDropdown.Item as={Link} to="/admin-careercenter">
                <FaHandHoldingHeart className="me-2" /> Career Posts
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admin-alumnineeds">
                <FaHandHoldingHeart className="me-2" /> Alumni Needs
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/admindonation" style={linkStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
            >
              <FaDonate className="me-2" /> Donations
            </Nav.Link>
            <Nav.Link as={Link} to="/admin-home-images" style={linkStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
            >
              <FaImage className="me-2" /> Home Images
            </Nav.Link>

            <Nav.Link as={Link} to="/" style={linkStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
            >
              <FaHome className="me-2" /> View Alumni Site
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center me-3">
            <Button variant="danger" style={buttonStyle} onClick={handleLogout}>
              <FaSignOutAlt className="me-2" /> LOG OUT
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;