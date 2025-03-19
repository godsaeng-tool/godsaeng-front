import React, { createContext, useContext, useState, useEffect } from "react";

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
    }
    if (isAuthenticated) {
      setShowAuthPopup(false);
      const storedSummaries = JSON.parse(localStorage.getItem(`recentSummaries_${storedEmail}`)) || [];
      setRecentSummaries(storedSummaries);
    }

    // const storedSummaries =
    //   JSON.parse(localStorage.getItem("recentSummaries")) || [];
    // setRecentSummaries(storedSummaries);
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(`recentSummaries_${userEmail}`, JSON.stringify(recentSummaries));
    }
  }, [recentSummaries, userEmail]);

  // 로그인 성공 시 호출하는 함수
  const handleLoginSuccess = (email, name) => {
    console.log("로그인 성공:", email, name);
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserName(name);

    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", name);

    setShowAuthPopup(false);

    const userSummaries = JSON.parse(localStorage.getItem(`recentSummaries_${email}`)) || [];
    setRecentSummaries(userSummaries);
  };

  // 로그아웃 함수 추가
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail("");
    setUserName("");
    setRecentSummaries([]);

    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("recentSummaries");

    setShowAuthPopup(true);
  };

  // 사이드바 토글
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleRecentSummaries = () => {
    setIsRecentOpen(!isRecentOpen);
  };

  // 최신 항목 이름 변경
  const handleSaveEdit = () => {
    if (editIndex !== null) {
      const updatedSummaries = [...recentSummaries];
      updatedSummaries[editIndex] = editTitle;
      setRecentSummaries(updatedSummaries);
      localStorage.setItem(
        `recentSummaries_${userEmail}`,
        JSON.stringify(updatedSummaries)
      );
    }
    setShowEditModal(false);
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
