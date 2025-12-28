import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Badge, Spinner, Alert, Button } from 'react-bootstrap';

const HealthStatusDashboard = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealthStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // FIXED: Synchronized with 'token'
      const token = localStorage.getItem('token');
      
      if (!token) throw new Error('No token found. Please login.');
      
      const response = await fetch('http://localhost:8000/api/health/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setStatus(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthStatus();
  }, [fetchHealthStatus]);

  if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
  if (error) return (
    <Alert variant="danger" className="m-3">
      {error} <Button size="sm" onClick={fetchHealthStatus} className="ms-2">Retry</Button>
    </Alert>
  );

  return (
    <div className="p-3">
      <h4 className="mb-4 fw-bold">Your Health Status</h4>
      <Row>
        {status?.metrics_status && Object.entries(status.metrics_status).map(([metric, data]) => (
          <Col md={4} key={metric} className="mb-3">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="text-muted fw-bold mb-0">{metric.replace('_', ' ').toUpperCase()}</h6>
                    <Badge bg={data.status === 'normal' ? 'success' : 'info'}>{data.status}</Badge>
                </div>
                <h3 className="fw-bold mb-1">
                  {data.value} <small className="text-muted fs-6 fw-normal">{data.unit}</small>
                </h3>
                <div className="text-secondary small mt-3 border-top pt-2">
                  Last Recorded: {new Date(data.recorded_at).toLocaleDateString()}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {(!status?.metrics_status || Object.keys(status.metrics_status).length === 0) && (
        <Alert variant="info" className="mt-3">No data recorded yet. Use the "Record Data" tab to start.</Alert>
      )}
    </div>
  );
};

export default HealthStatusDashboard;