import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  // In production rely on Vercel rewrite so calls stay same-origin and bypass CORS
  // (import.meta.env.PROD ? '/api' : 'https://backend-swqd.onrender.com/api');
  (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api');


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default api;
