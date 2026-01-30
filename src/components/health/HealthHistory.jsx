import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Form, Button, Spinner, Alert, Table, InputGroup, FormControl } from 'react-bootstrap';
import { healthMetricsAPI } from '../../services/healthMetrics';

const metricOptions = [
  { value: '', label: 'All' },
  { value: 'blood_pressure', label: 'Blood Pressure' },
  { value: 'blood_sugar', label: 'Blood Sugar' },
  { value: 'weight', label: 'Weight' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'bmi', label: 'BMI' },
  { value: 'heart_rate', label: 'Heart Rate' },
  { value: 'symptom', label: 'Symptoms' },
];

const pageSize = 10;

const HealthHistory = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [metricType, setMetricType] = useState('');
  const [days, setDays] = useState(90);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      // Use underlying API helper so token header is handled by axios interceptor
      const metricParam = metricType || null;
      const res = await healthMetricsAPI.getHistory(metricParam, days);

      // axios returns data in res.data
      const result = res.data;

      if (!result || !result.success) {
        throw new Error(result?.message || 'Unexpected response from server');
      }

      let data = Array.isArray(result.data) ? result.data : (result.data?.flat || []);

      // Normalize entries into common shape
      const normalized = data.map(item => {
        // possible shapes: { date, metric_type, value } or { recorded_at, metric_type, value }
        const date = item.recorded_at || item.date || item.timestamp || item.created_at || item.time;
        const type = item.metric_type || item.type || (item.symptom ? 'symptom' : (item.metric || 'unknown'));

        let display = '';

        if (type === 'blood_pressure') {
          display = `${item.systolic ?? item.sys ?? item.systolic_value ?? ''}/${item.diastolic ?? item.dia ?? item.diastolic_value ?? ''}`;
        } else if (type === 'symptom') {
          display = item.symptom || item.notes || JSON.stringify(item.details || item);
        } else {
          display = item.value ?? item.v ?? '';
        }

        return { id: item.id ?? `${date}-${type}-${Math.random()}`, date, type, display, raw: item };
      });

      // Sort descending by date if possible
      normalized.sort((a, b) => new Date(b.date) - new Date(a.date));

      setEntries(normalized);
      setPage(1);
    } catch (err) {
      console.error('History fetch error', err);
      setApiError(err.message || 'Unable to fetch history');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [metricType, days]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filtered = entries.filter(e => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (e.type || '').toLowerCase().includes(s) || (String(e.display) || '').toLowerCase().includes(s) || (new Date(e.date).toLocaleString() || '').toLowerCase().includes(s);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const downloadCSV = () => {
    const rows = [['Date', 'Type', 'Value']].concat(filtered.map(r => [r.date, r.type, r.display]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-history-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-primary fw-bold">Data History</h5>
        <div>
          <Button variant="outline-primary" size="sm" className="me-2" onClick={fetchHistory}>
            Refresh
          </Button>
          <Button variant="outline-success" size="sm" onClick={downloadCSV}>
            Export CSV
          </Button>
        </div>
      </Card.Header>

      <Card.Body>
        {apiError && <Alert variant="danger">{apiError}</Alert>}

        <Row className="mb-3">
          <Col md={4} className="mb-2">
            <Form.Label className="small fw-bold">Metric</Form.Label>
            <Form.Select value={metricType} onChange={(e) => setMetricType(e.target.value)}>
              {metricOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Form.Select>
          </Col>

          <Col md={3} className="mb-2">
            <Form.Label className="small fw-bold">Period</Form.Label>
            <Form.Select value={days} onChange={(e) => setDays(parseInt(e.target.value, 10))}>
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 3 Months</option>
              <option value={365}>Last 12 Months</option>
            </Form.Select>
          </Col>

          <Col md={5} className="mb-2">
            <Form.Label className="small fw-bold">Search</Form.Label>
            <InputGroup>
              <FormControl placeholder="Search type, value or date" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button variant="outline-secondary" onClick={() => setSearch('')}>Clear</Button>
            </InputGroup>
          </Col>
        </Row>

        <div style={{ minHeight: 120 }}>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (!entries || entries.length === 0) ? (
            <div className="text-center p-5 bg-light rounded border border-dashed">
              <p className="text-muted mb-0">No historical data found for the selected period.</p>
            </div>
          ) : (
            <>
              <Table responsive hover bordered className="align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>Date</th>
                    <th style={{ width: '18%' }}>Type</th>
                    <th>Value / Details</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map(row => (
                    <tr key={row.id}>
                      <td>{new Date(row.date).toLocaleString()}</td>
                      <td className="text-capitalize">{row.type.replace(/_/g, ' ')}</td>
                      <td style={{ whiteSpace: 'pre-wrap' }}>{row.display}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">Showing {((page-1)*pageSize)+1} - {Math.min(page*pageSize, filtered.length)} of {filtered.length}</div>
                <div>
                  <Button variant="outline-secondary" size="sm" className="me-2" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</Button>
                  <Button variant="outline-secondary" size="sm" disabled={page>=totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default HealthHistory;
