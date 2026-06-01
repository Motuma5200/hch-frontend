import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Nav, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Track reactive user object parameters locally
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  
  // Tab Routing & Edit State Toggles
  const [activeTab, setActiveTab] = useState('professional');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Shared loading throttle state

  // 1. PUBLIC PROFILE STATE ENGINE
  const [profileData, setProfileData] = useState({
    name: currentUser.name || 'Doctor',
    specialization: 'General Practitioner',
    bio: '',
    profileImage: null,
    languages: ['English'],
    insuranceProviders: ['Blue Cross Blue Shield']
  });

  // 2. ADVANCED TIME-SLOT GRID CONFIGURATION STATE
  const [scheduleGrid, setScheduleGrid] = useState({
    days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false },
    morningStart: '09:00',
    morningEnd: '12:00',
    afternoonStart: '13:00',
    afternoonEnd: '17:00',
    videoFee: '75.00',
    bufferMinutes: '15'
  });

  // Password / Security / Deletion States
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [securityAlert, setSecurityAlert] = useState({ show: false, variant: '', message: '' });

  // API Config Headers - Reusable token injection structure
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  // INITIALIZATION HOOK: Pull existing state configuration from backend database json column
  useEffect(() => {
    const fetchCurrentProfileState = async () => {
      if (!currentUser.id) return;
      try {
        // ALIGNED: Matches route: api/doctor/{id}
        const res = await axios.get(`http://localhost:8000/api/doctor/${currentUser.id}`, getAuthHeaders());
        
        if (res.data && res.data.doctor_profile_json) {
          const jsonProfile = res.data.doctor_profile_json;

          // Hydrate Professional Profile State Layout map
          setProfileData({
            name: res.data.name || 'Doctor',
            specialization: jsonProfile.specialization || 'General Practitioner',
            bio: jsonProfile.bio || '',
            profileImage: jsonProfile.profileImage || null,
            languages: jsonProfile.languages || ['English'],
            insuranceProviders: jsonProfile.insuranceProviders || ['Blue Cross Blue Shield', 'Aetna Health', 'UnitedHealthcare', 'Cigna Network']
          });

          // Hydrate Schedule State configuration grid
          if (jsonProfile.scheduleGrid) {
            setScheduleGrid(jsonProfile.scheduleGrid);
          }
        }
      } catch (err) {
        console.error("Failed to parse existing doctor profile data parameters map.", err);
      }
    };

    fetchCurrentProfileState();
  }, [currentUser.id]);

  // Input Handling
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleScheduleConfigChange = (e) => {
    setScheduleGrid({ ...scheduleGrid, [e.target.name]: e.target.value });
  };

  const toggleWorkingDay = (dayKey) => {
    setScheduleGrid({
      ...scheduleGrid,
      days: { ...scheduleGrid.days, [dayKey]: !scheduleGrid.days[dayKey] }
    });
  };

  const handleMultiLanguageChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setProfileData({ ...profileData, languages: selectedOptions });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Profile Image Streams
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (isEditingProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- SUBMIT 1: PUBLIC PORTAL INFORMATION SYNC ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      // ALIGNED: Matches route: api/doctor/{id}
      const res = await axios.put(`http://localhost:8000/api/doctor/${currentUser.id}`, {
        update_type: 'professional',
        name: profileData.name,
        specialization: profileData.specialization,
        bio: profileData.bio,
        languages: profileData.languages,
        insuranceProviders: profileData.insuranceProviders,
        profileImage: profileData.profileImage
      }, getAuthHeaders());

      // Update baseline local storage instances 
      const updatedUser = { ...currentUser, name: profileData.name, doctor_profile_json: res.data.user.doctor_profile_json };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      setIsEditingProfile(false);
      setSecurityAlert({ show: true, variant: 'success', message: 'Public professional info and accessibility criteria synchronized successfully!' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error occurred while saving profile metrics data.';
      setSecurityAlert({ show: true, variant: 'danger', message: errorMsg });
    }
  };

  // --- SUBMIT 2: CONSULTATION TIME-SLOTS HOURS AVAILABILITY GRID ---
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ALIGNED: Matches route: api/doctor/{id}
      const res = await axios.put(`http://localhost:8000/api/doctor/${currentUser.id}`, {
        update_type: 'schedule',
        scheduleGrid: scheduleGrid
      }, getAuthHeaders());

      const updatedUser = { ...currentUser, doctor_profile_json: res.data.user.doctor_profile_json };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      setIsEditingSchedule(false);
      setSecurityAlert({ show: true, variant: 'success', message: 'Clinical appointment shift slots and session buffers updated successfully!' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to persist structural shift criteria map attributes blocks.';
      setSecurityAlert({ show: true, variant: 'danger', message: errorMsg });
    }
  };

  // --- SUBMIT 3: PASSWORD ACCESS PROFILE SECURITY MODES ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSecurityAlert({ show: true, variant: 'danger', message: 'New passwords do not match!' });
      return;
    }

    try {
      // ALIGNED: Matches route: api/doctor/{id}
      await axios.put(`http://localhost:8000/api/doctor/${currentUser.id}`, {
        update_type: 'security',
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, getAuthHeaders());

      setSecurityAlert({ show: true, variant: 'success', message: 'Password security configurations updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      const errorMsg = serverErrors?.currentPassword ? serverErrors.currentPassword[0] : 'Validation failure resetting password criteria inputs.';
      setSecurityAlert({ show: true, variant: 'danger', message: errorMsg });
    }
  };

  // --- SUBMIT 4: PERMANENT DELETION ROUTINE (DANGER ZONE) ---
  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    setSecurityAlert({ show: false, variant: '', message: '' });

    if (deleteConfirmation.trim().toUpperCase() !== 'DELETE') {
      setSecurityAlert({ show: true, variant: 'danger', message: "Please enter authorization phrase 'DELETE'." });
      return;
    }

    if (!window.confirm("CRITICAL WARNING: Are you completely certain you want to delete your medical workspace profile? All shifts, records, and access tokens will be destroyed permanently.")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      // Fires request to the secure, unified Sanctum termination path
      await axios.delete('http://localhost:8000/api/user/terminate-account', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      localStorage.clear();
      alert('Workspace logs successfully dismantled. Account terminated.');
      navigate('/login');

    } catch (err) {
      setSecurityAlert({ 
        show: true, 
        variant: 'danger', 
        message: err.response?.data?.message || 'The infrastructure denied the permanent deletion transaction.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px' }}>
      <Container>
        
        {/* Return to Dashboard Header */}
        <div className="mb-4">
          <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
            ← Back to Dashboard
          </Button>
        </div>

        {/* PROFILE IDENTITY SUBHEADER WITH DYNAMIC METRICS */}
        <div className="bg-white rounded-4 shadow-sm p-4 mb-4 text-center border-top border-primary border-4">
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />

          <div 
            className="mx-auto mb-3 rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm fw-bold position-relative overflow-hidden" 
            style={{ 
              width: '90px', 
              height: '90px', 
              fontSize: '2.2rem',
              cursor: isEditingProfile ? 'pointer' : 'default',
              border: '3px solid #fff',
              outline: '1px solid #dee2e6'
            }}
            onClick={triggerFileInput}
          >
            {profileData.profileImage ? (
              <img src={profileData.profileImage} alt="Doctor Headshot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              profileData.name.charAt(0).toUpperCase()
            )}

            {isEditingProfile && (
              <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center text-white" style={{ height: '32px', fontSize: '0.65rem' }}>
                <i className="bi bi-camera-fill me-1"></i> Update
              </div>
            )}
          </div>

          <h3 className="fw-bold mb-0 text-dark">Dr. {profileData.name}</h3>
          
          <p className="text-primary small fw-semibold mb-2">
            <i className="bi bi-person-badge me-1"></i>
            {profileData.specialization}
          </p>

          {/* Quick Info Tags Matrix */}
          <div className="d-flex justify-content-center gap-1.5 mb-2 flex-wrap">
            {profileData.languages.map((lang, idx) => (
              <Badge key={idx} bg="secondary" className="text-dark bg-opacity-10 border border-secondary border-opacity-25 extra-small rounded-1">
                {lang}
              </Badge>
            ))}
          </div>

          <div className="d-flex flex-column align-items-center gap-1.5 small text-muted">
            <span><i className="bi bi-envelope-fill me-1"></i>{currentUser?.email || 'doctor@healthhub.com'}</span>
            <div>
              <Badge bg="info" className="text-dark text-capitalize px-3 py-1.5 rounded-pill fw-semibold shadow-xs">
                System Role: {currentUser?.role || 'doctor'}
              </Badge>
            </div>
          </div>
        </div>

        {securityAlert.show && (
          <Alert variant={securityAlert.variant} className="rounded-3 mb-4" onClose={() => setSecurityAlert({ ...securityAlert, show: false })} dismissible>
            {securityAlert.message}
          </Alert>
        )}

        <Row className="g-4">
          {/* PROFILE SECTIONS NAVIGATION */}
          <Col lg={3}>
            <Card className="border-0 shadow-sm rounded-4 p-3">
              <Nav variant="pills" className="flex-column gap-1" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav.Item>
                  <Nav.Link eventKey="professional" className="rounded-3 py-2.5 fw-medium d-flex align-items-center gap-2">
                    <i className="bi bi-person-badge-fill"></i> Public Profile Info
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="schedule" className="rounded-3 py-2.5 fw-medium d-flex align-items-center gap-2">
                    <i className="bi bi-calendar3"></i> Availability & Consultation
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="security" className="rounded-3 py-2.5 fw-medium d-flex align-items-center gap-2">
                    <i className="bi bi-shield-lock-fill"></i> Password & Security
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card>
          </Col>

          {/* ACTIVE SETTINGS CARD VIEWPORT */}
          <Col lg={9}>
            
            {/* PUBLIC PORTAL INFO CONFIG */}
            {activeTab === 'professional' && (
              <Card className="border-0 shadow-sm rounded-4 p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold text-dark mb-0">Public Portal Info</h4>
                  <Button 
                    variant={isEditingProfile ? "secondary" : "primary"}
                    size="sm"
                    className="px-3 rounded-pill fw-semibold shadow-sm"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? "Cancel Changes" : "Edit Professional Details"}
                  </Button>
                </div>

                <Row className="g-3 mb-4 p-3 bg-light rounded-3 mx-0 border align-items-center">
                  <Col md={4}>
                    <span className="small fw-semibold text-secondary d-block mb-1">Medical License</span>
                    <span className="text-dark fw-bold small"><i className="bi bi-patch-check-fill text-success me-1"></i> {currentUser?.licenseNo || 'LIC-88371-MED'}</span>
                  </Col>
                  <Col md={4}>
                    <span className="small fw-semibold text-secondary d-block mb-1">National NPI Number</span>
                    <span className="text-dark fw-bold small"><i className="bi bi-shield-lock-fill text-primary me-1"></i> {currentUser?.npi || '1982730491'}</span>
                  </Col>
                  <Col md={4}>
                    <span className="small fw-semibold text-secondary d-block mb-1">Affiliated Center</span>
                    <span className="text-dark fw-bold small"><i className="bi bi-building-fill text-secondary me-1"></i> {currentUser?.organisation || 'Central Health Hub Hospital'}</span>
                  </Col>
                </Row>

                <Form onSubmit={handleProfileSubmit}>
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">Full Title Display</Form.Label>
                        <Form.Control type="text" name="name" value={profileData.name} disabled={!isEditingProfile} onChange={handleProfileChange} required className="rounded-3" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">Specialization Department</Form.Label>
                        <Form.Select name="specialization" value={profileData.specialization} disabled={!isEditingProfile} onChange={handleProfileChange} className="rounded-3">
                          <option value="General Practitioner">General Practitioner</option>
                          <option value="Cardiologist">Cardiologist</option>
                          <option value="Pediatrician">Pediatrician</option>
                          <option value="Dermatologist">Dermatologist</option>
                          <option value="Neurologist">Neurologist</option>
                          <option value="Oncologist">Oncologist</option>
                          <option value="Psychiatrist">Psychiatrist</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">Languages Spoken (Multi-Select)</Form.Label>
                        <Form.Select 
                          multiple 
                          name="languages"
                          value={profileData.languages} 
                          disabled={!isEditingProfile} 
                          onChange={handleMultiLanguageChange} 
                          className="rounded-3"
                          style={{ height: '85px' }}
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="Mandarin">Mandarin</option>
                          <option value="Arabic">Arabic</option>
                          <option value="German">German</option>
                        </Form.Select>
                        <Form.Text className="text-muted extra-small d-block mt-1">Hold Ctrl (or Cmd on Mac) to select multiple items.</Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">Accepted Insurance Coverage Networks</Form.Label>
                        <div className="d-flex flex-wrap gap-2 p-2 border rounded-3 bg-light" style={{ minHeight: '85px', contentVisibility: 'auto' }}>
                          {profileData.insuranceProviders.map((provider, i) => (
                            <Badge key={i} bg="white" className="text-dark border px-2 py-1.5 rounded-pill shadow-xs small fw-medium">
                              <i className="bi bi-check-circle-fill text-success me-1"></i>{provider}
                            </Badge>
                          ))}
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="small fw-semibold text-secondary mb-0">Biography Summary (Visible to patients)</Form.Label>
                      <span className={`small fw-medium ${profileData.bio.length >= 480 ? 'text-danger fw-bold' : 'text-muted'}`}>
                        {profileData.bio.length} / 500 characters
                      </span>
                    </div>
                    <Form.Control as="textarea" rows={4} name="bio" maxLength={500} value={profileData.bio} disabled={!isEditingProfile} onChange={handleProfileChange} className="rounded-3" placeholder="Enter clinical bio information..." />
                  </Form.Group>

                  {isEditingProfile && (
                    <Button type="submit" variant="success" className="rounded-3 px-4 fw-semibold shadow-sm">
                      Save Profile Changes
                    </Button>
                  )}
                </Form>
              </Card>
            )}

            {/* CLINICAL CONSULTATION HOURS AND SHIFTS GRID */}
            {activeTab === 'schedule' && (
              <Card className="border-0 shadow-sm rounded-4 p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="fw-bold text-dark mb-0">Consultation Preferences</h4>
                  <Button 
                    variant={isEditingSchedule ? "secondary" : "primary"}
                    size="sm"
                    className="px-3 rounded-pill fw-semibold shadow-sm"
                    onClick={() => setIsEditingSchedule(!isEditingSchedule)}
                  >
                    {isEditingSchedule ? "Cancel" : "Modify Intervals"}
                  </Button>
                </div>
                <p className="text-muted small mb-4">Configure your shift hour boundaries, consultation rate benchmarks, and structured buffer constraints below.</p>
                
                <Form onSubmit={handleScheduleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-secondary d-block mb-2">Active Working Days</Form.Label>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.keys(scheduleGrid.days).map((day) => (
                        <Button
                          key={day}
                          variant={scheduleGrid.days[day] ? "primary" : "outline-light"}
                          disabled={!isEditingSchedule}
                          className={`px-3 py-2 rounded-3 text-capitalize fw-semibold border ${scheduleGrid.days[day] ? 'text-white' : 'text-dark border-secondary border-opacity-25'}`}
                          onClick={() => toggleWorkingDay(day)}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>

                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Card className="p-3 bg-light border-0 rounded-3">
                        <h6 className="fw-bold text-dark small mb-3"><i className="bi bi-sun-fill text-warning me-1"></i> Morning Consultation Shift</h6>
                        <Row className="g-2">
                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label className="extra-small text-secondary fw-semibold">Shift Start</Form.Label>
                              <Form.Control type="time" name="morningStart" value={scheduleGrid.morningStart} disabled={!isEditingSchedule} onChange={handleScheduleConfigChange} className="rounded-3" />
                            </Form.Group>
                          </Col>
                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label className="extra-small text-secondary fw-semibold">Shift End</Form.Label>
                              <Form.Control type="time" name="morningEnd" value={scheduleGrid.morningEnd} disabled={!isEditingSchedule} onChange={handleScheduleConfigChange} className="rounded-3" />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="p-3 bg-light border-0 rounded-3">
                        <h6 className="fw-bold text-dark small mb-3"><i className="bi bi-moon-stars-fill text-primary me-1"></i> Afternoon Consultation Shift</h6>
                        <Row className="g-2">
                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label className="extra-small text-secondary fw-semibold">Shift Start</Form.Label>
                              <Form.Control type="time" name="afternoonStart" value={scheduleGrid.afternoonStart} disabled={!isEditingSchedule} onChange={handleScheduleConfigChange} className="rounded-3" />
                            </Form.Group>
                          </Col>
                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label className="extra-small text-secondary fw-semibold">Shift End</Form.Label>
                              <Form.Control type="time" name="afternoonEnd" value={scheduleGrid.afternoonEnd} disabled={!isEditingSchedule} onChange={handleScheduleConfigChange} className="rounded-3" />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">Telehealth Video Appointment Fee ($)</Form.Label>
                        <Form.Control type="number" name="videoFee" value={scheduleGrid.videoFee} disabled={!isEditingSchedule} onChange={handleScheduleConfigChange} className="rounded-3" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">Inter-Session Patient Changeover Buffer</Form.Label>
                        <Form.Select name="bufferMinutes" value={scheduleGrid.bufferMinutes} disabled={!isEditingSchedule} onChange={handleScheduleConfigChange} className="rounded-3">
                          <option value="0">0 Minutes (Back-to-Back)</option>
                          <option value="5">5 Minutes</option>
                          <option value="10">10 Minutes</option>
                          <option value="15">15 Minutes</option>
                          <option value="20">20 Minutes</option>
                          <option value="30">30 Minutes</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {isEditingSchedule && (
                    <Button type="submit" variant="success" className="rounded-3 px-4 fw-semibold shadow-sm">
                      Save Interval Updates
                    </Button>
                  )}
                </Form>
              </Card>
            )}

            {/* SECURITY CREDENTIALS CONTROLS & DANGER ZONE */}
            {activeTab === 'security' && (
              <div className="d-flex flex-column gap-4">
                <Card className="border-0 shadow-sm rounded-4 p-4">
                  <h4 className="fw-bold text-dark mb-1">Reset Account Password</h4>
                  <p className="text-muted small mb-4">Ensure your health portal account remains secure by using strong credential structures.</p>

                  <Form onSubmit={handlePasswordSubmit}>
                    <Form.Group className="mb-3" style={{ maxWidth: '450px' }}>
                      <Form.Label className="small fw-semibold text-secondary">Current Security Password</Form.Label>
                      <Form.Control type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required className="rounded-3 py-2" />
                    </Form.Group>

                    <Form.Group className="mb-3" style={{ maxWidth: '450px' }}>
                      <Form.Label className="small fw-semibold text-secondary">New Security Password</Form.Label>
                      <Form.Control type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required className="rounded-3 py-2" />
                    </Form.Group>

                    <Form.Group className="mb-4" style={{ maxWidth: '450px' }}>
                      <Form.Label className="small fw-semibold text-secondary">Confirm New Password</Form.Label>
                      <Form.Control type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className="rounded-3 py-2" />
                    </Form.Group>

                    <Button type="submit" variant="danger" className="rounded-3 px-4 fw-semibold shadow-sm">
                      Update Password Security
                    </Button>
                  </Form>
                </Card>

                {/* VISUAL INTEGRATION: DANGER ZONE INTERFACE */}
                <Card className="border-0 shadow-sm rounded-4 p-4 border-top border-danger border-3 bg-danger-subtle bg-opacity-10">
                  <h4 className="fw-bold text-danger mb-1 small">Danger Zone</h4>
                  <p className="text-muted small mb-3">Deleting your clinical profile records is permanent and completely irreversible.</p>
                  
                  <Form onSubmit={handleDeleteAccountSubmit}>
                    <Form.Group className="mb-3" style={{ maxWidth: '450px' }}>
                      <Form.Control 
                        type="text" 
                        placeholder="Type DELETE to close profile" 
                        value={deleteConfirmation} 
                        onChange={(e) => setDeleteConfirmation(e.target.value)} 
                        required 
                        className="text-center form-control-sm text-danger border-danger fw-bold rounded-3" 
                      />
                    </Form.Group>
                    <Button 
                      type="submit" 
                      variant="danger" 
                      className="rounded-3 px-4 btn-sm fw-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing Destruction...' : 'Erase Everything'}
                    </Button>
                  </Form>
                </Card>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DoctorProfilePage;