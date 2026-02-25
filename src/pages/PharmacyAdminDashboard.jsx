import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Alert, Row, Col, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import api, { getDrugs, addDrug, updateDrug, deleteDrug, getAssignedHospital } from '../services/Api';

const PharmacyAdminDashboard = () => {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [assignedHospital, setAssignedHospital] = useState(null);
  const [loadingHospital, setLoadingHospital] = useState(true);

  const fetchAssignedHospital = async () => {
    setLoadingHospital(true);
    try {
      const resp = await getAssignedHospital();
      const data = resp.data;
      // expected backend returns { hospital: { id, name, ... } } or hospital object directly
      const hospital = data && (data.hospital || data);
      setAssignedHospital(hospital || null);
      if (hospital && hospital.id) {
        localStorage.setItem('hospitalId', String(hospital.id));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load assigned hospital');
    } finally { setLoadingHospital(false); }
  };

  const fetchDrugs = async (hid) => {
    if (!hid) return;
    setLoading(true);
    try {
      const resp = await getDrugs(hid);
      setDrugs(resp.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load drugs');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignedHospital(); }, []);

  useEffect(() => { if (assignedHospital && assignedHospital.id) fetchDrugs(assignedHospital.id); }, [assignedHospital]);

  const handleAddDrug = async (e) => {
    e.preventDefault();
    if (!assignedHospital || !assignedHospital.id) return setError('No assigned hospital found');
    try {
      await addDrug(assignedHospital.id, { name, dosage });
      setName(''); setDosage('');
      fetchDrugs(assignedHospital.id);
      setToastVariant('success');
      setToastMessage('Drug added');
      setShowToast(true);
    } catch (err) { console.error(err); setError('Failed to add drug'); }
  };

  // edit state
  const [editingDrugId, setEditingDrugId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDosage, setEditDosage] = useState('');

  const startEdit = (drug) => {
    setEditingDrugId(drug.id);
    setEditName(drug.name || '');
    setEditDosage(drug.dosage || '');
  };

  const cancelEdit = () => { setEditingDrugId(null); setEditName(''); setEditDosage(''); };

  const saveEdit = async (drugId) => {
    if (!assignedHospital || !assignedHospital.id) return setError('No assigned hospital');
    try {
      await updateDrug(assignedHospital.id, drugId, { name: editName, dosage: editDosage });
      cancelEdit();
      fetchDrugs(assignedHospital.id);
      setToastVariant('success');
      setToastMessage('Drug updated');
      setShowToast(true);
    } catch (err) { console.error(err); setError('Failed to update drug'); }
  };

  const handleDelete = async (drugId) => {
    if (!assignedHospital || !assignedHospital.id) return setError('No assigned hospital');
    if (!window.confirm('Delete this drug?')) return;
    try {
      await deleteDrug(assignedHospital.id, drugId);
      fetchDrugs(assignedHospital.id);
      setToastVariant('success');
      setToastMessage('Drug deleted');
      setShowToast(true);
    } catch (err) { console.error(err); setError('Failed to delete drug'); }
  };

  return (
    <div className="container" style={{ paddingTop: '90px' }}>
      <h2>Pharmacy Admin Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col xs={12} md={6} className="mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Assigned Hospital</h5>
              {loadingHospital ? (
                <div><Spinner animation="border" size="sm" /></div>
              ) : assignedHospital ? (
                <div>
                  <p className="mb-1"><strong>{assignedHospital.name}</strong></p>
                  {assignedHospital.address && <p className="mb-1">{assignedHospital.address}</p>}
                  {(assignedHospital.city || assignedHospital.state) && <p className="mb-1">{assignedHospital.city}{assignedHospital.city && assignedHospital.state ? ', ' : ''}{assignedHospital.state}</p>}
                  {assignedHospital.phone && <p className="mb-1">Phone: {assignedHospital.phone}</p>}
                  {assignedHospital.email && <p className="mb-1">Email: {assignedHospital.email}</p>}
                  <p className="text-muted small">Hospital ID: {assignedHospital.id}</p>
                </div>
              ) : (
                <div>No hospital assigned. Contact system administrator.</div>
              )}
            </div>
          </div>
        </Col>

        <Col xs={12} md={6} className="mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Record New Drug</h5>
              {!assignedHospital && !loadingHospital && (
                <Alert variant="warning">Cannot add drugs — no hospital assigned.</Alert>
              )}
              <Form onSubmit={handleAddDrug}>
                <Form.Group className="mb-2">
                  <Form.Label>Drug Name</Form.Label>
                  <Form.Control value={name} onChange={(e) => setName(e.target.value)} required disabled={!assignedHospital} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Dosage / Details</Form.Label>
                  <Form.Control value={dosage} onChange={(e) => setDosage(e.target.value)} disabled={!assignedHospital} />
                </Form.Group>
                <Button type="submit" disabled={!assignedHospital}>Add Drug</Button>
              </Form>
            </div>
          </div>
        </Col>
      </Row>

      <h5>Drugs</h5>
      <Table bordered>
        <thead>
          <tr><th>Name</th><th>Dosage</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {drugs.length === 0 && <tr><td colSpan={3}>No drugs found</td></tr>}
          {drugs.map(d => (
            <tr key={d.id}>
              <td>
                {editingDrugId === d.id ? (
                  <Form.Control value={editName} onChange={(e) => setEditName(e.target.value)} />
                ) : d.name}
              </td>
              <td>
                {editingDrugId === d.id ? (
                  <Form.Control value={editDosage} onChange={(e) => setEditDosage(e.target.value)} />
                ) : d.dosage}
              </td>
              <td>
                {editingDrugId === d.id ? (
                  <>
                    <Button size="sm" variant="success" onClick={() => saveEdit(d.id)}>Save</Button>{' '}
                    <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline-primary" onClick={() => startEdit(d)}>Edit</Button>{' '}
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(d.id)}>Delete</Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1060 }}>
          <Toast bg={toastVariant === 'success' ? 'success' : 'danger'} onClose={() => setShowToast(false)} show={showToast} autohide delay={3000} style={{ minWidth: '420px', maxWidth: '90vw' }}>
            <Toast.Body className="text-white" style={{ fontSize: '1rem', padding: '1rem 1.25rem' }}>{toastMessage}</Toast.Body>
          </Toast>
        </div>
    </div>
  );
};

export default PharmacyAdminDashboard;
