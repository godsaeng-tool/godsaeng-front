import api from './index';
import axios from 'axios';

// API 기본 URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export const signup = async (userData) => {
  const response = await api.post('/users/signup', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  // 직접 axios 사용 (api 인스턴스 사용 시 순환 참조 발생 가능)
  try {
    console.log('리프레시 토큰으로 새 액세스 토큰 요청 중...');
    const response = await axios.post(`${API_BASE_URL}/users/refresh`, { refreshToken });
    console.log('토큰 리프레시 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('토큰 리프레시 API 호출 실패:', error);
    throw error;
  }
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