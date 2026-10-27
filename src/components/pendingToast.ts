// 화면을 떠나면서 남기는 알림 하나. 다음 화면이 열릴 때 꺼내 보여준다
// (예: 할 일 상세에서 나누기, 삭제 뒤 이전 화면으로 돌아갈 때)
import { PENDING_TOAST_TTL_MS } from "@/config/app";

let pending: { message: string; at: number } | null = null;

export function setPendingToast(message: string) {
  pending = { message, at: Date.now() };
}

/** 남긴 알림을 꺼낸다. 한 번 꺼내면 비워지고, 오래된 알림은 버린다 */
export function takePendingToast(): string | null {
  const taken = pending;
  pending = null;
  if (!taken || Date.now() - taken.at > PENDING_TOAST_TTL_MS) return null;
  return taken.message;
}
