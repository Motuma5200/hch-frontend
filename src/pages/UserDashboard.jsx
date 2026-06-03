import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, Alert, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; 
import HealthDataInput from '../components/health/HealthDataInput';
import SymptomInput from '../components/health/SymptomInput';
import HealthStatusDashboard from '../components/health/HealthStatusDashboard';
import HealthCharts from '../components/health/HealthCharts';
import HealthHistory from '../components/health/HealthHistory';
import DoctorDashboard from './DoctorDashboard';
import PharmacyAdminDashboard from './PharmacyAdminDashboard';
import ClientDashboard from './ClientDashboard';
import AdminDashboard from './AdminDashboard';

const UserDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
  }, []);

  const [refreshToggle, setRefreshToggle] = useState(0);
  const [hasNewDoctorMessage, setHasNewDoctorMessage] = useState(false);

  useEffect(() => {
    const updateFlag = () => {
      setHasNewDoctorMessage(!!localStorage.getItem('client_has_new_doctor_message'));
    };

    updateFlag();
    window.addEventListener('storage', updateFlag);
    window.addEventListener('doctorMessageUpdate', updateFlag);
    return () => {
      window.removeEventListener('storage', updateFlag);
      window.removeEventListener('doctorMessageUpdate', updateFlag);
    };
  }, []);

  const clearDoctorNotification = () => {
    localStorage.removeItem('client_has_new_doctor_message');
    window.dispatchEvent(new CustomEvent('doctorMessageUpdate'));
  };

  const handleRefresh = () => {
    setRefreshToggle(prev => prev + 1);
  };

  return (
    /* 🌟 FLUID CONTAINER WITH ZERO SIDE PADDING EXTENDS LAYOUT TO BOTH EDGES */
    <Container fluid className="px-0 mt-4">
      {user && user.role === 'admin' && <AdminDashboard />}

      {user && user.role === 'doctor' && (
        user.approved ? <DoctorDashboard /> : <Alert variant="warning">Your account is pending admin approval.</Alert>
      )}

      {user && user.role === 'pharmacy_admin' && (
        user.approved ? <PharmacyAdminDashboard /> : <Alert variant="warning">Your account is pending admin approval.</Alert>
      )}

      {(!user || user.role === 'client') && (
        <>
          {/* 🌟 ENTERPRISE CLINICAL HEADER PANEL (Far Left Title & Far Right Balanced Profile Controls) */}
          <div 
            className="mb-5 d-flex justify-content-between align-items-center p-4 bg-white border border-light rounded-4 shadow-sm" 
            style={{ 
              paddingTop: '24px', 
              marginTop: '90px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02)'
            }}
          >
            {/* FAR LEFT: Clinical Scope Text Title */}
            <div className="text-start">
              <h3 className="fw-extrabold m-0 text-dark tracking-tight" style={{ fontWeight: 800, color: '#0f172a' }}>
                Health Intelligence Portal
              </h3>
              <p className="text-muted m-0 small fw-medium mt-1">
                <i className="bi bi-shield-check text-success me-1"></i> Continuous Telemetry & Sync Active
              </p>
            </div>
            
            {/* FAR RIGHT: Executive Action Matrix & Premium Profile Link */}
            <div className="d-flex align-items-center gap-3">
              
              {/* Action A: Browse Directory */}
              <Button
                variant="outline-primary"
                className="fw-semibold px-3 py-2 shadow-xs d-flex align-items-center rounded-3 border-secondary-subtle text-secondary"
                style={{ fontSize: '0.9rem', backgroundColor: '#fff' }}
                onClick={() => navigate('/contact-doctor')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0284c7';
                  e.currentTarget.style.borderColor = '#0284c7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <i className="bi bi-search me-2"></i>
                Find a Doctor
              </Button>

              {/* Action B: Message Center Node */}
              <div 
                className="position-relative d-flex align-items-center justify-content-center bg-white border rounded-3 text-secondary"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s',
                  borderColor: '#e2e8f0'
                }}
                onClick={() => {
                  clearDoctorNotification();
                  navigate('/messages/inbox'); 
                }}
                title="Open Message Inbox"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0284c7';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.color = '#0284c7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <i className={`bi ${hasNewDoctorMessage ? 'bi-envelope-open-fill text-danger' : 'bi-envelope-fill'}`} style={{ fontSize: '1.15rem' }}></i>
                
                {hasNewDoctorMessage && (
                  <Badge 
                    bg="danger" 
                    pill 
                    className="position-absolute p-1 border border-white rounded-circle"
                    style={{ top: '-2px', right: '-2px', minWidth: '10px', minHeight: '10px' }}
                  >
                    <span className="visually-hidden">New Messages</span>
                  </Badge>
                )}
              </div>

              {/* Vertical Structural Separator Divider */}
              <div className="bg-light" style={{ width: '1px', height: '28px' }}></div>

              {/* Action C: Premium Clinical Profile Circle */}
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase"
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  cursor: 'pointer', 
                  fontSize: '1rem',
                  backgroundColor: '#e0f2fe',  /* Soft premium clinical blue background */
                  color: '#0369a1',            /* Highly visible sapphire slate text */
                  border: '2px solid #bae6fd', /* Structural border ring */
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => navigate('/profile')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.backgroundColor = '#0369a1';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#0369a1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = '#e0f2fe';
                  e.currentTarget.style.color = '#0369a1';
                  e.currentTarget.style.borderColor = '#bae6fd';
                }}
                title="View your Profile & Settings"
              >
                {(user?.name || 'V').charAt(0).toUpperCase()}
              </div>
              
            </div>
          </div>
          

          {/* CENTRAL CLEAN LIST TABS */}
          <Tabs defaultActiveKey="status" id="dashboard-tabs" className="mb-4 shadow-sm border-bottom-0 rounded-top-3 overflow-hidden bg-white">
            <Tab eventKey="status" title="Current Status">
              <HealthStatusDashboard key={`status-${refreshToggle}`} />
            </Tab>
            
            <Tab eventKey="record" title="Record Data">
              {/* Added gx-0 here to keep the internal recording grid flushed perfectly to the edge */}
              <Row className="gx-0">
                <Col lg={6} className="mb-4 pe-lg-3 text-start">
                  <HealthDataInput onRecordAdded={handleRefresh} />
                </Col>
                <Col lg={6} className="mb-4 ps-lg-3 text-start">
                  <SymptomInput onRecordAdded={handleRefresh} />
                </Col>
              </Row>
            </Tab>
            
            <Tab eventKey="trends" title="Health Trends">
              <HealthCharts key={`charts-${refreshToggle}`} />
            </Tab>
            
            <Tab eventKey="history" title="Data History">
              <HealthHistory key={`history-${refreshToggle}`} />
            </Tab>
          </Tabs>
        </>
      )}
    </Container>
  );
};

export default UserDashboard;

