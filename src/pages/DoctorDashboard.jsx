import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DoctorChat from './DoctorChat';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  
  // BACKEND FUNCTIONALITY PRESERVATION
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

  // DASHBOARD NAV STATE
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px' }}>
      <Container>
        
        {/* Profile Header Block */}
        <div className="bg-white rounded-4 shadow-sm p-4 mb-4 border-start border-primary border-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
            
            {/* CLICKABLE PROFILE AVATAR ICON */}
            <div 
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm fw-bold border border-2 border-white flex-shrink-0 mx-auto mx-sm-0"
              style={{ 
                width: '75px', 
                height: '75px', 
                fontSize: '1.8rem',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onClick={() => navigate('/doctor-profile')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Click to manage profile settings"
            >
              {name.charAt(0).toUpperCase()}
            </div>

            {/* DYNAMIC PROFILE DETAILS UNDER THE NAME */}
            <div className="text-center text-sm-start">
              <h3 className="fw-bold mb-0 text-dark">Welcome, Dr. {name}</h3>
              <p className="text-primary small fw-semibold mb-1">
                <i className="bi bi-mdi bi-person-badge me-1"></i>
                {user?.specialization || 'General Practitioner'}
              </p>
              <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-2 small text-muted">
                <span><i className="bi bi-envelope-fill me-1"></i>{user?.email || 'doctor@healthhub.com'}</span>
                <span className="text-secondary d-none d-sm-inline">•</span>
                <Badge bg="info" className="text-dark text-capitalize px-2 py-1 rounded-pill fw-semibold">
                  Role: {user?.role || 'doctor'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="d-flex align-items-center justify-content-center flex-shrink-0">
            {hasNewClientMessage && (
              <Badge bg="danger" className="p-2 animate-pulse">
                New Message Received
              </Badge>
            )}
          </div>
        </div>

        {/* Navigation & Tab Content Layout */}
        <Row className="g-4">
          {/* LEFT SIDEBAR: Nav Controls */}
          <Col lg={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3">
              <Nav variant="pills" className="flex-column gap-1" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav.Item>
                  <Nav.Link eventKey="overview" className="rounded-3 py-2.5 fw-medium d-flex align-items-center gap-2">
                    <i className="bi bi-grid-1x2-fill"></i> Account Overview
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="chat" className="rounded-3 py-2.5 fw-medium d-flex align-items-center justify-content-between">
                    <span className="d-flex align-items-center gap-2">
                      <i className="bi bi-chat-left-text-fill text-primary"></i> Patient Communications
                    </span>
                    {hasNewClientMessage && <Badge bg="danger" pill>New</Badge>}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card>
          </Col>

          {/* RIGHT SIDEBAR: Active Panels */}
          <Col lg={9}>
            {activeTab === 'overview' && (
              <Card className="border-0 shadow-sm rounded-4 p-4">
                <h4 className="fw-bold text-dark mb-4">Account Status Dashboard</h4>
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <div className="p-3 border rounded-3 bg-light">
                      <h6 className="fw-bold text-secondary mb-1">Profile Visibility Status</h6>
                      <p className="text-success small mb-0 fw-semibold">● Live and Accepting Patients</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 border rounded-3 bg-light">
                      <h6 className="fw-bold text-secondary mb-1">Verification Badge</h6>
                      <p className="text-primary small mb-0 fw-semibold"><i className="bi bi-patch-check-fill me-1"></i> Medical License Confirmed</p>
                    </div>
                  </Col>
                </Row>
                
                <h5 className="fw-bold text-dark mb-3">Recent Active Schedules</h5>
                <Table responsive hover className="align-middle small">
                  <thead className="table-light">
                    <tr>
                      <th>Patient Name</th>
                      <th>Type</th>
                      <th>Scheduled Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">John Doe</td>
                      <td><span className="badge bg-primary-subtle text-primary">Video Call</span></td>
                      <td>Tomorrow, 10:00 AM</td>
                      <td><span className="badge bg-warning text-dark">Confirmed</span></td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Sarah Jenkins</td>
                      <td><span className="badge bg-success-subtle text-success">Secure Text</span></td>
                      <td>Continuous Chat Channel</td>
                      <td><span className="badge bg-success">Active</span></td>
                    </tr>
                  </tbody>
                </Table>
              </Card>
            )}

            {activeTab === 'chat' && (
              <div className="d-flex flex-column gap-4">
                <Card className="shadow-sm border-0 rounded-4 p-4">
                  <Card.Body className="p-0">
                    <h4 className="fw-bold text-dark mb-2">Patient Communications Inbox</h4>
                    <p className="text-muted small mb-4">Use the workspace chat platform below to select patients from your client roster and respond to message queries.</p>
                    <DoctorChat />
                  </Card.Body>
                </Card>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DoctorDashboard;