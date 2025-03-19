import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

import { IoClose } from "react-icons/io5";
import { HiOutlineHome } from "react-icons/hi2";
import { GoClock } from "react-icons/go";
import { IoFolderOpenOutline } from "react-icons/io5";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { BsLayoutSidebar } from "react-icons/bs";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { FaCrown } from "react-icons/fa";
import { MdOutlineAddToPhotos } from "react-icons/md";

import { useAppState } from "../../context/AppStateProvider";
import { updateGodMode } from "../../api/authApi";
import { getUserRecentLectures, deleteLecture } from "../../api/lectureApi";
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
  const [lecturesLoading, setLecturesLoading] = useState(false);

  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(null);
  const [localSummaries, setLocalSummaries] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedLecture, setSelectedLecture] = useState(null);

  const fetchLectures = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLecturesLoading(true);
      const lectures = await getUserRecentLectures(10);
      setLocalSummaries(lectures);
      setRecentSummaries(lectures);
    } catch (error) {
      console.error('강의 목록 로딩 실패:', error);
    } finally {
      setLecturesLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLectures();
    } else {
      setLocalSummaries([]);
      setRecentSummaries([]);
    }
  }, [isAuthenticated]);

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

  const handleMoreOptionsClick = (index, event, lecture) => {
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 100,
      });
    }
    
    setSelectedLecture(lecture);
    setIsMoreOptionsOpen(isMoreOptionsOpen === index ? null : index);
  };

  const handleDelete = async (index) => {
    if (!selectedLecture) return;
    
    if (window.confirm("이 항목을 삭제하시겠습니까?")) {
      try {
        await deleteLecture(selectedLecture.id);
        
        fetchLectures();
        setIsMoreOptionsOpen(null);
      } catch (error) {
        console.error('강의 삭제 실패:', error);
        alert('강의 삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = (index) => {
    setEditTitle(localSummaries[index].title);
    setEditIndex(index);
    setShowEditModal(true);
    setIsMoreOptionsOpen(null);
  };

  const handleAddToDrawer = (index) => {
    alert('내서랍 추가(구현전)');
    setIsMoreOptionsOpen(null);
  };

  const groupLecturesByDate = (lectures) => {
    const sortedLectures = [...lectures].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const grouped = {
      today: [],
      yesterday: [],
      earlier: []
    };

    sortedLectures.forEach(lecture => {
      try {
        const date = parseISO(lecture.createdAt);
        
        if (isToday(date)) {
          grouped.today.push(lecture);
        } else if (isYesterday(date)) {
          grouped.yesterday.push(lecture);
        } else {
          grouped.earlier.push(lecture);
        }
      } catch (error) {
        grouped.earlier.push(lecture);
      }
    });

    return grouped;
  };

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MM월 dd일', { locale: ko });
    } catch (error) {
      return '날짜 없음';
    }
  };

  const groupedLectures = groupLecturesByDate(localSummaries);

  return (
    <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="toggle-button" onClick={toggleSidebar}>
          <BsLayoutSidebar />
        </button>
      </div>

      {!isSidebarCollapsed && (
        <div className="sidebar-content">
          <div className="menu-container">
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
                  {lecturesLoading ? (
                    <li className="loading-message">강의 목록 로딩 중...</li>
                  ) : localSummaries.length > 0 ? (
                    <>
                      {groupedLectures.today.length > 0 && (
                        <div className="date-group">
                          <div className="date-header">오늘</div>
                          {groupedLectures.today.map((lecture, index) => (
                            <li
                              key={lecture.id}
                              className={`summary-list-item ${activeIndex === `today-${index}` ? "active" : ""}`}
                            >
                              <div className="summary-item">
                                <span
                                  onClick={() => onSummaryClick(lecture, `today-${index}`)}
                                  className={activeIndex === `today-${index}` ? "active" : ""}
                                >
                                  {lecture.title}
                                </span>
                                <HiOutlineDotsHorizontal
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoreOptionsClick(`today-${index}`, e, lecture);
                                  }}
                                  className="more-options-icon"
                                />
                              </div>
                            </li>
                          ))}
                        </div>
                      )}

                      {groupedLectures.yesterday.length > 0 && (
                        <div className="date-group">
                          <div className="date-header">어제</div>
                          {groupedLectures.yesterday.map((lecture, index) => (
                            <li
                              key={lecture.id}
                              className={`summary-list-item ${activeIndex === `yesterday-${index}` ? "active" : ""}`}
                            >
                              <div className="summary-item">
                                <span
                                  onClick={() => onSummaryClick(lecture, `yesterday-${index}`)}
                                  className={activeIndex === `yesterday-${index}` ? "active" : ""}
                                >
                                  {lecture.title}
                                </span>
                                <HiOutlineDotsHorizontal
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoreOptionsClick(`yesterday-${index}`, e, lecture);
                                  }}
                                  className="more-options-icon"
                                />
                              </div>
                            </li>
                          ))}
                        </div>
                      )}

                      {groupedLectures.earlier.length > 0 && (
                        <div className="date-group">
                          <div className="date-header">이전</div>
                          {groupedLectures.earlier.map((lecture, index) => (
                            <li
                              key={lecture.id}
                              className={`summary-list-item ${activeIndex === `earlier-${index}` ? "active" : ""}`}
                            >
                              <div className="summary-item">
                                <span
                                  onClick={() => onSummaryClick(lecture, `earlier-${index}`)}
                                  className={activeIndex === `earlier-${index}` ? "active" : ""}
                                >
                                  {lecture.title}
                                </span>
                                <HiOutlineDotsHorizontal
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoreOptionsClick(`earlier-${index}`, e, lecture);
                                  }}
                                  className="more-options-icon"
                                />
                              </div>
                            </li>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <li className="no-summaries">최근 강의가 없습니다</li>
                  )}
                </ul>
              )}

              {/* <li>
                <IoFolderOpenOutline /> 내 서랍
              </li> */}
            </ul>
          </div>

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

          <div className="sidebar-footer">
            <p>© 갓생살기</p>
          </div>
        </div>
      )}

      {isMoreOptionsOpen !== null && (
        <div 
          className="more-options-menu" 
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
        >
          <button onClick={() => handleDelete(isMoreOptionsOpen)}>
            삭제
          </button>
          <button onClick={() => handleAddToDrawer(isMoreOptionsOpen)}>
            내 서랍에 넣기
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
