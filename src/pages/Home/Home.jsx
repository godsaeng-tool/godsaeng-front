import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUpload } from "react-icons/hi";
import { FaPen, FaUser, FaSignOutAlt } from "react-icons/fa";
import { IoFolderOpenOutline, IoClose } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";
import { createYoutubeLecture, uploadLecture, getLectures } from '../../api/lectureApi';
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
  const [remainingDays, setRemainingDays] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    isAuthenticatedContext ? setUserInfo({ username: userName, email: userEmail }) : setUserInfo(null);
  }, [isAuthenticatedContext, userEmail, userName]);

  const validateYoutubeUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/.test(url);

  const handleFileChange = ({ target: { files } }) => {
    if (!isAuthenticatedContext) return showError("먼저 로그인을 해주세요.");
    const file = files[0];
    if (!file) return;
    const allowedTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv"];
    if (!allowedTypes.includes(file.type)) return showError("지원되지 않는 파일 형식입니다. MP4, AVI, MOV, WMV만 업로드 가능합니다.");
    setSelectedFile(file);
    setUploadProgress(0);
  };

  const handleRemainingDaysChange = (e) => {
    setRemainingDays(parseInt(e.target.value));
  };

  const handleSummarize = async () => {
    if (!isAuthenticatedContext) return showError("먼저 로그인을 해주세요.");
    if (!urlInput && !selectedFile && !courseTitle) return showError("강의 제목을 입력하세요.\n링크를 입력하시거나, 파일을 업로드해주세요.");

    setLoading(true); setUploadProgress(0);
    try {
      let lectureId, newSummary = "";

      if (urlInput) {
        if (!validateYoutubeUrl(urlInput)) return showError("유효한 YouTube URL을 입력해주세요.");
        const lectureData = { 
          title: courseTitle || "YouTube 강의", 
          description: courseDescription || "", 
          videoUrl: urlInput, 
          sourceType: "YOUTUBE",
          remainingDays: remainingDays
        };
        const { id } = await createYoutubeLecture(lectureData);
        lectureId = id; newSummary = lectureData.title;

      } else if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", courseTitle || selectedFile.name);
        formData.append("description", courseDescription || "");
        formData.append("remainingDays", remainingDays);
        const { id } = await uploadLecture(formData, {
          onUploadProgress: ({ loaded, total }) => setUploadProgress(Math.round((loaded * 100) / total))
        });
        lectureId = id; newSummary = courseTitle || selectedFile.name;
      } else return showError("올바른 URL을 입력하거나, 파일을 업로드하세요.");

      if (!lectureId) return showError("강의 ID를 가져오는 데 실패했습니다. 다시 시도해주세요.");

      await getLectures();
      setRecentSummaries(prev => [newSummary, ...prev]);
      navigate(`/lectures/${lectureId}`);
    } catch (error) {
      showError(error.response?.data?.message || "요약 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setShowErrorModal(true);
    setLoading(false);
  };

  return (
    <div className="home">
      {isAuthenticatedContext && (
        <div className="user-icon-container">
          <FaUser className="user-icon" onClick={() => setShowUserMenu(!showUserMenu)} />
          {showUserMenu && (
            <div className="user-menu">
              {userInfo && (
                <div className="user-info-dropdown">
                  <div className="user-name">{userInfo.username || '사용자'}</div>
                  <div className="user-email">{userInfo.email || ''}</div>
                </div>
              )}
              <div className="menu-divider"></div>
              <div className="menu-item drawer-item" onClick={() => { alert('내 서랍 기능은 준비 중입니다.'); setShowUserMenu(false); }}>
                <IoFolderOpenOutline className="drawer-icon" /><span>내 서랍</span>
              </div>
              <div className="menu-item logout-item" onClick={() => { onLogout(); setShowUserMenu(false); }}>
                <FaSignOutAlt className="logout-icon" /><span>로그아웃</span>
              </div>
            </div>
          )}
        </div>
      )}

      <h2>영상을 요약하고, 빠르게 이해하세요</h2>

      <div className="input-container">
        <input type="text" className="upload-input" placeholder="링크를 입력하세요" value={urlInput} onChange={e => setUrlInput(e.target.value)} disabled={loading} />
        <button className="summarize-btn" onClick={handleSummarize} disabled={loading}>{loading ? "처리 중..." : "요약하기 →"}</button>
      </div>

      <div className="upload-buttons">
        <button onClick={() => isAuthenticatedContext ? document.getElementById('fileInput').click() : showError("먼저 로그인을 해주세요.")} disabled={loading}>
          <HiOutlineUpload /> 업로드
        </button>
        <input id="fileInput" type="file" accept="video/mp4,video/avi,video/mov,video/wmv" style={{ display: "none" }} onChange={handleFileChange} disabled={loading} />
        <button onClick={() => isAuthenticatedContext ? setShowCourseInput(true) : showError("먼저 로그인을 해주세요.")} disabled={loading}>
          <FaPen /> 강의 정보 입력
        </button>
      </div>

      {(selectedFile || (urlInput && courseTitle)) && (
        <div className="selected-file">
          <p>{courseTitle || selectedFile?.name}</p>
          {selectedFile && <button onClick={() => { setSelectedFile(null); setUploadProgress(0); document.getElementById("fileInput").value = ""; }}><FaRegTrashCan /></button>}
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
          <div className="course-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowCourseInput(false)}><IoClose /></button>
            <p className="course-title">강의 제목과 설명을 입력하세요</p>
            <input className="course-title-input" type="text" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="강의 제목" />
            <textarea className="course-description-textarea" value={courseDescription} onChange={e => setCourseDescription(e.target.value)} placeholder="강의 설명 (선택사항)" />
            
            <div className="remaining-days-container">
              <label htmlFor="remainingDays">시험까지 남은 기간</label>
              <select 
                id="remainingDays"
                className="remaining-days-select"
                value={remainingDays}
                onChange={handleRemainingDaysChange}
              >
                <option value="1">1일</option>
                <option value="2">2일</option>
                <option value="3">3일</option>
                <option value="4">4일</option>
                <option value="5">5일</option>
              </select>
            </div>
            
            <button className="submit-button" onClick={() => setShowCourseInput(false)}>저장</button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="error-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowErrorModal(false)}><IoClose /></button>
            <p className="error-message">{errorMessage || "먼저 로그인을 해주세요."}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
