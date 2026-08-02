import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isStudent = localStorage.getItem('user')?.includes('"type":"student"');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = isStudent ? '/student/login' : '/admin/login';
    }
    return Promise.reject(err);
  }
);

export const downloadFile = async (endpoint, params, filename) => {
  const res = await api.get(endpoint, { params, responseType: 'blob' });
  const blob = res.data;
  if (blob && blob.type && blob.type.includes('application/json')) {
    const text = await blob.text();
    let message = 'Download failed. Please try again.';
    try {
      const parsed = JSON.parse(text);
      message = parsed.message || parsed.error || message;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export default api;
