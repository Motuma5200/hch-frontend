import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',          // or import.meta.env.VITE_LARAVEL_URL
  withCredentials: true,                     // Critical – sends cookies
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Optional: auto-refresh CSRF before mutating requests (very reliable)
api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    // You can add a check if XSRF-TOKEN cookie exists, but simplest is always fetch
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
  }
  return config;
});

export default api;