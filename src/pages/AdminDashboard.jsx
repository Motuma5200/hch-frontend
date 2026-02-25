import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Table, Button, Form, Spinner, Row, Col, Card, InputGroup, Modal, Toast, ToastContainer } from 'react-bootstrap';
import api, { getPendingApprovals, approveUser, rejectUser, addHospital, updateHospital, deleteHospital, deleteUser } from '../services/Api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeKey, setActiveKey] = useState('approvals');

  // Approvals
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // Hospitals
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [newHospitalName, setNewHospitalName] = useState('');
  const [newHospitalAddress, setNewHospitalAddress] = useState('');
  const [newHospitalPhone, setNewHospitalPhone] = useState('');
  const [newHospitalEmail, setNewHospitalEmail] = useState('');
  const [newHospitalCity, setNewHospitalCity] = useState('');
  const [newHospitalState, setNewHospitalState] = useState('');
  const [newHospitalCountry, setNewHospitalCountry] = useState('');
  const [newHospitalLatitude, setNewHospitalLatitude] = useState('');
  const [newHospitalLongitude, setNewHospitalLongitude] = useState('');
  const [newHospitalSpecialties, setNewHospitalSpecialties] = useState('');
  

  // Users
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, action: null });
  const [viewDoc, setViewDoc] = useState({ show: false, url: null, filename: null, mime: null });
  const [editModal, setEditModal] = useState({ show: false, hospital: null });

  useEffect(() => { fetchPending(); fetchHospitals(); fetchUsers(); }, []);
  const navigate = useNavigate();

  // Show toast when `success` or `error` changes
  useEffect(() => {
    let timer;
    if (success) {
      setToastMessage(success);
      setToastVariant('success');
      setShowToast(true);
      timer = setTimeout(() => { setShowToast(false); setSuccess(''); }, 3000);
    } else if (error) {
      setToastMessage(error);
      setToastVariant('danger');
      setShowToast(true);
      timer = setTimeout(() => { setShowToast(false); setError(''); }, 4000);
    }
    return () => clearTimeout(timer);
  }, [success, error]);

  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const resp = await getPendingApprovals();
      setPending(resp.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load pending approvals');
    } finally { setLoadingPending(false); }
  };

  const handleApprove = (id) => setConfirmModal({ show: true, id, action: 'approve' });
  const handleReject = (id) => setConfirmModal({ show: true, id, action: 'reject' });

  const runConfirm = async () => {
    const { id, action } = confirmModal;
    setConfirmModal({ show: false, id: null, action: null });
    try {
      if (action === 'approve') await approveUser(id);
      if (action === 'reject') await rejectUser(id);
      setSuccess(`User ${action}d successfully`);
      fetchPending();
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError('Action failed');
    }
  };

  const fetchHospitals = async () => {
    setLoadingHospitals(true);
    try {
      const resp = await api.get('/api/hospitals');
      setHospitals(resp.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load hospitals');
    } finally { setLoadingHospitals(false); }
  };

  const submitHospital = async (e) => {
    e.preventDefault();
    if (!newHospitalName || !newHospitalAddress || !newHospitalPhone || !newHospitalEmail || !newHospitalCity || !newHospitalState || !newHospitalCountry || !newHospitalLatitude || !newHospitalLongitude) {
      setError('All fields are mandatory to register the hospital.');
      return;
    }
    // Prevent duplicate hospitals by checking existing records (name+address, phone, or email)
    const normalize = (s) => (s || '').toString().toLowerCase().trim();
    const isDuplicate = hospitals.some(h => {
      if (!h) return false;
      const sameNameAddress = normalize(h.name) === normalize(newHospitalName) && normalize(h.address) === normalize(newHospitalAddress);
      const samePhone = newHospitalPhone && h.phone && h.phone.toString().trim() === newHospitalPhone.toString().trim();
      const sameEmail = newHospitalEmail && h.email && normalize(h.email) === normalize(newHospitalEmail);
      return sameNameAddress || samePhone || sameEmail;
    });
    if (isDuplicate) {
      setError('The hospital already exists.');
      return;
    }

    try {
      const payload = {
        name: newHospitalName,
        address: newHospitalAddress,
      };
      if (newHospitalPhone) payload.phone = newHospitalPhone;
      if (newHospitalEmail) payload.email = newHospitalEmail;
      if (newHospitalCity) payload.city = newHospitalCity;
      if (newHospitalState) payload.state = newHospitalState;
      if (newHospitalCountry) payload.country = newHospitalCountry;
      if (newHospitalLatitude) payload.latitude = parseFloat(newHospitalLatitude);
      if (newHospitalLongitude) payload.longitude = parseFloat(newHospitalLongitude);
      if (newHospitalSpecialties) payload.specialties = newHospitalSpecialties.split(',').map(s => s.trim());

      // Compatibility: include empty services array in payload in case backend still requires it
      if (!payload.services) payload.services = [];

      await addHospital(payload);
      setSuccess('Hospital added');
      setNewHospitalName(''); setNewHospitalAddress('');
      setNewHospitalPhone(''); setNewHospitalEmail('');
      setNewHospitalCity(''); setNewHospitalState(''); setNewHospitalCountry('');
      setNewHospitalLatitude(''); setNewHospitalLongitude('');
      setNewHospitalSpecialties('');
      fetchHospitals();
    } catch (err) {
      console.error('Add hospital error:', err.response ? err.response.data : err);
      const backendMsg = err.response && (err.response.data?.message || err.response.data);
      setError(backendMsg ? JSON.stringify(backendMsg) : 'Failed to add hospital');
    }
  };

  const closeEditModal = () => setEditModal({ show: false, hospital: null });

  const submitEditHospital = async () => {
    const h = editModal.hospital;
    if (!h) return;
    try {
      const payload = {
        name: h.name,
        address: h.address,
        phone: h.phone,
        email: h.email,
        city: h.city,
        state: h.state,
        country: h.country,
        latitude: h.latitude !== undefined ? parseFloat(h.latitude) : undefined,
        longitude: h.longitude !== undefined ? parseFloat(h.longitude) : undefined,
      };
      if (h.specialties) payload.specialties = (typeof h.specialties === 'string') ? h.specialties.split(',').map(s => s.trim()) : h.specialties;
      await updateHospital(h.id, payload);
      setSuccess('Hospital updated');
      closeEditModal();
      fetchHospitals();
    } catch (err) {
      console.error('Update hospital error', err);
      setError('Failed to update hospital');
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const resp = await api.get('/api/admin/users');
      setUsers(resp.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally { setLoadingUsers(false); }
  };

  return (
    <div className="container" style={{ paddingTop: '90px' }}>
      <h2 className="mb-3">Admin Dashboard</h2>

      <ToastContainer position="top-end" className="p-3">
        <Toast bg={toastVariant === 'success' ? 'success' : 'danger'} onClose={() => { setShowToast(false); setError(''); setSuccess(''); }} show={showToast} autohide delay={3000}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Card className="mb-4">
        <Card.Body>
          <Tabs id="admin-tabs" activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
            <Tab eventKey="approvals" title={`Approvals (${pending.length})`}>
              <div className="mt-3">
                {loadingPending ? (
                  <Spinner animation="border" />
                ) : (
                  <Table bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Organisation</th>
                        <th>Document</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.length === 0 && <tr><td colSpan={6} className="text-center">No pending approvals</td></tr>}
                      {pending.map(u => {
                        // try to find a document URL returned by backend
                        const docUrl = u.id_document_url || u.document_url || u.id_document || u.document || null;
                        // infer mime by filename (simple)
                        const filename = docUrl ? docUrl.split('/').pop() : null;
                        const mime = filename && filename.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image';
                        return (
                          <tr key={u.id}>
                            <td>
                              <div className="fw-bold">{u.name}</div>
                              <div className="text-muted small">{u.created_at ? new Date(u.created_at).toLocaleString() : ''}</div>
                            </td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>
                              {u.role === 'pharmacy_admin' ? (
                                u.hospital && u.hospital.name ? (
                                  <div>
                                    <div className="fw-bold">{u.hospital.name}</div>
                                    <div className="small text-muted">{u.hospital.address || u.organisation || ''}</div>
                                  </div>
                                ) : (
                                  u.organisation || '-'
                                )
                              ) : (
                                u.organisation || '-'
                              )}
                            </td>
                            <td>
                              {docUrl ? (
                                <>
                                  <a href={docUrl} target="_blank" rel="noreferrer">{filename}</a>
                                  <div>
                                    <Button size="sm" variant="outline-primary" onClick={() => setViewDoc({ show: true, url: docUrl, filename, mime })}>View</Button>
                                  </div>
                                </>
                              ) : '-'}
                            </td>
                            <td>
                              <Button size="sm" variant="success" onClick={() => handleApprove(u.id)}>Approve</Button>{' '}
                              <Button size="sm" variant="danger" onClick={() => handleReject(u.id)}>Reject</Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </div>
            </Tab>

            <Tab eventKey="hospitals" title={`Hospitals (${hospitals.length})`}>
              <Row className="mt-3">
                <Col md={12}>
                  <h5 className='fw-bold mb-4 text-center'>Add Hospital / Clinic</h5>
                  <Form onSubmit={submitHospital}>
                    <Row>
                      <Col>
                      <Form.Group className="mb-2">
                      <Form.Label>Name</Form.Label>
                      <Form.Control value={newHospitalName} onChange={(e) => setNewHospitalName(e.target.value)} required />
                    </Form.Group>
                      </Col>

                      <Col>
                      <Form.Group className="mb-2">
                      <Form.Label>Address</Form.Label>
                      <Form.Control value={newHospitalAddress} onChange={(e) => setNewHospitalAddress(e.target.value)} required />
                      </Form.Group>
                      </Col>
                    </Row>
                    
                    
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>City</Form.Label>
                          <Form.Control value={newHospitalCity} onChange={(e) => setNewHospitalCity(e.target.value)} required />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>State</Form.Label>
                          <Form.Control value={newHospitalState} onChange={(e) => setNewHospitalState(e.target.value)} required />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Country</Form.Label>
                          <Form.Control value={newHospitalCountry} onChange={(e) => setNewHospitalCountry(e.target.value)} required />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control value={newHospitalPhone} onChange={(e) => setNewHospitalPhone(e.target.value)} required />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-2">
                      <Form.Label>Email</Form.Label>
                      <Form.Control value={newHospitalEmail} onChange={(e) => setNewHospitalEmail(e.target.value)} required />
                    </Form.Group>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Latitude</Form.Label>
                          <Form.Control value={newHospitalLatitude} onChange={(e) => setNewHospitalLatitude(e.target.value)} required />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Longitude</Form.Label>
                          <Form.Control value={newHospitalLongitude} onChange={(e) => setNewHospitalLongitude(e.target.value)} required />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-2">
                      <Form.Label>Specialties (comma separated)</Form.Label>
                      <Form.Control value={newHospitalSpecialties} onChange={(e) => setNewHospitalSpecialties(e.target.value)} />
                    </Form.Group>
                    
                    <Button type="submit" className='m-3'>Create Hospital</Button>
                  </Form>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col md={12}>
                  <h5 className='fw-bold text-center mb-4'>Existing Hospitals</h5>
                  {loadingHospitals ? <Spinner animation="border" /> : (
                    <Table bordered responsive>
                      <thead><tr><th>Name</th><th>Address</th><th>Specialties</th><th>Contact</th><th>Actions</th></tr></thead>
                      <tbody>
                        {hospitals.length === 0 && <tr><td colSpan={5}>No hospitals</td></tr>}
                        {hospitals.map(h => (
                          <tr key={h.id}>
                            <td>{h.name}</td>
                            <td>{h.address || '-'}</td>
                            <td>{(h.specialties && h.specialties.join) ? h.specialties.join(', ') : (h.specialties || '-')}</td>
                            <td>
                              {h.phone && <div>{h.phone}</div>}
                              {h.email && <div className="small text-muted">{h.email}</div>}
                            </td>
                            <td>
                              <Button size="sm" variant="primary" onClick={() => { setEditModal({ show: true, hospital: h }); }}>Edit</Button>{' '}
                              <Button size="sm" variant="danger" onClick={async () => {
                                if (!confirm('Delete this hospital? This cannot be undone.')) return;
                                try {
                                  await deleteHospital(h.id);
                                  setSuccess('Hospital deleted');
                                  fetchHospitals();
                                } catch (err) {
                                  console.error(err);
                                  setError('Failed to delete hospital');
                                }
                              }}>Delete</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="users" title={`Users (${users.length})`}>
              <div className="mt-3">
                {loadingUsers ? <Spinner animation="border" /> : (
                  <Table bordered hover responsive>
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Role</th><th>Approved</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && <tr><td colSpan={5} className="text-center">No users</td></tr>}
                      {users.map(u => (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td>{u.approved ? 'Yes' : 'No'}</td>
                          <td>
                            <Button size="sm" variant="danger" onClick={async () => {
                              if (!confirm(`Delete user ${u.email || u.name}? This cannot be undone.`)) return;
                              try {
                                await deleteUser(u.id);
                                setSuccess('User deleted');
                                fetchUsers();
                              } catch (err) {
                                console.error('Delete user error', err);
                                const backendMsg = err.response && (err.response.data?.message || err.response.data);
                                setError(backendMsg ? JSON.stringify(backendMsg) : 'Failed to delete user');
                              }
                            }}>Delete</Button>
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

      <Modal show={confirmModal.show} onHide={() => setConfirmModal({ show: false, id: null, action: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to {confirmModal.action} this user?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmModal({ show: false, id: null, action: null })}>Cancel</Button>
          <Button variant="primary" onClick={runConfirm}>Yes</Button>
        </Modal.Footer>
      </Modal>

      <Modal size="lg" show={viewDoc.show} onHide={() => setViewDoc({ show: false, url: null, filename: null, mime: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Document Preview {viewDoc.filename ? `- ${viewDoc.filename}` : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ minHeight: '400px' }}>
          {viewDoc.url ? (
            viewDoc.mime === 'application/pdf' ? (
              <iframe src={viewDoc.url} title="document" style={{ width: '100%', height: '70vh', border: 'none' }} />
            ) : (
              <img src={viewDoc.url} alt={viewDoc.filename || 'document'} style={{ maxWidth: '100%', maxHeight: '70vh' }} />
            )
          ) : (
            <div>No document available</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewDoc({ show: false, url: null, filename: null, mime: null })}>Close</Button>
        </Modal.Footer>
      </Modal>
      
      <Modal show={editModal.show} onHide={closeEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Hospital</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editModal.hospital ? (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Name</Form.Label>
                <Form.Control value={editModal.hospital.name || ''} onChange={(e) => setEditModal(prev => ({ ...prev, hospital: { ...prev.hospital, name: e.target.value } }))} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Address</Form.Label>
                <Form.Control value={editModal.hospital.address || ''} onChange={(e) => setEditModal(prev => ({ ...prev, hospital: { ...prev.hospital, address: e.target.value } }))} />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-2">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control value={editModal.hospital.phone || ''} onChange={(e) => setEditModal(prev => ({ ...prev, hospital: { ...prev.hospital, phone: e.target.value } }))} />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-2">
                    <Form.Label>Email</Form.Label>
                    <Form.Control value={editModal.hospital.email || ''} onChange={(e) => setEditModal(prev => ({ ...prev, hospital: { ...prev.hospital, email: e.target.value } }))} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-2">
                    <Form.Label>Latitude</Form.Label>
                    <Form.Control value={editModal.hospital.latitude || ''} onChange={(e) => setEditModal(prev => ({ ...prev, hospital: { ...prev.hospital, latitude: e.target.value } }))} />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-2">
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control value={editModal.hospital.longitude || ''} onChange={(e) => setEditModal(prev => ({ ...prev, hospital: { ...prev.hospital, longitude: e.target.value } }))} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-2">
                <Form.Label>Specialties (comma separated)</Form.Label>
                <Form.Control value={Array.isArray(editModal.hospital.specialties) ? editModal.hospital.specialties.join(', ') : (editModal.hospital.specialties || '')} onChange={(e) => setEditModal(prev => ({ ...prev, hospital: { ...prev.hospital, specialties: e.target.value } }))} />
              </Form.Group>
            </Form>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModal}>Cancel</Button>
          <Button variant="primary" onClick={submitEditHospital}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
