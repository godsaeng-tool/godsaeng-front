import axios from 'axios';
import { getToken, getRefreshToken, setToken } from '../utils/tokenUtils';
import { refreshToken as refreshTokenApi } from './authApi';

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 토큰 만료 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 리프레시 토큰으로 새 토큰 발급
        const refreshTokenValue = getRefreshToken();
        if (!refreshTokenValue) {
          throw new Error('No refresh token available');
        }
        
        const response = await refreshTokenApi(refreshTokenValue);
        const { accessToken } = response;
        
        // 새 토큰 저장
        setToken(accessToken);
        
        // 원래 요청 헤더 업데이트
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        // 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우 로그인 페이지로 리다이렉트
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 