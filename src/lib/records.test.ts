import { describe, expect, it } from "vitest";
import { addDays, startOfWeek } from "@/lib/date";
import { completionRate, formatRate, pageDayRecords, summarizeWeek } from "@/lib/records";
import type { DayRecord } from "@/types";

const day = (date: string, planned: number, plannedDone: number, done = plannedDone): DayRecord => ({
  date,
  plannedCount: planned,
  plannedDoneCount: plannedDone,
  doneTasks: Array.from({ length: done }, (_, i) => ({ id: `${date}-${i}`, title: `할 일 ${i}` })),
  movedTasks: [],
});

describe("startOfWeek", () => {
  it("월요일부터 센다. 일요일은 그 전 월요일", () => {
    expect(startOfWeek("2026-10-28")).toBe("2026-10-26"); // 수
    expect(startOfWeek("2026-10-26")).toBe("2026-10-26"); // 월
    expect(startOfWeek("2026-11-01")).toBe("2026-10-26"); // 일
  });
});

describe("completionRate", () => {
  it("수행 대상이 0개인 날은 계산하지 않는다", () => {
    expect(completionRate(0, 0)).toBeNull();
    expect(completionRate(3, 4)).toBe(0.75);
  });
});

describe("summarizeWeek", () => {
  it("이번 주 날만 더하고, 하나 이상 완료한 날을 실행한 날로 센다", () => {
    const days = [
      day("2026-10-25", 5, 5), // 지난주 일요일: 빠진다
      day("2026-10-26", 4, 3),
      day("2026-10-27", 0, 0, 2), // 계획이 없던 날: 실행률 분모에 없음, 실행한 날에는 들어감
      day("2026-10-28", 2, 0),
    ];
    const week = summarizeWeek(days, "2026-10-28");
    expect(week.doneCount).toBe(5);
    expect(week.activeDayCount).toBe(2);
    // 오늘(10/28, 0/2)은 아직 하는 중이라 실행률에서 빠진다: 10/26의 3/4만
    expect(week.completionRate).toBe(0.75);
  });

  it("월요일 아침에는 끝난 날이 없어 실행률이 없다", () => {
    expect(summarizeWeek([day("2026-10-26", 3, 0)], "2026-10-26").completionRate).toBeNull();
  });

  it("계획이 하나도 없던 주는 실행률이 없다", () => {
    expect(summarizeWeek([day("2026-10-27", 0, 0, 1)], "2026-10-28").completionRate).toBeNull();
    expect(formatRate(0.678)).toBe("68%");
  });
});

describe("pageDayRecords", () => {
  const day = (date: string): DayRecord => ({ date, plannedCount: 1, plannedDoneCount: 1, doneTasks: [], movedTasks: [] });
  const today = "2026-10-28";
  const days = [0, 1, 5, 29, 30, 31, 70].map((n) => day(addDays(today, -n)));

  it("기준 날짜 전날부터 정한 기간만 최근 날짜가 위로 자르고, 더 오래된 기록이 있으면 다음 기준을 준다", () => {
    const first = pageDayRecords(days, addDays(today, 1), 30);
    expect(first.days.map((d) => d.date)).toEqual([0, 1, 5, 29].map((n) => addDays(today, -n)));
    expect(first.olderBefore).toBe(addDays(today, -29));
  });

  it("더 오래된 기록이 없으면 olderBefore는 null", () => {
    const last = pageDayRecords(days, addDays(today, -60), 30);
    expect(last.days.map((d) => d.date)).toEqual([addDays(today, -70)]);
    expect(last.olderBefore).toBeNull();
  });
});
