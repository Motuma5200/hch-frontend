import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Step 1: Fetch CSRF cookie
      await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
      });

      // Step 2: Login POST
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        navigate('/dashboard');           // ← redirect to dashboard
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Is the backend running?');
      console.error(err);
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