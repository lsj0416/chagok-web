import { describe, expect, it } from "vitest";
import { filterGoals, goalNotice, groupGoalTasks, remainingTaskCount } from "@/lib/goals";
import type { Goal, GoalSummary, Task } from "@/types";

const goal: Goal = {
  id: "g1",
  title: "백엔드 개발자로 취업하기",
  type: "CAREER",
  status: "ACTIVE",
  dueDate: null,
  completionCriteria: null,
  createdAt: "2026-10-01T00:00:00",
};

let seq = 0;
function task(overrides: Partial<Task> = {}): Task {
  seq += 1;
  return {
    id: `t${seq}`,
    title: `할 일 ${seq}`,
    goalId: "g1",
    status: "PLANNED",
    scheduledDate: null,
    isCore: false,
    source: "MANUAL",
    recurrence: null,
    memo: null,
    completedAt: null,
    createdAt: `2026-10-2${seq % 10}T08:00:00`,
    ...overrides,
  };
}

const today = "2026-10-28";

describe("groupGoalTasks", () => {
  it("날짜 있는 할 일은 날짜순, 완료한 할 일은 최근 완료가 위", () => {
    const late = task({ scheduledDate: "2026-10-30" });
    const early = task({ scheduledDate: "2026-10-26" });
    const undated = task();
    const doneOld = task({ status: "DONE", completedAt: "2026-10-20T09:00:00" });
    const doneNew = task({ status: "DONE", completedAt: "2026-10-27T09:00:00" });
    const groups = groupGoalTasks([late, undated, doneOld, early, doneNew]);
    expect(groups.dated.map((t) => t.id)).toEqual([early.id, late.id]);
    expect(groups.undated.map((t) => t.id)).toEqual([undated.id]);
    expect(groups.done.map((t) => t.id)).toEqual([doneNew.id, doneOld.id]);
  });
});

describe("goalNotice", () => {
  it("연결된 할 일을 모두 마치면 완료를 묻는다 (자동 완료하지 않음)", () => {
    expect(goalNotice(goal, [task({ status: "DONE" })], today)).toBe("ALL_TASKS_DONE");
  });

  it("할 일이 없으면 모두 마친 것으로 보지 않는다", () => {
    expect(goalNotice(goal, [], today)).toBeNull();
  });

  it("기한이 지나면 기한 안내", () => {
    expect(goalNotice({ ...goal, dueDate: "2026-10-27" }, [task()], today)).toBe("DUE_PASSED");
    expect(goalNotice({ ...goal, dueDate: today }, [task()], today)).toBeNull();
  });

  it("보관과 완료가 먼저다", () => {
    expect(goalNotice({ ...goal, status: "ARCHIVED", dueDate: "2026-10-01" }, [], today)).toBe("ARCHIVED");
    expect(goalNotice({ ...goal, status: "COMPLETED" }, [task({ status: "DONE" })], today)).toBe("COMPLETED");
  });
});

describe("filterGoals, remainingTaskCount", () => {
  it("상태로 거르고, 남은 할 일은 할 예정만 센다", () => {
    const summaries: GoalSummary[] = [
      { goal, building: null, doneTaskCount: 0, taskCount: 0 },
      { goal: { ...goal, id: "g2", status: "ARCHIVED" }, building: null, doneTaskCount: 0, taskCount: 0 },
    ];
    expect(filterGoals(summaries, "ARCHIVED").map((s) => s.goal.id)).toEqual(["g2"]);
    expect(remainingTaskCount([task(), task({ status: "DONE" })])).toBe(1);
  });
});
