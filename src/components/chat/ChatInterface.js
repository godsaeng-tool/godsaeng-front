import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import { sendQuestion, getChatHistory } from "../../api/chatApi";
import ChatMessage from "./ChatMessage";

const ChatInterface = ({ lectureId, hideHeader = false }) => {
  const [messagesByLecture, setMessagesByLecture] = useState({});
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedTone, setSelectedTone] = useState("b");
  const messagesEndRef = useRef(null);

  // 현재 강의방 메시지 가져오기
  const messages = messagesByLecture[lectureId] || [];

  const toneOptions = [
    { value: "b", label: "기본" },
    { value: "a", label: "까칠한" },
    { value: "c", label: "따뜻한" },
  ];

  const updateMessagesForLecture = (lectureId, updateFn) => {
    setMessagesByLecture((prev) => {
      const prevMessages = prev[lectureId] || [];
      const newMessages = updateFn(prevMessages);
      return { ...prev, [lectureId]: newMessages };
    });
  };

  // 채팅 기록 불러오기
  useEffect(() => {
    const fetchChatHistory = async () => {
      setError("");
      setInitialLoading(true);

      try {
        const data = await getChatHistory(lectureId);
        if (data && data.messages) {
          const formattedMessages = [];

          data.messages.forEach((msg) => {
            if (msg.question) {
              formattedMessages.push({
                id: msg.questionId || `q-${Date.now()}-${Math.random()}`,
                content: msg.question,
                isUser: true,
                timestamp: msg.timestamp,
              });
            }
            if (msg.answer) {
              formattedMessages.push({
                id: msg.answerId || `a-${Date.now()}-${Math.random()}`,
                content: msg.answer,
                isUser: false,
                timestamp: msg.timestamp,
              });
            }
          });

          setMessagesByLecture((prev) => ({
            ...prev,
            [lectureId]: formattedMessages,
          }));
        }
      } catch (err) {
        console.error("채팅 기록 로딩 실패:", err);
        setError("채팅 기록을 불러오는데 실패했습니다.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, [lectureId]);

  // 스크롤 맨 아래로 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    setLoading(true);
    setError("");

    const userMessage = {
      id: Date.now(),
      content: question,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    // 현재 강의방에 메시지 추가
    updateMessagesForLecture(lectureId, (prev) => [...prev, userMessage]);

    const currentQuestion = question;
    setQuestion("");

    try {
      const response = await sendQuestion(
        lectureId,
        currentQuestion,
        selectedTone
      );

      // 스트리밍 응답 처리
      streamAIResponse(response.answer, response.answerId);
    } catch (err) {
      console.error("질문 전송 실패:", err);
      setError("질문을 처리하는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const streamAIResponse = async (fullText, answerId) => {
    const typingSpeed = 30;
    const currentLectureId = lectureId;

    const newMessage = {
      id: answerId || `a-${Date.now()}`,
      content: "",
      isUser: false,
      timestamp: new Date().toISOString(),
    };

    updateMessagesForLecture(currentLectureId, (prev) => [...prev, newMessage]);

    for (let index = 0; index < fullText.length; index++) {
      // 강의방이 바뀌었을 경우 스트리밍 중단
      if (currentLectureId !== lectureId) break;

      await new Promise((resolve) => setTimeout(resolve, typingSpeed));

      updateMessagesForLecture(currentLectureId, (prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: fullText.slice(0, index + 1),
        };

        return updatedMessages;
      });
    }
  };

  const handleToneChange = (e) => {
    setSelectedTone(e.target.value);
  };

  return (
    <div className="d-flex flex-column h-100">
      <div
        className="chat-messages p-3"
        style={{
          flexGrow: 1,
          overflowY: "auto",
          maxHeight: "445px",
          minHeight: "445px",
        }}
      >
        {initialLoading ? (
          <div className="text-center my-3">
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            채팅 기록을 불러오는 중...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted my-3">
            강의 내용에 대해 질문해보세요!
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <Alert variant="danger" className="m-2 mb-0 py-2">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="p-2 border-top mt-auto">
        <div className="d-flex flex-column">
          <div className="mb-2">
            <Form.Select
              value={selectedTone}
              onChange={handleToneChange}
              style={{
                width: "150px",
                fontSize: "0.9rem",
                borderColor: "#FFC330",
                backgroundColor: "#FFF8E7",
              }}
            >
              {toneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </div>

          <div className="d-flex">
            <Form.Control
              as="textarea"
              rows={1}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="질문을 입력하세요..."
              disabled={loading}
              style={{
                maxHeight: "160px",
                overflowY: "auto",
                resize: "none",
              }}
            />
            <Button
              type="submit"
              className="ms-2"
              disabled={loading || !question.trim()}
              style={{
                backgroundColor: "#FFC330",
                borderColor: "#FFC330",
                color: "black",
                height: "50px",
                width: "70px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "17px",
              }}
            >
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                "전송"
              )}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

ChatInterface.propTypes = {
  lectureId: PropTypes.string.isRequired,
  hideHeader: PropTypes.bool,
};

export default ChatInterface;
