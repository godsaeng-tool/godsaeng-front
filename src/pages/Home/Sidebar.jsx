import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { IoClose } from "react-icons/io5";
import { HiOutlineHome } from "react-icons/hi2";
import { GoClock } from "react-icons/go";
import { IoFolderOpenOutline } from "react-icons/io5";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { BsLayoutSidebar } from "react-icons/bs";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { FaCrown } from "react-icons/fa";

import { useAppState } from "../../context/AppStateProvider";
import { updateGodMode } from "../../api/authApi";
import "../../styles/Home/Sidebar.css";

function Sidebar({
  isAuthenticated,
  userEmail,
  userName,
  onOpenAuthPopup,
  onHomeClick,
  recentSummaries = [],
  onLogout,
}) {
  const { editTitle, setEditTitle, setEditIndex, handleSaveEdit } = useAppState();
  const { showEditModal, setShowEditModal, setRecentSummaries } = useAppState();
  const { isSidebarCollapsed, toggleSidebar, isRecentOpen, toggleRecentSummaries } = useAppState();

  const [isGodMode, setIsGodMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(null);
  const [localSummaries, setLocalSummaries] = useState(recentSummaries);
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const toggleGodMode = async () => {
    setLoading(true);
    try {
      const newGodModeStatus = !isGodMode;
      await updateGodMode(newGodModeStatus);
      setIsGodMode(newGodModeStatus);
      
      if (newGodModeStatus) {
        alert('갓생모드가 활성화되었습니다! 더 많은 기능을 이용해보세요.');
      } else {
        alert('갓생모드가 비활성화되었습니다.');
      }
    } catch (error) {
      console.error('갓생모드 변경 실패:', error);
      alert('갓생모드 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const onSummaryClick = (lecture, index) => {
    setActiveIndex(index);
    navigate(`/lectures/${lecture.id}`);
  };

  const handleClickOutside = (event) => {
    if (
      !event.target.closest(".more-options-menu") &&
      !event.target.closest(".more-options-icon")
    ) {
      setIsMoreOptionsOpen(null);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleMoreOptionsClick = (index) => {
    setIsMoreOptionsOpen(isMoreOptionsOpen === index ? null : index);
  };

  useEffect(() => {
    const storedSummaries =
      JSON.parse(localStorage.getItem(`recentSummaries_${userEmail}`)) || [];
    setLocalSummaries(storedSummaries);
  }, [recentSummaries, userEmail]);

  useEffect(() => {
    setLocalSummaries(recentSummaries);
  }, [recentSummaries]);

  const handleDelete = (index) => {
    const newSummaries = localSummaries.filter((_, i) => i !== index);
    setLocalSummaries(newSummaries);
    setRecentSummaries(newSummaries);
    localStorage.setItem(
      `recentSummaries_${userEmail}`,
      JSON.stringify(newSummaries)
    );
    setIsMoreOptionsOpen(null);
  };

  const handleEdit = (index) => {
    setEditTitle(localSummaries[index]);
    setEditIndex(index);
    setShowEditModal(true);
    setIsMoreOptionsOpen(null);
  };

  // 사이드바에서 항목 클릭 시 해당 강의로 이동
  // const Sidebar = ({ recentSummaries }) => {
  // const navigate = useNavigate();

  // const handleClickSummary = (summary) => {
  //   navigate(`/summary/${summary.id}`, { state: { summary } });
  // };

  return (
    <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="toggle-button" onClick={toggleSidebar}>
          <BsLayoutSidebar />
        </button>
      </div>

      {!isSidebarCollapsed && (
        <div className="sidebar-content">
          <ul>
            <li onClick={onHomeClick}>
              <HiOutlineHome /> 홈
            </li>

            <li onClick={toggleRecentSummaries} className="recent-toggle">
              <div className="left-content">
                <GoClock /> <span>최근</span>
              </div>
              {isRecentOpen ? (
                <FaAngleUp className="toggle-icon" />
              ) : (
                <FaAngleDown className="toggle-icon" />
              )}
            </li>

            {isRecentOpen && (
              <ul className="recent-summaries">
                {recentSummaries.length > 0 ? (
                  recentSummaries.map((lecture, index) => (
                    <li
                      key={lecture.id}
                      className={activeIndex === index ? "active" : ""}
                      onClick={() => onSummaryClick(lecture, index)}
                    >
                      <div className="summary-item">
                        <span>{lecture.title}</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="no-summaries">최근 강의가 없습니다</li>
                )}
              </ul>
            )}

            {/* 강의 제목 변경 모달창 */}
            {showEditModal && (
              <div
                className="modal-overlay"
                onClick={() => setShowEditModal(false)}
              >
                <div
                  className="course-edit-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="course-title">강의 제목 변경</p>
                  <button
                    className="close-button"
                    onClick={() => setShowEditModal(false)}
                  >
                    <IoClose />
                  </button>
                  <input
                    className="course-title-input"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <button onClick={handleSaveEdit}>저장</button>{" "}
                </div>
              </div>
            )}

            {/* <li>
              <IoFolderOpenOutline /> 내 서랍
            </li> */}
          </ul>

          {/* 로그인 상태에 따라 버튼 변경 */}
          {!isAuthenticated ? (
            <button className="login-signup-button" onClick={onOpenAuthPopup}>
              로그인 / 회원가입
            </button>
          ) : (
            <div className="user-info-container">
              <div className="user-info">
                {/* <p>
                  안녕하세요! {userName}님 ({userEmail})
                </p> */}
              </div>
              <button className="god-mode-button" onClick={toggleGodMode}>
                <FaCrown className={`crown-icon ${isGodMode ? 'active' : ''}`} />
                {loading ? '처리 중...' : isGodMode ? '갓생모드 활성화됨' : '갓생모드 구독'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="sidebar-footer">
        <p>© 갓생살기</p>
      </div>
    </div>
  );
}

export default Sidebar;
