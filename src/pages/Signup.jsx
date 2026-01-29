import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Get CSRF cookie
      await fetch('/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
      });

      // Step 2: Register request
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Registration successful
        // You can decide here:
        // Option A: Redirect to login
        // navigate('/login');

        // Option B: If backend auto-logs in → go to home/dashboard
        navigate('/');
        // window.location.href = '/';   // like your login
      } else {
        // Show Laravel validation error or general message
        const errorMessage = 
          result.message ||
          (result.errors && (
            result.errors.email?.[0] ||
            result.errors.password?.[0] ||
            result.errors.name?.[0] ||
            result.errors.password_confirmation?.[0]
          )) ||
          'Registration failed. Please check your information.';
        
        setError(errorMessage);
      }
    } catch (err) {
      setError('Connection error. Is the backend running?');
      console.error(err);
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

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-bold"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Signup;