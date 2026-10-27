import type { DateKey, Goal, GoalStatus, GoalSummary, Task } from "@/types";

/** 목표 목록의 필터 이름 */
export const GOAL_STATUS_LABEL: Record<GoalStatus, string> = { ACTIVE: "진행 중", COMPLETED: "완료", ARCHIVED: "보관" };

/** 필터 결과가 비었을 때 문구 */
export const EMPTY_FILTER_MESSAGE: Record<GoalStatus, string> = {
  ACTIVE: "진행 중인 목표가 없어요",
  COMPLETED: "완료한 목표가 아직 없어요",
  ARCHIVED: "보관한 목표가 없어요",
};

export function filterGoals(summaries: GoalSummary[], status: GoalStatus): GoalSummary[] {
  return summaries.filter((s) => s.goal.status === status);
}

/** 목표 상세의 할 일 묶음 */
export interface GoalTaskGroups {
  /** 날짜 있는 할 일. 날짜순 */
  dated: Task[];
  /** 날짜 없는 할 일. 만든 순서 */
  undated: Task[];
  /** 완료한 할 일. 최근에 완료한 것이 위 */
  done: Task[];
}

export function groupGoalTasks(tasks: Task[]): GoalTaskGroups {
  const planned = tasks.filter((t) => t.status === "PLANNED");
  return {
    dated: planned
      .filter((t) => t.scheduledDate !== null)
      .sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? "") || a.createdAt.localeCompare(b.createdAt)),
    undated: planned.filter((t) => t.scheduledDate === null).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    done: tasks
      .filter((t) => t.status === "DONE")
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")),
  };
}

export type GoalNotice = "ARCHIVED" | "COMPLETED" | "ALL_TASKS_DONE" | "DUE_PASSED" | null;

/**
 * 목표 상세 위쪽 안내. 하나만 보여준다.
 * 할 일을 모두 마쳐도 자동으로 완료하지 않고 묻기만 한다. 기한이 지나도 실패로 표시하지 않는다
 */
export function goalNotice(goal: Goal, tasks: Task[], today: DateKey): GoalNotice {
  if (goal.status === "ARCHIVED") return "ARCHIVED";
  if (goal.status === "COMPLETED") return "COMPLETED";
  if (tasks.length > 0 && tasks.every((t) => t.status === "DONE")) return "ALL_TASKS_DONE";
  if (goal.dueDate !== null && goal.dueDate < today) return "DUE_PASSED";
  return null;
}

/** 목표 완료 때 처리를 물어야 하는 남은 할 일 수 */
export function remainingTaskCount(tasks: Task[]): number {
  return tasks.filter((t) => t.status === "PLANNED").length;
}
