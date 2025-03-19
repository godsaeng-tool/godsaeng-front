import React, { useState } from "react";
import "../../styles/Popup/Modal.css";

function SignupModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // 성공 메시지 상태 추가

  const handleSignup = async () => {
    if (!email && !password && !username) {
      setError("모든 필드를 입력해주세요.");
      return;
    }
    if (!email) return setError("이메일을 입력해주세요.");
    if (!password) return setError("비밀번호를 입력해주세요.");
    if (!username) return setError("닉네임을 입력해주세요.");

    try {
      const response = await fetch("http://localhost:8080/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, username }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("회원가입 성공! 🎉");
        setError(""); // 에러 메시지 초기화

        // 2초 후 자동으로 모달 닫기
        setTimeout(() => {
          onClose();
          window.location.href = "/"; // 회원가입 후 홈으로 이동
        }, 2000);
      } else {
        setError(result.message || "회원가입 실패. 다시 시도해주세요.");
        setSuccessMessage(""); // 성공 메시지 초기화
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      setError("서버 오류가 발생했습니다.");
      setSuccessMessage(""); // 성공 메시지 초기화
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>회원가입</h2>

        {/* 에러 메시지 표시 */}
        {error && <p className="error-message">{error}</p>}

        {/* 회원가입 성공 메시지 표시 */}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <input type="email" placeholder="이메일" className="modal-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="비밀번호" className="modal-input" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="text" placeholder="닉네임" className="modal-input" value={username} onChange={(e) => setUsername(e.target.value)} />
        <button className="modal-button" onClick={handleSignup}>회원가입</button>
      </div>
    </div>
  );
}

export default SignupModal;
