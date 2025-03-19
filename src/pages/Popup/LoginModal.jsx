import React, { useState } from "react";
import "../../styles/Popup/Modal.css";

function LoginModal({ onClose, setIsAuthenticated, setUserEmail, setUserName, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

    try {
      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = "로그인 실패. 다시 시도해주세요.";
        try {
          const errorResult = await response.json();
          errorMessage = errorResult.message || errorMessage;
        } catch (jsonError) {
          console.error("JSON 파싱 오류:", jsonError);
        }
        setError(errorMessage);
        return;
      }
  
      const result = await response.json();

      setIsAuthenticated(true);
      setUserEmail(result.email);
      setUserName(result.username);

      onLoginSuccess(result.email, result.username);

      onClose();
      console.log(result);
    } catch (error) {
      console.error("로그인 요청 중 오류 발생:", error);
      setError("서버 오류가 발생했습니다.");
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
        <button className="submit-button" onClick={handleLogin}>로그인</button>
      </div>
    </div>
  );
}
export default LoginModal;