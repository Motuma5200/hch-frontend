import React, { useState } from 'react';
import { Container, Row, Col, Tabs, Tab, Card, Alert } from 'react-bootstrap'; 
import HealthDataInput from '../components/health/HealthDataInput';
import SymptomInput from '../components/health/SymptomInput';
import HealthStatusDashboard from '../components/health/HealthStatusDashboard';
import HealthCharts from '../components/health/HealthCharts';
import HealthHistory from '../components/health/HealthHistory';

const UserDashboard = () => {
  // Key to force child components to refresh when data is recorded
  const [refreshToggle, setRefreshToggle] = useState(0);

  const handleRefresh = () => {
    setRefreshToggle(prev => prev + 1);
  };

  return (
    <Container className="mt-4">
      <div className="mb-4">
        <h2 className="fw-bold">Health Dashboard</h2>
        <p className="text-muted">Monitor and track your health metrics and symptoms</p>
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
    </Container>
  );
};

export default UserDashboard;