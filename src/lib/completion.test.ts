import { describe, expect, it } from "vitest";
import { BUILDING_FRAME_THRESHOLD, CORE_TASK_CREDIT, DAILY_BONUS_CREDIT, DAILY_BONUS_THRESHOLD } from "@/config/game";
import { canUncomplete, computeCompletion, computeUncompletion } from "@/lib/completion";
import type { Building, Goal, Task } from "@/types";

const goal: Goal = {
  id: "g1",
  title: "백엔드 개발자로 취업하기",
  type: "CAREER",
  status: "ACTIVE",
  dueDate: null,
  completionCriteria: null,
  createdAt: "2026-10-01T00:00:00",
};

const lot: Building = { id: "b1", goalId: "g1", type: "OFFICE", stage: "LOT", constructionProgress: 1, lastSeenStage: "LOT" };

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "지원동기 첫 문단 쓰기",
    goalId: null,
    status: "PLANNED",
    scheduledDate: "2026-10-27",
    isCore: false,
    source: "MANUAL",
    completedAt: null,
    createdAt: "2026-10-27T08:00:00",
    ...overrides,
  };
}

const base = { goals: [goal], buildings: [lot], normalDoneBefore: 0, dailyBonusEarned: false };

describe("computeCompletion", () => {
  it("핵심 할 일 + 목표 연결: 크레딧과 공사 진행", () => {
    const effect = computeCompletion({ ...base, task: task({ isCore: true, goalId: "g1" }) });
    expect(effect.ledger).toEqual([{ type: "EARN_CORE_TASK", amount: CORE_TASK_CREDIT }]);
    expect(effect.buildingId).toBe("b1");
    expect(effect.message).toBe(`+${CORE_TASK_CREDIT} 크레딧 · 오피스 공사 진행`);
  });

  it("핵심 할 일 + 목표 없음: 크레딧만", () => {
    const effect = computeCompletion({ ...base, task: task({ isCore: true }) });
    expect(effect.message).toBe(`+${CORE_TASK_CREDIT} 크레딧`);
    expect(effect.buildingId).toBeNull();
  });

  it("일반 할 일 + 목표 연결: 크레딧 없이 공사 진행", () => {
    const effect = computeCompletion({ ...base, task: task({ goalId: "g1" }) });
    expect(effect.ledger).toEqual([]);
    expect(effect.message).toBe("오피스 공사 진행");
  });

  it("일반 할 일 + 목표 없음 + 보너스 전: 보너스 진행", () => {
    const effect = computeCompletion({ ...base, task: task(), normalDoneBefore: 2 });
    expect(effect.message).toBe(`오늘의 보너스 3/${DAILY_BONUS_THRESHOLD}`);
  });

  it("일반 할 일 기준 수 달성: 일일 보너스 지급", () => {
    const effect = computeCompletion({ ...base, task: task({ goalId: "g1" }), normalDoneBefore: DAILY_BONUS_THRESHOLD - 1 });
    expect(effect.dailyBonusEarnedNow).toBe(true);
    expect(effect.ledger).toEqual([{ type: "EARN_DAILY_BONUS", amount: DAILY_BONUS_CREDIT }]);
    expect(effect.message).toBe(`+${DAILY_BONUS_CREDIT} 크레딧 · 오늘의 보너스`);
  });

  it("보너스는 하루 한 번만", () => {
    const effect = computeCompletion({ ...base, task: task(), normalDoneBefore: DAILY_BONUS_THRESHOLD, dailyBonusEarned: true });
    expect(effect.ledger).toEqual([]);
    expect(effect.message).toBe("완료했어요");
  });

  it("핵심 할 일은 일일 보너스에 반영되지 않는다", () => {
    const effect = computeCompletion({ ...base, task: task({ isCore: true }), normalDoneBefore: DAILY_BONUS_THRESHOLD - 1 });
    expect(effect.dailyBonusEarnedNow).toBe(false);
  });

  it("연결 할 일 완료 수가 기준에 닿으면 골조", () => {
    const nearFrame = { ...lot, constructionProgress: BUILDING_FRAME_THRESHOLD - 1 };
    const effect = computeCompletion({ ...base, buildings: [nearFrame], task: task({ isCore: true, goalId: "g1" }) });
    expect(effect.reachedFrame).toBe(true);
    expect(effect.nextBuildingStage).toBe("FRAME");
    expect(effect.message).toBe(`+${CORE_TASK_CREDIT} 크레딧 · 오피스 골조가 올라갔어요`);
  });

  it("보관한 목표는 공사가 멈춘다", () => {
    const archived = { ...goal, status: "ARCHIVED" as const };
    const effect = computeCompletion({ ...base, goals: [archived], task: task({ goalId: "g1" }), normalDoneBefore: 1 });
    expect(effect.buildingId).toBeNull();
    expect(effect.message).toBe(`오늘의 보너스 2/${DAILY_BONUS_THRESHOLD}`);
  });
});

describe("computeUncompletion", () => {
  it("핵심 할 일 취소: 크레딧과 공사 진행 회수", () => {
    const effect = computeUncompletion({ ...base, task: task({ isCore: true, goalId: "g1", status: "DONE" }) });
    expect(effect.ledger).toEqual([{ type: "REVOKE_UNCOMPLETE", amount: -CORE_TASK_CREDIT }]);
    expect(effect.buildingId).toBe("b1");
  });

  it("보너스 기준 아래로 내려가면 보너스 회수", () => {
    const effect = computeUncompletion({
      ...base,
      task: task({ status: "DONE" }),
      normalDoneBefore: DAILY_BONUS_THRESHOLD,
      dailyBonusEarned: true,
    });
    expect(effect.dailyBonusRevoked).toBe(true);
    expect(effect.ledger).toEqual([{ type: "REVOKE_UNCOMPLETE", amount: -DAILY_BONUS_CREDIT }]);
  });

  it("기준보다 많이 완료했으면 보너스 유지", () => {
    const effect = computeUncompletion({
      ...base,
      task: task({ status: "DONE" }),
      normalDoneBefore: DAILY_BONUS_THRESHOLD + 1,
      dailyBonusEarned: true,
    });
    expect(effect.dailyBonusRevoked).toBe(false);
    expect(effect.ledger).toEqual([]);
  });

  it("골조가 된 직후 취소하면 터로 돌아간다", () => {
    const frame = { ...lot, stage: "FRAME" as const, constructionProgress: BUILDING_FRAME_THRESHOLD };
    const effect = computeUncompletion({ ...base, buildings: [frame], task: task({ goalId: "g1", status: "DONE" }) });
    expect(effect.nextBuildingStage).toBe("LOT");
  });
});

describe("canUncomplete", () => {
  it("완료한 당일에만 가능", () => {
    const done = task({ status: "DONE", completedAt: "2026-10-27T09:00:00" });
    expect(canUncomplete(done, "2026-10-27")).toBe(true);
    expect(canUncomplete(done, "2026-10-28")).toBe(false);
    expect(canUncomplete(task(), "2026-10-27")).toBe(false);
  });
});
