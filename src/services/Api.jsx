import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',          // or import.meta.env.VITE_LARAVEL_URL
  withCredentials: true,                     // Critical – sends cookies
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Auto-refresh CSRF before mutating requests (very reliable)
api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
  }

  // Add authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

// Helper API methods for admin and pharmacy actions
export const getPendingApprovals = () => api.get('/api/admin/pending-approvals');

/**
 * FIXED: Now accepts the payload argument and forwards it to the Laravel backend!
 */
export const approveUser = (userId, payload) => api.post(`/api/admin/approve/${userId}`, payload);
export const rejectUser = (userId, payload) => api.post(`/api/admin/reject/${userId}`, payload);

export const deleteUser = (userId) => api.delete(`/api/admin/users/${userId}`);

export const getDrugs = (hospitalId) => api.get(`/api/hospitals/${hospitalId}/drugs`);
export const addDrug = (hospitalId, payload) => api.post(`/api/hospitals/${hospitalId}/drugs`, payload);
export const updateDrug = (hospitalId, drugId, payload) => api.put(`/api/hospitals/${hospitalId}/drugs/${drugId}`, payload);
export const deleteDrug = (hospitalId, drugId) => api.delete(`/api/hospitals/${hospitalId}/drugs/${drugId}`);
export const getAssignedHospital = () => api.get('/api/admin/assigned-hospital');
export const addHospital = (payload) => api.post(`/api/hospitals`, payload);
export const updateHospital = (hospitalId, payload) => api.put(`/api/hospitals/${hospitalId}`, payload);
export const deleteHospital = (hospitalId) => api.delete(`/api/hospitals/${hospitalId}`);

export const login = (payload) => api.post('/api/login', payload);
export const register = (payload) => api.post('/api/register', payload);

// Doctor-specific endpoints
export const getDoctorProfile = (doctorId) => api.get(`/api/doctors/${doctorId}`);
export const updateDoctorProfile = (doctorId, payload) => api.put(`/api/doctors/${doctorId}`, payload);

export const getAdvices = (doctorId) => api.get(`/api/doctors/${doctorId}/advices`);
export const addAdvice = (doctorId, payload) => api.post(`/api/doctors/${doctorId}/advices`, payload);

// Client-specific endpoints
export const getDoctors = () => api.get('/api/client/doctors');
export const getChatDoctors = () => api.get('/api/doctors');
export const sendChatMessage = (doctorId, payload) => api.post(`/api/chat/messages/${doctorId}`, payload);
export const getChatMessages = (doctorId) => api.get(`/api/chat/messages/${doctorId}`);

// Doctor chat endpoints
export const getClients = () => api.get('/api/chat/clients');
export const sendDoctorMessage = (userId, payload) => api.post(`/api/chat/doctor/messages/${userId}`, payload);