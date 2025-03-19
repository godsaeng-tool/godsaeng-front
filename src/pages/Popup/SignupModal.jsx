import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { signup, login } from "../../api/authApi";
import { setToken, setRefreshToken } from "../../utils/tokenUtils";
import "../../styles/Popup/Modal.css";

function SignupModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email && !password && !username) {
      setError("모든 필드를 입력해주세요.");
      return;
    }
    if (!email) return setError("이메일을 입력해주세요.");
    if (!password) return setError("비밀번호를 입력해주세요.");
    if (!username) return setError("닉네임을 입력해주세요.");

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // 회원가입 요청
      await signup({ email, password, username });
      
      setSuccessMessage("회원가입 성공! 🎉");
      
      // 회원가입 후 자동 로그인
      try {
        const loginResult = await login({ email, password });
        
        // 토큰 저장
        setToken(loginResult.accessToken);
        setRefreshToken(loginResult.refreshToken);
        
        // 2초 후 자동으로 모달 닫기
        setTimeout(() => {
          onClose();
          window.location.href = "/"; // 회원가입 후 홈으로 이동
        }, 2000);
      } catch (loginError) {
        console.error("자동 로그인 실패:", loginError);
        setError("회원가입은 성공했지만 자동 로그인에 실패했습니다. 로그인 페이지로 이동합니다.");
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      setError(error.response?.data?.message || "회원가입에 실패했습니다. 다시 시도해주세요.");
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-button" onClick={onClose}>
          <IoClose />
        </button>
        <h3>회원가입</h3>

        {/* 에러 메시지 표시 */}
        {error && <p className="error-message">{error}</p>}

        {/* 회원가입 성공 메시지 표시 */}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <input type="email" placeholder="이메일" className="modal-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="비밀번호" className="modal-input" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="text" placeholder="닉네임" className="modal-input" value={username} onChange={(e) => setUsername(e.target.value)} />
        <button className="modal-button" onClick={handleSignup} disabled={loading}>
          {loading ? "처리 중..." : "회원가입"}
        </button>
      </div>
    </div>
  );
}

export default SignupModal;