import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Alert, Button, Form, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Reference to the hidden file input element
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Shared loading throttle state
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [securityAlert, setSecurityAlert] = useState({ show: false, variant: '', message: '' });
  
  // State for storing the local uploaded image preview string
  const [selectedImage, setSelectedImage] = useState(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Valued Patient',
    bloodType: 'O+',
    allergies: '',
    emergencyContact: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Clicking the circle opens the file selection window instantly
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // Convert the file to a base64 string to render it on screen immediately
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdateSubmit = (e) => {
    e.preventDefault();
    setIsEditingProfile(false);
    setSecurityAlert({ show: true, variant: 'success', message: 'Medical profile changes updated locally!' });
  };

  // Hooks directly into the custom Laravel change-password logic block
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSecurityAlert({ show: false, variant: '', message: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSecurityAlert({ show: true, variant: 'danger', message: 'New passwords do not match confirmation!' });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        'http://localhost:8000/api/user/change-password',
        {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          new_password_confirmation: passwordData.confirmPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSecurityAlert({ 
        show: true, 
        variant: 'success', 
        message: 'Security credentials updated successfully inside the system matrix!' 
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (err) {
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        const fallbackMessage = validationErrors[Object.keys(validationErrors)[0]][0];
        setSecurityAlert({ show: true, variant: 'danger', message: fallbackMessage });
      } else {
        setSecurityAlert({ 
          show: true, 
          variant: 'danger', 
          message: err.response?.data?.message || 'A network error interrupted the credentials mutation routine.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // CONNECTED: Fires the account termination sequence directly to Laravel backend
  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    setSecurityAlert({ show: false, variant: '', message: '' });

    // 1. Text phrase verification matching check
    if (deleteConfirmation.trim().toUpperCase() !== 'DELETE') {
      setSecurityAlert({ show: true, variant: 'danger', message: "Please enter authorization phrase 'DELETE'." });
      return;
    }

    // 2. Native browser dialog structural confirmation fallback interceptor
    if (!window.confirm("CRITICAL WARNING: Are you completely certain you want to erase this workspace profile? This configuration sequence is permanent.")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      // 3. Request destruction endpoint execution payload from api router matrix
      await axios.delete('http://localhost:8000/api/user/terminate-account', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // 4. Wipe completely all application local browser tokens upon success array confirmation
      localStorage.clear();
      alert('Account closed successfully. All related session tables destroyed.');
      
      // 5. Safely push user browser address tree away to out-of-bounds auth layout
      navigate('/login');

    } catch (err) {
      setSecurityAlert({ 
        show: true, 
        variant: 'danger', 
        message: err.response?.data?.message || 'The application framework denied the permanent destruction execution query.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container style={{ paddingTop: '100px', paddingBottom: '40px' }}>
      
      {/* Return Navigation Anchor */}
      <div className="mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* HEADER SECTION WITH AVATAR, UNEDITABLE EMAIL/ROLE, AND ACTIONS */}
      <div className="text-center py-4 bg-white rounded-4 border shadow-sm mb-4">
        
        {/* Always clickable profile avatar element */}
        <div 
          className="mx-auto mb-3 rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm fw-bold overflow-hidden"
          style={{ 
            width: '100px', 
            height: '100px', 
            fontSize: '2.5rem',
            cursor: 'pointer', 
            position: 'relative',
            transition: 'all 0.2s'
          }}
          onClick={handleAvatarClick}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Click to upload a profile picture"
        >
          {selectedImage ? (
            <img src={selectedImage} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            profileData.name.charAt(0).toUpperCase()
          )}
          
          <div 
            className="position-absolute bottom-0 w-100 text-white py-1 bg-dark bg-opacity-70 small" 
            style={{ fontSize: '0.7rem' }}
          >
            Upload
          </div>
        </div>
        
        {/* Hidden File Input handler */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleImageChange} 
        />

        <h3 className="fw-bold text-dark mb-1">{profileData.name}</h3>
        <p className="text-muted small mb-2">ID Reference: #{user?.id || '9827'}</p>

        {/* Display for non-editable Email and System Role */}
        <div className="d-flex flex-column align-items-center gap-1 mb-3">
          <span className="text-secondary small">
            <i className="bi bi-envelope-fill me-1"></i>
            {user?.email || 'patient@healthhub.com'}
          </span>
          <div>
            <Badge bg="info" className="text-dark text-capitalize px-3 py-1.5 rounded-pill fw-semibold shadow-xs">
              <i className="bi bi-shield-lock-fill me-1"></i>
              System Role: {user?.role || 'client'}
            </Badge>
          </div>
        </div>

        {/* High Visibility Main Toggle Button */}
        <Button 
          variant={isEditingProfile ? "secondary" : "primary"} 
          className="px-4 rounded-pill fw-semibold shadow-sm mb-2"
          onClick={() => setIsEditingProfile(!isEditingProfile)}
        >
          {isEditingProfile ? "Cancel Editing" : "Edit Profile Details"}
        </Button>
      </div>

      {securityAlert.show && (
        <Alert variant={securityAlert.variant} className="rounded-3 mb-4" onClose={() => setSecurityAlert({ ...securityAlert, show: false })} dismissible>
          {securityAlert.message}
        </Alert>
      )}

      <Row className="g-4">
        {/* Left Column Form */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
            <h4 className="fw-bold mb-3 text-dark">Medical File</h4>
            
            <Form onSubmit={handleProfileUpdateSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-secondary">Account Nickname</Form.Label>
                <Form.Control type="text" name="name" value={profileData.name} disabled={!isEditingProfile} onChange={handleProfileChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-secondary">Blood Type</Form.Label>
                <Form.Select name="bloodType" value={profileData.bloodType} disabled={!isEditingProfile} onChange={handleProfileChange}>
                  <option>A+</option><option>B+</option><option>O+</option><option>AB+</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-secondary">Allergies</Form.Label>
                <Form.Control type="text" name="allergies" value={profileData.allergies} disabled={!isEditingProfile} onChange={handleProfileChange} />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold text-secondary">Emergency Contact</Form.Label>
                <Form.Control type="text" name="emergencyContact" value={profileData.emergencyContact} disabled={!isEditingProfile} onChange={handleProfileChange} />
              </Form.Group>
              
              {isEditingProfile && (
                <Button type="submit" variant="success" className="w-100 rounded-3 fw-semibold shadow-sm">
                  Save All Updates
                </Button>
              )}
            </Form>
          </Card>
        </Col>

        {/* Right Column Forms */}
        <Col lg={6}>
          <div className="d-flex flex-column gap-4">
            <Card className="border-0 shadow-sm rounded-4 p-4">
              <h4 className="fw-bold mb-3">Update Password</h4>
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-2">
                  <Form.Control type="password" name="currentPassword" placeholder="Current Password" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control type="password" name="newPassword" placeholder="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control type="password" name="confirmPassword" placeholder="Confirm New Password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
                </Form.Group>
                <Button type="submit" variant="dark" className="w-100 btn-sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Update Security Settings'}
                </Button>
              </Form>
            </Card>

            <Card className="border-0 shadow-sm rounded-4 p-4 border-top border-danger border-3 bg-danger-subtle bg-opacity-10">
              <h4 className="fw-bold text-danger mb-1 small">Danger Zone</h4>
              <p className="text-muted small mb-3">Deleting your workspace logs is irreversible.</p>
              <Form onSubmit={handleDeleteAccountSubmit}>
                <Form.Group className="mb-2">
                  <Form.Control type="text" placeholder="Type DELETE to close profile" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} required className="text-center form-control-sm text-danger border-danger fw-bold" />
                </Form.Group>
                <Button type="submit" variant="danger" className="w-100 btn-sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Erase Everything'}
                </Button>
              </Form>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;