import { startOfWeek } from "@/lib/date";
import type { DateKey, DayRecord, WeekSummary } from "@/types";

/**
 * 계획 대비 실행률: 수행 대상이던 할 일 중 그날 완료한 비율.
 * 수행 대상이 0개면 계산하지 않는다 (docs/glossary.md completionRate)
 */
export function completionRate(plannedDoneCount: number, plannedCount: number): number | null {
  return plannedCount === 0 ? null : plannedDoneCount / plannedCount;
}

/** 이번 주(월요일부터 오늘까지) 요약. 연속 일수는 세지 않는다 */
export function summarizeWeek(days: DayRecord[], today: DateKey): WeekSummary {
  const monday = startOfWeek(today);
  const week = days.filter((d) => d.date >= monday && d.date <= today);
  const planned = week.reduce((sum, d) => sum + d.plannedCount, 0);
  const plannedDone = week.reduce((sum, d) => sum + d.plannedDoneCount, 0);
  return {
    doneCount: week.reduce((sum, d) => sum + d.doneTasks.length, 0),
    activeDayCount: week.filter((d) => d.doneTasks.length > 0).length,
    completionRate: completionRate(plannedDone, planned),
  };
}

/** '68%'. 반올림 */
export function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
