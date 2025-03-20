import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AppStateProvider, useAppState } from "./context/AppStateProvider";
import AuthPopup from "./pages/Popup/AuthPopup";
import LoginModal from "./pages/Popup/LoginModal";
import SignupModal from "./pages/Popup/SignupModal";
import UploadBox from "./pages/Home/Home";
import Sidebar from "./pages/Home/Sidebar";
import SummaryPage from "./pages/Summary/SummaryPage";
import LectureDetailPage from "./pages/Summary/LectureDetailPage";

import "./App.css";

function AppContent() {
  const {
    showLogin, setShowLogin,
    showSignup, setShowSignup,
    showAuthPopup, setShowAuthPopup,
    isAuthenticated, setIsAuthenticated,
    userEmail, setUserEmail,
    userName, setUserName,
    recentSummaries, setRecentSummaries,
    handleLogout, handleLoginSuccess,
    isSidebarCollapsed,
  } = useAppState();

  useEffect(() => {
    console.log("로그인 상태 변경:", isAuthenticated);
  }, [isAuthenticated]);

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleSignupClick = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  const handleCloseModal = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar
          recentSummaries={recentSummaries} setRecentSummaries={setRecentSummaries}
          onOpenAuthPopup={() => setShowAuthPopup(true)}
          onHomeClick={() => (window.location.href = "/")}
          isAuthenticated={isAuthenticated}
          userEmail={userEmail} userName={userName}
          onLogout={handleLogout}
        />

        <div className={`main-header ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <img
            src="/fire_icon.png" alt="fire" className="logo-img"
            onClick={() => (window.location.href = "/")}
            style={{ cursor: "pointer" }}
          />
          <div
            className="logo"
            onClick={() => (window.location.href = "/")}
            style={{ cursor: "pointer" }}
          >
            갓생도구
          </div>
        </div>

        <div className={`main-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
          <Routes>
            <Route
              path="/"
              element={
                <UploadBox
                  isAuthenticated={isAuthenticated}
                  setRecentSummaries={setRecentSummaries}
                  onLogout={handleLogout}
                />
              }
            />
            {/* <Route path="/summary" element={<SummaryPage recentSummaries={recentSummaries} />} /> */}
            <Route
              path="/lectures/:lectureId"
              element={<LectureDetailPage recentSummaries={recentSummaries} />}
            />
          </Routes>

          {showAuthPopup && (
            <AuthPopup
              onLoginClick={handleLoginClick} onSignupClick={handleSignupClick}
              onClose={() => setShowAuthPopup(false)}
            />
          )}
        </div>

        {showLogin && (
          <LoginModal
            onClose={handleCloseModal}
            setIsAuthenticated={setIsAuthenticated}
            setUserEmail={setUserEmail}
            setUserName={setUserName}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {showSignup && <SignupModal onClose={handleCloseModal} />}
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;
