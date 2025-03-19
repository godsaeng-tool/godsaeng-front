import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUpload } from "react-icons/hi";
import { FaPen, FaUser, FaSignOutAlt } from "react-icons/fa";
import { IoFolderOpenOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { isAuthenticated } from '../../utils/tokenUtils';
import { createYoutubeLecture, uploadLecture, getLectures } from '../../api/lectureApi';
import { getCurrentUser } from '../../api/authApi';
import { useAppState } from '../../context/AppStateProvider';
import '../../styles/Home/Home.css';

function Home({ setRecentSummaries, onLogout }) {
  const { isAuthenticated: isAuthenticatedContext, userEmail, userName } = useAppState();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [showCourseInput, setShowCourseInput] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticatedContext) {
      fetchUserInfo();
    } else {
      setUserInfo(null);
    }
  }, [isAuthenticatedContext]);

  const fetchUserInfo = async () => {
    try {
      setUserInfo({
        username: userName,
        email: userEmail
      });
    } catch (error) {
      console.error('사용자 정보 로딩 실패:', error);
    }
  };

  const handleFileChange = (event) => {
    if (!isAuthenticatedContext) {
      setErrorMessage("먼저 로그인을 해주세요.");
      setShowErrorModal(true);
      return;
    }

    const file = event.target.files[0];
    if (!file) return;
    
    // 지원되는 형식 검증
    const allowedTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("지원되지 않는 파일 형식입니다. MP4, AVI, MOV, WMV만 업로드 가능합니다.");
      setShowErrorModal(true);
      return;
    }

    setSelectedFile(file);
    setUploadProgress(0); // 진행률 초기화
  };

  const validateYoutubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
    return youtubeRegex.test(url);
  };

  // 요약 버튼 클릭 시
  const handleSummarize = async () => {
    if (!isAuthenticatedContext) {
      setErrorMessage("먼저 로그인을 해주세요.");
      setShowErrorModal(true);
      return;
    }

    if (!urlInput && !selectedFile && !courseTitle) {
      setErrorMessage("강의 제목을 입력하세요.\n링크를 입력하시거나, 파일을 업로드해주세요.");
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      let lectureId;
      let newSummary = "";

      // 유튜브 링크일 경우
      if (urlInput) {
        if (!validateYoutubeUrl(urlInput)) {
          setErrorMessage("유효한 YouTube URL을 입력해주세요.");
          setShowErrorModal(true);
          setLoading(false);
          return;
        }
        
        const lectureData = {
          title: courseTitle || "YouTube 강의",
          description: courseDescription || "",
          videoUrl: urlInput,
          sourceType: "YOUTUBE" 
        };
        
        const response = await createYoutubeLecture(lectureData);
        lectureId = response.id;
        newSummary = lectureData.title;
      
      // 파일 업로드일 경우
      } else if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", courseTitle || selectedFile.name);
        formData.append("description", courseDescription || "");

        const config = {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        };
  
        const response = await uploadLecture(formData);
        lectureId = response.id;
        newSummary = courseTitle || selectedFile.name;
      } else {
        setErrorMessage("올바른 URL을 입력하거나, 파일을 업로드하세요.");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      // 최근 강의 목록 가져오기
      const lectures = await getLectures();
      
      // 강의 ID 확인
      if (!lectureId) {
        setErrorMessage("강의 ID를 가져오는 데 실패했습니다. 다시 시도해주세요.");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      // 최근 강의 목록 갱신
      setRecentSummaries(prevSummaries => {
        const updatedSummaries = [newSummary, ...prevSummaries];
        return updatedSummaries;
      });

      navigate(`/lectures/${lectureId}`);
    } catch (error) {
      console.error("요약 요청 중 오류 발생:", error);
      setErrorMessage(error.response?.data?.message || "요약 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUserIconClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    onLogout();
    setShowUserMenu(false);
  };

  // 내 서랍 버튼 클릭 핸들러 추가
  const handleMyDrawerClick = () => {
    // 내 서랍 페이지로 이동하거나 기능 구현
    alert('내 서랍 기능은 준비 중입니다.');
    setShowUserMenu(false);
  };

  return (
    <div className="home">
      {isAuthenticatedContext && (
        <div className="user-icon-container">
          <FaUser className="user-icon" onClick={handleUserIconClick} />
          {showUserMenu && (
            <div className="user-menu">
              {userInfo && (
                <div className="user-info-dropdown">
                  <div className="user-name">{userInfo.username || '사용자'}</div>
                  <div className="user-email">{userInfo.email || ''}</div>
                </div>
              )}
              <div className="menu-divider"></div>
              <div className="menu-item drawer-item" onClick={handleMyDrawerClick}>
                <IoFolderOpenOutline className="drawer-icon" />
                <span>내 서랍</span>
              </div>
              <div className="menu-item logout-item" onClick={handleLogout}>
                <FaSignOutAlt className="logout-icon" />
                <span>로그아웃</span>
              </div>
            </div>
          )}
        </div>
      )}

      <h2>영상을 요약하고, 빠르게 이해하세요</h2>

      <div className="input-container">
        <input 
          className="upload-input"
          type="text"
          placeholder="링크를 입력하세요"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          disabled={loading}
        />
        <button className="summarize-btn" onClick={handleSummarize} disabled={loading}>
          {loading ? "처리 중..." : "요약하기 →"}
        </button>
      </div>

      <div className="upload-buttons">
        <button onClick={() => isAuthenticatedContext ? document.getElementById('fileInput').click() : setShowErrorModal(true)} disabled={loading}>
          <HiOutlineUpload /> 업로드
        </button>
        <input
          id="fileInput"
          type="file"
          accept="video/mp4,video/avi,video/mov,video/wmv"
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={loading}
        />

        <button onClick={() => isAuthenticatedContext ? setShowCourseInput(true) : setShowErrorModal(true)} disabled={loading}>
          <FaPen /> 강의 정보 입력
        </button>
      </div>

      {selectedFile && (
        <div className="selected-file">
          <p>{selectedFile.name}</p>
          {uploadProgress > 0 && loading && (
            <div className="progress-bar">
              <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
              <span>{uploadProgress}%</span>
            </div>
          )}
        </div>
      )}

      {showCourseInput && (
        <div className="modal-overlay" onClick={() => setShowCourseInput(false)}>
          <div className="course-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowCourseInput(false)}>
              <IoClose />
            </button>
            <p className="course-title">강의 제목과 설명을 입력하세요</p>
            <input
              className="course-title-input"
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="강의 제목"
            />
            <textarea
              className="course-description-textarea"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              placeholder="강의 설명 (선택사항)"
            />
            <button className="submit-button" onClick={() => setShowCourseInput(false)}>저장</button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowErrorModal(false)}>
              <IoClose />
            </button>
            <p className="error-message">{errorMessage || "먼저 로그인을 해주세요."}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
