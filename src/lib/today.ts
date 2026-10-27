import { DAILY_BONUS_THRESHOLD, MAX_CORE_TASKS_PER_DAY } from "@/config/game";
import { formatShortDate } from "@/lib/date";
import type { DateKey, Task, TodayPlan } from "@/types";

export type TodayNotice = "OVERDUE" | "HOUSE_UPGRADE" | null;

export interface TodayView {
  /** 핵심 할 일. 완료 여부와 함께 핵심 자리에 남는다 */
  coreTasks: Task[];
  /** 핵심이 아닌 남은 할 일 */
  normalTasks: Task[];
  /** 핵심이 아닌 완료한 할 일 (접힌 목록) */
  doneNormalTasks: Task[];
  coreDoneCount: number;
  doneCount: number;
  totalCount: number;
  /** 일일 보너스에 반영되는 일반 할 일 완료 수 */
  normalDoneCount: number;
  dailyBonusEarned: boolean;
  notice: TodayNotice;
  allDone: boolean;
  isEmpty: boolean;
}

const byCreatedAt = (a: Task, b: Task) => a.createdAt.localeCompare(b.createdAt);

/**
 * 오늘 화면의 목록과 진행 현황을 만든다.
 * lingeringIds: 방금 완료해서 알림이 떠 있는 동안 원래 자리에 남겨 둘 할 일
 */
export function buildTodayView(plan: TodayPlan, lingeringIds: ReadonlySet<string> = new Set()): TodayView {
  const tasks = plan.tasks.filter((t) => t.status !== "SPLIT").sort(byCreatedAt);
  const core = tasks.filter((t) => t.isCore);
  const normal = tasks.filter((t) => !t.isCore);
  const normalDone = normal.filter((t) => t.status === "DONE");
  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  return {
    coreTasks: core,
    normalTasks: normal.filter((t) => t.status !== "DONE" || lingeringIds.has(t.id)),
    doneNormalTasks: normalDone.filter((t) => !lingeringIds.has(t.id)),
    coreDoneCount: core.filter((t) => t.status === "DONE").length,
    doneCount,
    totalCount: tasks.length,
    normalDoneCount: normalDone.length,
    dailyBonusEarned: plan.dailyBonusEarned,
    notice: pickNotice(plan),
    allDone: tasks.length > 0 && doneCount === tasks.length,
    isEmpty: tasks.length === 0,
  };
}

/** 안내가 둘 다 있으면 지난 할 일 안내만 보여준다 (docs/screens.md S02) */
export function pickNotice(plan: Pick<TodayPlan, "overdueCount" | "canUpgradeHouse">): TodayNotice {
  if (plan.overdueCount > 0) return "OVERDUE";
  if (plan.canUpgradeHouse) return "HOUSE_UPGRADE";
  return null;
}

export function isCoreFull(tasks: Task[]): boolean {
  return tasks.filter((t) => t.isCore && t.status !== "SPLIT").length >= MAX_CORE_TASKS_PER_DAY;
}

export function bonusProgress(view: Pick<TodayView, "normalDoneCount">): number {
  return Math.min(view.normalDoneCount, DAILY_BONUS_THRESHOLD);
}

/** 다른 날로 옮긴 핵심 할 일이 그날 핵심이 가득 차서 일반 할 일이 됐을 때의 알림 (S02, S04) */
export function coreDemotedMessage(date: DateKey): string {
  return `${formatShortDate(date)}은 핵심 할 일이 ${MAX_CORE_TASKS_PER_DAY}개라 일반 할 일로 옮겼어요`;
}
