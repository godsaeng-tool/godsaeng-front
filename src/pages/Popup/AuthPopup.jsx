import React from 'react';
import { IoClose } from "react-icons/io5";
import '../../styles/Popup/AuthPopup.css';

function AuthPopup({ onLoginClick, onSignupClick, onClose  }) {
  return (
    <div className="auth-popup">
      <button className="close-button" onClick={onClose}><IoClose /></button>
      <p className="auth-popup-title">무료로 계정을 등록하세요!</p>
      <p className="auth-popup-sub">🔥갓생공부에 도전🔥</p>
      <button className="Login" onClick={onLoginClick}>
        로그인
      </button>
      <button className="Signup" onClick={onSignupClick}>
        이메일로 시작하기
      </button>
    </div>
  );
}

export default AuthPopup;
