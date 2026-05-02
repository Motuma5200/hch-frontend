import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import DoctorChat from './DoctorChat';

const DoctorDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const name = user.name || 'Doctor';
  const [hasNewClientMessage, setHasNewClientMessage] = useState(false);

  useEffect(() => {
    const updateFlag = () => {
      setHasNewClientMessage(!!localStorage.getItem('doctor_has_new_client_message'));
    };

    updateFlag();
    window.addEventListener('storage', updateFlag);
    window.addEventListener('doctorNewClientMessageUpdate', updateFlag);

    return () => {
      window.removeEventListener('storage', updateFlag);
      window.removeEventListener('doctorNewClientMessageUpdate', updateFlag);
    };
  }, []);

  return (
    <Container style={{ paddingTop: '90px', paddingBottom: '40px' }}>
      <Row className="justify-content-center">
        <Col lg={10}>
          <h2 className="mb-3">Welcome, Dr. {name}</h2>

          <Card className="shadow-sm mb-4">
            <Card.Body>
              
              <p className="text-muted">Use the chat below to communicate with your patients on this page.</p>
              <DoctorChat />
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Tips</h5>
              <ul className="mb-0">
                <li>New messages will appear in the chat list immediately.</li>
                <li>Select a patient to view their full conversation.</li>
                <li>All messages are stored on the server, so you can refresh safely.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorDashboard;
