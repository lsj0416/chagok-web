import { addDays, startOfWeek } from "@/lib/date";
import type { DateKey, DayRecord, DayRecordPage, WeekSummary } from "@/types";

/**
 * 계획 대비 실행률: 수행 대상이던 할 일 중 그날 완료한 비율.
 * 수행 대상이 0개면 계산하지 않는다 (docs/glossary.md completionRate)
 */
export function completionRate(plannedDoneCount: number, plannedCount: number): number | null {
  return plannedCount === 0 ? null : plannedDoneCount / plannedCount;
}

/**
 * 이번 주(월요일부터 오늘까지) 요약. 연속 일수는 세지 않는다.
 * 실행률은 끝난 날(어제까지)만 센다. 오늘은 아직 하는 중이라 아침마다 실행률이 떨어져 보이지 않게 한다.
 * 오늘 완료한 할 일은 완료 수와 실행한 날에는 들어간다
 */
export function summarizeWeek(days: DayRecord[], today: DateKey): WeekSummary {
  const monday = startOfWeek(today);
  const week = days.filter((d) => d.date >= monday && d.date <= today);
  const finished = week.filter((d) => d.date < today);
  const planned = finished.reduce((sum, d) => sum + d.plannedCount, 0);
  const plannedDone = finished.reduce((sum, d) => sum + d.plannedDoneCount, 0);
  return {
    doneCount: week.reduce((sum, d) => sum + d.doneTasks.length, 0),
    activeDayCount: week.filter((d) => d.doneTasks.length > 0).length,
    completionRate: completionRate(plannedDone, planned),
  };
}

/**
 * before 바로 전날부터 pageDays일 동안의 기록을 자른다(before는 빠진다).
 * 그보다 오래된 기록이 남아 있으면 다음에 불러올 기준 날짜를 함께 준다
 */
export function pageDayRecords(days: DayRecord[], before: DateKey, pageDays: number): DayRecordPage {
  const from = addDays(before, -pageDays);
  const page = days.filter((d) => d.date < before && d.date >= from).sort((a, b) => b.date.localeCompare(a.date));
  return { days: page, olderBefore: days.some((d) => d.date < from) ? from : null };
}

/** '68%'. 반올림 */
export function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
