import React from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ paddingTop: '90px' }}>
      <h2>Client Dashboard</h2>
      <p>Welcome to your health dashboard. Here you can manage your health data and communicate with your doctor.</p>

      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Contact Your Doctor</Card.Title>
              <Card.Text>
                Chat with your doctor about your health issues and get personalized advice.
              </Card.Text>
              <Button variant="primary" onClick={() => navigate('/contact-doctor')}>
                Start Chat
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Health Records</Card.Title>
              <Card.Text>
                View your health history and current status.
              </Card.Text>
              <Button variant="secondary" disabled>
                Coming Soon
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClientDashboard;
