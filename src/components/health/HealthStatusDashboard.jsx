import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// ✅ FIXED: Import your central authenticated configuration wrapper
import api from '../../services/Api'

const HealthStatusDashboard = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchHealthStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // ✅ FIXED: Replaced raw window fetch with your custom configured axios instance.
      // Your Api.js automatically reads the bearer token from localStorage and hits the right local IP.
      const response = await api.get('/api/health/status');
      
      const result = response.data;
      if (result.success) {
        setStatus(result.data);
      } else {
        setError(result.message || 'Failed to retrieve dashboard summaries.');
      }
    } catch (err) {
      console.error('Dashboard fetch crash:', err);
      // Extracts custom error message from Laravel if available, defaults to system connection error
      const msg = err.response?.data?.message || err.message || 'Connection to backend failed.';
      setError(msg);
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