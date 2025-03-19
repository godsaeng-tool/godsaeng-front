import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUpload } from "react-icons/hi";
import { FaPen } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { isAuthenticated } from '../../utils/tokenUtils';
import { createYoutubeLecture, uploadLecture, getLectures } from '../../api/lectureApi';
import '../../styles/Home/Home.css';

function Home({ setRecentSummaries }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [showCourseInput, setShowCourseInput] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleFileChange = (event) => {
    if (!isLoggedIn) {
      setErrorMessage("먼저 로그인을 해주세요.");
      setShowErrorModal(true);
      return;
    }

    // const file = event.target.files[0];
    // if (file && file.type === "video/mp4") {
    //   setSelectedFile(file);
    // } else {
    //   setErrorMessage("MP4 파일만 업로드 가능합니다.");
    //   setShowErrorModal(true);
    // }
    // event.target.value = "";

    // 수정
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

  // ✅ 요약 버튼 클릭 시
  const handleSummarize = async () => {
    if (!isLoggedIn) {
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
      let newSummary = "";

      // 유튜브 링크일 경우
      if (urlInput.startsWith("https://")) {
        const lectureData = {
          title: courseTitle,
          description: courseDescription,
          url: urlInput,
          sourceType: "YOUTUBE" 
        };
        const response = await createYoutubeLecture(lectureData);
        lectureId = response.id;
        newSummary = lectureData.title;

      
      // 파일 업로드일 경우
      } else if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", courseTitle);
        formData.append("description", courseDescription);

        const config = {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        };
  
        const response = await uploadLecture(formData, config);
        lectureId = response.id;
        newSummary = courseTitle || selectedFile.name;
      } else {
        setErrorMessage("올바른 URL을 입력하거나, MP4 파일을 업로드하세요.");
        setShowErrorModal(true);
        return;
      }

      // 최근 강의 목록 가져오기
      const lectures = await getLectures();
      const latestLecture = lectures.content[0]; // 최신 강의 가져오기
      const lectureId = latestLecture?.id;
      
       // 강의 ID 확인
      if (!lectureId) {
        setErrorMessage("강의 ID를 가져오는 데 실패했습니다. 다시 시도해주세요.");
        setShowErrorModal(true);
        return;
      }

      // 최근 강의 목록 갱신
      setRecentSummaries(prevSummaries => {
        const updatedSummaries = [newSummary, ...prevSummaries];
        localStorage.setItem("recentSummaries", JSON.stringify(updatedSummaries));
        return updatedSummaries;
      });

      localStorage.setItem("courseTitle", courseTitle);
      navigate(`/lectures/${lectureId}`);
    } catch (error) {
      console.error("요약 요청 중 오류 발생:", error);
      setErrorMessage("요약 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowErrorModal(true);
    }finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <h2>영상을 요약하고, 빠르게 이해하세요</h2>

      <div className="input-container">
        <input 
          className="upload-input"
          type="text"
          placeholder="링크를 입력하세요"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <button className="summarize-btn" onClick={handleSummarize}>
          요약하기 →
        </button>
      </div>

      <div className="upload-buttons">
        <button onClick={() => isLoggedIn ? document.getElementById('fileInput').click() : setShowErrorModal(true)}>
          <HiOutlineUpload /> 업로드
        </button>
        <input
          id="fileInput"
          type="file"
          accept="video/mp4"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button onClick={() => isLoggedIn ? setShowCourseInput(true) : setShowErrorModal(true)}>
          <FaPen /> 강의 정보 입력
        </button>
      </div>

      {selectedFile && (
        <div className="selected-file">
          <p>{selectedFile.name}</p>
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
