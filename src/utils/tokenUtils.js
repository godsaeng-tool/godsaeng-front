// 토큰 저장
export const setToken = (token) => {
  localStorage.setItem('accessToken', token);
};

// 리프레시 토큰 저장
export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token);
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
};

// 로그인 상태 확인
export const isAuthenticated = () => {
  return !!getToken();
};

// 토큰 리프레시 함수 추가
export const refreshToken = async (refreshToken) => {
  // 이 함수는 실제로 API 호출을 하지 않고, authApi.js의 함수를 사용하도록 리다이렉트합니다.
  // 순환 참조 문제를 피하기 위해 동적 import 사용
  const { refreshToken: refreshTokenApi } = await import('../api/authApi');
  return refreshTokenApi(refreshToken);
};