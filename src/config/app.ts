// 서비스명은 출시 전에 정한다. 화면에서 서비스명이 필요한 곳은 이 상수만 쓴다
export const APP_NAME = "서비스명";

// 홈 화면 설치(PWA)

/** 안내판 띠 색. 안드로이드 상태 표시줄과 설치한 앱의 머리 색 (globals.css의 --color-sign) */
export const SIGN_COLOR = "#1f4fa3";
/** 설치한 앱이 처음 뜰 때의 바탕색 (globals.css의 --color-surface) */
export const SURFACE_COLOR = "#ffffff";
/** 설치한 앱을 열면 처음 보이는 화면, 알림을 눌렀을 때 기본으로 여는 화면 */
export const START_PATH = "/today";
/** 서비스 워커 파일 (public/sw.js) */
export const SERVICE_WORKER_PATH = "/sw.js";
/** 웹 푸시 서버 공개 키(VAPID). 백엔드가 키를 만들기 전까지는 비어 있고, 그동안은 기기 구독을 만들지 않는다 */
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;

// 화면 동작 값 (게임 규칙이 아닌 것)

/** 알림(토스트) 표시 시간. docs/screens.md 0.2: 3~4초 */
export const TOAST_DURATION_MS = 4000;
/** 할 일 길게 누르기로 인정하는 시간 */
export const LONG_PRESS_MS = 500;
/** 가짜 데이터 응답 지연. 로딩 상태가 실제처럼 보이도록 */
export const MOCK_LATENCY_MS = 350;
/** AI 분해 응답을 기다리는 최대 시간 */
export const AI_TIMEOUT_MS = 20000;
/** 할 일 제목과 메모의 최대 글자 수 */
export const TASK_TITLE_MAX_LENGTH = 100;
export const TASK_MEMO_MAX_LENGTH = 500;
/** 화면을 떠나며 남긴 알림을 다음 화면이 보여줄 수 있는 시간. 이보다 늦게 열린 화면에는 보여주지 않는다 */
export const PENDING_TOAST_TTL_MS = 3000;
/** 가짜 AI 응답 지연 */
export const MOCK_AI_LATENCY_MS = 1500;

/** 기록(S13) 한 번에 불러오는 기간. 처음엔 최근 이만큼, '이전 기록 더 보기'로 이만큼씩 더 */
export const RECORDS_PAGE_DAYS = 30;
/** 하루 시작·마무리 알림을 처음 켤 때의 기본 시각 (HH:MM) */
export const DEFAULT_MORNING_REMINDER_TIME = "08:00";
export const DEFAULT_EVENING_REMINDER_TIME = "21:00";
