import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Table, Button, Form, Spinner, Row, Col, Card, Modal, Toast, ToastContainer, Badge, Alert } from 'react-bootstrap';
import api, { getPendingApprovals, approveUser, rejectUser, addHospital, updateHospital, deleteHospital, deleteUser } from '../services/Api';

const AdminDashboard = () => {
  const [activeKey, setActiveKey] = useState('approvals');

  // Core Data States
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Form State: Add New Hospital
  const [hospitalForm, setHospitalForm] = useState({
    name: '', address: '', city: '', state: '', country: '',
    phone: '', email: '', latitude: '', longitude: '', specialties: ''
  });

  // Form State: Create Content (Matching the JSON specification)
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    image: null,       // Handles thumbnail file assets
    videoUrl: '',
    category: 'general',
    detail: ''
  });

  // Doctor Credentialing State (Built into Approval Process)
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [docCredentials, setDocCredentials] = useState({
    licenseNo: '', npi: '', specialization: 'General Practitioner', experienceYears: 5, videoFee: 75.00
  });

  // Global Toast/Modal Feedback States
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState({ message: '', variant: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, action: null, role: null });
  const [viewDoc, setViewDoc] = useState({ show: false, url: null, filename: null, mime: null });
  const [editModal, setEditModal] = useState({ show: false, hospital: null });

  useEffect(() => {
    fetchPending();
    fetchHospitals();
    fetchUsers();
  }, []);

  const triggerToast = (message, variant = 'success') => {
    setToastContent({ message, variant });
    setShowToast(true);
  };

  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const resp = await getPendingApprovals();
      setPending(resp.data || []);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load pending approvals', 'danger');
    } finally { setLoadingPending(false); }
  };

  const fetchHospitals = async () => {
    setLoadingHospitals(true);
    try {
      const resp = await api.get('/api/hospitals');
      setHospitals(resp.data || []);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load hospitals', 'danger');
    } finally { setLoadingHospitals(false); }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const resp = await api.get('/api/admin/users');
      setUsers(resp.data || []);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load system users', 'danger');
    } finally { setLoadingUsers(false); }
  };

  const handleActionClick = (user, actionType) => {
    if (actionType === 'approve' && user.role === 'doctor') {
      setSelectedDoctor(user);
      setDocCredentials({ licenseNo: '', npi: '', specialization: 'General Practitioner', experienceYears: 5, videoFee: 75.00 });
      setShowDocModal(true);
    } else {
      setConfirmModal({ show: true, id: user.id, action: actionType, role: user.role });
    }
  };

  const executeStandardConfirm = async () => {
    const { id, action } = confirmModal;
    setConfirmModal({ show: false, id: null, action: null, role: null });
    try {
      if (action === 'approve') {
        await approveUser(id, { approved: true });
      }
      if (action === 'reject') await rejectUser(id);
      triggerToast(`Account status updated to ${action}d successfully.`);
      fetchPending();
      fetchUsers();
    } catch (err) {
      console.error(err);
      triggerToast('Verification execution routine failure.', 'danger');
    }
  };

  const submitDoctorOnboarding = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        approved: true,
        doctor_profile_json: {
          specialization: docCredentials.specialization,
          bio: 'Profile activated by site administrator. Please add your bio summary updates here.',
          experienceYears: parseInt(docCredentials.experienceYears),
          videoFee: parseFloat(docCredentials.videoFee),
          isOnline: false, 
          supportsText: true, 
          supportsVideo: true,
          languages: ['English'], 
          insuranceProviders: ['All Major Networks'],
          credentials: {
            licenseNo: docCredentials.licenseNo,
            npi: docCredentials.npi,
            hospital: selectedDoctor.organisation || 'Affiliated Hub Center'
          },
          scheduleGrid: {
            days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false },
            morningStart: '09:00', morningEnd: '12:00', afternoonStart: '13:00', afternoonEnd: '17:00', bufferMinutes: 15
          }
        }
      };

      await approveUser(selectedDoctor.id, payload);
      
      setShowDocModal(false);
      triggerToast(`Doctor profile approved, credentialed, and deployed to DB.`);
      fetchPending();
      fetchUsers();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to deploy doctor structure profile configuration', 'danger');
    }
  };

  const handleHospitalInput = (e) => {
    setHospitalForm({ ...hospitalForm, [e.target.name]: e.target.value });
  };

  const handleEditHospitalInput = (e) => {
    setEditModal(prev => ({
      ...prev,
      hospital: { ...prev.hospital, [e.target.name]: e.target.value }
    }));
  };

  const handleContentInput = (e) => {
    const { name, value, files } = e.target;
    setContentForm({
      ...contentForm,
      [name]: files ? files[0] : value
    });
  };

  const submitContentForm = async (e) => {
  e.preventDefault();
  try {
    // Convert object payload structure into a standard multipart/form-data container instance
    const dataPayload = new FormData();
    dataPayload.append('title', contentForm.title);
    dataPayload.append('description', contentForm.description);
    dataPayload.append('videoUrl', contentForm.videoUrl);
    dataPayload.append('category', contentForm.category);
    dataPayload.append('detail', contentForm.detail);
    
    if (contentForm.image) {
      dataPayload.append('image', contentForm.image); // Appends the raw file object
    }

    // Fire actual post request execution routing sequence to your Laravel API endpoint
    // NOTE: Do NOT set Content-Type header for FormData - axios will set it automatically with proper boundary
    const response = await api.post('/api/content', dataPayload);
    
    triggerToast(`Educational Content Module "${contentForm.title}" published successfully.`);
    setShowContentModal(false);
    setContentForm({ title: '', description: '', image: null, videoUrl: '', category: 'general', detail: '' });
  } catch (err) {
    console.error(err);
    triggerToast(err.response?.data?.message || 'Failed to broadcast content metadata asset.', 'danger');
  }
};



  const triggerReportGeneration = () => {
    triggerToast('Compiling analytical engine metrics... System file export sequence standard download ready shortly.', 'info');
  };

  const submitHospital = async (e) => {
    e.preventDefault();
    const { name, address, phone, email, city, state, country, latitude, longitude, specialties } = hospitalForm;

    if (!name || !address || !phone || !email || !city || !state || !country || !latitude || !longitude) {
      triggerToast('All parameters are strictly required for clinical verification.', 'danger');
      return;
    }

    const normalize = (val) => (val || '').toString().toLowerCase().trim();
    const duplicateExist = hospitals.some(h => 
      (normalize(h.name) === normalize(name) && normalize(h.address) === normalize(address)) ||
      (h.phone && h.phone.toString().trim() === phone.toString().trim()) ||
      (h.email && normalize(h.email) === normalize(email))
    );

    if (duplicateExist) {
      triggerToast('A matching hospital entity is already indexed on this system.', 'danger');
      return;
    }

    try {
      const payload = {
        name, address, phone, email, city, state, country,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        specialties: specialties && specialties.trim() !== '' ? specialties.split(',').map(s => s.trim()) : [],
        services: []
      };

      await addHospital(payload);
      triggerToast('Hospital node registered successfully.');
      setHospitalForm({ name: '', address: '', city: '', state: '', country: '', phone: '', email: '', latitude: '', longitude: '', specialties: '' });
      fetchHospitals();
    } catch (err) {
      console.error(err);
      triggerToast('Could not register hospital structural data', 'danger');
    }
  };

  const submitEditHospital = async () => {
    const h = editModal.hospital;
    if (!h) return;
    try {
      const payload = {
        name: h.name, address: h.address, phone: h.phone, email: h.email, city: h.city, state: h.state, country: h.country,
        latitude: parseFloat(h.latitude), longitude: parseFloat(h.longitude),
        specialties: typeof h.specialties === 'string' ? (h.specialties.trim() !== '' ? h.specialties.split(',').map(s => s.trim()) : []) : h.specialties
      };
      await updateHospital(h.id, payload);
      triggerToast('Hospital registry values modified.');
      setEditModal({ show: false, hospital: null });
      fetchHospitals();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to save update configuration details.', 'danger');
    }
  };

  return (
    <Container style={{ paddingTop: '110px', paddingBottom: '60px' }}>
      
      {/* Toast Alert System Notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1100 }}>
        <Toast bg={toastContent.variant} onClose={() => setShowToast(false)} show={showToast} autohide delay={3500}>
          <Toast.Body className="text-white fw-medium">{toastContent.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Title Header Panel */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark m-0"><i className="bi bi-cpu-fill text-primary me-2"></i>System Engine Dashboard</h2>
        <p className="text-muted small mb-0">Manage credential onboarding loops, update platform listings, and inspect system database entities.</p>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <Card.Body className="p-4">
          
          {/* Flexbox Action Row: Tab Bar Container housing Tabs Left and Actions Right */}
          <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-2 mb-3 gap-3">
            
            {/* Navigation Tab Sets */}
            <Tabs 
              id="admin-control-tabs" 
              activeKey={activeKey} 
              onSelect={(k) => setActiveKey(k)} 
              className="border-bottom-0 custom-admin-tabs"
              style={{ marginBottom: '-9px' }}
            >
              <Tab eventKey="approvals" title={<span><i className="bi bi-shield-check me-2"></i>Approvals ({pending.length})</span>} />
              <Tab eventKey="hospitals" title={<span><i className="bi bi-building me-2"></i>Hospital Networks ({hospitals.length})</span>} />
              <Tab eventKey="users" title={<span><i className="bi bi-people me-2"></i>User Directories ({users.length})</span>} />
            </Tabs>

            {/* Action Buttons sitting Side-by-Side with the navigation row tabs */}
            <div className="d-flex gap-2">
              <Button variant="primary" size="sm" className="rounded-3 fw-semibold px-3 d-flex align-items-center gap-1" onClick={() => setShowContentModal(true)}>
                <i className="bi bi-file-earmark-plus"></i> Create Content
              </Button>
              <Button variant="outline-dark" size="sm" className="rounded-3 fw-semibold px-3 d-flex align-items-center gap-1" onClick={triggerReportGeneration}>
                <i className="bi bi-graph-up-arrow"></i> Generate Report
              </Button>
            </div>
          </div>

          {/* Dynamic Window Container Workspace based on target active tab index */}
          <div className="tab-content-panel">
            
            {/* CONTENT LOGIC WINDOW: APPROVALS */}
            {activeKey === 'approvals' && (
              <div className="mt-2">
                {loadingPending ? (
                  <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="text-muted small mt-2">Reading security registration keys...</p></div>
                ) : (
                  <Table responsive hover className="align-middle mb-0 border">
                    <thead className="table-light small text-uppercase text-secondary">
                      <tr>
                        <th className="ps-3">Applicant Name</th>
                        <th>Account Contact Email</th>
                        <th>Access Identity Role</th>
                        <th>Institution Affiliation</th>
                        <th>Document Asset</th>
                        <th className="text-end pe-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-muted">No pending operations registration files caught in verification queues.</td></tr>}
                      {pending.map(u => {
                        const docUrl = u.id_document_url || u.document_url || u.id_document || u.document || null;
                        const filename = docUrl ? docUrl.split('/').pop() : null;
                        const mime = filename && filename.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image';
                        return (
                          <tr key={u.id}>
                            <td className="ps-3">
                              <div className="fw-bold text-dark">{u.name}</div>
                              <div className="text-muted extra-small" style={{ fontSize: '11px' }}>{u.created_at ? new Date(u.created_at).toLocaleString() : ''}</div>
                            </td>
                            <td className="small font-monospace text-secondary">{u.email}</td>
                            <td>
                              <Badge bg={u.role === 'doctor' ? 'danger' : 'info'} className="text-dark bg-opacity-10 text-capitalize px-2.5 py-1.5 border border-opacity-10">{u.role}</Badge>
                            </td>
                            <td>
                              {u.role === 'pharmacy_admin' && u.hospital?.name ? (
                                <div>
                                  <div className="fw-bold text-xs">{u.hospital.name}</div>
                                  <div className="small text-muted extra-small">{u.hospital.address || u.organisation || ''}</div>
                                </div>
                              ) : (u.organisation || '-')}
                            </td>
                            <td>
                              {docUrl ? (
                                <Button size="sm" variant="link" className="p-0 font-semibold text-danger text-decoration-none small d-inline-flex align-items-center gap-1" onClick={() => setViewDoc({ show: true, url: docUrl, filename, mime })}>
                                  <i className="bi bi-file-earmark-pdf"></i> View File
                                </Button>
                              ) : <span className="text-muted extra-small text-italic">None Attached</span>}
                            </td>
                            <td className="text-end pe-3">
                              <Button size="sm" variant="success" className="rounded-3 px-2.5 me-1" onClick={() => handleActionClick(u, 'approve')}>Verify</Button>
                              <Button size="sm" variant="outline-secondary" className="rounded-3 px-2.5" onClick={() => handleActionClick(u, 'reject')}>Deny</Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </div>
            )}

            {/* CONTENT LOGIC WINDOW: HEALTH NETWORKS */}
            {activeKey === 'hospitals' && (
              <div className="mt-2">
                <Card className="border border-light-subtle rounded-3 p-4 bg-light bg-opacity-25 mb-4">
                  <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-plus-circle text-primary me-2"></i>Provision New Healthcare Center Node</h5>
                  <Form onSubmit={submitHospital}>
                    <Row className="g-3">
                      <Col md={4} sm={12}><Form.Group><Form.Label className="small fw-semibold text-secondary">Hospital Name</Form.Label><Form.Control size="sm" name="name" value={hospitalForm.name} onChange={handleHospitalInput} required placeholder="e.g. Saint Mary Hospital" /></Form.Group></Col>
                      <Col md={5} sm={12}><Form.Group><Form.Label className="small fw-semibold text-secondary">Physical Address</Form.Label><Form.Control size="sm" name="address" value={hospitalForm.address} onChange={handleHospitalInput} required placeholder="Street numbers and block values" /></Form.Group></Col>
                      <Col md={3} sm={12}><Form.Group><Form.Label className="small fw-semibold text-secondary">City Node</Form.Label><Form.Control size="sm" name="city" value={hospitalForm.city} onChange={handleHospitalInput} required /></Form.Group></Col>
                      <Col md={3} sm={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">State/Region</Form.Label><Form.Control size="sm" name="state" value={hospitalForm.state} onChange={handleHospitalInput} required /></Form.Group></Col>
                      <Col md={3} sm={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Country</Form.Label><Form.Control size="sm" name="country" value={hospitalForm.country} onChange={handleHospitalInput} required /></Form.Group></Col>
                      <Col md={3} sm={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Contact Telephone Line</Form.Label><Form.Control size="sm" name="phone" value={hospitalForm.phone} onChange={handleHospitalInput} required /></Form.Group></Col>
                      <Col md={3} sm={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Admin Email Address</Form.Label><Form.Control size="sm" type="email" name="email" value={hospitalForm.email} onChange={handleHospitalInput} required /></Form.Group></Col>
                      <Col md={3} sm={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Map Latitude Location</Form.Label><Form.Control size="sm" type="number" step="any" name="latitude" value={hospitalForm.latitude} onChange={handleHospitalInput} required placeholder="e.g. 40.7128" /></Form.Group></Col>
                      <Col md={3} sm={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Map Longitude Location</Form.Label><Form.Control size="sm" type="number" step="any" name="longitude" value={hospitalForm.longitude} onChange={handleHospitalInput} required placeholder="e.g. -74.0060" /></Form.Group></Col>
                      <Col md={6} sm={12}><Form.Group><Form.Label className="small fw-semibold text-secondary">Medical Specialties (Split with commas)</Form.Label><Form.Control size="sm" name="specialties" value={hospitalForm.specialties} onChange={handleHospitalInput} placeholder="Cardiology, Pediatrics, Neurology" /></Form.Group></Col>
                    </Row>
                    <Button type="submit" variant="primary" size="sm" className="mt-3 px-4 rounded-3 fw-semibold shadow-xs"><i className="bi bi-check-lg me-1"></i>Deploy Node Record</Button>
                  </Form>
                </Card>

                <h5 className="fw-bold mb-3 text-dark mt-4">Active Indexed Directories</h5>
                {loadingHospitals ? <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div> : (
                  <Table responsive hover className="align-middle border small mb-0">
                    <thead className="table-light text-uppercase text-secondary">
                      <tr><th>Hospital Node Name</th><th>Locality Destination</th><th>Specialty Arrays</th><th>Contact Records</th><th className="text-end pe-3">Actions</th></tr>
                    </thead>
                    <tbody>
                      {hospitals.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-3">No hospitals mapped inside the database schema yet.</td></tr>}
                      {hospitals.map(h => (
                        <tr key={h.id}>
                          <td className="fw-bold text-dark">{h.name}</td>
                          <td className="text-secondary">{h.address || '-'}, {h.city || ''}</td>
                          <td>
                            {h.specialties && Array.isArray(h.specialties) ? h.specialties.map((spec, i) => (
                              <Badge key={i} bg="secondary" className="me-1 bg-opacity-10 text-secondary border font-normal">{spec}</Badge>
                            )) : (h.specialties || '-')}
                          </td>
                          <td className="extra-small text-muted">
                            <div><i className="bi bi-telephone text-xs me-1"></i>{h.phone}</div>
                            <div><i className="bi bi-envelope text-xs me-1"></i>{h.email}</div>
                          </td>
                          <td className="text-end pe-3">
                            <Button size="sm" variant="outline-primary" className="rounded-3 me-1 px-2.5 py-1" onClick={() => setEditModal({ show: true, hospital: h })}><i className="bi bi-pencil"></i></Button>
                            <Button size="sm" variant="outline-danger" className="rounded-3 px-2.5 py-1" onClick={async () => {
                              if (!window.confirm('Erase this hospital asset completely?')) return;
                              try {
                                await deleteHospital(h.id);
                                triggerToast('Hospital listing deleted from indices.');
                                fetchHospitals();
                              } catch { triggerToast('Failed to clear entry.', 'danger'); }
                            }}><i className="bi bi-trash"></i></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            )}

            {/* CONTENT LOGIC WINDOW: SYSTEM USER RECORDS */}
            {activeKey === 'users' && (
              <div className="mt-2">
                {loadingUsers ? <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div> : (
                  <Table responsive hover className="align-middle border small mb-0">
                    <thead className="table-light text-uppercase text-secondary">
                      <tr><th>Identity User Label</th><th>Electronic Core Email</th><th>System Role Access</th><th>Verification Passed</th><th className="text-end pe-3">Actions</th></tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && <tr><td colSpan={5} className="text-center py-3">No profiles mapped inside standard columns.</td></tr>}
                      {users.map(u => (
                        <tr key={u.id}>
                          <td className="fw-bold text-dark">{u.name}</td>
                          <td className="font-monospace text-secondary">{u.email}</td>
                          <td><Badge bg="dark" className="text-capitalize bg-opacity-10 text-dark px-2">{u.role}</Badge></td>
                          <td>
                            <Badge bg={u.approved ? 'success' : 'warning'} className={`px-2.5 py-1 ${u.approved ? 'text-success bg-opacity-10' : 'text-warning bg-opacity-10'}`}>
                              {u.approved ? 'Verified Active' : 'Hold / Locked'}
                            </Badge>
                          </td>
                          <td className="text-end pe-3">
                            <Button size="sm" variant="outline-danger" className="rounded-3 px-3 fw-semibold" onClick={async () => {
                              if (!window.confirm(`Execute complete termination deletion sequence for ${u.email}?`)) return;
                              try {
                                await deleteUser(u.id);
                                triggerToast('User index dropped cleanly from system storage.');
                                fetchUsers();
                              } catch { triggerToast('Database delete security interception restriction.', 'danger'); }
                            }}>Delete Account</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            )}
          </div>

        </Card.Body>
      </Card>

      {/* MODAL WINDOW CONTEXT: CREATIVE CONTENT MANAGEMENT SUBMODULE */}
      <Modal show={showContentModal} onHide={() => setShowContentModal(false)} size="lg" centered>
        <Form onSubmit={submitContentForm}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold text-dark">
              <i className="bi bi-file-earmark-medical text-primary me-2"></i>Publish Medical & Wellness Asset
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 bg-light">
            <Card className="border-0 shadow-xs p-4 rounded-3 bg-white">
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Content Title</Form.Label>
                    <Form.Control name="title" value={contentForm.title} onChange={handleContentInput} required placeholder="e.g. Stress Management" />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Brief Description</Form.Label>
                    <Form.Control as="textarea" rows={2} name="description" value={contentForm.description} onChange={handleContentInput} required placeholder="Incorporate relaxation techniques like deep breathing..." />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Thumbnail Cover Asset (Image)</Form.Label>
                    <Form.Control type="file" name="image" accept="image/*" onChange={handleContentInput} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Stream Validation URL (Video)</Form.Label>
                    <Form.Control type="url" name="videoUrl" value={contentForm.videoUrl} onChange={handleContentInput} placeholder="https://www.youtube.com/embed/VIDEO_ID" />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Indexing Classification Category</Form.Label>
                    <Form.Select name="category" value={contentForm.category} onChange={handleContentInput}>
                      <option value="general">General</option>
                      <option value="disease">Disease</option>
                      <option value="pediatrics">Diet</option>
                      <option value="neurology">Exercise</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Complete Educational Details</Form.Label>
                    <Form.Control as="textarea" rows={4} name="detail" value={contentForm.detail} onChange={handleContentInput} placeholder="Insert extensive article text, clinical citations, or instructional notes here..." />
                  </Form.Group>
                </Col>
              </Row>
            </Card>
          </Modal.Body>
          <Modal.Footer className="bg-light border-0">
            <Button variant="secondary" onClick={() => setShowContentModal(false)}>Cancel Drop</Button>
            <Button type="submit" variant="primary" className="px-4 fw-semibold shadow-xs">Publish Asset Module</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL WINDOW CONTEXT: DOCTOR METADATA GENERATION OVERLAY */}
      <Modal show={showDocModal} onHide={() => setShowDocModal(false)} size="lg" centered>
        {selectedDoctor && (
          <Form onSubmit={submitDoctorOnboarding}>
            <Modal.Header closeButton><Modal.Title className="fw-bold text-dark"><i className="bi bi-shield-lock-fill text-danger me-2"></i>Medical Credentials Initialization</Modal.Title></Modal.Header>
            <Modal.Body className="bg-light p-4">
              <Alert variant="danger" className="border-0 rounded-3 mb-4 small bg-opacity-10 border-start border-danger border-3 text-dark">
                You are validating medical access credentials for <strong>Dr. {selectedDoctor.name}</strong>. Provide their state verification metrics below to initialize their tracking structures.
              </Alert>
              <Card className="border-0 shadow-xs p-4 rounded-3 bg-white">
                <Row className="g-3">
                  <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Verified Medical License Key</Form.Label><Form.Control value={docCredentials.licenseNo} name="licenseNo" onChange={(e) => setDocCredentials({ ...docCredentials, licenseNo: e.target.value })} required placeholder="e.g. LIC-9981-MED" /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">National Provider Identifier (NPI)</Form.Label><Form.Control value={docCredentials.npi} name="npi" onChange={(e) => setDocCredentials({ ...docCredentials, npi: e.target.value })} required maxLength={10} placeholder="10-digit numerical catalog code" /></Form.Group></Col>
                  <Col md={4}><Form.Group><Form.Label className="small fw-semibold text-secondary">Assigned Category Specialty</Form.Label><Form.Select value={docCredentials.specialization} name="specialization" onChange={(e) => setDocCredentials({ ...docCredentials, specialization: e.target.value })}>
                    <option value="General Practitioner">General Practitioner</option><option value="Cardiologist">Cardiologist</option><option value="Pediatrician">Pediatrician</option><option value="Dermatologist">Dermatologist</option><option value="Neurologist">Neurologist</option>
                  </Form.Select></Form.Group></Col>
                  <Col md={4}><Form.Group><Form.Label className="small fw-semibold text-secondary">Years of Experience</Form.Label><Form.Control type="number" value={docCredentials.experienceYears} name="experienceYears" onChange={(e) => setDocCredentials({ ...docCredentials, experienceYears: e.target.value })} required min={0} /></Form.Group></Col>
                  <Col md={4}><Form.Group><Form.Label className="small fw-semibold text-secondary">Consultation Fee Base rate ($)</Form.Label><Form.Control type="number" value={docCredentials.videoFee} name="videoFee" onChange={(e) => setDocCredentials({ ...docCredentials, videoFee: e.target.value })} required min={0} /></Form.Group></Col>
                </Row>
              </Card>
            </Modal.Body>
            <Modal.Footer className="bg-light border-0"><Button variant="secondary" onClick={() => setShowDocModal(false)}>Cancel Review</Button><Button type="submit" variant="success" className="px-4 fw-semibold shadow-xs">Authorize & Initialize Profile</Button></Modal.Footer>
          </Form>
        )}
      </Modal>

      {/* MODAL WINDOW CONTEXT: STANDARD ENTRY REGISTRATION ACTIONS CONFIRMS */}
      <Modal show={confirmModal.show} onHide={() => setConfirmModal({ show: false, id: null, action: null, role: null })} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold fs-5">System Action Audit Interception</Modal.Title></Modal.Header>
        <Modal.Body className="text-secondary py-3">Confirming authorization choice to <strong>{confirmModal.action}</strong> this system profile instance payload record node?</Modal.Body>
        <Modal.Footer className="border-0 pt-0"><Button variant="secondary" onClick={() => setConfirmModal({ show: false, id: null, action: null, role: null })}>Cancel</Button><Button variant="primary" className="px-3" onClick={executeStandardConfirm}>Confirm Request</Button></Modal.Footer>
      </Modal>

      {/* MODAL WINDOW CONTEXT: SECURE ATTACHMENT PROOF DOCUMENT VIEW PREVIEWER */}
      <Modal size="lg" show={viewDoc.show} onHide={() => setViewDoc({ show: false, url: null, filename: null, mime: null })} centered>
        <Modal.Header closeButton><Modal.Title className="small fw-bold text-dark text-truncate">Attachment Panel: {viewDoc.filename || 'Manifest Identity Assert'}</Modal.Title></Modal.Header>
        <Modal.Body className="bg-light p-2" style={{ minHeight: '450px' }}>
          {viewDoc.url ? (viewDoc.mime === 'application/pdf' ? <iframe src={viewDoc.url} title="PDF Viewer Node" style={{ width: '100%', height: '68vh', border: 'none' }} /> : <img src={viewDoc.url} alt="Registry Source File" style={{ maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain', margin: '0 auto', display: 'block' }} />) : <div className="text-center p-4">Empty Reference Resource Location</div>}
        </Modal.Body>
      </Modal>
      
      {/* MODAL WINDOW CONTEXT: UPDATE MODIFY INDEXED CLINIC NODES */}
      <Modal show={editModal.show} onHide={() => setEditModal({ show: false, hospital: null })} size="lg" centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold">Modify Hospital parameters</Modal.Title></Modal.Header>
        <Modal.Body>
          {editModal.hospital && (
            <Form>
              <Row className="g-3">
                <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Hospital Registry Name</Form.Label><Form.Control name="name" value={editModal.hospital.name || ''} onChange={handleEditHospitalInput} /></Form.Group></Col>
                <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Street Mapping Destination</Form.Label><Form.Control name="address" value={editModal.hospital.address || ''} onChange={handleEditHospitalInput} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label className="small fw-semibold text-secondary">City</Form.Label><Form.Control name="city" value={editModal.hospital.city || ''} onChange={handleEditHospitalInput} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label className="small fw-semibold text-secondary">State</Form.Label><Form.Control name="state" value={editModal.hospital.state || ''} onChange={handleEditHospitalInput} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label className="small fw-semibold text-secondary">Country</Form.Label><Form.Control name="country" value={editModal.hospital.country || ''} onChange={handleEditHospitalInput} /></Form.Group></Col>
                <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Telephone contact</Form.Label><Form.Control name="phone" value={editModal.hospital.phone || ''} onChange={handleEditHospitalInput} /></Form.Group></Col>
                <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Email Routing</Form.Label><Form.Control name="email" value={editModal.hospital.email || ''} onChange={handleEditHospitalInput} /></Form.Group></Col>
                <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Latitude</Form.Label><Form.Control name="latitude" value={editModal.hospital.latitude || ''} onChange={handleEditHospitalInput} /></Form.Group></Col>
                <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Longitude</Form.Label><Form.Control name="longitude" value={editModal.hospital.longitude || ''} onChange={handleEditHospitalInput} /></Form.Group></Col>
                <Col md={12}><Form.Group><Form.Label className="small fw-semibold text-secondary">Specialties Array (Split with commas)</Form.Label><Form.Control name="specialties" value={Array.isArray(editModal.hospital.specialties) ? editModal.hospital.specialties.join(', ') : (editModal.hospital.specialties || '')} onChange={handleEditHospitalInput} /></Form.Group></Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setEditModal({ show: false, hospital: null })}>Cancel</Button><Button variant="primary" className="px-4" onClick={submitEditHospital}>Save Changes</Button></Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;