const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

export const api = {
  healthCheck: () =>
    fetch(`${API_URL}/api/health`, { headers: getHeaders() }).then(handleResponse),

  get: (endpoint) =>
    fetch(`${API_URL}${endpoint}`, { method: 'GET', headers: getHeaders() }).then(handleResponse),

  post: (endpoint, data) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  put: (endpoint, data) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  patch: (endpoint, data) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (endpoint) =>
    fetch(`${API_URL}${endpoint}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  postForm: (endpoint, formData) =>
    fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    }).then(handleResponse),
};
