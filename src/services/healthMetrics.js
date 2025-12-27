import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const healthMetricsAPI = {
  // Record health metric
  recordMetric: (data) => api.post('/health/metrics/record', data),
  
  // Record symptom
  recordSymptom: (data) => api.post('/health/symptoms/record', data),
  
  // Get health status
  getStatus: () => api.get('/health/status'),
  
  // Get chart data
  getChartData: (metricType, days = 30) => 
    api.get(`/health/charts/${metricType}?days=${days}`),
  
  // Get history
  getHistory: (metricType = null, days = 30) => {
    const params = { days };
    if (metricType) params.metric_type = metricType;
    return api.get('/health/history', { params });
  }
};