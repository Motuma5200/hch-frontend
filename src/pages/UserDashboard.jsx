import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, Card, Alert, Button, Badge } from 'react-bootstrap';
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
    // If not logged in, send to login
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Keep users on this unified Dashboard; rendering below decides what to show per role
  }, []);

  // Key to force child components to refresh when data is recorded
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
      {/* Role-specific rendering: admin/doctor/pharmacy/client */}
      {user && user.role === 'admin' && (
        <AdminDashboard />
      )}

      {user && user.role === 'doctor' && (
        user.approved ? <DoctorDashboard /> : <Alert variant="warning">Your account is pending admin approval. You will be able to access your dashboard once approved.</Alert>
      )}

      {user && user.role === 'pharmacy_admin' && (
        user.approved ? <PharmacyAdminDashboard /> : <Alert variant="warning">Your account is pending admin approval. You will be able to access your dashboard once approved.</Alert>
      )}

      {(!user || user.role === 'client') && (
        <>
          <div className="mb-4 d-flex justify-content-between align-items-center" style={{ paddingTop: '90px' }}>
            <div>
              <h2 className="fw-bold">Health Dashboard</h2>
              <p className="text-muted">Monitor and track your health metrics and symptoms</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                clearDoctorNotification();
                navigate('/contact-doctor');
              }}
            >
              Contact Doctor
              {hasNewDoctorMessage && (
                <Badge bg="danger" pill className="ms-2">
                  New
                </Badge>
              )}
            </Button>
          </div>
          

          <Tabs defaultActiveKey="status" id="dashboard-tabs" className="mb-4">
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