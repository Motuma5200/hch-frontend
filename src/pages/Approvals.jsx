import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import { getPendingApprovals, approveUser, rejectUser } from '../services/Api';

const Approvals = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const resp = await getPendingApprovals();
      setPending(resp.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      setPending(p => p.filter(u => u.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id) => {
    try {
      await rejectUser(id);
      setPending(p => p.filter(u => u.id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="container" style={{ paddingTop: '90px' }}>
      <h2>Pending Approvals</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table bordered>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Organisation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 && (
              <tr><td colSpan={5} className="text-center">No pending approvals</td></tr>
            )}
            {pending.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.organisation || '-'}</td>
                <td>
                  <Button size="sm" variant="success" onClick={() => handleApprove(user.id)}>Approve</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => handleReject(user.id)}>Reject</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default Approvals;
