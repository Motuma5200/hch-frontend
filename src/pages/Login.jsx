import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Step 1: Fetch CSRF cookie (sets XSRF-TOKEN & laravel_session cookies)
      await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',           // ← Critical: sends/accepts cookies cross-origin
      });

      // Step 2: Now do the actual login POST
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Optional: manually add X-XSRF-TOKEN (uncomment if still failing)
          // 'X-XSRF-TOKEN': decodeURIComponent(
          //   document.cookie
          //     .split('; ')
          //     .find(row => row.startsWith('XSRF-TOKEN='))
          //     ?.split('=')[1] || ''
          // ),
        },
        credentials: 'include',           // ← Critical again
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = '/'; 
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Is the backend running?');
      console.error(err);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
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

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
              Sign In
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;