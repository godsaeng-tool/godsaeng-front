import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// 페이지 컴포넌트 임포트
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LecturesPage from './pages/LecturesPage';
import LectureDetailPage from './pages/LectureDetailPage';
import CreateLecturePage from './pages/CreateLecturePage';

// 공통 컴포넌트 임포트
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <Navbar />
      <Container className="py-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* 보호된 라우트 */}
          <Route 
            path="/lectures" 
            element={
              <ProtectedRoute>
                <LecturesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lectures/:lectureId" 
            element={
              <ProtectedRoute>
                <LectureDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-lecture" 
            element={
              <ProtectedRoute>
                <CreateLecturePage />
              </ProtectedRoute>
            } 
          />
          
          {/* 기본 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
