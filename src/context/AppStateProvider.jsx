import React, { createContext, useContext, useState, useEffect } from "react";
import { removeTokens } from "../utils/tokenUtils";
import { getUserRecentLectures, updateLectureTitle, getLectures } from "../api/lectureApi";

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [recentSummaries, setRecentSummaries] = useState([]);

  const [editTitle, setEditTitle] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");

    if (storedEmail && storedName) {
      setIsAuthenticated(true);
      setUserEmail(storedEmail);
      setUserName(storedName);
      setShowAuthPopup(false);
      
      // 최근 강의 목록 가져오기
      const fetchRecentLectures = async () => {
        try {
          const recentLectures = await getUserRecentLectures(5); // 최근 5개만 가져오기
          setRecentSummaries(recentLectures);
        } catch (error) {
          console.error("최근 강의 목록 로딩 실패:", error);
          setRecentSummaries([]);
        }
      };
      
      fetchRecentLectures();
    }
  }, []);

  // 로그인 성공 시 호출하는 함수
  const handleLoginSuccess = async (email, name) => {
    console.log("로그인 성공:", email, name);
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserName(name);

    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", name);

    setShowAuthPopup(false);
    
    // 최근 강의 목록 가져오기
    try {
      const recentLectures = await getUserRecentLectures(5);
      setRecentSummaries(recentLectures);
    } catch (error) {
      console.error("최근 강의 목록 로딩 실패:", error);
      setRecentSummaries([]);
    }
  };

  // 로그아웃 함수 개선
  const handleLogout = () => {
    // 토큰 제거
    removeTokens();
    
    // 상태 초기화
    setIsAuthenticated(false);
    setUserEmail("");
    setUserName("");
    setRecentSummaries([]);
    
    // 로컬 스토리지 정리
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem(`recentSummaries_${userEmail}`);

    // 홈으로 리다이렉트
    window.location.href = "/";
  };

  // 사이드바 토글
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleRecentSummaries = () => {
    setIsRecentOpen(!isRecentOpen);
  };

  // 최신 항목 이름 변경
  const handleSaveEdit = async () => {
    if (editIndex !== null && recentSummaries[editIndex]) {
      try {
        const lecture = recentSummaries[editIndex];
        await updateLectureTitle(lecture.id, editTitle);
        
        // 성공 시 로컬 상태 업데이트
        const updatedSummaries = [...recentSummaries];
        updatedSummaries[editIndex] = {
          ...lecture,
          title: editTitle
        };
        setRecentSummaries(updatedSummaries);
      } catch (error) {
        console.error("강의 제목 수정 실패:", error);
        alert("강의 제목 수정에 실패했습니다.");
      }
      setShowEditModal(false);
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        showLogin,setShowLogin,
        showSignup,setShowSignup,
        showAuthPopup,setShowAuthPopup,
        isAuthenticated,setIsAuthenticated,
        userEmail,setUserEmail,
        userName,setUserName,
        recentSummaries,setRecentSummaries,
        editTitle,setEditTitle,
        editIndex,setEditIndex,
        showEditModal,setShowEditModal,
        handleLoginSuccess,
        handleLogout,
        isSidebarCollapsed,toggleSidebar,
        isRecentOpen, toggleRecentSummaries,
        handleSaveEdit,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
