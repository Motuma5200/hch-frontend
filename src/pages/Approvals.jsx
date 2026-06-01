import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Spinner, Alert, Card, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { getPendingApprovals, approveUser, rejectUser } from '../services/Api';

const Approvals = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal Control States for Doctor Audits
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Custom metadata variables to initialize the MySQL doctor_profile_json column
  const [docCredentials, setDocCredentials] = useState({
    licenseNo: '',
    npi: '',
    specialization: 'General Practitioner',
    experienceYears: 5,
    videoFee: 75.00
  });

  const fetchPendingDoctors = async () => {
    setLoading(true);
    try {
      const resp = await getPendingApprovals();
      // Safeguard: Ensure we only populate the table with users under the 'doctor' designation
      const doctorsOnly = (resp.data || []).filter(user => user.role === 'doctor');
      setPendingDoctors(doctorsOnly);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load pending medical applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPendingDoctors(); }, []);

  // Open modal overlay and load context parameters
  const handleOpenDoctorAudit = (doctor) => {
    setSelectedDoctor(doctor);
    setDocCredentials({
      licenseNo: '',
      npi: '',
      specialization: doctor.specialization || 'General Practitioner',
      experienceYears: 5,
      videoFee: 75.00
    });
    setShowDocModal(true);
  };

  // Compiles parameters and provisions the doctor_profile_json field in MySQL
  const handleApproveDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      const payload = {
        doctor_profile_json: {
          specialization: docCredentials.specialization,
          bio: 'Welcome to the health platform! Please select the edit options on your profile menu to customize this biography layout.',
          experienceYears: parseInt(docCredentials.experienceYears),
          videoFee: parseFloat(docCredentials.videoFee),
          isOnline: false,
          supportsText: true,
          supportsVideo: true,
          languages: ['English'], 
          insuranceProviders: ['Major Networks Accepted'],
          credentials: {
            licenseNo: docCredentials.licenseNo,
            npi: docCredentials.npi,
            hospital: selectedDoctor.organisation || 'Affiliated Center'
          },
          scheduleGrid: {
            days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false },
            morningStart: '09:00',
            morningEnd: '12:00',
            afternoonStart: '13:00',
            afternoonEnd: '17:00',
            bufferMinutes: 15
          }
        }
      };

      await approveUser(selectedDoctor.id, payload);
      setPendingDoctors(p => p.filter(u => u.id !== selectedDoctor.id));
      setShowDocModal(false);
      setSuccess(`Dr. ${selectedDoctor.name} has been successfully credentialed. Their profile is now live!`);
    } catch (err) {
      console.error(err);
      setError('An error occurred while compiling credentials or updating the record.');
    }
  };

  const handleReject = async (id) => {
    try {
      setError('');
      setSuccess('');
      await rejectUser(id);
      setPendingDoctors(p => p.filter(u => u.id !== id));
      setSuccess('Application successfully rejected and removed from registration logs.');
    } catch (err) { 
      console.error(err);
      setError('Failed to execute account rejection command.');
    }
  };

  const handleInputChange = (e) => {
    setDocCredentials({ ...docCredentials, [e.target.name]: e.target.value });
  };

  return (
    <Container style={{ paddingTop: '100px', paddingBottom: '50px' }}>
      
      {/* Dynamic Header Block */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-shield-check text-danger me-2"></i>Medical Credentialing Center
          </h2>
          <p className="text-muted small mb-0">Cross-reference state board certificates, audit practitioner assets, and initialize clinical configurations.</p>
        </div>
        <Badge bg="danger" className="px-3 py-2 rounded-pill fs-6">{pendingDoctors.length} Pending Board Reviews</Badge>
      </div>

      {error && <Alert variant="danger" className="rounded-3 shadow-sm">{error}</Alert>}
      {success && <Alert variant="success" className="rounded-3 shadow-sm">{success}</Alert>}

      {/* Main Action Table Container */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" variant="danger" />
            <p className="mt-2 text-muted small fw-medium">Assembling legal registration profiles...</p>
          </div>
        ) : (
          <Table responsive hover className="align-middle mb-0 bg-white">
            <thead className="table-light text-secondary small text-uppercase">
              <tr>
                <th className="ps-4">Applicant Practitioner</th>
                <th>Affiliated Clinic / Org</th>
                <th>Verification Document</th>
                <th className="text-end pe-4">System Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingDoctors.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted">
                    <i className="bi bi-file-earmark-check text-success fs-1 d-block mb-2"></i>
                    <span className="fw-semibold text-dark d-block">All Queues Clear</span>
                    <span className="small text-muted">There are no pending doctor registration files requiring authorization checks right now.</span>
                  </td>
                </tr>
              )}
              {pendingDoctors.map(doctor => (
                <tr key={doctor.id}>
                  <td className="ps-4">
                    <div className="fw-bold text-dark">Dr. {doctor.name}</div>
                    <div className="text-muted extra-small">{doctor.email}</div>
                  </td>
                  <td className="fw-medium text-secondary">{doctor.organisation || 'Independent Practice'}</td>
                  <td>
                    {doctor.id_document ? (
                      <a href={doctor.id_document} target="_blank" rel="noopener noreferrer" className="text-decoration-none small fw-bold text-danger d-inline-flex align-items-center gap-1">
                        <i className="bi bi-file-earmark-pdf-fill fs-6"></i> Open Medical Certificate
                      </a>
                    ) : (
                      <span className="text-muted extra-small italic text-wrap">No upload attachment caught</span>
                    )}
                  </td>
                  <td className="text-end pe-4">
                    <Button 
                      size="sm" 
                      variant="danger" 
                      className="rounded-3 fw-semibold px-3 shadow-xs me-2"
                      onClick={() => handleOpenDoctorAudit(doctor)}
                    >
                      Audit & Verify
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-secondary" 
                      className="rounded-3 fw-semibold px-3"
                      onClick={() => handleReject(doctor.id)}
                    >
                      Deny Access
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* --- DOCTOR SECURE CREDENTIAL ENTRY MODAL GRID --- */}
      <Modal show={showDocModal} onHide={() => setShowDocModal(false)} size="lg" centered className="rounded-4">
        {selectedDoctor && (
          <Form onSubmit={handleApproveDoctorSubmit}>
            <Modal.Header closeButton className="bg-light border-0 px-4 pt-4">
              <Modal.Title className="fw-bold text-dark">
                <i className="bi bi-patch-check-fill text-success me-2"></i>Provision Clinical System Access
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-light px-4 pb-4">
              <Alert variant="danger" className="border-0 rounded-3 small mb-4 bg-opacity-10 text-danger-emphasis border-start border-danger border-3">
                <i className="bi bi-info-circle-fill me-2"></i>
                You are verifying a medical practitioner license row for <strong>Dr. {selectedDoctor.name}</strong>. Cross-reference their parameters against state registry catalogs before confirming.
              </Alert>

              <Card className="border-0 shadow-sm rounded-3 p-4 bg-white">
                <Row className="g-3">
                  <Col md={6} sm={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">Verified Medical License Key</Form.Label>
                      <Form.Control type="text" name="licenseNo" value={docCredentials.licenseNo} onChange={handleInputChange} required placeholder="e.g. LIC-88371-MED" className="rounded-3" />
                    </Form.Group>
                  </Col>
                  <Col md={6} sm={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">National Provider Identifier (NPI)</Form.Label>
                      <Form.Control type="text" name="npi" value={docCredentials.npi} onChange={handleInputChange} required placeholder="10-digit numerical code" maxLength={10} className="rounded-3" />
                    </Form.Group>
                  </Col>

                  <Col md={12}><hr className="my-2 opacity-25 text-muted" /></Col>

                  <Col md={4} sm={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">Assigned Classification</Form.Label>
                      <Form.Select name="specialization" value={docCredentials.specialization} onChange={handleInputChange} className="rounded-3">
                        <option value="General Practitioner">General Practitioner</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Pediatrician">Pediatrician</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Neurologist">Neurologist</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4} sm={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">Years of Experience</Form.Label>
                      <Form.Control type="number" name="experienceYears" value={docCredentials.experienceYears} onChange={handleInputChange} required className="rounded-3" min={0} />
                    </Form.Group>
                  </Col>
                  <Col md={4} sm={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">Consultation Fee Rate ($)</Form.Label>
                      <Form.Control type="number" name="videoFee" value={docCredentials.videoFee} onChange={handleInputChange} required className="rounded-3" min={0} />
                    </Form.Group>
                  </Col>
                </Row>
              </Card>
            </Modal.Body>
            <Modal.Footer className="bg-light border-0 px-4 pb-4 pt-0">
              <Button variant="secondary" className="rounded-3 px-3 fw-semibold" onClick={() => setShowDocModal(false)}>Cancel Review</Button>
              <Button type="submit" variant="success" className="rounded-3 px-4 fw-semibold shadow-sm">Authorize & Deploy Profile</Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>
    </Container>
  );
};

export default Approvals;