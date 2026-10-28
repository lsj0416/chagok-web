import { beforeEach, describe, expect, it } from "vitest";
import { MAX_CORE_TASKS_PER_DAY } from "@/config/game";
import { addDays, toDateKey } from "@/lib/date";
import { createTask, fetchDayCoreTasks, fetchTaskDetail, rescheduleTask, setMockScenario } from "@/mocks/server";

const tomorrow = () => addDays(toDateKey(new Date()), 1);

/** 내일 핵심 할 일을 가득 채운다 */
async function fillTomorrowCore() {
  for (let i = 0; i < MAX_CORE_TASKS_PER_DAY; i += 1) {
    await createTask({ title: `내일 핵심 ${i}`, scheduledDate: tomorrow(), goalId: null, isCore: true, source: "MANUAL", recurrence: null });
  }
}

describe("핵심 할 일이 가득 찬 날로 옮기기", () => {
  beforeEach(async () => {
    setMockScenario("empty");
    setMockScenario("default");
    await fillTomorrowCore();
  });

  it("고른 처리가 없으면 옮기지 않고 거절한다 (말없이 일반 할 일로 바꾸지 않는다)", async () => {
    // t-2: 오늘의 핵심 할 일 (가짜 데이터)
    await expect(rescheduleTask("t-2", tomorrow())).rejects.toThrow();
    const detail = await fetchTaskDetail("t-2");
    expect(detail?.task.isCore).toBe(true);
    expect(detail?.task.scheduledDate).not.toBe(tomorrow());
  });

  it("일반 할 일로 옮기기를 고르면 일반 할 일로 옮긴다", async () => {
    await rescheduleTask("t-2", tomorrow(), { asNormal: true });
    const detail = await fetchTaskDetail("t-2");
    expect(detail?.task.isCore).toBe(false);
    expect(detail?.task.scheduledDate).toBe(tomorrow());
  });

  it("뺄 할 일을 고르면 그 할 일을 일반으로 바꾸고 핵심으로 옮긴다", async () => {
    const [removed] = await fetchDayCoreTasks(tomorrow());
    await rescheduleTask("t-2", tomorrow(), { replaceCoreTaskId: removed.id });
    const core = await fetchDayCoreTasks(tomorrow());
    expect(core.map((t) => t.id)).toContain("t-2");
    expect(core.map((t) => t.id)).not.toContain(removed.id);
    expect(core).toHaveLength(MAX_CORE_TASKS_PER_DAY);
  });

  it("새로 더할 때도 고른 처리가 없으면 거절한다", async () => {
    const req = { title: "내일 핵심 하나 더", scheduledDate: tomorrow(), goalId: null, isCore: true, source: "MANUAL" as const, recurrence: null };
    await expect(createTask(req)).rejects.toThrow();
    await createTask(req, { asNormal: true });
    expect(await fetchDayCoreTasks(tomorrow())).toHaveLength(MAX_CORE_TASKS_PER_DAY);
  });
});
