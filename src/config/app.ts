// 서비스명은 출시 전에 정한다. 화면에서 서비스명이 필요한 곳은 이 상수만 쓴다
export const APP_NAME = "서비스명";

// 화면 동작 값 (게임 규칙이 아닌 것)

/** 알림(토스트) 표시 시간. docs/screens.md 0.2: 3~4초 */
export const TOAST_DURATION_MS = 4000;
/** 할 일 길게 누르기로 인정하는 시간 */
export const LONG_PRESS_MS = 500;
/** 가짜 데이터 응답 지연. 로딩 상태가 실제처럼 보이도록 */
export const MOCK_LATENCY_MS = 350;
/** AI 분해 응답을 기다리는 최대 시간 (docs/screens.md 확인 필요) */
export const AI_TIMEOUT_MS = 20000;
/** 할 일 제목과 메모의 최대 글자 수 */
export const TASK_TITLE_MAX_LENGTH = 100;
export const TASK_MEMO_MAX_LENGTH = 500;
/** 화면을 떠나며 남긴 알림을 다음 화면이 보여줄 수 있는 시간. 이보다 늦게 열린 화면에는 보여주지 않는다 */
export const PENDING_TOAST_TTL_MS = 3000;
/** 가짜 AI 응답 지연 */
export const MOCK_AI_LATENCY_MS = 1500;
