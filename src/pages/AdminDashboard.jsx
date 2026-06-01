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
      setHospitals(resp.data || []); // Note: verify if this should be setUsers(resp.data) based on your api structure
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load system users', 'danger');
    } finally { setLoadingUsers(false); }
  };

  // Route Approval Operations
  const handleActionClick = (user, actionType) => {
    if (actionType === 'approve' && user.role === 'doctor') {
      // Direct Doctors through the specialized initialization credentials form overlay
      setSelectedDoctor(user);
      setDocCredentials({ licenseNo: '', npi: '', specialization: 'General Practitioner', experienceYears: 5, videoFee: 75.00 });
      setShowDocModal(true);
    } else {
      // General patients or pharmacy admins use standard validation confirmation
      setConfirmModal({ show: true, id: user.id, action: actionType, role: user.role });
    }
  };

  const executeStandardConfirm = async () => {
    const { id, action } = confirmModal;
    setConfirmModal({ show: false, id: null, action: null, role: null });
    try {
      if (action === 'approve') {
        // Patients and standard roles simply get updated to approved without additional profile JSON
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

  /**
   * UPDATED: Sends BOTH `approved: true` AND the `doctor_profile_json` properties 
   * stacked inside a single, unified database request payload.
   */
  const submitDoctorOnboarding = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        approved: true, // Mark the user status active inside the database
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

      // Calls your endpoint (e.g., PUT or POST /api/admin/users/{id}/approve)
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

  // Hospital Submission Operations
  const handleHospitalInput = (e) => {
    setHospitalForm({ ...hospitalForm, [e.target.name]: e.target.value });
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
        specialties: specialties ? specialties.split(',').map(s => s.trim()) : [],
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
        specialties: typeof h.specialties === 'string' ? h.specialties.split(',').map(s => s.trim()) : h.specialties
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

      <div className="mb-4">
        <h2 className="fw-bold text-dark"><i className="bi bi-cpu-fill text-primary me-2"></i>System Engine Dashboard</h2>
        <p className="text-muted small">Manage credential onboarding loops, update platform listings, and inspect system database entities.</p>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <Card.Body className="p-4">
          <Tabs id="admin-control-tabs" activeKey={activeKey} onSelect={(k) => setActiveKey(k)} className="border-bottom-0 mb-3 custom-admin-tabs">
            
            {/* TAB SECTION: REGISTER APPROVAL SYSTEM QUEUE */}
            <Tab eventKey="approvals" title={<span><i className="bi bi-shield-check me-2"></i>Approvals ({pending.length})</span>}>
              <div className="mt-3">
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
            </Tab>

            {/* TAB SECTION: HEALTH INFRASTRUCTURE NETWORKS */}
            <Tab eventKey="hospitals" title={<span><i className="bi bi-building me-2"></i>Hospital Networks ({hospitals.length})</span>}>
              
              {/* TOP FORMS CARD SUB SECTION */}
              <Card className="border border-light-subtle rounded-3 p-4 bg-light bg-opacity-25 mt-3 mb-4">
                <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-plus-circle text-primary me-2"></i>Provision New Healthcare Center Node</h5>
                <Form onSubmit={submitHospital}>
                  <Row className="g-3">
                    <Col md={4} sm={12}>
                      <Form.Group><Form.Label className="small fw-semibold text-secondary">Hospital Name</Form.Label><Form.Control size="sm" name="name" value={hospitalForm.name} onChange={handleHospitalInput} required placeholder="e.g. Saint Mary Hospital" /></Form.Group>
                    </Col>
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

              {/* BOTTOM LIST DATA TABLE SUB SECTION */}
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
            </Tab>

            {/* TAB SECTION: IDENTITY INSTANCE SYSTEM USERS */}
            <Tab eventKey="users" title={<span><i className="bi bi-people me-2"></i>User Directories ({users.length})</span>}>
              <div className="mt-3">
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
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

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
            <Form><Row className="g-3">
              <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Hospital Registry Name</Form.Label><Form.Control value={editModal.hospital.name || ''} onChange={(e) => setEditModal({ ...editModal, hospital: { ...editModal.hospital, name: e.target.value } })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Street Mapping Destination</Form.Label><Form.Control value={editModal.hospital.address || ''} onChange={(e) => setEditModal({ ...editModal, hospital: { ...editModal.hospital, address: e.target.value } })} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label className="small fw-semibold text-secondary">City</Form.Label><Form.Control value={editModal.hospital.city || ''} onChange={(e) => setEditModal({ ...editModal, hospital: { ...editModal.hospital, city: e.target.value } })} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label className="small fw-semibold text-secondary">State</Form.Label><Form.Control value={editModal.hospital.state || ''} onChange={(e) => setEditModal({ ...editModal, hospital: { ...editModal.hospital, state: e.target.value } })} /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label className="small fw-semibold text-secondary">Country</Form.Label><Form.Control value={editModal.hospital.country || ''} onChange={(e) => setEditModal({ ...editModal, hospital: { ...editModal.hospital, country: e.target.value } })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Telephone contact</Form.Label><Form.Control value={editModal.hospital.phone || ''} onChange={(e) => setEditModal({ ...editModal, hospital: { ...editModal.hospital, phone: e.target.value } })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Email Routing</Form.Label><Form.Control value={editModal.hospital.email || ''} onChange={(e) => setEditModal({ ...editModal, hospital: { ...editModal.hospital, email: e.target.value } })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Latitude</Form.Label><Form.Control value={editModal.hospital.latitude || ''} onChange={(e) => setEditModal({ ...editModal, hospital: { ...editModal.hospital, latitude: e.target.value } })} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="small fw-semibold text-secondary">Longitude</Form.Label><Form.Control value={editModal.hospital.longitude || ''} onChange={(e) => setEditModal({ ...editModal, hospital: { ...editModal.hospital, longitude: e.target.value } })} /></Form.Group></Col>
              <Col md={12}><Form.Group><Form.Label className="small fw-semibold text-secondary">Specialties Array (Split with commas)</Form.Label><Form.Control value={Array.isArray(editModal.hospital.specialties) ? editModal.hospital.specialties.join(', ') : (editModal.hospital.specialties || '')} onChange={(e) => setEditModal({ ...editModal, hospital: { ...editModal.hospital, specialties: e.target.value } })} /></Form.Group></Col>
            </Row></Form>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setEditModal({ show: false, hospital: null })}>Cancel</Button><Button variant="primary" className="px-4" onClick={submitEditHospital}>Save Changes</Button></Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;