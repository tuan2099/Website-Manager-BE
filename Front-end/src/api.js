import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function saveTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers = config.headers || {};
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      (error?.response ? `HTTP ${error.response.status}` : 'Network error');
    return Promise.reject(new Error(message));
  },
);

export async function apiRequest(path, options = {}) {
  const method = (options.method || 'GET').toLowerCase();
  const config = {
    url: path,
    method,
  };

  if (options.headers) {
    config.headers = options.headers;
  }

  if (options.body) {
    config.data = options.body;
  }

  const res = await apiClient.request(config);
  return res.data;
}
