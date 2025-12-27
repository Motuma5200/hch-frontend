import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';

const SymptomInput = () => {
  const [formData, setFormData] = useState({
    symptom: '',
    description: '',
    severity: 'mild',
    recorded_at: new Date().toISOString().slice(0, 16)
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });

  const commonSymptoms = [
    'Headache', 'Fever', 'Cough', 'Fatigue', 'Dizziness',
    'Nausea', 'Chest Pain', 'Shortness of Breath', 'Joint Pain',
    'Abdominal Pain', 'Back Pain', 'Sore Throat'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/health/symptoms/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

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
      setMessage({ type: 'danger', text: 'Error recording symptom: ' + error.message });
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5>Record Symptom</h5>
      </Card.Header>
      <Card.Body>
        {message.text && (
          <Alert variant={message.type}>{message.text}</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Symptom *</Form.Label>
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
                <Form.Label>Severity *</Form.Label>
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
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your symptoms in detail..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>When did it start? *</Form.Label>
            <Form.Control
              type="datetime-local"
              value={formData.recorded_at}
              onChange={(e) => setFormData({...formData, recorded_at: e.target.value})}
              required
            />
          </Form.Group>

          <Button type="submit" variant="warning" size="lg">
            Record Symptom
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SymptomInput;