// 화면을 떠나면서 남기는 알림 하나. 다음 화면이 열릴 때 꺼내 보여준다
// (예: 할 일 상세에서 나누기, 삭제 뒤 이전 화면으로 돌아갈 때)
import { PENDING_TOAST_TTL_MS } from "@/config/app";

let pending: { message: string; at: number } | null = null;

export function setPendingToast(message: string) {
  pending = { message, at: Date.now() };
}

let addTaskRequested: { at: number } | null = null;

/** 돌아간 화면에서 할 일 추가(S03)를 열어 달라고 남긴다 (S09 'AI로 할 일 추가'의 직접 추가하기) */
export function requestAddTaskOnReturn() {
  addTaskRequested = { at: Date.now() };
}

/** 남긴 요청이 있는지 본다. 읽기만 하므로 상태 초기값 계산에 쓸 수 있다 */
export function hasAddTaskRequest(): boolean {
  return addTaskRequested !== null && Date.now() - addTaskRequested.at <= PENDING_TOAST_TTL_MS;
}

export function clearAddTaskRequest() {
  addTaskRequested = null;
}

/** 남긴 알림을 꺼낸다. 한 번 꺼내면 비워지고, 오래된 알림은 버린다 */
export function takePendingToast(): string | null {
  const taken = pending;
  pending = null;
  if (!taken || Date.now() - taken.at > PENDING_TOAST_TTL_MS) return null;
  return taken.message;
}
