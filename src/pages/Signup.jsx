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
      if (role === 'pharmacy_admin' && !hospitalId) {
        setError('Please select the hospital/clinic for this pharmacy admin account.');
        setLoading(false);
        return;
      }
      let response;

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
    /* Added bg-light utility class to the full viewport width container to elevate the white card */
    <Container fluid className="d-flex align-items-center justify-content-center bg-light" style={{ minHeight: '100vh', paddingTop: '40px' }}>
      
      {/* Embedded focused styling rules securely inside the page scope */}
      <style>{`
        .custom-form-input {
          border-bottom: 3px solid #0d6efd !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .custom-form-input:focus {
          border-color: #0d6efd !important;
          box-shadow: 0 4px 10px -2px rgba(13, 110, 253, 0.25) !important;
          transform: translateY(-1px);
        }
        .custom-select-field, .custom-file-field {
          border: 1px solid #dee2e6 !important;
          border-bottom: 3px solid #6c757d !important;
          border-radius: 6px !important;
        }
        .custom-select-field:focus, .custom-file-field:focus {
          border-color: #0d6efd !important;
          border-bottom-color: #0d6efd !important;
          box-shadow: 0 4px 10px -2px rgba(13, 110, 253, 0.2) !important;
        }
      `}</style>

      <Card style={{ width: '500px',}} className="shadow border-0 rounded-4 bg-white">
        <Card.Body className="pt-0 pb-4 px-4 pb-md-5 px-md-5">
          <h3 className="text-center mb-4 fw-bold text-primary pt-2" style={{ letterSpacing: '0.5px' }}>Create Account</h3>

          {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

          <Form onSubmit={handleSignup}>
            <Form.Group className="mb-4">
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your full name"
                className="custom-form-input py-2 px-3"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your email address"
                className="custom-form-input py-2 px-3"
              />
            </Form.Group>

            <Form.Group className="mb-4">
            <Form.Label className="small fw-semibold text-secondary">Create Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="custom-form-input py-2 px-3"
              />
            </Form.Group>

            <Form.Group className="mb-4">
            <Form.Label className="small fw-semibold text-secondary">Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                disabled={loading}
                className="custom-form-input py-2 px-3"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-semibold text-secondary">Account Assignment / Role</Form.Label>
              <Form.Select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                disabled={loading}
                className="custom-select-field py-2 px-3"
              >
                <option value="client">Client / Patient</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacy_admin">Pharmacy Admin</option>
              </Form.Select>
            </Form.Group>

            {role === 'pharmacy_admin' && (
              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold text-secondary">Hospital / Clinic Location</Form.Label>
                <Form.Select 
                  value={hospitalId} 
                  onChange={(e) => setHospitalId(e.target.value)} 
                  disabled={loading} 
                  required
                  className="custom-select-field py-2 px-3"
                >
                  <option value="">-- Select hospital / clinic --</option>
                  {hospitals.length === 0 && <option value="" disabled>Loading hospitals...</option>}
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}{h.city ? ` — ${h.city}` : ''}{h.state ? `, ${h.state}` : ''}</option>
                  ))}
                </Form.Select>
                {hospitals.length === 0 && <Form.Text className="text-muted d-block mt-1">No hospitals available — ask admin to register one first.</Form.Text>}
              </Form.Group>
            )}

            {(role === 'doctor' || role === 'pharmacy_admin') && (
              <>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold text-secondary">Upload Verification ID / License</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setIdFile(e.target.files[0] || null)}
                    disabled={loading}
                    className="custom-file-field py-2"
                  />
                  <Form.Text className="text-muted d-block mt-1">Please upload an ID or license verification snapshot (image or PDF format) for regulatory admin evaluation.</Form.Text>
                </Form.Group>

                <Alert variant="info" className="small border-0 rounded-3 mb-4">Accounts for this role require validation review before platform access is cleared.</Alert>
              </>
            )}

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-25 mt-2 fw-bold shadow-sm rounded-3"
              disabled={loading}
              style={{ transition: 'all 0.2s' }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
            
            <div className="text-center mt-4 small text-secondary">
              Already have an account? <Button variant="link" className="p-0 ms-1 text-decoration-none fw-semibold alignment-baseline" onClick={() => navigate('/login')}>Log in</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Signup;