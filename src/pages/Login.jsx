import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert, Modal, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api, { login as apiLogin } from '../services/Api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false); // 🌟 Added verification loading state
  const navigate = useNavigate();

  // POP-UP MODEL MODAL MANAGEMENT STATES
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true); // 🌟 Turn on verification loader immediately upon clicking login

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
    } finally {
      setIsVerifying(false); // 🌟 Reset verifying loader if authentication fails
    }
  };

  // POP-UP MODEL FORM HANDLING LOGIC
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setModalSuccessMessage('Your reset link has been sent to your email address if you have been registered with this email.');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setResetEmail('');
    setModalSuccessMessage('');
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
        .hover-primary:hover {
          color: #0d6efd !important;
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
                disabled={isVerifying}
                className="custom-form-input py-2 px-3"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Password</Form.Label>
              <Form.Control 
                type="password" /* 🌟 Fixed securely back to password type */
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isVerifying}
                className="custom-form-input py-2 px-3"
              />
            </Form.Group>

            {/* Intercepted Forgot Password trigger linking straight into the modal array */}
            <div className="text-end mb-4">
              <span 
                className="text-muted text-decoration-none small hover-primary"
                style={{ transition: 'color 0.2s', cursor: 'pointer' }}
                onClick={() => !isVerifying && setShowModal(true)}
              >
                Forgot password?
              </span>
            </div>

            {/* 🌟 Dynamic Button displays a Spinner component if verifying processing loops are active */}
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isVerifying}
              className="w-100 py-2.5 fw-bold shadow-sm rounded-3 d-flex align-items-center justify-content-center gap-2"
              style={{ transition: 'all 0.2s' }}
            >
              {isVerifying ? (
                <>
                  <Spinner size="sm" animation="border" role="status" aria-hidden="true" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
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

      {/* POP-UP MODEL (FORGOT PASSWORD MODAL FRAMEWORK) */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        centered
        backdrop="static"
        keyboard={false}
        className="border-0"
      >
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold text-dark h4">Reset Your Password</Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="px-4 pb-4">
          {modalSuccessMessage ? (
            <div className="text-center py-2">
              <Alert variant="success" className="rounded-3 border-0 shadow-xs mb-4 text-start fw-medium small">
                <i className="bi bi-envelope-check-fill me-2 fs-6"></i>
                {modalSuccessMessage}
              </Alert>
              <Button 
                variant="primary" 
                onClick={handleCloseModal}
                className="w-100 py-2 fw-semibold rounded-3 shadow-xs"
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleForgotPasswordSubmit}>
              <p className="text-muted small mb-4" style={{ lineHeight: '1.5' }}>
                Please provide your registered account email profile down below. If a match exists within our active directories, our telemetry cluster will forward over an access sequence validation URL node directly.
              </p>
              
              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold text-secondary">Registered Email Address</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  autoFocus
                  className="custom-form-input py-2 px-3"
                />
              </Form.Group>
              
              <div className="d-flex gap-3 justify-content-end">
                <Button 
                  variant="outline-secondary" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 border-secondary-subtle bg-white text-secondary rounded-3"
                  style={{ fontSize: '0.9rem' }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  className="px-4 py-2 fw-bold rounded-3 shadow-sm"
                  style={{ fontSize: '0.9rem' }}
                >
                  Send Reset Link
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Login;