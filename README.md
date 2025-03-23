# Godsaeng-Front: AI 기반 학습 보조 시스템

## 프로젝트 소개
Godsaeng-Front는 다양한 형식의 강의 자료(비디오, PDF, PPT)를 처리하여 AI로 분석하고, 학습에 효과적으로 활용할 수 있는 웹 인터페이스를 제공하는 프론트엔드 애플리케이션입니다. 직관적인 사용자 경험과 다양한 학습 도구를 통해 효율적인 학습 경험을 제공합니다.

## 주요 기능
1. **다양한 형식의 강의 자료 업로드**
   - 비디오 파일 (mp4, avi, mov, wmv)
   - 문서 파일 (pdf, ppt/pptx)
   - YouTube URL을 통한 동영상 처리

2. **AI 분석 결과 시각화**
   - 강의 내용 요약 및 핵심 포인트 제시
   - 학습 내용 기반 퀴즈 인터페이스 (정답 확인 기능)
   - 맞춤형 학습 계획 제공 (premium 기능)
   - AI 학습 도우미 채팅 인터페이스

3. **사용자 편의 기능**
   - 로그인/회원가입
   - 강의 목록 관리
   - 강의 자료 다운로드 (TXT, PDF 형식)
   - 모바일 반응형 디자인

## 기술 스택

- **프론트엔드 프레임워크**: React
- **스타일링**: React-Bootstrap, CSS
- **상태 관리**: Context API
- **라우팅**: React Router
- **HTTP 클라이언트**: Axios
- **아이콘**: React-Icons
- **문서 변환**: jsPDF
- **마크다운 렌더링**: React Markdown

## 프로젝트 구조
```
godsaeng-front/
├── public/                # 정적 파일
├── src/
│   ├── api/               # API 통신 모듈
│   │   ├── authApi.js     # 인증 관련 API
│   │   ├── chatApi.js     # 채팅 관련 API
│   │   ├── index.js       # API 기본 설정
│   │   └── lectureApi.js  # 강의 관련 API
│   ├── components/        # 재사용 가능한 컴포넌트
│   │   ├── auth/          # 인증 관련 컴포넌트
│   │   ├── chat/          # 채팅 인터페이스 컴포넌트
│   │   ├── common/        # 공통 UI 컴포넌트
│   │   └── lecture/       # 강의 관련 컴포넌트
│   ├── context/           # Context API 상태 관리
│   ├── hooks/             # 커스텀 훅
│   ├── pages/             # 페이지 컴포넌트
│   │   ├── Auth/          # 로그인/회원가입 페이지
│   │   ├── Home/          # 홈 페이지(업로드)
│   │   └── Summary/       # 강의 상세 페이지
│   ├── styles/            # CSS 스타일시트
│   ├── utils/             # 유틸리티 함수
│   ├── App.jsx            # 메인 앱 컴포넌트
│   └── index.js           # 진입점
├── .env                   # 환경 변수(필요 시)
├── package.json           # 패키지 의존성
└── README.md              # 프로젝트 문서
```

## 주요 컴포넌트 및 기능

### 1. 홈 화면 (Home.jsx)
- 강의 자료 업로드 인터페이스
- 공개플랫폼 URL 입력 기능
- 강의 제목 및 설명 입력
- 학습 기간 설정
- 사용자 인증 상태 관리

### 2. 강의 상세 페이지 (LectureDetailPage.jsx)
- 강의 정보 표시
- 비디오 임베딩
- 탭 기반 콘텐츠 네비게이션:
  - 요약 탭: AI 생성 요약 내용
  - 전체 스크립트 탭: 강의 전체 스크립트
  - 예상 질문 탭: 퀴즈 인터페이스
  - 학습 계획 탭: 맞춤형 학습 계획 (premium)
- AI 학습 도우미 채팅 인터페이스

### 3. 인증 시스템 (AuthPopup.jsx, LoginModal.jsx, SignupModal.jsx)
- 사용자 인증 (로그인/회원가입)
- 토큰 기반 인증
- 인증 상태 유지

### 4. AI 학습 도우미 (ChatInterface.jsx)
- 강의 내용 기반 질의응답
- 실시간 채팅 UI
- 메시지 히스토리 관리

### 5. 퀴즈 인터페이스 (QuizParser.jsx)
- 예상 질문 목록 표시
- 정답 보기/숨기기 기능
- 인터랙티브 UI

## 설치 및 실행 방법

1. **저장소 클론**
```bash
git clone https://github.com/username/godsaeng-front.git
cd godsaeng-front
```

2. **의존성 설치**
```bash
npm install
npm install react-markdown
```

3. **개발 서버 실행**
```bash
npm start
```

4. **프로덕션 빌드**
```bash
npm run build
```

## Premium 기능 (갓생모드)

Godsaeng 서비스는 기본 기능 외에 프리미엄 사용자를 위한 '갓생모드'를 제공합니다:

1. **말투 조절 및 맞춤형 퀴즈**: 사용자 수준과 학습 스타일에 맞는 퀴즈 생성 및 AI 답변 말투 조절
2. **맞춤형 학습 계획**: 강의 내용과 남은 학습 일수를 고려한 최적화된 학습 계획
3. **고급 질의응답**: 더 상세하고 깊이 있는 AI 답변 제공
4. **추가 분석 기능**: 향후 추가될 고급 분석 기능에 대한 접근 권한

## 백엔드 통합

이 프론트엔드 애플리케이션은 Spring Boot 백엔드 서버 및 AI 처리 서버와 통합되어 작동합니다:

1. **Spring Boot 백엔드 API**
   - 인증 및 사용자 관리
   - 강의 자료 저장 및 관리
   - AI 서버 통신 중개

2. **AI 처리 서버**
   - 강의 자료 변환 및 분석
   - 요약, 퀴즈, 학습 계획 생성
   - RAG 기반 질의응답 처리

## 작성자
엄준현
