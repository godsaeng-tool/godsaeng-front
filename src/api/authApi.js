import api from './index';

export const signup = async (userData) => {
  const response = await api.post('/users/signup', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  const response = await api.post('/users/refresh', { refreshToken });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateGodMode = async (isGodMode) => {
  const response = await api.put('/users/god-mode', { isGodMode });
  return response.data;
}; 