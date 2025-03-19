import React, { useState } from "react";
import { login } from "../../api/authApi";
import { setToken, setRefreshToken } from "../../utils/tokenUtils";
import "../../styles/Popup/Modal.css";

function LoginModal({ onClose, setIsAuthenticated, setUserEmail, setUserName, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email && !password) {
      setError("이메일과 비밀번호를 입력하세요.");
      return;
    }
    if (!email) {
      setError("이메일을 입력하세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력하세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login({ email, password });
      
      // 토큰 저장
      setToken(result.accessToken);
      setRefreshToken(result.refreshToken);
      
      // 사용자 정보 저장
      setIsAuthenticated(true);
      setUserEmail(result.email);
      setUserName(result.username);

      onLoginSuccess(result.email, result.username);
      onClose();
    } catch (error) {
      console.error("로그인 요청 중 오류 발생:", error);
      setError(error.response?.data?.message || "로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>로그인</h2>
        {error && <p className="error-message">{error}</p>}
        <input type="email" placeholder="이메일" className="modal-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="비밀번호" className="modal-input" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="submit-button" onClick={handleLogin} disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </div>
    </div>
  );
}

export default LoginModal;