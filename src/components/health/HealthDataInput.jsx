import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';

import api from '../../services/Api'

const HealthDataInput = ({ onRecordAdded }) => {
  const [formData, setFormData] = useState({
    metric_type: '',
    value: '',
    unit: '',
    additional_data: {},
    recorded_at: new Date().toISOString().slice(0, 16)
  });
  
  const [showBloodPressure, setShowBloodPressure] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleMetricTypeChange = (e) => {
    const type = e.target.value;
    setFormData({
      ...formData,
      metric_type: type,
      unit: getDefaultUnit(type),
      additional_data: {}
    });
    setShowBloodPressure(type === 'blood_pressure');
  };

  const getDefaultUnit = (type) => {
    const units = {
      blood_pressure: 'mmHg',
      blood_sugar: 'mg/dL',
      weight: 'kg',
      temperature: '°C',
      bmi: 'kg/m²',
      heart_rate: 'bpm'
    };
    return units[type] || '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = { ...formData };

      if (formData.metric_type === 'blood_pressure') {
        const systolic = parseFloat(formData.additional_data.systolic);
        const diastolic = parseFloat(formData.additional_data.diastolic);
        
        payload.value = systolic; 
        payload.additional_data = {
            systolic: systolic,
            diastolic: diastolic
        };
      } else {
        payload.value = parseFloat(formData.value);
      }
      
      // ✅ FIXED: Using api.post ensures your CSRF interceptor fires and requests hit your Wi-Fi network host address 
      const response = await api.post('/api/health/metrics/record', payload);

      // Axios returns the server response body directly inside .data
      const data = response.data;

      if (data.success) {
        setMessage({ type: 'success', text: 'Health data recorded successfully!' });
        setFormData({
          metric_type: '',
          value: '',
          unit: '',
          additional_data: {},
          recorded_at: new Date().toISOString().slice(0, 16)
        });
        setShowBloodPressure(false);
        if (onRecordAdded) onRecordAdded();
      } else {
        setMessage({ type: 'danger', text: data.message || 'Failed to record data' });
      }
    } catch (error) {
      console.error('Data submission error:', error);
      // Extracts validation errors or messages directly from Laravel if available
      const msg = error.response?.data?.message || error.message || 'An error occurred while saving your data.';
      setMessage({ type: 'danger', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (e) => {
    setFormData({...formData, value: e.target.value});
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Record Health Data</h5>
      </Card.Header>
      <Card.Body>
        {message.text && (
          <Alert variant={message.type} dismissible onClose={() => setMessage({type:'', text:''})}>
            {message.text}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Metric Type *</Form.Label>
                <Form.Select 
                  value={formData.metric_type}
                  onChange={handleMetricTypeChange}
                  required
                >
                  <option value="">Select Metric Type</option>
                  <option value="blood_pressure">Blood Pressure</option>
                  <option value="blood_sugar">Blood Sugar</option>
                  <option value="weight">Weight</option>
                  <option value="temperature">Body Temperature</option>
                  <option value="bmi">BMI</option>
                  <option value="heart_rate">Heart Rate</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Recorded At *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={formData.recorded_at}
                  onChange={(e) => setFormData({...formData, recorded_at: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {showBloodPressure ? (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Systolic (Upper) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.additional_data.systolic || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      additional_data: { ...formData.additional_data, systolic: e.target.value }
                    })}
                    placeholder="120"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Diastolic (Lower) *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.additional_data.diastolic || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      additional_data: { ...formData.additional_data, diastolic: e.target.value }
                    })}
                    placeholder="80"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          ) : (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Value *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formData.value}
                    onChange={handleValueChange}
                    placeholder={formData.unit ? `Enter value in ${formData.unit}` : 'Enter value'}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="e.g., mmHg, kg"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          )}

          <div className="d-grid gap-2">
            <Button type="submit" variant="primary" size="lg" disabled={loading}>
              {loading ? (
                <><Spinner animation="border" size="sm" /> Recording...</>
              ) : (
                'Record Health Data'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default HealthDataInput;