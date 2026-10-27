import { describe, expect, it } from "vitest";
import { HOUSE_UPGRADE_RULES, MAX_CORE_TASKS_PER_DAY } from "@/config/game";
import { canUpgradeHouse } from "@/lib/house";
import { buildTodayView, isCoreFull, pickNotice } from "@/lib/today";
import type { Task, TodayPlan } from "@/types";

let seq = 0;
function task(overrides: Partial<Task> = {}): Task {
  seq += 1;
  return {
    id: `t${seq}`,
    title: `할 일 ${seq}`,
    goalId: null,
    status: "PLANNED",
    scheduledDate: "2026-10-27",
    isCore: false,
    source: "MANUAL",
    completedAt: null,
    createdAt: `2026-10-27T08:${String(seq).padStart(2, "0")}:00`,
    ...overrides,
  };
}

function plan(tasks: Task[], overrides: Partial<TodayPlan> = {}): TodayPlan {
  return {
    date: "2026-10-27",
    tasks,
    goals: [],
    buildings: [],
    overdueCount: 0,
    canUpgradeHouse: false,
    undatedTasks: [],
    quickTemplates: [],
    dailyBonusEarned: false,
    ...overrides,
  };
}

describe("buildTodayView", () => {
  it("핵심과 일반을 나누고 중복 표시하지 않는다", () => {
    const core = task({ isCore: true });
    const normal = task();
    const view = buildTodayView(plan([core, normal]));
    expect(view.coreTasks.map((t) => t.id)).toEqual([core.id]);
    expect(view.normalTasks.map((t) => t.id)).toEqual([normal.id]);
  });

  it("완료한 일반 할 일은 완료 목록으로, 핵심은 제자리", () => {
    const core = task({ isCore: true, status: "DONE" });
    const normal = task({ status: "DONE" });
    const view = buildTodayView(plan([core, normal]));
    expect(view.coreTasks).toHaveLength(1);
    expect(view.normalTasks).toHaveLength(0);
    expect(view.doneNormalTasks).toHaveLength(1);
    expect(view.coreDoneCount).toBe(1);
    expect(view.doneCount).toBe(2);
    expect(view.allDone).toBe(true);
  });

  it("알림이 떠 있는 동안 방금 완료한 할 일은 제자리에 남는다", () => {
    const normal = task({ status: "DONE" });
    const view = buildTodayView(plan([normal]), new Set([normal.id]));
    expect(view.normalTasks).toHaveLength(1);
    expect(view.doneNormalTasks).toHaveLength(0);
  });

  it("쪼개진 할 일은 집계와 목록에서 빠진다", () => {
    const view = buildTodayView(plan([task({ status: "SPLIT" }), task()]));
    expect(view.totalCount).toBe(1);
  });

  it("할 일 0개는 빈 화면이며 모두 완료가 아니다", () => {
    const view = buildTodayView(plan([]));
    expect(view.isEmpty).toBe(true);
    expect(view.allDone).toBe(false);
  });
});

describe("pickNotice", () => {
  it("둘 다 있으면 지난 할 일 안내만", () => {
    expect(pickNotice({ overdueCount: 2, canUpgradeHouse: true })).toBe("OVERDUE");
    expect(pickNotice({ overdueCount: 0, canUpgradeHouse: true })).toBe("HOUSE_UPGRADE");
    expect(pickNotice({ overdueCount: 0, canUpgradeHouse: false })).toBeNull();
  });
});

describe("isCoreFull", () => {
  it(`핵심 할 일은 ${MAX_CORE_TASKS_PER_DAY}개까지`, () => {
    const cores = Array.from({ length: MAX_CORE_TASKS_PER_DAY }, () => task({ isCore: true }));
    expect(isCoreFull(cores)).toBe(true);
    expect(isCoreFull(cores.slice(1))).toBe(false);
  });
});

describe("canUpgradeHouse", () => {
  const studio = HOUSE_UPGRADE_RULES.STUDIO;
  it("설치 수와 잔액을 모두 채워야 한다", () => {
    expect(canUpgradeHouse("STUDIO", studio.requiredPlacements!, studio.upgradeCost!)).toBe(true);
    expect(canUpgradeHouse("STUDIO", studio.requiredPlacements! - 1, studio.upgradeCost!)).toBe(false);
    expect(canUpgradeHouse("STUDIO", studio.requiredPlacements!, studio.upgradeCost! - 1)).toBe(false);
  });
  it("마지막 단계는 업그레이드할 수 없다", () => {
    expect(canUpgradeHouse("DETACHED", 100, 100000)).toBe(false);
  });
});
