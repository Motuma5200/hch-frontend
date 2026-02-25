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
    <Container 
      className="d-flex align-items-center justify-content-center" 
      style={{ minHeight: '80vh',
         paddingTop: '90px'  // 
       }}
    >
      <Card style={{ width: '400px' }} className="shadow-sm border-0">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4 fw-bold text-primary">Login</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Enter email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </Form.Group>

            <div className="text-end mb-4">
              <Link 
                to="/forgot-password" 
                className="text-muted text-decoration-none small"
              >
                Forgot password?
              </Link>
            </div>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-2 fw-bold"
            >
              Sign In
            </Button>
          </Form>

          <div className="text-center mt-4">
            <p className="text-muted mb-0">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-primary fw-semibold text-decoration-none"
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