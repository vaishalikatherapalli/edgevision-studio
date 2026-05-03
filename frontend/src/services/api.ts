import axios from 'axios';

const API_BASE = 'http://localhost:8000';

// Create axios instance
const api = axios.create({ baseURL: API_BASE });

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const signup = (email: string, password: string, full_name: string) =>
  api.post('/auth/signup', { email, password, full_name });

export const login = (email: string, password: string) =>
  api.post('/auth/login', new URLSearchParams({ username: email, password }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});

export const getMe = () => api.get('/auth/me');

// Inference
export const detectObjects = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/inference/detect', form);
};

export const getHistory = () => api.get('/inference/history');

// Devices
export const getDevices = () => api.get('/devices/');
export const registerDevice = (name: string, device_type: string) =>
  api.post('/devices/register', { name, device_type });
export const deleteDevice = (id: number) => api.delete(`/devices/${id}`);