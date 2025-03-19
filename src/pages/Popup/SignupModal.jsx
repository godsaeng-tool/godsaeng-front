import React, { useState } from "react";
import "../../styles/Popup/Modal.css";

function SignupModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = async () => {
    if (!email && !password && !username) {
      setError("모든 필드를 입력해주세요.");
      return;
    }
    if (!email) return setError("이메일을 입력해주세요.");
    if (!password) return setError("비밀번호를 입력해주세요.");
    if (!username) return setError("닉네임을 입력해주세요.");

    try {
      // 회원가입 요청
      const signupResponse = await fetch("http://localhost:8080/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키를 포함한 요청
        body: JSON.stringify({ email, password, username }),
      });

      const signupResult = await signupResponse.json();

      if (signupResponse.ok) {
        setSuccessMessage("회원가입 성공! 🎉");
        setError(""); // 에러 메시지 초기화

        // 회원가입 후 로그인 처리
        const loginResponse = await fetch("http://localhost:8080/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 쿠키를 포함한 요청
          body: JSON.stringify({ email, password }), // 로그인에 필요한 이메일, 비밀번호 전달
        });

        const loginResult = await loginResponse.json();

        if (loginResponse.ok) {
          // 로그인 성공 후 받은 JWT 액세스 토큰과 refreshToken을 localStorage에 저장
          localStorage.setItem("accessToken", loginResult.accessToken);
          localStorage.setItem("refreshToken", loginResult.refreshToken);

          // 2초 후 자동으로 모달 닫기
          setTimeout(() => {
            onClose();
            window.location.href = "/"; // 회원가입 후 홈으로 이동
          }, 2000);
        } else {
          setError(loginResult.message || "로그인 실패. 다시 시도해주세요.");
          setSuccessMessage(""); // 성공 메시지 초기화
        }
      } else {
        setError(signupResult.message || "회원가입 실패. 다시 시도해주세요.");
        setSuccessMessage(""); // 성공 메시지 초기화
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      setError("서버 오류가 발생했습니다.");
      setSuccessMessage(""); // 성공 메시지 초기화
    }
  };

  // 토큰 갱신 처리
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
      const response = await fetch("http://localhost:8080/api/users/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const result = await response.json();
        // 새 액세스 토큰을 localStorage에 저장
        localStorage.setItem("accessToken", result.accessToken);
      } else {
        console.log("토큰 갱신 실패");
      }
    } catch (error) {
      console.error("토큰 갱신 오류:", error);
    }
  };

  // 페이지 로드 시 토큰 갱신 확인 (토큰 만료 체크 후 갱신)
  React.useEffect(() => {
    refreshToken();
  }, []);

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
