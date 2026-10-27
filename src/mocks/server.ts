// 백엔드가 준비되기 전까지 쓰는 메모리 안의 가짜 API.
// 함수 이름과 응답 모양이 나중에 API 명세의 기준이 된다
import { MOCK_AI_LATENCY_MS, MOCK_LATENCY_MS } from "@/config/app";
import { computeCompletion, computeUncompletion, canUncomplete, type LedgerChange } from "@/lib/completion";
import { toDateKey } from "@/lib/date";
import { remainingAiCalls } from "@/lib/drafts";
import { canUpgradeHouse } from "@/lib/house";
import { isCoreFull } from "@/lib/today";
import { mockBreakdown } from "@/mocks/aiDrafts";
import { createMockDb, type MockDb, type MockScenario } from "@/mocks/scenarios";
import { GOAL_BUILDING } from "@/config/game";
import type {
  AiUsage,
  CreateGoalRequest,
  DateKey,
  Goal,
  GoalBreakdown,
  GoalBreakdownRequest,
  Task,
  TodayPlan,
} from "@/types";

let scenario: MockScenario = "default";
let db: MockDb = createMockDb(scenario);

export function setMockScenario(next: MockScenario) {
  if (next === scenario) return;
  scenario = next;
  db = createMockDb(next);
}

export function getMockScenario(): MockScenario {
  return scenario;
}

export class MockApiError extends Error {}

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
const today = () => toDateKey(new Date());
const clone = <T>(value: T): T => structuredClone(value);

async function respond<T>(read: () => T): Promise<T> {
  await wait();
  if (scenario === "loading") return new Promise<T>(() => {});
  if (scenario === "load-error") throw new MockApiError("load failed");
  return clone(read());
}

async function mutate<T>(write: () => T): Promise<T> {
  await wait();
  if (scenario === "save-error") throw new MockApiError("save failed");
  return clone(write());
}

function findTask(id: string): Task {
  const task = db.tasks.find((t) => t.id === id);
  if (!task) throw new MockApiError(`task ${id} not found`);
  return task;
}

const isOverdue = (t: Task, date: DateKey) =>
  t.status === "PLANNED" && t.scheduledDate !== null && t.scheduledDate < date;

const activeGoals = () => db.goals.filter((g) => g.status === "ACTIVE");

function normalDoneToday(date: DateKey) {
  return db.tasks.filter((t) => t.scheduledDate === date && !t.isCore && t.status === "DONE").length;
}

function balance() {
  return db.ledger.reduce((sum, l) => sum + l.amount, 0);
}

function writeLedger(changes: LedgerChange[], taskId: string) {
  for (const change of changes) {
    db.ledger.push({ id: `l-${db.ledger.length + 1}`, ...change, taskId, createdAt: new Date().toISOString() });
  }
}

export interface TaskListResult {
  tasks: Task[];
  goals: Goal[];
}

export function fetchTodayPlan(): Promise<TodayPlan> {
  return respond(() => {
    const date = today();
    const tasks = db.tasks.filter((t) => t.scheduledDate === date && t.status !== "SPLIT");
    const goalIds = new Set(activeGoals().map((g) => g.id));
    for (const t of tasks) if (t.goalId) goalIds.add(t.goalId);
    return {
      date,
      tasks,
      goals: db.goals.filter((g) => goalIds.has(g.id)),
      buildings: db.buildings,
      overdueCount: db.tasks.filter((t) => isOverdue(t, date)).length,
      canUpgradeHouse: canUpgradeHouse(db.house.level, db.placements.length, balance()),
      undatedTasks: db.tasks.filter(
        (t) => t.scheduledDate === null && t.status === "PLANNED" && t.goalId !== null && goalIds.has(t.goalId),
      ),
      quickTemplates: db.quickTemplates,
      dailyBonusEarned: db.dailyBonusDates.includes(date),
    };
  });
}

/** 지난 할 일. 오래된 날짜가 위 */
export function fetchOverdueTasks(): Promise<TaskListResult> {
  return respond(() => {
    const date = today();
    const tasks = db.tasks
      .filter((t) => isOverdue(t, date))
      .sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""));
    return { tasks, goals: db.goals };
  });
}

export function completeTask(id: string) {
  return mutate(() => {
    const date = today();
    const task = findTask(id);
    if (task.status === "DONE") return { message: null };
    const effect = computeCompletion({
      task,
      goals: db.goals,
      buildings: db.buildings,
      normalDoneBefore: normalDoneToday(date),
      dailyBonusEarned: db.dailyBonusDates.includes(date),
    });
    task.status = "DONE";
    task.completedAt = new Date().toISOString();
    writeLedger(effect.ledger, id);
    if (effect.dailyBonusEarnedNow) db.dailyBonusDates.push(date);
    const building = db.buildings.find((b) => b.id === effect.buildingId);
    if (building && effect.nextBuildingStage) {
      building.constructionProgress += 1;
      building.stage = effect.nextBuildingStage;
    }
    return { message: effect.message };
  });
}

export function uncompleteTask(id: string) {
  return mutate(() => {
    const date = today();
    const task = findTask(id);
    if (!canUncomplete(task, date)) throw new MockApiError("cannot uncomplete");
    const effect = computeUncompletion({
      task,
      goals: db.goals,
      buildings: db.buildings,
      normalDoneBefore: normalDoneToday(date),
      dailyBonusEarned: db.dailyBonusDates.includes(date),
    });
    task.status = "PLANNED";
    task.completedAt = null;
    writeLedger(effect.ledger, id);
    if (effect.dailyBonusRevoked) db.dailyBonusDates = db.dailyBonusDates.filter((d) => d !== date);
    const building = db.buildings.find((b) => b.id === effect.buildingId);
    if (building && effect.nextBuildingStage) {
      building.constructionProgress = Math.max(0, building.constructionProgress - 1);
      building.stage = effect.nextBuildingStage;
    }
    return { ok: true };
  });
}

export function setTaskCore(id: string, isCore: boolean) {
  return mutate(() => {
    const task = findTask(id);
    if (isCore) {
      const sameDay = db.tasks.filter((t) => t.scheduledDate === task.scheduledDate);
      if (isCoreFull(sameDay)) throw new MockApiError("core full");
    }
    task.isCore = isCore;
    return { ok: true };
  });
}

/** 핵심 할 일 하나를 해제하고 다른 할 일을 핵심으로 지정 */
export function replaceCoreTask(removeId: string, addId: string) {
  return mutate(() => {
    findTask(removeId).isCore = false;
    findTask(addId).isCore = true;
    return { ok: true };
  });
}

export function rescheduleTask(id: string, date: DateKey) {
  return mutate(() => {
    const task = findTask(id);
    // 옮긴 날짜의 핵심 할 일이 이미 가득 차 있으면 일반 할 일로 옮긴다
    if (task.isCore && isCoreFull(db.tasks.filter((t) => t.id !== id && t.scheduledDate === date))) {
      task.isCore = false;
    }
    task.scheduledDate = date;
    return { ok: true };
  });
}

export function unscheduleTask(id: string) {
  return mutate(() => {
    const task = findTask(id);
    task.scheduledDate = null;
    task.isCore = false;
    return { ok: true };
  });
}

// 목표와 AI 분해 (S09, S10, S11)

export class MockAiTimeoutError extends Error {}

export function fetchAiUsage(): Promise<AiUsage> {
  return respond(() => ({ usedToday: db.aiUsedToday, remaining: remainingAiCalls(db.aiUsedToday) }));
}

/** 진행 중 목표 수. 0이면 첫 진입으로 본다 */
export function fetchActiveGoalCount(): Promise<number> {
  return respond(() => activeGoals().length);
}

let breakdownRound = 0;

/**
 * AI 분해 요청. 성공하면 1회로 센다. 취소(abort)도 서버는 이미 호출했으므로 1회로 센다.
 * 실패와 시간 초과는 세지 않는다 (docs/screens.md 확인 필요)
 */
export function requestGoalBreakdown(req: GoalBreakdownRequest, signal?: AbortSignal): Promise<GoalBreakdown> {
  return new Promise((resolve, reject) => {
    if (remainingAiCalls(db.aiUsedToday) === 0) {
      reject(new MockApiError("daily limit"));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      const reason = signal?.reason;
      const timedOut = reason instanceof DOMException && reason.name === "TimeoutError";
      if (!timedOut) db.aiUsedToday += 1;
      reject(timedOut ? new MockAiTimeoutError("timeout") : reason);
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    const timer = setTimeout(() => {
      // ai-timeout 시나리오: 응답하지 않는다. 시간 초과는 호출한 쪽의 signal이 끊는다
      if (scenario === "ai-timeout") return;
      signal?.removeEventListener("abort", onAbort);
      if (scenario === "ai-fail") {
        reject(new MockApiError("ai failed"));
        return;
      }
      db.aiUsedToday += 1;
      breakdownRound += 1;
      resolve(clone(mockBreakdown(req.title, breakdownRound)));
    }, MOCK_AI_LATENCY_MS);
  });
}

/** 목표, 고른 할 일(날짜 없음), 건물 터를 만든다 */
export function createGoal(req: CreateGoalRequest) {
  return mutate(() => {
    const now = new Date().toISOString();
    const goalId = `g-${Date.now()}`;
    db.goals.push({
      id: goalId,
      title: req.title,
      type: req.type,
      status: "ACTIVE",
      dueDate: req.dueDate,
      completionCriteria: null,
      createdAt: now,
    });
    db.buildings.push({ id: `b-${goalId}`, goalId, type: GOAL_BUILDING[req.type], stage: "LOT", constructionProgress: 0 });
    req.taskTitles.forEach((title, i) => {
      db.tasks.push({
        id: `t-${goalId}-${i}`,
        title,
        goalId,
        status: "PLANNED",
        scheduledDate: null,
        isCore: false,
        source: req.source,
        completedAt: null,
        createdAt: now,
      });
    });
    return { goalId };
  });
}
