import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';

import api from '../../services/Api'

const SymptomInput = () => {
  const [formData, setFormData] = useState({
    symptom: '',
    description: '',
    severity: 'mild',
    recorded_at: new Date().toISOString().slice(0, 16)
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const commonSymptoms = [
    'Headache', 'Fever', 'Cough', 'Fatigue', 'Dizziness',
    'Nausea', 'Chest Pain', 'Shortness of Breath', 'Joint Pain',
    'Abdominal Pain', 'Back Pain', 'Sore Throat'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // ✅ FIXED: Replaced raw fetch with api.post. 
      // This will automatically route the request to your Wi-Fi network host and attach your token.
      const response = await api.post('/api/health/symptoms/record', formData);

      // Axios unpacks JSON directly into .data
      const data = response.data;

      if (data.success) {
        setMessage({ type: 'success', text: 'Symptom recorded successfully!' });
        setFormData({
          symptom: '',
          description: '',
          severity: 'mild',
          recorded_at: new Date().toISOString().slice(0, 16)
        });
      } else {
        setMessage({ type: 'danger', text: data.message || 'Failed to record symptom' });
      }
    } catch (error) {
      console.error('Symptom recording error:', error);
      // Grabs validation or application failures from Laravel if accessible
      const msg = error.response?.data?.message || error.message || 'Error recording symptom.';
      setMessage({ type: 'danger', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-warning text-dark py-3">
        <h5 className="mb-0 fw-bold">Record Symptom</h5>
      </Card.Header>
      <Card.Body>
        {message.text && (
          <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
            {message.text}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small">Symptom *</Form.Label>
                <Form.Select 
                  value={formData.symptom}
                  onChange={(e) => setFormData({...formData, symptom: e.target.value})}
                  required
                >
                  <option value="">Select Symptom</option>
                  {commonSymptoms.map(symptom => (
                    <option key={symptom} value={symptom}>{symptom}</option>
                  ))}
                  <option value="other">Other (specify in description)</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small">Severity *</Form.Label>
                <Form.Select 
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  required
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold small">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your symptoms in detail..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold small">When did it start? *</Form.Label>
            <Form.Control
              type="datetime-local"
              value={formData.recorded_at}
              onChange={(e) => setFormData({...formData, recorded_at: e.target.value})}
              required
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button type="submit" variant="warning" size="lg" disabled={loading}>
              {loading ? (
                <><Spinner animation="border" size="sm" className="me-2" /> Saving...</>
              ) : (
                'Record Symptom'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SymptomInput;