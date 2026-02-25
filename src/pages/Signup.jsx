import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api, { register as apiRegister } from '../services/Api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('client');
  const [organisation, setOrganisation] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [hospitalId, setHospitalId] = useState('');
  const [idFile, setIdFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 useEffect(() => {
  let mounted = true;
  const fetchHospitals = async () => {
    try {
      const url = role === 'pharmacy_admin'
        ? '/api/hospitals?available_for_pharmacy_admin=1'
        : '/api/hospitals';
      const resp = await api.get(url);
      if (!mounted) return;
      setHospitals(resp.data || []);
    } catch (err) {
      console.error('Failed to load hospitals', err);
      if (mounted) setHospitals([]);
    }
  };
  fetchHospitals();
  return () => { mounted = false; };
}, [role]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // enforce hospital selection for pharmacy admin
      if (role === 'pharmacy_admin' && !hospitalId) {
        setError('Please select the hospital/clinic for this pharmacy admin account.');
        setLoading(false);
        return;
      }
      // Use axios instance which auto-fetches CSRF via interceptor
      let response;

      // If user uploaded an ID (or role requires it), send multipart/form-data
      if (idFile || role === 'doctor' || role === 'pharmacy_admin') {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('password_confirmation', passwordConfirmation);
        formData.append('role', role);
        if (organisation && role !== 'pharmacy_admin') formData.append('organisation', organisation);
        if (role === 'pharmacy_admin') formData.append('hospital_id', hospitalId);
        if (idFile) formData.append('id_document', idFile);

        response = await api.post('/api/register', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const payload = {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          role,
        };
        if (organisation && role !== 'pharmacy_admin') payload.organisation = organisation;
        if (role === 'pharmacy_admin') payload.hospital_id = hospitalId;

        response = await apiRegister(payload);
      }

      const result = response.data;
      // If backend returns created user, you can show message; normally backend will require approval for some roles
      navigate('/login');
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || 'Connection error. Is the backend running?';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh'
      ,paddingTop: '70px'  
     }}>
      <Card style={{ width: '400px' }} className="shadow-sm border-0">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4 fw-bold text-primary">Create Account</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSignup}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
                <option value="client">Client / Patient</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacy_admin">Pharmacy Admin</option>
              </Form.Select>
            </Form.Group>

            {role === 'pharmacy_admin' && (
              <Form.Group className="mb-3">
                <Form.Label>Hospital / Clinic</Form.Label>
                <Form.Select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} disabled={loading} required>
                  <option value="">-- Select hospital / clinic --</option>
                  {hospitals.length === 0 && <option value="" disabled>Loading hospitals...</option>}
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}{h.city ? ` — ${h.city}` : ''}{h.state ? `, ${h.state}` : ''}</option>
                  ))}
                </Form.Select>
                {hospitals.length === 0 && <Form.Text className="text-muted">No hospitals available — ask admin to register one first.</Form.Text>}
              </Form.Group>
            )}

            {(role === 'doctor' || role === 'pharmacy_admin') && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Upload ID / License</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setIdFile(e.target.files[0] || null)}
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">Please upload an ID or license (image or PDF) for admin approval.</Form.Text>
                </Form.Group>

                <Alert variant="info">Accounts for this role require admin approval before access is granted.</Alert>
              </>
            )}

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-bold"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
              <div className="text-center mt-3">
                Already have an account? <Button variant="link" onClick={() => navigate('/login')}>Log in</Button>
              </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Signup;