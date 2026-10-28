import { MAX_CORE_TASKS_PER_DAY, TASK_UNIT_LABEL } from "@/config/game";
import type { DateKey, Goal, QuickTaskTemplate, Task, TaskUnit } from "@/types";

/** 빠른 추가 제목: '{키워드} {수량}{단위}'. 예: 독서 20분 */
export function templateTitle(keyword: string, amount: number, unit: TaskUnit): string {
  return `${keyword} ${amount}${TASK_UNIT_LABEL[unit]}`;
}

/** 단위의 기본 수량. 정해지지 않았으면 선택지의 첫 번째 */
export function defaultAmountFor(template: QuickTaskTemplate, unit: TaskUnit): number | null {
  return template.defaultAmount[unit] ?? template.amountOptions[unit]?.[0] ?? null;
}

/**
 * 빠른 추가의 연결 목표 기본값 (docs/screens.md S16).
 * 목표 유형 템플릿만. 그 유형의 진행 중 목표가 하나면 그 목표, 여러 개면 가장 최근 목표
 */
export function defaultGoalFor(template: QuickTaskTemplate, goals: Goal[]): Goal | null {
  if (!template.goalType) return null;
  const matching = goals
    .filter((g) => g.status === "ACTIVE" && g.type === template.goalType)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return matching[0] ?? null;
}

/** 핵심 할 일 토글: 날짜가 있어야 하고, 아는 범위에서 그날 핵심이 3개 미만이어야 한다 */
export function canMarkCore(date: DateKey | null, knownTasks: Task[]): boolean {
  if (date === null) return false;
  const cores = knownTasks.filter((t) => t.scheduledDate === date && t.isCore && t.status !== "SPLIT").length;
  return cores < MAX_CORE_TASKS_PER_DAY;
}
