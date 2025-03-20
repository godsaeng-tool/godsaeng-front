import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { removeTokens, getToken } from "../utils/tokenUtils";
import { getUserRecentLectures, updateLectureTitle, getLectures } from "../api/lectureApi";
import { updateGodMode, getCurrentUser } from "../api/authApi";

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(true);
  const [recentSummaries, setRecentSummaries] = useState([]);

  const [editTitle, setEditTitle] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 갓생모드 상태 추가 - 로컬 스토리지에서 초기값 가져오기
  const [isGodMode, setIsGodMode] = useState(() => {
    const savedGodMode = localStorage.getItem("isGodMode");
    return savedGodMode === "true";
  });

  // 갓생모드 상태가 변경될 때 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem("isGodMode", isGodMode);
  }, [isGodMode]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");
    const token = getToken();

    if (storedEmail && storedName && token) {
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
      
      // 사용자 정보 가져오기 (갓생모드 상태 포함)
      const fetchUserInfo = async () => {
        try {
          const userInfo = await getCurrentUser();
          setIsGodMode(userInfo.godMode || false);
          // 서버에서 가져온 갓생모드 상태를 로컬 스토리지에 저장
          localStorage.setItem("isGodMode", userInfo.godMode || false);
        } catch (error) {
          console.error("사용자 정보 로딩 실패:", error);
        }
      };
      
      fetchRecentLectures();
      fetchUserInfo();
    }
  }, []);

  // 갓생모드 토글 함수
  const toggleGodMode = async () => {
    if (!isAuthenticated) {
      setShowAuthPopup(true);
      return;
    }
    
    console.log('현재 갓생모드 상태:', isGodMode);
    
    try {
      const newGodModeStatus = !isGodMode;
      console.log('변경할 갓생모드 상태:', newGodModeStatus);
      
      const response = await updateGodMode(newGodModeStatus);
      console.log('갓생모드 업데이트 응답:', response);
      
      setIsGodMode(newGodModeStatus);
      localStorage.setItem("isGodMode", newGodModeStatus);
      
      console.log('변경 후 갓생모드 상태:', newGodModeStatus);
      
      if (newGodModeStatus) {
        alert('갓생모드가 활성화되었습니다! 더 많은 기능을 이용해보세요.');
      } else {
        alert('갓생모드가 비활성화되었습니다.');
      }
    } catch (error) {
      console.error('갓생모드 변경 실패:', error);
      alert('갓생모드 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 로그인 성공 시 호출하는 함수
  const handleLoginSuccess = async (email, name, godMode = false) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserName(name);
    setIsGodMode(godMode);
    setShowLogin(false);
    setShowSignup(false);
    setShowAuthPopup(false);
    
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", name);
    localStorage.setItem("isGodMode", godMode);
    
    // 최근 강의 목록 가져오기
    try {
      const recentLectures = await getUserRecentLectures(10); // 최근 10개 가져오기
      setRecentSummaries(recentLectures);
    } catch (error) {
      console.error("최근 강의 목록 로딩 실패:", error);
      setRecentSummaries([]);
    }
  };

  // 세션 체크 함수 추가
  const checkSession = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    
    try {
      // 사용자 정보 요청으로 토큰 유효성 확인
      await getCurrentUser();
    } catch (error) {
      console.error("세션 체크 실패:", error);
      // 에러 처리는 인터셉터에서 수행
    }
  }, []);

  // 주기적으로 세션 체크 (선택적)
  useEffect(() => {
    if (isAuthenticated) {
      // 15분마다 세션 체크
      const sessionCheckInterval = setInterval(checkSession, 15 * 60 * 1000);
      return () => clearInterval(sessionCheckInterval);
    }
  }, [isAuthenticated, checkSession]);

  // 로그아웃 함수 개선
  const handleLogout = () => {
    // 토큰 제거
    removeTokens();
    
    // 상태 초기화
    setIsAuthenticated(false);
    setUserEmail("");
    setUserName("");
    setRecentSummaries([]);
    setIsGodMode(false);
    
    // 로컬 스토리지 정리
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("isGodMode");
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
        isGodMode, setIsGodMode, toggleGodMode,
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
