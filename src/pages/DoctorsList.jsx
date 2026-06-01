import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, InputGroup, Badge } from 'react-bootstrap';
import { getDoctors } from '../services/Api';
import { useNavigate } from 'react-router-dom';
// Imported your heart image asset to use for the medical avatars
import doctorAvatar from '../assets/doctor.jpg'; 

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real-time filtering and sorting panel configurations
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState('status'); // Options: status, feeAsc, feeDesc, experience
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getDoctors();
        
        // UPDATED: Read natively from doctor_profile_json payload array sent from backend columns
        const structuralData = response.data.map((doc) => {
          const profile = doc.doctor_profile_json || {};
          const credentials = profile.credentials || {};

          const extractedSpecialty = profile.specialization || 
                             doc.specialization || 
                             profile.specialty || 
                             doc.specialty || 
                                      'General Practitioner';
            return {
              id: doc.id,
              name: doc.name || 'Specialist Provider',
              email: doc.email,
              organisation: doc.organisation || credentials.hospital || 'Affiliated Hub Center',
              
              // Assigning our safely resolved specialty string value here
              specialization: extractedSpecialty,
              
              experienceYears: profile.experienceYears !== undefined ? parseInt(profile.experienceYears) : 5, 
              videoFee: profile.videoFee !== undefined ? parseFloat(profile.videoFee) : 75.00,
              isOnline: profile.isOnline === true, 
              supportsVideo: profile.supportsVideo !== false,
              supportsText: profile.supportsText !== false,
              bio: profile.bio || doc.bio || 'Certified specialist dedicated to providing exceptional patient healthcare outcomes.',
              languages: profile.languages || ['English'],
              insuranceProviders: profile.insuranceProviders || ['All Major Networks'],
              
              availability: profile.scheduleGrid 
                ? `Mon - Fri (${profile.scheduleGrid.morningStart} - ${profile.scheduleGrid.afternoonEnd})`
                : 'Mon - Fri (9 AM - 5 PM)',
              
              profileImage: doc.profileImage || null
            };
          });

       
        
        setDoctors(structuralData);
      } catch (err) {
        console.error(err);
        setError('Failed to load certified doctors array from data index.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleChatWithDoctor = (doctor) => {
    navigate(`/chat/doctor/${doctor.id}`);
  };

  // Extract unique specializations for the filter matrix dropdown
  const specializations = ['All', ...new Set(doctors.map(d => d.specialization))];

  // Dynamic Filtering AND Sorting Logic Pipeline
  const processedDoctors = doctors
    .filter((doctor) => {
      const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialization === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    })
    .sort((a, b) => {
      if (sortBy === 'status') {
        return (b.isOnline === a.isOnline) ? 0 : b.isOnline ? 1 : -1; // Bring online doctors to the top
      }
      if (sortBy === 'feeAsc') {
        return a.videoFee - b.videoFee;
      }
      if (sortBy === 'feeDesc') {
        return b.videoFee - a.videoFee;
      }
      if (sortBy === 'experience') {
        return b.experienceYears - a.experienceYears; // Deep clinical seniority first
      }
      return 0;
    });

  if (loading) {
    return (
      <Container className="mt-5 text-center" style={{ paddingTop: '120px' }}>
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-secondary fw-medium">Assembling our specialist roster...</p>
      </Container>
    );
  }

  return (
    <Container style={{ paddingTop: '90px', paddingBottom: '40px' }}>
      <h2 className="mb-2 text-center fw-bold text-primary">Our Certified Medical Specialists</h2>
      
      <p className="text-center text-secondary mx-auto mb-4" style={{ maxWidth: '650px', fontSize: '1.05rem', lineHeight: '1.6' }}>
        Connect directly with our network of verified health professionals. Our dedicated physicians and specialists are available online to provide personal consultations, answer medical queries, and guide you smoothly through your health journey.
      </p>
      
      <p className="text-center text-muted mb-5 small">Select a specialist below to open a private message window</p>

      {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

      {/* --- INTERACTIVE FILTERS & SORT PANEL --- */}
      <Card className="border-0 shadow-sm rounded-4 p-3 mb-5 bg-white">
        <Row className="g-3 align-items-center">
          <Col lg={5} md={12}>
            <InputGroup>
              <InputGroup.Text className="bg-light border-0 text-muted">
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control 
                type="text" 
                placeholder="Search physicians by name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-light border-0 py-2.5 rounded-end-3"
              />
            </InputGroup>
          </Col>
          <Col lg={4} md={6}>
            <Form.Select 
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-light border-0 py-2.5 rounded-3 fw-medium text-dark"
            >
              {specializations.map((spec, i) => (
                <option key={i} value={spec}>Department: {spec}</option>
              ))}
            </Form.Select>
          </Col>
          <Col lg={3} md={6}>
            <Form.Select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-light border-0 py-2.5 rounded-3 fw-medium text-dark"
            >
              <option value="status">Sort by: Availability</option>
              <option value="experience">Sort by: Seniority / Experience</option>
              <option value="feeAsc">Sort by: Consultation Fee (Low to High)</option>
              <option value="feeDesc">Sort by: Consultation Fee (High to Low)</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>

      <Row>
        {processedDoctors.map((doctor) => (
          <Col md={6} lg={4} key={doctor.id} className="mb-4">
            <Card className="h-100 shadow-sm border-0 rounded-4 transition-card d-flex flex-column position-relative border-top border-light border-3">
              
              <Card.Body className="p-4 d-flex flex-column justify-content-between h-100">
                <div>
                  
                  {/* REAL-TIME PRESENCE RADAR HUD & CONSULTATION MODALITY LABELS */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Badge 
                      bg={doctor.isOnline ? "success" : "secondary"} 
                      className={`bg-opacity-10 ${doctor.isOnline ? 'text-success border-success' : 'text-muted border-secondary'} border px-2.5 py-1 rounded-pill extra-small fw-semibold`}
                    >
                      <span 
                        className={`d-inline-block rounded-circle me-1 ${doctor.isOnline ? 'bg-success' : 'bg-secondary'}`} 
                        style={{ width: '6px', height: '6px', transform: 'translateY(-1px)' }}
                      ></span>
                      {doctor.isOnline ? "Available Now" : "Away"}
                    </Badge>

                    <div className="d-flex gap-2 text-muted small">
                      {doctor.supportsText && <i className="bi bi-chat-left-text-fill text-secondary" title="Secure Instant Messaging Active"></i>}
                      {doctor.supportsVideo && <i className="bi bi-camera-video-fill text-secondary" title="HD Video Consultations Active"></i>}
                    </div>
                  </div>

                  {/* Photo Avatar Engine Container */}
                  <div 
                    className="mx-auto mb-3 rounded-circle overflow-hidden d-flex align-items-center justify-content-center bg-light"
                    style={{ width: '85px', height: '85px', border: '3px solid #f4f6f9', outline: '1px solid #dee2e6' }}
                  >
                    <img 
                      src={doctor.profileImage || doctorAvatar} 
                      alt={`Dr. ${doctor.name}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>

                  <div className="text-center">
                    <Card.Title className="fw-bold mb-1 text-dark">Dr. {doctor.name}</Card.Title>
                    <Card.Subtitle className="text-primary fw-bold small mb-2 text-uppercase tracking-wide">
                      {doctor.specialization}
                    </Card.Subtitle>

                    {/* Languages Spoken Badges */}
                    <div className="d-flex justify-content-center flex-wrap gap-1 mb-3">
                      {doctor.languages.map((lang, idx) => (
                        <Badge key={idx} bg="light" className="text-secondary border rounded-1 extra-small fw-normal">
                          <i className="bi bi-translate text-muted me-1"></i>{lang}
                        </Badge>
                      ))}
                    </div>

                    {/* CLINICAL EXPERIENCE & BENCHMARK PRICING GRID METRICS ROW */}
                    <Row className="g-0 my-3 py-2 bg-light rounded-3 border-start border-primary border-3 text-center">
                      <Col xs={6} className="border-end">
                        <span className="extra-small text-secondary d-block fw-semibold mb-0.5">Experience</span>
                        <span className="text-dark fw-bold small"><i className="bi bi-award-fill text-primary me-0.5"></i> {doctor.experienceYears} Yrs</span>
                      </Col>
                      <Col xs={6}>
                        <span className="extra-small text-secondary d-block fw-semibold mb-0.5">Session Rate</span>
                        <span className="text-dark fw-bold small">${doctor.videoFee.toFixed(2)}</span>
                      </Col>
                    </Row>

                    {/* Weekly Booking Window Metrics */}
                    <div className="mb-3 text-muted small py-1 px-2 rounded-2 d-inline-block border bg-white w-100 text-truncate">
                      <span className="fw-semibold text-dark"><i className="bi bi-calendar-event text-secondary me-1"></i></span>
                      {doctor.availability}
                    </div>

                    {/* Profile Biography Narrative Snippet */}
                    <Card.Text className="text-muted small mb-3 px-1 text-start line-clamp-2" style={{ lineHeight: '1.5', minHeight: '36px' }}>
                      {doctor.bio}
                    </Card.Text>

                    {/* Accepted Insurance Networks Panel */}
                    <div className="text-start border-top pt-3 mb-4">
                      <span className="extra-small fw-bold text-secondary d-block mb-1.5 text-uppercase tracking-wider">Accepted Insurance</span>
                      <div className="d-flex flex-wrap gap-1 text-truncate" style={{ maxHeight: '26px', overflow: 'hidden' }}>
                        {doctor.insuranceProviders.map((provider, idx) => (
                          <span key={idx} className="bg-light text-dark border rounded-pill extra-small px-2 py-0.5 d-inline-block fw-medium">
                            {provider}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  variant={doctor.isOnline ? "primary" : "outline-primary"} 
                  className="w-100 py-2.5 fw-semibold rounded-3 shadow-sm mt-auto d-flex align-items-center justify-content-center gap-2"
                  onClick={() => handleChatWithDoctor(doctor)}
                >
                  <i className={doctor.isOnline ? "bi bi-chat-text-fill" : "bi bi-envelope-fill"}  /> 
                  {doctor.isOnline ? "Connect to Consultation" : "Leave Offline Message"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Fallback search matching guardrail */}
      {processedDoctors.length === 0 && (
        <Alert variant="info" className="text-center rounded-4 shadow-sm p-5 mt-4 border-0 bg-white">
          <i className="bi bi-shield-exclamation d-block fs-1 mb-2 text-primary"></i>
          <h5 className="fw-bold text-dark">No Specialists Match Your Request</h5>
          <p className="text-muted small mb-0 mx-auto" style={{ maxWidth: '400px' }}>
            We couldn't find any certified health professionals matching your filter queries. Try adjusting your filter categories or text search bar.
          </p>
        </Alert>
      )}
    </Container>
  );
};

export default DoctorsList;