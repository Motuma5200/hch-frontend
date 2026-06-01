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
    <Container className="mt-4">
      {user && user.role === 'admin' && <AdminDashboard />}

      {user && user.role === 'doctor' && (
        user.approved ? <DoctorDashboard /> : <Alert variant="warning">Your account is pending admin approval.</Alert>
      )}

      {user && user.role === 'pharmacy_admin' && (
        user.approved ? <PharmacyAdminDashboard /> : <Alert variant="warning">Your account is pending admin approval.</Alert>
      )}

      {(!user || user.role === 'client') && (
        <>
          {/* HEADER ROW WITH TOP-RIGHT CORNER PROFILE AVATAR & INBOX */}
          <div className="mb-4 d-flex justify-content-between align-items-center" style={{ paddingTop: '90px' }}>
            <div>
              <h2 className="fw-bold m-0">Health Dashboard</h2>
              <p className="text-muted m-0">Monitor and track your health metrics and symptoms</p>
            </div>
            
            {/* CORNER QUICK ACTIONS: LOOKUP, INBOX, AND PROFILE */}
            <div className="d-flex align-items-center gap-3">
              
              {/* Action A: Browse Directory */}
              <Button
                variant="outline-primary"
                className="fw-semibold px-3 shadow-xs d-flex align-items-center rounded-3"
                onClick={() => navigate('/contact-doctor')}
              >
                <i className="bi bi-search me-2"></i>
                Find a Doctor
              </Button>

              {/* Action B: Professional Dedicated Message Center Icon */}
              <div 
                className="position-relative d-flex align-items-center justify-content-center bg-white border rounded-3 shadow-xs"
                style={{ width: '42px', height: '42px', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => {
                  clearDoctorNotification();
                  navigate('/messages/inbox'); // Leads directly to the active threads index view
                }}
                title="Open Message Inbox"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--bs-primary)';
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#dee2e6';
                  e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                <i className={`bi ${hasNewDoctorMessage ? 'bi-envelope-open-fill text-danger' : 'bi-envelope-fill text-secondary'}`} style={{ fontSize: '1.25rem' }}></i>
                
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

              {/* Action C: Interactive Profile Circle */}
              <div 
                className="rounded-circle border border-2 border-primary bg-secondary text-white d-flex align-items-center justify-content-center shadow-sm fw-bold"
                style={{ width: '42px', height: '42px', cursor: 'pointer', transition: 'transform 0.15s', fontSize: '1.1rem' }}
                onClick={() => navigate('/profile')}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
              <Row>
                <Col lg={6} className="mb-4">
                  <HealthDataInput onRecordAdded={handleRefresh} />
                </Col>
                <Col lg={6} className="mb-4">
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