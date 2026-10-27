import { describe, expect, it } from "vitest";
import { MAX_CORE_TASKS_PER_DAY } from "@/config/game";
import { canMarkCore, defaultAmountFor, defaultGoalFor, templateTitle } from "@/lib/quickAdd";
import type { Goal, QuickTaskTemplate, Task } from "@/types";

const reading: QuickTaskTemplate = {
  id: "q-read",
  keyword: "독서",
  units: ["MINUTE", "PAGE"],
  amountOptions: { MINUTE: [10, 20, 30], PAGE: [10, 20, 50] },
  defaultAmount: { MINUTE: 20 },
  goalType: null,
  sortOrder: 1,
};

const goal = (id: string, createdAt: string, overrides: Partial<Goal> = {}): Goal => ({
  id,
  title: id,
  type: "CAREER",
  status: "ACTIVE",
  dueDate: null,
  completionCriteria: null,
  createdAt,
  ...overrides,
});

describe("templateTitle", () => {
  it("키워드 수량단위", () => {
    expect(templateTitle("독서", 20, "MINUTE")).toBe("독서 20분");
    expect(templateTitle("독서", 30, "PAGE")).toBe("독서 30쪽");
  });
});

describe("defaultAmountFor", () => {
  it("정한 기본값, 없으면 첫 선택지", () => {
    expect(defaultAmountFor(reading, "MINUTE")).toBe(20);
    expect(defaultAmountFor(reading, "PAGE")).toBe(10);
  });
});

describe("defaultGoalFor", () => {
  const career = { ...reading, goalType: "CAREER" as const };
  it("공통 템플릿은 목표가 없다", () => {
    expect(defaultGoalFor(reading, [goal("a", "2026-10-01")])).toBeNull();
  });
  it("같은 유형의 진행 중 목표 중 가장 최근", () => {
    const goals = [goal("old", "2026-09-01"), goal("new", "2026-10-01"), goal("other", "2026-10-20", { type: "STUDY" })];
    expect(defaultGoalFor(career, goals)?.id).toBe("new");
  });
  it("보관한 목표는 고르지 않는다", () => {
    expect(defaultGoalFor(career, [goal("x", "2026-10-01", { status: "ARCHIVED" })])).toBeNull();
  });
});

describe("canMarkCore", () => {
  const core = (i: number): Task => ({
    id: `t${i}`,
    title: "t",
    goalId: null,
    status: "PLANNED",
    scheduledDate: "2026-10-28",
    isCore: true,
    source: "MANUAL",
    recurrence: null,
    completedAt: null,
    createdAt: "2026-10-28T08:00:00",
  });
  it("날짜가 없으면 핵심으로 정할 수 없다", () => {
    expect(canMarkCore(null, [])).toBe(false);
  });
  it(`그날 핵심이 ${MAX_CORE_TASKS_PER_DAY}개면 정할 수 없다`, () => {
    const cores = Array.from({ length: MAX_CORE_TASKS_PER_DAY }, (_, i) => core(i));
    expect(canMarkCore("2026-10-28", cores)).toBe(false);
    expect(canMarkCore("2026-10-29", cores)).toBe(true);
  });
});
