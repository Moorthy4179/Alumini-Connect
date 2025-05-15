import React from "react";
import { Navbar, Nav, NavDropdown, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaBookOpen,
  FaUserFriends,
  FaHandHoldingHeart,
  FaDonate,
  FaUserAlt,
} from "react-icons/fa";
import {
  MdEventAvailable,
  MdConnectWithoutContact,
} from "react-icons/md";
import { GiGraduateCap } from "react-icons/gi";
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
  transition: "background-color 0.3s ease",
};

const CustomNavbar = () => {
  return (
    <Navbar expand="lg" variant="dark" style={navbarStyle} className="w-100 shadow">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 ms-3 text-white">
          <MdConnectWithoutContact className="me-2" size={32} />
          ALUMNI CONNECT
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="mx-auto gap-4">
            <Nav.Link
              as={Link}
              to="/"
              style={linkStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
            >
              <FaHome className="me-2" /> Home
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/stories"
              style={linkStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
            >
              <FaBookOpen className="me-2" /> Stories
            </Nav.Link>

            <NavDropdown
              title={<><MdEventAvailable className="me-2" /> Events</>}
              id="eventsDropdown"
              className="fs-5"
            >
              <NavDropdown.Item as={Link} to="/reunion">
                <GiGraduateCap className="me-2" /> Reunion
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/virtualsection">
                <MdEventAvailable className="me-2" /> Virtual Section
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown
              title={<><MdEventAvailable className="me-2" /> Community</>}
              id="eventsDropdown"
              className="fs-5"
            >
              <NavDropdown.Item as={Link} to="/community">
                <GiGraduateCap className="me-2" /> Alumni Search
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/group">
                <MdEventAvailable className="me-2" /> Friends
              </NavDropdown.Item>
            </NavDropdown>


            {/* <Nav.Link
              as={Link}
              to="/community"
              style={linkStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
            >
              <FaBookOpen className="me-2" /> Community
            </Nav.Link> */}

            <NavDropdown
              title={<><FaHandHoldingHeart className="me-2" /> Support</>}
              id="supportDropdown"
              className="fs-5"
            >
              <NavDropdown.Item as={Link} to="/careercenter">
                <FaHandHoldingHeart className="me-2" /> Career Center
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/alumnineeds">
                <FaHandHoldingHeart className="me-2" /> Alumni Needs
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link
              as={Link}
              to="/donate"
              style={linkStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
            >
              <FaDonate className="me-2" /> Donate
            </Nav.Link>

            {/* <NavDropdown
              title={<><FaDonate className="me-2" /> Donate</>}
              id="donateDropdown"
              className="fs-5"
            >
              <NavDropdown.Item as={Link} to="/donate-now">
                <FaDonate className="me-2" /> Donate Now
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/scholarships">
                <FaDonate className="me-2" /> Scholarships
              </NavDropdown.Item>
            </NavDropdown> */}
          </Nav>

          <div className="d-flex align-items-center me-3">
            <Nav.Link as={Link} to="/profile" className="me-3 text-white">
              <FaUserAlt size={28} />
            </Nav.Link>
            <Button variant="danger" style={buttonStyle}>LOG OUT</Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
