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
  try {
    const response = await api.get('/users/me');
    console.log('Current user API response:', response.data);
    
    // 응답 구조에 따라 godMode 값 추출
    const godMode = response.data.isGodMode !== undefined 
      ? response.data.isGodMode 
      : (response.data.godMode !== undefined ? response.data.godMode : false);
    
    console.log('Extracted godMode value:', godMode);
    
    return {
      ...response.data,
      godMode: godMode
    };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    throw error;
  }
};

export const updateGodMode = async (isGodMode) => {
  const response = await api.put('/users/god-mode', { isGodMode });
  return response.data;
}; 