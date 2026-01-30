import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Form, Card, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const HealthCharts = () => {
  const [chartData, setChartData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('bmi');
  const [days, setDays] = useState(90); 
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const metricOptions = [
    { value: 'blood_pressure', label: 'Blood Pressure' },
    { value: 'blood_sugar', label: 'Blood Sugar' },
    { value: 'weight', label: 'Weight' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'bmi', label: 'BMI' },
    { value: 'heart_rate', label: 'Heart Rate' }
  ];

 const fetchChartData = useCallback(async () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');

  if (!token) {
    setApiError('Authentication token missing. Please log in again.');
    setLoading(false);
    return;
  }

  setLoading(true);
  setApiError(null);

  try {
    const url = `http://localhost:8000/api/health/charts/${selectedMetric}?days=${days}`;
    console.log("Requesting URL:", url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    // Defensive parsing if server responds with HTML / not JSON
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error('Non-JSON response from server: ' + text.slice(0, 300));
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message || `Server Error ${response.status}`);

    // Normalize into an array of { date, value } or { date, systolic, diastolic }
    let normalized = [];

    if (result.data && Array.isArray(result.data.flat) && result.data.flat.length > 0) {
      normalized = result.data.flat.map(it => {
        return selectedMetric === 'blood_pressure'
          ? { date: it.date, systolic: it.systolic, diastolic: it.diastolic }
          : { date: it.date, value: it.value };
      });
    } else if (Array.isArray(result.data)) {
      normalized = result.data;
    } else if (result.data && result.data.series) {
      if (selectedMetric === 'blood_pressure') {
        const sys = result.data.series.systolic || [];
        const dia = result.data.series.diastolic || [];
        const dMap = new Map(dia.map(d => [d.x, d.y]));
        normalized = sys.map(s => ({ date: s.x, systolic: s.y, diastolic: dMap.get(s.x) ?? null }));
      } else {
        normalized = (result.data.series || []).map(p => ({ date: p.x, value: p.y }));
      }
    }

    if (!normalized.length) {
      setChartData(null);
      setApiError(null);
    } else {
      const labels = normalized.map(item => item.date);
      let datasets = [];

      if (selectedMetric === 'blood_pressure') {
        datasets = [
          {
            label: 'Systolic',
            data: normalized.map(i => i.systolic),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Diastolic',
            data: normalized.map(i => i.diastolic),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.3,
            fill: true,
          }
        ];
      } else {
        datasets = [{
          label: metricOptions.find(m => m.value === selectedMetric)?.label || selectedMetric.toUpperCase(),
          data: normalized.map(i => i.value),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          pointRadius: 6,
          fill: true,
        }];
      }

      setChartData({ labels, datasets });
    }
  } catch (error) {
    console.error('Frontend Fetch Error:', error);
    setApiError(error.message);
    setChartData(null);
  } finally {
    setLoading(false);
  }
}, [selectedMetric, days]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { 
        display: true, 
        text: `${selectedMetric.replace('_', ' ').toUpperCase()} Trend` 
      },
    },
    scales: {
      y: { beginAtZero: false, ticks: { precision: 1 } },
      x: { grid: { display: false } }
    },
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-primary fw-bold">Health Analytics</h5>
        <Button variant="outline-primary" size="sm" onClick={fetchChartData}>
           Refresh Data
        </Button>
      </Card.Header>
      <Card.Body>
        {apiError && <Alert variant="danger">{apiError}</Alert>}
        
        <Row className="mb-4">
          <Col md={6}>
            <Form.Label className="small fw-bold">Metric</Form.Label>
            <Form.Select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
              {metricOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label className="small fw-bold">Period</Form.Label>
            <Form.Select value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 3 Months (Recommended)</option>
            </Form.Select>
          </Col>
        </Row>

        <div style={{ height: '380px', position: 'relative' }}>
          {loading ? (
            <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>
          ) : chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="text-center mt-5 p-5 bg-light rounded border border-dashed">
              <p className="text-muted">No data found in database for <strong>{selectedMetric}</strong>.</p>
              <small>Ensure your data in PHPMyAdmin has the <strong>recorded_at</strong> date within the last 90 days.</small>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default HealthCharts;