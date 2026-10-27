import { describe, expect, it } from "vitest";
import { MAX_CORE_TASKS_PER_DAY } from "@/config/game";
import { addDays, toDateKey } from "@/lib/date";
import { createTask, fetchTaskDetail, rescheduleTask, setMockScenario } from "@/mocks/server";

describe("rescheduleTask", () => {
  it("옮긴 날의 핵심 할 일이 가득 차 있으면 일반 할 일로 옮기고 결과로 알린다", async () => {
    setMockScenario("empty");
    setMockScenario("default");
    const tomorrow = addDays(toDateKey(new Date()), 1);
    for (let i = 0; i < MAX_CORE_TASKS_PER_DAY; i += 1) {
      await createTask({ title: `내일 핵심 ${i}`, scheduledDate: tomorrow, goalId: null, isCore: true, source: "MANUAL", recurrence: null });
    }
    // t-2: 오늘의 핵심 할 일 (가짜 데이터)
    const result = await rescheduleTask("t-2", tomorrow);
    expect(result.demotedFromCore).toBe(true);
    const detail = await fetchTaskDetail("t-2");
    expect(detail?.task.isCore).toBe(false);
    expect(detail?.task.scheduledDate).toBe(tomorrow);
  });
});
