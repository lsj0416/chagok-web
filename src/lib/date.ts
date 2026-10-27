import type { DateKey } from "@/types";

const WEEKDAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

/** 로컬 시간 기준 'YYYY-MM-DD' */
export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** '10월 27일 화요일' */
export function formatDayTitle(key: DateKey): string {
  const date = parseDateKey(key);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}`;
}

/** '10월 25일' */
export function formatShortDate(key: DateKey): string {
  const date = parseDateKey(key);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** 시각(ISO)이 그 날짜(로컬)에 속하는지 */
export function isSameDay(iso: string, key: DateKey): boolean {
  return toDateKey(new Date(iso)) === key;
}
