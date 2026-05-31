import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { getDoctors } from '../services/Api';
import { useNavigate } from 'react-router-dom';
// Imported your heart image asset to use for the medical avatars
import doctorAvatar from '../assets/doctor.jpg'; 

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getDoctors();
        setDoctors(response.data);
      } catch (err) {
        setError('Failed to load doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleChatWithDoctor = (doctor) => {
    navigate(`/chat/doctor/${doctor.id}`);
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading doctors...</p>
      </Container>
    );
  }

  return (
    <Container style={{ paddingTop: '90px', paddingBottom: '40px' }}>
      <h2 className="mb-2 text-center fw-bold text-primary">Our Certified Medical Specialists</h2>
      
      {/* Added brief introduction paragraph describing the doctor network */}
      <p className="text-center text-secondary mx-auto mb-4" style={{ maxWidth: '650px', fontSize: '1.05rem', lineHeight: '1.6' }}>
        Connect directly with our network of verified health professionals. Our dedicated physicians and specialists are available online to provide personal consultations, answer medical queries, and guide you smoothly through your health journey.
      </p>
      
      <p className="text-center text-muted mb-5 small">Select a specialist below to open a private message window</p>

      {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

      <Row>
        {doctors.map((doctor) => (
          <Col md={6} lg={4} key={doctor.id} className="mb-4">
            <Card className="h-100 shadow-sm border-0 rounded-4 transition-card">
              <Card.Body className="text-center p-4 d-flex flex-column justify-content-between">
                <div>
                  <div 
                    className="mx-auto mb-3 rounded-circle overflow-hidden d-flex align-items-center justify-content-center bg-light"
                    style={{ width: '80px', height: '80px', border: '2px solid #dee2e6' }}
                  >
                    <img 
                      src={doctorAvatar} 
                      alt="Doctor Avatar" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  </div>

                  <Card.Title className="fw-bold mb-1">Dr. {doctor.name}</Card.Title>
                  <Card.Subtitle className="text-primary fw-medium small mb-3">
                    {doctor.specialization || 'General Practitioner'}
                  </Card.Subtitle>

                  {/* ADDED: About paragraph section for each individual doctor */}
                  <Card.Text className="text-muted small mb-4 px-2" style={{ lineHeight: '1.5' }}>
                    {doctor.bio || doctor.about || `Experienced specialist committed to providing exceptional care.`}
                  </Card.Text>
                </div>

                <Button 
                  variant="primary" 
                  className="w-100 py-2 fw-semibold rounded-3 shadow-sm mt-auto"
                  onClick={() => handleChatWithDoctor(doctor)}
                >
                  Chat with Doctor
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {doctors.length === 0 && (
        <Alert variant="info" className="text-center rounded-3 shadow-sm">
          No doctors available at the moment.
        </Alert>
      )}
    </Container>
  );
};

export default DoctorsList;