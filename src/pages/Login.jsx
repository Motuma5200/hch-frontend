import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api, { login as apiLogin } from '../services/Api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Use axios wrapper which handles CSRF cookie via interceptor
      await api.post('/sanctum/csrf-cookie', {}, { withCredentials: true }).catch(() => null);
      const response = await apiLogin({ email, password });
      const result = response.data;

      // Persist token and user from backend response
      if (result.token) localStorage.setItem('token', result.token);
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        if (result.user.role) localStorage.setItem('role', result.user.role);
        // store approval flag
        localStorage.setItem('approved', result.user.approved ? '1' : '0');
      }

      // Redirect based on backend-provided role and approval
      const role = result.user?.role;
      const approved = !!result.user?.approved;

      if (role === 'admin') return navigate('/admin');
      if (role === 'doctor') return approved ? navigate('/doctor') : navigate('/dashboard');
      if (role === 'pharmacy_admin') return approved ? navigate('/pharmacy') : navigate('/dashboard');

      // default: client/user dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || 'Connection error. Is the backend running?';
      setError(message);
    }
  };

  return (
    /* Applied bg-light here so the card contrasts perfectly against the backdrop layout */
    <Container 
      fluid
      className="d-flex align-items-center justify-content-center bg-light" 
      style={{ 
        minHeight: '100vh',
        paddingTop: '90px'
      }}
    >
      {/* Kept your exact styles matched with the signup component */}
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
      `}</style>

      {/* Boosted drop-shadow to match the premium, professional UI depth */}
      <Card style={{ width: '420px' }} className="shadow border-0 rounded-4 my-5 bg-white">
        <Card.Body className="p-4 p-md-5">
          <h2 className="text-center mb-4 fw-bold text-primary" style={{ letterSpacing: '0.5px' }}>Login</h2>

          {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-semibold text-secondary">Email Address</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="custom-form-input py-2 px-3"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Password</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="custom-form-input py-2 px-3"
              />
            </Form.Group>

            <div className="text-end mb-4">
              <Link 
                to="/forgot-password" 
                className="text-muted text-decoration-none small hover-primary"
                style={{ transition: 'color 0.2s' }}
              >
                Forgot password?
              </Link>
            </div>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-25 fw-bold shadow-sm rounded-3"
              style={{ transition: 'all 0.2s' }}
            >
              Sign In
            </Button>
          </Form>

          <div className="text-center mt-4 small">
            <p className="text-secondary mb-0">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-primary fw-semibold text-decoration-none ms-1"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;