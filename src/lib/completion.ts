import {
  BUILDING_FRAME_THRESHOLD,
  BUILDING_LABEL,
  CORE_TASK_CREDIT,
  DAILY_BONUS_CREDIT,
  DAILY_BONUS_THRESHOLD,
} from "@/config/game";
import { isSameDay } from "@/lib/date";
import type { Building, BuildingStage, DateKey, Goal, LedgerType, Task } from "@/types";

export interface LedgerChange {
  type: LedgerType;
  amount: number;
}

export interface CompletionEffect {
  ledger: LedgerChange[];
  /** 공사가 진행되는 건물. 목표가 없거나 진행 중이 아니면 null */
  buildingId: string | null;
  nextBuildingStage: BuildingStage | null;
  reachedFrame: boolean;
  dailyBonusEarnedNow: boolean;
  /** 완료 알림 문구 (docs/screens.md S02 완료 알림 문구 규칙) */
  message: string;
}

export interface CompletionContext {
  task: Task;
  goals: Goal[];
  buildings: Building[];
  /** 이 완료 전, 오늘 완료한 일반 할 일 수 */
  normalDoneBefore: number;
  dailyBonusEarned: boolean;
}

/** 공사가 진행되는 건물: 목표가 진행 중이고 건물이 완성 전일 때만 */
function activeBuildingFor(task: Task, goals: Goal[], buildings: Building[]): Building | null {
  if (!task.goalId) return null;
  const goal = goals.find((g) => g.id === task.goalId);
  if (!goal || goal.status !== "ACTIVE") return null;
  const building = buildings.find((b) => b.goalId === goal.id);
  if (!building || building.stage === "COMPLETE") return null;
  return building;
}

function stageFor(progress: number): BuildingStage {
  return progress >= BUILDING_FRAME_THRESHOLD ? "FRAME" : "LOT";
}

export function computeCompletion(ctx: CompletionContext): CompletionEffect {
  const { task, goals, buildings, normalDoneBefore, dailyBonusEarned } = ctx;
  const ledger: LedgerChange[] = [];

  let dailyBonusEarnedNow = false;
  if (task.isCore) {
    ledger.push({ type: "EARN_CORE_TASK", amount: CORE_TASK_CREDIT });
  } else if (!dailyBonusEarned && normalDoneBefore + 1 >= DAILY_BONUS_THRESHOLD) {
    dailyBonusEarnedNow = true;
    ledger.push({ type: "EARN_DAILY_BONUS", amount: DAILY_BONUS_CREDIT });
  }

  const building = activeBuildingFor(task, goals, buildings);
  let nextBuildingStage: BuildingStage | null = null;
  let reachedFrame = false;
  if (building) {
    nextBuildingStage = stageFor(building.constructionProgress + 1);
    reachedFrame = building.stage === "LOT" && nextBuildingStage === "FRAME";
  }

  const credit = ledger.reduce((sum, l) => sum + l.amount, 0);
  const parts: string[] = [];
  if (credit > 0) parts.push(`+${credit} 크레딧`);
  if (building && reachedFrame) {
    parts.push(`${BUILDING_LABEL[building.type]} 골조가 올라갔어요`);
  } else if (dailyBonusEarnedNow) {
    parts.push("오늘의 보너스");
  } else if (building) {
    parts.push(`${BUILDING_LABEL[building.type]} 공사 진행`);
  } else if (!task.isCore && !dailyBonusEarned) {
    parts.push(`오늘의 보너스 ${normalDoneBefore + 1}/${DAILY_BONUS_THRESHOLD}`);
  }

  return {
    ledger,
    buildingId: building?.id ?? null,
    nextBuildingStage,
    reachedFrame,
    dailyBonusEarnedNow,
    message: parts.length > 0 ? parts.join(" · ") : "완료했어요",
  };
}

export interface UncompletionEffect {
  ledger: LedgerChange[];
  buildingId: string | null;
  nextBuildingStage: BuildingStage | null;
  dailyBonusRevoked: boolean;
}

export interface UncompletionContext {
  task: Task;
  goals: Goal[];
  buildings: Building[];
  /** 이 취소 전, 오늘 완료한 일반 할 일 수 (취소할 할 일 포함) */
  normalDoneBefore: number;
  dailyBonusEarned: boolean;
}

/** 완료 취소는 완료한 당일에만 가능하다 */
export function canUncomplete(task: Task, today: DateKey): boolean {
  return task.status === "DONE" && task.completedAt !== null && isSameDay(task.completedAt, today);
}

/** 완료 취소: 크레딧과 공사 진행을 회수한다. 일반 완료 수가 기준 아래로 내려가면 일일 보너스도 회수한다 */
export function computeUncompletion(ctx: UncompletionContext): UncompletionEffect {
  const { task, goals, buildings, normalDoneBefore, dailyBonusEarned } = ctx;
  const ledger: LedgerChange[] = [];

  let dailyBonusRevoked = false;
  if (task.isCore) {
    ledger.push({ type: "REVOKE_UNCOMPLETE", amount: -CORE_TASK_CREDIT });
  } else if (dailyBonusEarned && normalDoneBefore - 1 < DAILY_BONUS_THRESHOLD) {
    dailyBonusRevoked = true;
    ledger.push({ type: "REVOKE_UNCOMPLETE", amount: -DAILY_BONUS_CREDIT });
  }

  const building = activeBuildingFor(task, goals, buildings);
  const nextBuildingStage = building ? stageFor(Math.max(0, building.constructionProgress - 1)) : null;

  return { ledger, buildingId: building?.id ?? null, nextBuildingStage, dailyBonusRevoked };
}
