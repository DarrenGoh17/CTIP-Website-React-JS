import React, { useContext } from 'react';
import { Container, Row, Col, Nav, Navbar as BootstrapNavbar, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../backend/AuthContext';
import logo from '../assets/logo.webp';

const Navbar = () => {
  const { isAuthenticated, logout, username, userRole } = useContext(AuthContext); // Add username and userRole to the context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home after logout
  };

  return (
    <BootstrapNavbar bg="light" expand="lg">
      <Container fluid style={{ boxShadow: "0 1px 8px rgba(0, 0, 0, 0.4)", paddingBottom: "20px", backgroundColor: "#faf5e9" }}>
        <Row className="w-100 align-items-center">
          <Col md={2}>
            <BootstrapNavbar.Brand href="#">
              <img className='logo' src={logo} alt="Logo" width="70" height="70" />
            </BootstrapNavbar.Brand>
          </Col>
          <Col md={7}>
            <Nav className="justify-content-center">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/discover">Discover</Nav.Link>
              <Nav.Link as={Link} to="/wildlife">Wildlife</Nav.Link>
              <Nav.Link as={Link} to="/events">Events</Nav.Link>
              <Nav.Link as={Link} to="/donationPage">Donation</Nav.Link>
              {/* Conditionally render the User Profile dropdown only if authenticated */}
              {isAuthenticated && (
                <NavDropdown title={username} id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  {userRole === 'admin' ? ( // Check if the user is an admin
                    <>
                      <NavDropdown.Item as={Link} to="/admin-dashboard">Admin Dashboard</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/tableau-dashboard">Tableau Dashboard</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/iot-dashboard">IoT Dashboard</NavDropdown.Item>
                    </>
                  ) : (
                    <>
                    <NavDropdown.Item as={Link} to="/voucher">Voucher</NavDropdown.Item>
                    </>
                    
                  )}
                </NavDropdown>
              )}
            </Nav>
          </Col>
          <Col md={3} className="text-end">
            <Nav>
              {/* Conditionally render the Login link if not authenticated */}
              {!isAuthenticated ? (
                <Nav.Link as={Link} to="/entry">
                  <i className="fas fa-user"></i> Login
                </Nav.Link>
              ) : (
                <Nav.Link onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </Nav.Link>
              )}
            </Nav>
          </Col>
        </Row>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
