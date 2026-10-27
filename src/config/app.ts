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
/** 가짜 AI 응답 지연 */
export const MOCK_AI_LATENCY_MS = 1500;
