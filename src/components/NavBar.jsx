import React from 'react';
import { Nav, Navbar, Container, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload(); // Ensures the navbar updates immediately
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-white">Health Hub</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto gap-3">
            <Nav.Link as={NavLink} to="/" className="fs-5 text-white">Home</Nav.Link>
            <Nav.Link as={NavLink} to="/learn" className="fs-5 text-white">Learn</Nav.Link>
            <Nav.Link as={NavLink} to="/about" className="fs-5 text-white">About</Nav.Link>
            {token && <Nav.Link as={NavLink} to="/" className="fs-5 text-white">Dashboard</Nav.Link>}
          </Nav>
          <Nav>
            {token ? (
              <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Nav.Link as={Link} to="/login" className="fs-5 text-white">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
