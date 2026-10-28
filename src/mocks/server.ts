// 백엔드가 준비되기 전까지 쓰는 메모리 안의 가짜 API.
// 함수 이름과 응답 모양이 나중에 API 명세의 기준이 된다
import { MOCK_AI_LATENCY_MS, MOCK_LATENCY_MS, RECORDS_PAGE_DAYS } from "@/config/app";
import { computeCompletion, computeUncompletion, canUncomplete, type LedgerChange } from "@/lib/completion";
import { addDays, toDateKey } from "@/lib/date";
import { remainingAiCalls } from "@/lib/drafts";
import { canPurchase, canUpgradeHouse } from "@/lib/house";
import { slotsFor } from "@/mocks/house";
import { pageDayRecords, summarizeWeek } from "@/lib/records";
import type { NotifyBlock } from "@/lib/push";
import { isCoreFull } from "@/lib/today";
import { mockBreakdown } from "@/mocks/aiDrafts";
import { createMockDb, type MockDb, type MockScenario } from "@/mocks/scenarios";
import { GOAL_BUILDING, HOUSE_UPGRADE_RULES, SPLIT_MIN_TASKS } from "@/config/game";
import type {
  CoreConflictChoice,
  AchievementProgress,
  AiUsage,
  CreateGoalRequest,
  CreateTaskRequest,
  DateKey,
  DayRecord,
  DayRecordPage,
  Goal,
  GoalBreakdown,
  GoalBreakdownRequest,
  GoalDetail,
  GoalSummary,
  RemainingTaskAction,
  UpdateGoalRequest,
  HouseDetail,
  PushSubscriptionRequest,
  RecordsOverview,
  Task,
  TaskDetail,
  VillageDetail,
  TodayPlan,
  UserSettings,
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
      canUpgradeHouse: canUpgradeHouse(db.house.level, db.furniture.length, balance()),
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

/** 그날의 핵심 할 일. 핵심 할 일을 그날로 옮기거나 더하기 전에 자리가 있는지 본다 */
export function fetchDayCoreTasks(date: DateKey, excludeTaskId?: string): Promise<Task[]> {
  return respond(() => db.tasks.filter((t) => t.scheduledDate === date && t.isCore && t.id !== excludeTaskId));
}

/** 그날 핵심 할 일이 가득 찼는데 핵심으로 들이려 하면, 사용자가 고른 처리(choice)를 따른다.
 *  고르지 않았으면 바꾸지 않고 거절한다 (말없이 일반 할 일로 바꾸지 않는다) */
function resolveCoreConflict(date: DateKey, incomingId: string | null, choice: CoreConflictChoice | undefined): boolean {
  const dayCore = db.tasks.filter((t) => t.scheduledDate === date && t.isCore && t.id !== incomingId);
  if (!isCoreFull(dayCore)) return true;
  if (!choice) throw new MockApiError("core full");
  if ("asNormal" in choice) return false;
  const removed = dayCore.find((t) => t.id === choice.replaceCoreTaskId && t.status !== "DONE");
  if (!removed) throw new MockApiError("core replace target not found");
  removed.isCore = false;
  return true;
}

export function rescheduleTask(id: string, date: DateKey, choice?: CoreConflictChoice) {
  return mutate(() => {
    const task = findTask(id);
    if (task.isCore) task.isCore = resolveCoreConflict(date, id, choice);
    recordMoveFromToday(task, date);
    task.scheduledDate = date;
    return { ok: true };
  });
}

/** 오늘이 수행 날짜였던 할 일을 다른 날로 옮기면 오늘 기록에 남긴다 (이전 날짜 기록은 남는다) */
function recordMoveFromToday(task: Task, movedTo: DateKey | null) {
  const date = today();
  if (task.scheduledDate !== date || movedTo === date || task.status !== "PLANNED") return;
  db.movedFromToday = [...db.movedFromToday.filter((m) => m.id !== task.id), { id: task.id, title: task.title, movedTo }];
}

export function unscheduleTask(id: string) {
  return mutate(() => {
    const task = findTask(id);
    if (task.recurrence) throw new MockApiError("recurring task needs a date");
    recordMoveFromToday(task, null);
    task.scheduledDate = null;
    task.isCore = false;
    return { ok: true };
  });
}

// 할 일 상세 (S04)

/** 없는 할 일(지웠거나 나눠진 할 일 포함)이면 null */
export function fetchTaskDetail(id: string): Promise<TaskDetail | null> {
  return respond(() => {
    const task = db.tasks.find((t) => t.id === id && t.status !== "SPLIT");
    if (!task) return null;
    return {
      task,
      goals: db.goals.filter((g) => g.status === "ACTIVE" || g.id === task.goalId),
      dayCoreTasks: task.scheduledDate
        ? db.tasks.filter((t) => t.id !== id && t.isCore && t.status !== "SPLIT" && t.scheduledDate === task.scheduledDate)
        : [],
    };
  });
}

export function updateTask(id: string, patch: Partial<Pick<Task, "title" | "memo" | "goalId" | "recurrence">>) {
  return mutate(() => {
    const task = findTask(id);
    // 완료한 할 일은 공사 진행이 이미 반영됐으므로 목표를 바꾸지 않는다
    if (task.status === "DONE" && patch.goalId !== undefined && patch.goalId !== task.goalId) {
      throw new MockApiError("done task goal locked");
    }
    // 매일 반복은 날짜가 있는 할 일만 (언제부터 반복하는지가 있어야 한다)
    if (patch.recurrence && task.scheduledDate === null) throw new MockApiError("recurrence needs a date");
    Object.assign(task, patch);
    return { ok: true };
  });
}

/**
 * 나누기. 원래 할 일은 SPLIT으로 남고(목록, 집계, 크레딧에서 빠진다) 새 할 일은 원래 날짜와 목표를 이어받는다.
 * 새 할 일은 일반 할 일로 만들고 반복과 메모는 물려주지 않는다
 */
export function splitTask(id: string, titles: string[]) {
  return mutate(() => {
    const task = findTask(id);
    if (task.status !== "PLANNED") throw new MockApiError("only planned tasks split");
    if (titles.length < SPLIT_MIN_TASKS) throw new MockApiError("too few titles");
    task.status = "SPLIT";
    task.isCore = false;
    const now = new Date().toISOString();
    titles.forEach((title, i) => {
      db.tasks.push({
        id: `t-${Date.now()}-${i}`,
        title,
        goalId: task.goalId,
        status: "PLANNED",
        scheduledDate: task.scheduledDate,
        isCore: false,
        source: "MANUAL",
        recurrence: null,
        memo: null,
        completedAt: null,
        createdAt: now,
      });
    });
    return { count: titles.length };
  });
}

/** 삭제. 완료한 할 일이어도 받은 크레딧과 공사 진행은 그대로 둔다 */
export function deleteTask(id: string) {
  return mutate(() => {
    findTask(id);
    db.tasks = db.tasks.filter((t) => t.id !== id);
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
 * 실패와 시간 초과는 세지 않는다
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
    db.buildings.push({ id: `b-${goalId}`, goalId, type: GOAL_BUILDING[req.type], stage: "LOT", constructionProgress: 0, lastSeenStage: "LOT" });
    req.taskTitles.forEach((title, i) => {
      db.tasks.push({
        id: `t-${goalId}-${i}`,
        title,
        goalId,
        status: "PLANNED",
        scheduledDate: null,
        isCore: false,
        source: req.source,
        recurrence: null,
        memo: null,
        completedAt: null,
        createdAt: now,
      });
    });
    return { goalId };
  });
}

// 목표 목록, 목표 상세 (S08, S12)

const goalTasks = (goalId: string) => db.tasks.filter((t) => t.goalId === goalId && t.status !== "SPLIT");

function findGoal(id: string) {
  const goal = db.goals.find((g) => g.id === id);
  if (!goal) throw new MockApiError(`goal ${id} not found`);
  return goal;
}

/** 모든 상태의 목표. 만든 순서가 최근인 것이 위 */
export function fetchGoals(): Promise<GoalSummary[]> {
  return respond(() =>
    [...db.goals]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((goal) => {
        const tasks = goalTasks(goal.id);
        return {
          goal,
          building: db.buildings.find((b) => b.goalId === goal.id) ?? null,
          doneTaskCount: tasks.filter((t) => t.status === "DONE").length,
          taskCount: tasks.length,
        };
      }),
  );
}

/** 없는 목표면 null */
export function fetchGoalDetail(id: string): Promise<GoalDetail | null> {
  return respond(() => {
    const goal = db.goals.find((g) => g.id === id);
    if (!goal) return null;
    const date = today();
    return {
      goal,
      building: db.buildings.find((b) => b.goalId === id) ?? null,
      tasks: goalTasks(id),
      activeGoals: activeGoals(),
      todayTasks: db.tasks.filter((t) => t.scheduledDate === date && t.status !== "SPLIT"),
    };
  });
}

export function updateGoal(id: string, req: UpdateGoalRequest) {
  return mutate(() => {
    Object.assign(findGoal(id), req);
    return { ok: true };
  });
}

/** 목표 완료. 사용자가 고른 대로 남은 할 일을 처리하고 건물을 완성한다. 자동으로 완료하지 않는다 */
export function completeGoal(id: string, remaining: RemainingTaskAction) {
  return mutate(() => {
    const goal = findGoal(id);
    const left = goalTasks(id).filter((t) => t.status === "PLANNED");
    if (remaining === "UNSCHEDULE") {
      for (const t of left) {
        t.scheduledDate = null;
        t.isCore = false;
      }
    }
    if (remaining === "DELETE") {
      const ids = new Set(left.map((t) => t.id));
      db.tasks = db.tasks.filter((t) => !ids.has(t.id));
    }
    goal.status = "COMPLETED";
    const building = db.buildings.find((b) => b.goalId === id);
    if (building) building.stage = "COMPLETE";
    return { ok: true };
  });
}

/** 보관. 건물은 그대로 남고 공사가 멈춘다 */
export function archiveGoal(id: string) {
  return mutate(() => {
    findGoal(id).status = "ARCHIVED";
    return { ok: true };
  });
}

/** 보관한 목표 다시 진행 */
export function resumeGoal(id: string) {
  return mutate(() => {
    findGoal(id).status = "ACTIVE";
    return { ok: true };
  });
}

/** 목표에 할 일 여러 개를 날짜 없이 추가한다 (S12의 AI로 할 일 추가) */
export function addGoalTasks(goalId: string, titles: string[], source: Task["source"], breakdownId: string | null = null) {
  void breakdownId; // 가짜 서버는 채택률을 세지 않는다. 실제 서버는 분해 요청과 고른 수를 기록한다
  return mutate(() => {
    findGoal(goalId);
    const now = new Date().toISOString();
    titles.forEach((title, i) => {
      db.tasks.push({
        id: `t-${goalId}-${Date.now()}-${i}`,
        title,
        goalId,
        status: "PLANNED",
        scheduledDate: null,
        isCore: false,
        source,
        recurrence: null,
        memo: null,
        completedAt: null,
        createdAt: now,
      });
    });
    return { count: titles.length };
  });
}

// 기록, 업적 (S13, S14)

/** 오늘 기록은 할 일에서 바로 계산한다. 지난 기록은 계획 이력과 실행 이력에서 계산한 값(가짜 데이터) */
function todayRecord(date: DateKey): DayRecord {
  const planned = db.tasks.filter((t) => t.scheduledDate === date && t.status !== "SPLIT");
  const done = db.tasks.filter((t) => t.status === "DONE" && t.completedAt !== null && toDateKey(new Date(t.completedAt)) === date);
  // 옮긴 할 일도 오늘의 수행 대상이었으므로 오늘 계획 수에 남긴다. 다시 오늘로 돌아온 할 일은 한 번만 센다
  const moved = db.movedFromToday.filter((m) => !planned.some((t) => t.id === m.id));
  return {
    date,
    plannedCount: planned.length + moved.length,
    plannedDoneCount: planned.filter((t) => t.status === "DONE").length,
    doneTasks: done.map(({ id, title }) => ({ id, title })),
    movedTasks: moved,
  };
}

/** 계획도 완료도 없던 날(쉰 날)은 기록 줄을 만들지 않는다 */
function allDayRecords(date: DateKey): DayRecord[] {
  return [todayRecord(date), ...db.pastRecords].filter(
    (d) => d.plannedCount > 0 || d.doneTasks.length > 0 || d.movedTasks.length > 0,
  );
}

/** 주간 요약과 최근 RECORDS_PAGE_DAYS일의 기록 */
export function fetchRecords(): Promise<RecordsOverview> {
  return respond(() => {
    const date = today();
    const days = allDayRecords(date);
    return {
      week: summarizeWeek(days, date),
      ...pageDayRecords(days, addDays(date, 1), RECORDS_PAGE_DAYS),
      earnedAchievementCount: db.achievements.filter((a) => a.earnedAt !== null).length,
    };
  });
}

/** before 이전 RECORDS_PAGE_DAYS일의 기록 ('이전 기록 더 보기') */
export function fetchDayRecords(before: DateKey): Promise<DayRecordPage> {
  return respond(() => pageDayRecords(allDayRecords(today()), before, RECORDS_PAGE_DAYS));
}

export function fetchAchievements(): Promise<AchievementProgress[]> {
  return respond(() => db.achievements);
}

// 설정, 로그인 (S15, S01)

export function fetchSettings(): Promise<UserSettings> {
  return respond(() => db.settings);
}

export function updateSettings(patch: Partial<Omit<UserSettings, "email">>) {
  return mutate(() => {
    Object.assign(db.settings, patch);
    return { ok: true };
  });
}

/** 구글 로그인. login-error 시나리오는 실패(취소 포함)로 끝난다 */
export async function signInWithGoogle(): Promise<{ activeGoalCount: number }> {
  await wait();
  await wait();
  if (scenario === "login-error") throw new MockApiError("sign-in failed");
  return { activeGoalCount: activeGoals().length };
}

export function signOut() {
  return mutate(() => ({ ok: true }));
}

/** 이 기기의 웹 푸시 구독 등록. 같은 endpoint가 다시 오면 키만 바꾼다 */
export function subscribePush(subscription: PushSubscriptionRequest) {
  return mutate(() => {
    db.pushSubscriptions = [...db.pushSubscriptions.filter((s) => s.endpoint !== subscription.endpoint), subscription];
  });
}

/** 이 기기의 웹 푸시 구독 지우기 */
export function unsubscribePush(endpoint: string) {
  return mutate(() => {
    db.pushSubscriptions = db.pushSubscriptions.filter((s) => s.endpoint !== endpoint);
  });
}

/** 알림을 켤 수 없는 상태를 흉내 낼 때. notify-denied는 권한 거부, notify-install은 홈 화면에 추가하지 않은 iPhone */
export function mockNotifyBlock(): NotifyBlock | null {
  if (scenario === "notify-denied") return "denied";
  if (scenario === "notify-install") return "install-required";
  return null;
}

// 집 내부와 가구 (S06, S07)

export function fetchHouseDetail(): Promise<HouseDetail> {
  return respond(() => ({
    house: db.house,
    slots: slotsFor(db.house.level),
    placements: db.placements,
    furniture: db.furniture,
    catalog: db.catalog,
    balance: balance(),
  }));
}

function spend(type: "SPEND_FURNITURE" | "SPEND_HOUSE_UPGRADE", amount: number) {
  db.ledger.push({ id: `l-${db.ledger.length + 1}`, type, amount: -amount, taskId: null, createdAt: new Date().toISOString() });
}

/** 슬롯에 가구를 놓는다. 이미 놓인 가구가 있으면 빼서 보유 상태로 둔다 */
function place(furnitureId: string, slotId: string) {
  db.placements = db.placements.filter((p) => p.slotId !== slotId && p.furnitureId !== furnitureId);
  db.placements.push({ id: `p-${Date.now()}`, furnitureId, slotId });
}

export function purchaseAndPlace(catalogItemId: string, slotId: string) {
  return mutate(() => {
    const item = db.catalog.find((c) => c.id === catalogItemId);
    if (!item) throw new MockApiError("item not found");
    if (!canPurchase(item.price, balance())) throw new MockApiError("not enough credit");
    spend("SPEND_FURNITURE", item.price);
    const furnitureId = `f-${Date.now()}`;
    db.furniture.push({ id: furnitureId, catalogItemId, purchasedAt: new Date().toISOString() });
    place(furnitureId, slotId);
    return { ok: true };
  });
}

/** 보유한 가구를 크레딧 차감 없이 놓는다 */
export function placeOwnedFurniture(furnitureId: string, slotId: string) {
  return mutate(() => {
    place(furnitureId, slotId);
    return { ok: true };
  });
}

/** 가구를 뺀다. 뺀 가구는 보유 상태로 남고 업그레이드 조건의 가구 수도 그대로다 */
export function removePlacement(slotId: string) {
  return mutate(() => {
    db.placements = db.placements.filter((p) => p.slotId !== slotId);
    return { ok: true };
  });
}

export function upgradeHouse() {
  return mutate(() => {
    const rule = HOUSE_UPGRADE_RULES[db.house.level];
    if (!rule.next || !canUpgradeHouse(db.house.level, db.furniture.length, balance())) {
      throw new MockApiError("cannot upgrade");
    }
    spend("SPEND_HOUSE_UPGRADE", rule.upgradeCost ?? 0);
    db.house = { level: rule.next };
    return { level: rule.next };
  });
}

// 마을 (S05)

export function fetchVillageDetail(): Promise<VillageDetail> {
  return respond(() => {
    const goalIds = new Set(db.buildings.map((b) => b.goalId));
    return {
      house: db.house,
      buildings: db.buildings,
      goals: db.goals.filter((g) => goalIds.has(g.id)),
      balance: balance(),
    };
  });
}

/** 마을에서 단계를 본 것으로 기록한다. 다음 진입부터 연출하지 않는다 */
export function markBuildingStageSeen(buildingId: string) {
  return mutate(() => {
    const building = db.buildings.find((b) => b.id === buildingId);
    if (building) building.lastSeenStage = building.stage;
    return { ok: true };
  });
}

// 할 일 만들기 (S03, S16)

/** 할 일을 만든다. 그날 핵심 할 일이 이미 가득 찼으면 사용자가 고른 처리(choice)를 따른다 */
export function createTask(req: CreateTaskRequest, choice?: CoreConflictChoice) {
  return mutate(() => {
    const isCore = req.isCore && req.scheduledDate !== null && resolveCoreConflict(req.scheduledDate, null, choice);
    const task: Task = {
      id: `t-${Date.now()}`,
      title: req.title,
      goalId: req.goalId,
      status: "PLANNED",
      scheduledDate: req.scheduledDate,
      isCore,
      source: req.source,
      recurrence: req.recurrence,
      memo: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };
    db.tasks.push(task);
    return { taskId: task.id };
  });
}
