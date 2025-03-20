import axios from 'axios';
import { getToken, getRefreshToken, setToken, removeTokens } from '../utils/tokenUtils';

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
    
    // 토큰 만료 에러인지 확인 (401 Unauthorized)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log('토큰 만료 감지, 리프레시 시도...');
      
      // 재시도 플래그 설정
      originalRequest._retry = true;
      
      try {
        // 리프레시 토큰 가져오기
        const refreshTokenValue = getRefreshToken();
        
        if (!refreshTokenValue) {
          console.error('리프레시 토큰이 없습니다.');
          // 로그아웃 처리
          removeTokens();
          window.location.href = '/';
          return Promise.reject(new Error('No refresh token available'));
        }
        
        // 리프레시 토큰으로 새 액세스 토큰 요청
        console.log('리프레시 토큰으로 새 액세스 토큰 요청 중...');
        
        // 직접 axios를 사용하여 리프레시 요청 (순환 참조 방지)
        const response = await axios.post(`${API_BASE_URL}/users/refresh`, { 
          refreshToken: refreshTokenValue 
        });
        
        console.log('토큰 리프레시 응답:', response.data);
        
        const { accessToken } = response.data;
        
        if (!accessToken) {
          console.error('새 액세스 토큰을 받지 못했습니다.');
          throw new Error('Failed to refresh token');
        }
        
        // 새 토큰 저장
        setToken(accessToken);
        
        // 원래 요청 헤더 업데이트
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        // 원래 요청 재시도
        console.log('원래 요청 재시도...');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('토큰 리프레시 실패:', refreshError);
        
        // 리프레시 토큰도 만료된 경우 로그아웃 처리
        removeTokens();
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("isGodMode");
        
        // 로그인 페이지로 리다이렉트
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    // 다른 에러는 그대로 반환
    return Promise.reject(error);
  }
);

export default api; 