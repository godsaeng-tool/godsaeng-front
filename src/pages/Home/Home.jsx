import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineUpload } from "react-icons/hi";
import { FaPen } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";

import { isAuthenticated, getToken, getRefreshToken, refreshToken as refreshAccessToken } from "../../utils/tokenUtils";
import { createYoutubeLecture, uploadLecture, getLectures } from "../../api/lectureApi";

import "../../styles/Home/Home.css";

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

  // API 호출 후 토큰 만료 시 자동 갱신 & 재시도 로직 함수
  const fetchWithAuthRetry = async (apiFunc, ...args) => {
    try {
      return await apiFunc(...args);
    } catch (error) {
      console.error("API 요청 중 에러 발생", error);

      // 토큰 만료 시 처리
      if (error.response && error.response.status === 401) {
        const refresh = getRefreshToken();

        if (!refresh) {
          setErrorMessage("로그인 정보가 만료되었습니다. 다시 로그인 해주세요.");
          setShowErrorModal(true);
          return;
        }

        try {
          const newAccessToken = await refreshAccessToken(refresh);
          console.log("토큰 재발급 성공");

          localStorage.setItem("accessToken", newAccessToken); // 저장
          // 토큰 재시도도
          return await apiFunc(...args, {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          });
        } catch (refreshError) {
          console.error("토큰 재발급 실패", refreshError);
          setErrorMessage("세션이 만료되었습니다. 다시 로그인 해주세요.");
          setShowErrorModal(true);
        }
      } else {
        throw error;
      }
    }
  };

  const handleFileChange = (event) => {
    if (!isLoggedIn) {
      setErrorMessage("먼저 로그인을 해주세요.");
      setShowErrorModal(true);
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        "지원되지 않는 파일 형식입니다. MP4, AVI, MOV, WMV만 업로드 가능합니다."
      );
      setShowErrorModal(true);
      return;
    }

    setSelectedFile(file);
    setUploadProgress(0); // 진행률 초기화
  };

  const validateYoutubeUrl = (url) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
    return youtubeRegex.test(url);
  };

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

      // 유튜브 링크 요약 처리
      if (urlInput.startsWith("https://")) {
        const lectureData = {
          title: courseTitle,
          description: courseDescription,
          url: urlInput,
          sourceType: "YOUTUBE",
        };

        // const response = await createYoutubeLecture(lectureData);
        // const lectureId = response.id;
        // newSummary = lectureData.title;
        const response = await fetchWithAuthRetry(createYoutubeLecture, lectureData);
        const lectureId = response.id;
        newSummary = lectureData.title;
      } 

      // 파일 업로드 처리
      else if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", courseTitle);
        formData.append("description", courseDescription);

        // 추가
        // for (let pair of formData.entries()) {
        //   console.log(pair[0] + ", " + pair[1]);
        // }

        const config = {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        };

        // const response = await uploadLecture(formData, config);
        // const lectureId = response.id;
        // newSummary = courseTitle || selectedFile.name;
        const response = await fetchWithAuthRetry(uploadLecture, formData, config);
        const lectureId = response.id;
        newSummary = courseTitle || selectedFile.name;
      } else {
        setErrorMessage("올바른 URL을 입력하거나, MP4 파일을 업로드하세요.");
        setShowErrorModal(true);
        return;
      }

      // const lectures = await getLectures();
      // const latestLecture = lectures.content[0];
      // const lectureId = latestLecture?.id;

      // 최근 강의 목록 가져오기
      const lectures = await fetchWithAuthRetry(getLectures);
      const latestLecture = lectures.content[0];
      const lectureId = latestLecture?.id;

      if (!lectureId) {
        setErrorMessage(
          "강의 ID를 가져오는 데 실패했습니다. 다시 시도해주세요."
        );
        setShowErrorModal(true);
        return;
      }

      // 최근 요약 업데이트
      setRecentSummaries((prevSummaries) => {
        const updatedSummaries = [newSummary, ...prevSummaries];
        localStorage.setItem("recentSummaries",JSON.stringify(updatedSummaries));
        return updatedSummaries;
      });

      localStorage.setItem("courseTitle", courseTitle);
      navigate(`/lectures/${lectureId}`);

    } catch (error) {
      console.error("요약 요청 중 오류 발생:", error);
      setErrorMessage("요약 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowErrorModal(true);

    } finally {
      setLoading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null); // 파일 선택 취소
    setUploadProgress(0); // 진행률 초기화

    // 파일 input 값 초기화
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.value = ""; // input 값 초기화
    }
  };

  const handleTitleChange = (e) => {
    setCourseTitle(e.target.value);
    if (selectedFile) {
      setSelectedFile((prevFile) => ({
        ...prevFile,
        name: e.target.value || prevFile.name, // 강의 제목 입력 시 파일 이름 변경
      }));
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
        <button
          onClick={() =>
            isLoggedIn
              ? document.getElementById("fileInput").click()
              : setShowErrorModal(true)
          }
        >
          <HiOutlineUpload /> 업로드
        </button>
        <input
          id="fileInput"
          type="file"
          accept="video/mp4"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button
          onClick={() =>
            isLoggedIn ? setShowCourseInput(true) : setShowErrorModal(true)
          }
        >
          <FaPen /> 강의 정보 입력
        </button>
      </div>

      {selectedFile && (
        <div className="selected-file">
          <p>{selectedFile.name}</p>
          <button onClick={handleCancelUpload}>
            <FaRegTrashCan />
          </button>
        </div>
      )}

      {showCourseInput && (
        <div
          className="modal-overlay"
          onClick={() => setShowCourseInput(false)}
        >
          <div className="course-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setShowCourseInput(false)}
            >
              <IoClose />
            </button>
            <p className="course-title">강의 제목과 설명을 입력하세요</p>
            <input
              className="course-title-input"
              type="text"
              value={courseTitle}
              onChange={handleTitleChange} // 제목 변경 시 파일 이름도 바뀌게 함
              placeholder="강의 제목"
            />
            <textarea
              className="course-description-textarea"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              placeholder="강의 설명 (선택사항)"
            />
            <button
              className="submit-button"
              onClick={() => setShowCourseInput(false)}
            >
              저장
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setShowErrorModal(false)}
            >
              <IoClose />
            </button>
            <p className="error-message">
              {errorMessage || "먼저 로그인을 해주세요."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
