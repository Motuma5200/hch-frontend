import React, { useEffect, useState } from 'react';
import { Form, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { getDoctorProfile, updateDoctorProfile, getAdvices, addAdvice } from '../services/Api';

const DoctorDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const doctorId = user.id;

  const [profile, setProfile] = useState({ name: user.name || '', bio: '', specialization: '' });
  const [advices, setAdvices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [adviceText, setAdviceText] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (doctorId) {
          const p = await getDoctorProfile(doctorId);
          setProfile(prev => ({ ...prev, ...p.data }));

          const adv = await getAdvices(doctorId);
          setAdvices(adv.data || []);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load doctor data');
      } finally { setLoading(false); }
    };
    load();
  }, [doctorId]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoctorProfile(doctorId, profile);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to save profile');
    } finally { setSaving(false); }
  };

  const handleAddAdvice = async (e) => {
    e.preventDefault();
    try {
      await addAdvice(doctorId, { text: adviceText });
      setAdviceText('');
      const adv = await getAdvices(doctorId);
      setAdvices(adv.data || []);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="container" style={{ paddingTop: '90px' }}><Spinner animation="border" /></div>;

  return (
    <div className="container" style={{ paddingTop: '90px' }}>
      <h2>Doctor Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="mb-4">
        <h5>Profile</h5>
        <Form onSubmit={handleSaveProfile}>
          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Specialization</Form.Label>
            <Form.Control value={profile.specialization} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Bio</Form.Label>
            <Form.Control as="textarea" rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          </Form.Group>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
        </Form>
      </div>

      <div>
        <h5>Advices / Notes</h5>
        <Form onSubmit={handleAddAdvice} className="mb-3">
          <Form.Group className="mb-2">
            <Form.Control placeholder="Write advice or note for patient" value={adviceText} onChange={(e) => setAdviceText(e.target.value)} />
          </Form.Group>
          <Button type="submit">Add Advice</Button>
        </Form>

        <Table bordered>
          <thead><tr><th>Text</th><th>Date</th></tr></thead>
          <tbody>
            {advices.length === 0 && <tr><td colSpan={2}>No advices yet</td></tr>}
            {advices.map(a => (
              <tr key={a.id}><td>{a.text}</td><td>{new Date(a.created_at).toLocaleString()}</td></tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default DoctorDashboard;
