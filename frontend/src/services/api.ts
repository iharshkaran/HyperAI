import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true, // Cookies and session handling
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;