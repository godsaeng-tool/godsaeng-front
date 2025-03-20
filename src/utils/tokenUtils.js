// 토큰 저장
export const setToken = (token) => {
  if (!token) {
    console.error('토큰이 없습니다.');
    return;
  }
  localStorage.setItem('accessToken', token);
  console.log('액세스 토큰 저장됨');
};

// 리프레시 토큰 저장
export const setRefreshToken = (token) => {
  if (!token) {
    console.error('리프레시 토큰이 없습니다.');
    return;
  }
  localStorage.setItem('refreshToken', token);
  console.log('리프레시 토큰 저장됨');
};

// 토큰 가져오기
export const getToken = () => {
  return localStorage.getItem('accessToken');
};

// 리프레시 토큰 가져오기
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// 토큰 삭제
export const removeTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  console.log('모든 토큰이 삭제됨');
};

// 인증 여부 확인
export const isAuthenticated = () => {
  return !!getToken();
};

// 토큰 만료 시간 확인 (선택적)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // JWT 토큰 디코딩 (간단한 방식)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // 현재 시간과 만료 시간 비교
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('토큰 만료 확인 중 오류:', error);
    return true;
  }
};

// 토큰 리프레시 함수 추가
export const refreshToken = async (refreshToken) => {
  // 이 함수는 실제로 API 호출을 하지 않고, authApi.js의 함수를 사용하도록 리다이렉트합니다.
  // 순환 참조 문제를 피하기 위해 동적 import 사용
  const { refreshToken: refreshTokenApi } = await import('../api/authApi');
  return refreshTokenApi(refreshToken);
}; 