import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-auto">
      <Container>
        <Row className="gy-4">
          {/* Brand and Mission */}
          <Col lg={4} md={12}>
            <h4 className="fw-bold text-primary mb-3">OroHealth Hub</h4>
            <p className="text-muted" style={{ maxWidth: '300px' }}>
              Your trusted partner in health education and medical insights. 
              Providing verified data from global health organizations.
            </p>
          </Col>

          {/* Quick Links */}
          <Col lg={2} md={4} xs={6}>
            <h6 className="text-uppercase fw-bold mb-3">Resources</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/learn" className="text-muted text-decoration-none hover-link">Health Library</Link>
              </li>
              <li className="mb-2">
                <Link to="/hospitals" className="text-muted text-decoration-none hover-link">Hospital Map</Link>
              </li>
              <li className="mb-2">
                <Link to="/checkup" className="text-muted text-decoration-none hover-link">Checkup Tools</Link>
              </li>
            </ul>
          </Col>

          {/* Support Links */}
          <Col lg={2} md={4} xs={6}>
            <h6 className="text-uppercase fw-bold mb-3">Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/about" className="text-muted text-decoration-none hover-link">About Us</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-muted text-decoration-none hover-link">Contact</Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy" className="text-muted text-decoration-none hover-link">Privacy Policy</Link>
              </li>
            </ul>
          </Col>

          {/* Newsletter Signup */}
          <Col lg={4} md={4}>
            <h6 className="text-uppercase fw-bold mb-3">Stay Updated</h6>
            <p className="text-muted small">Get the latest health tips delivered to your inbox.</p>
            <Form className="d-flex gap-2">
              <Form.Control
                type="email"
                placeholder="Email address"
                className="bg-secondary border-0 text-white placeholder-light"
              />
              <Button variant="primary">Join</Button>
            </Form>
          </Col>
        </Row>

        <hr className="my-4 border-secondary" />

        {/* Copyright and Socials */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center">
          <p className="mb-0 text-muted small">
            &copy; {new Date().getFullYear()} OroTrader Health Check Hub. All rights reserved.
          </p>
          <div className="d-flex gap-3 mt-3 mt-sm-0">
            <a href="#youtube" className="text-muted fs-5"><i className="bi bi-youtube"></i></a>
            <a href="#twitter" className="text-muted fs-5"><i className="bi bi-twitter"></i></a>
            <a href="#github" className="text-muted fs-5"><i className="bi bi-github"></i></a>
          </div>
        </div>
      </Container>

      {/* Basic Hover Effect CSS */}
      <style>{`
        .hover-link:hover {
          color: #0d6efd !important;
          transition: 0.3s;
        }
        .placeholder-light::placeholder {
          color: #adb5bd;
          opacity: 0.7;
        }
      `}</style>
    </footer>
  );
};

export default Footer;