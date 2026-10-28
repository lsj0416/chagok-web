// 화면 상태 확인용 가짜 데이터 시나리오.
// 개발 서버에서 ?mock=<이름> 으로 바꿔 본다. 날짜는 오늘을 기준으로 만든다
import { DEFAULT_EVENING_REMINDER_TIME, DEFAULT_MORNING_REMINDER_TIME } from "@/config/app";
import { AI_DAILY_LIMIT, DAILY_BONUS_THRESHOLD, HOUSE_UPGRADE_RULES } from "@/config/game";
import { addDays, toDateKey } from "@/lib/date";
import { furnishedSlots, MOCK_CATALOG } from "@/mocks/house";
import type {
  AchievementProgress,
  Building,
  CreditLedgerEntry,
  DateKey,
  DayRecord,
  Furniture,
  FurnitureCatalogItem,
  Goal,
  House,
  Placement,
  PushSubscriptionRequest,
  QuickTaskTemplate,
  Task,
  UserSettings,
} from "@/types";

export interface MockDb {
  goals: Goal[];
  buildings: Building[];
  tasks: Task[];
  ledger: CreditLedgerEntry[];
  house: House;
  furniture: Furniture[];
  placements: Placement[];
  catalog: FurnitureCatalogItem[];
  quickTemplates: QuickTaskTemplate[];
  /** 일일 보너스를 받은 날짜 */
  dailyBonusDates: DateKey[];
  /** 오늘 사용한 AI 분해 횟수 */
  aiUsedToday: number;
  /** 어제까지의 기록. 오늘 기록은 할 일에서 계산한다 */
  pastRecords: DayRecord[];
  achievements: AchievementProgress[];
  settings: UserSettings;
  /** 기기별 웹 푸시 구독 */
  pushSubscriptions: PushSubscriptionRequest[];
  /** 오늘에서 다른 날로 옮긴 할 일 (계획 이력의 오늘 부분). 오늘 기록에 '옮긴 일'로 남는다 */
  movedFromToday: (Pick<Task, "id" | "title"> & { movedTo: DateKey | null })[];
}

export const MOCK_SCENARIOS = [
  "default",
  "empty",
  "empty-no-goal",
  "loading",
  "load-error",
  "overdue",
  "upgrade",
  "both-notices",
  "all-done",
  "bonus-near",
  "bonus-done",
  "long-title",
  "save-error",
  "offline",
  "first-entry",
  "ai-fail",
  "ai-timeout",
  "ai-limit",
  "ai-last",
  "house-ready",
  "house-two-room",
  "house-max",
  "house-negative",
  "house-shop-empty",
  "village-first",
  "village-stage-up",
  "village-archived",
  "village-full",
  "goals-mixed",
  "records-empty",
  "notify-denied",
  "notify-install",
  "login-error",
] as const;

export type MockScenario = (typeof MOCK_SCENARIOS)[number];

export function isMockScenario(value: string | null): value is MockScenario {
  return value !== null && (MOCK_SCENARIOS as readonly string[]).includes(value);
}

const at = (date: DateKey, time: string) => `${date}T${time}:00`;

function goals(today: DateKey): Goal[] {
  const created = at(addDays(today, -20), "09:00");
  return [
    { id: "g-career", title: "백엔드 개발자로 취업하기", type: "CAREER", status: "ACTIVE", dueDate: null, completionCriteria: null, createdAt: created },
    { id: "g-study", title: "정보처리기사 필기 합격", type: "STUDY", status: "ACTIVE", dueDate: null, completionCriteria: null, createdAt: created },
    { id: "g-health", title: "주 3회 운동하기", type: "HEALTH", status: "ACTIVE", dueDate: null, completionCriteria: null, createdAt: created },
  ];
}

const buildings: Building[] = [
  { id: "b-career", goalId: "g-career", type: "OFFICE", stage: "LOT", constructionProgress: 3, lastSeenStage: "LOT" },
  { id: "b-study", goalId: "g-study", type: "SCHOOL", stage: "LOT", constructionProgress: 4, lastSeenStage: "LOT" },
  { id: "b-health", goalId: "g-health", type: "GYM", stage: "FRAME", constructionProgress: 7, lastSeenStage: "FRAME" },
];

// TODO: 템플릿 목록은 개발 시점에 정한다 (docs/planning.md 14장). 정렬된 상태로 둔다
const minutes = (options: number[], fallback: number) => ({
  amountOptions: { MINUTE: options },
  defaultAmount: { MINUTE: fallback },
});
const quickTemplates: QuickTaskTemplate[] = [
  { id: "q-read", keyword: "독서", units: ["MINUTE", "PAGE"], amountOptions: { MINUTE: [10, 20, 30], PAGE: [10, 20, 50] }, defaultAmount: { MINUTE: 20, PAGE: 20 }, goalType: null, sortOrder: 1 },
  { id: "q-algo", keyword: "알고리즘 문제", units: ["COUNT"], amountOptions: { COUNT: [1, 2, 3] }, defaultAmount: { COUNT: 2 }, goalType: "CAREER", sortOrder: 2 },
  { id: "q-cert", keyword: "기출 풀기", units: ["COUNT", "MINUTE"], amountOptions: { COUNT: [10, 20, 40], MINUTE: [30, 60] }, defaultAmount: { COUNT: 20, MINUTE: 30 }, goalType: "STUDY", sortOrder: 3 },
  { id: "q-walk", keyword: "산책", units: ["MINUTE"], ...minutes([10, 20, 30], 20), goalType: "HEALTH", sortOrder: 4 },
  { id: "q-clean", keyword: "청소", units: ["MINUTE"], ...minutes([10, 20, 30], 10), goalType: null, sortOrder: 5 },
  { id: "q-eng", keyword: "영어 단어", units: ["ITEM"], amountOptions: { ITEM: [10, 20, 30] }, defaultAmount: { ITEM: 20 }, goalType: null, sortOrder: 6 },
  { id: "q-stretch", keyword: "스트레칭", units: ["MINUTE"], ...minutes([5, 10, 20], 10), goalType: "HEALTH", sortOrder: 7 },
  { id: "q-journal", keyword: "일기", units: ["MINUTE"], ...minutes([5, 10, 15], 10), goalType: null, sortOrder: 8 },
  { id: "q-blog", keyword: "기술 블로그", units: ["MINUTE"], ...minutes([30, 60, 90], 60), goalType: "CAREER", sortOrder: 9 },
  { id: "q-water", keyword: "물 마시기", units: ["COUNT"], amountOptions: { COUNT: [4, 6, 8] }, defaultAmount: { COUNT: 6 }, goalType: null, sortOrder: 10 },
];

let seq = 0;
function makeTask(today: DateKey, title: string, overrides: Partial<Task> = {}): Task {
  seq += 1;
  return {
    id: `t-${seq}`,
    title,
    goalId: null,
    status: "PLANNED",
    scheduledDate: today,
    isCore: false,
    source: "MANUAL",
    recurrence: null,
    memo: null,
    completedAt: null,
    createdAt: at(addDays(today, -1), `2${seq % 10}:00`),
    ...overrides,
  };
}

const done = (today: DateKey, time = "08:30"): Partial<Task> => ({ status: "DONE", completedAt: at(today, time) });

function todayTasks(today: DateKey): Task[] {
  return [
    makeTask(today, "관심 공고 3개에서 주요 업무 정리하기", { isCore: true, goalId: "g-career", source: "AI", ...done(today) }),
    makeTask(today, "지원동기 첫 문단 쓰기", { isCore: true, goalId: "g-career", source: "AI", memo: "회사 인재상에서 키워드 두 개를 골라 경험과 잇기" }),
    makeTask(today, "기출 1회분 풀기", { isCore: true, goalId: "g-study" }),
    makeTask(today, "Spring Security 강의 1개 듣기", { goalId: "g-career", source: "AI" }),
    makeTask(today, "독서 20분", { source: "TEMPLATE", ...done(today, "07:40") }),
    makeTask(today, "산책 30분", { goalId: "g-health", source: "TEMPLATE" }),
    makeTask(today, "세탁기 돌리기"),
    makeTask(today, "영어 단어 30개", { source: "TEMPLATE" }),
  ];
}

/** 어제 완료한 할 일. 오늘 화면에는 나오지 않고 할 일 상세(S04)의 '지난날 완료' 상태를 확인할 때 쓴다 */
function pastDoneTasks(today: DateKey): Task[] {
  const yesterday = addDays(today, -1);
  return [makeTask(today, "운영체제 정리 노트 읽기", { id: "t-done-past", scheduledDate: yesterday, goalId: "g-study", ...done(yesterday, "21:10") })];
}

function undatedTasks(today: DateKey): Task[] {
  return [
    makeTask(today, "이력서 프로젝트 설명 다듬기", { scheduledDate: null, goalId: "g-career", source: "AI" }),
    makeTask(today, "자료구조 요약 노트 만들기", { scheduledDate: null, goalId: "g-study", source: "AI" }),
    makeTask(today, "포트폴리오 README 쓰기", { scheduledDate: null, goalId: "g-career", source: "AI" }),
    makeTask(today, "데이터베이스 기출 오답 정리", { scheduledDate: null, goalId: "g-study" }),
    makeTask(today, "헬스장 등록 알아보기", { scheduledDate: null, goalId: "g-health" }),
  ];
}

function overdueTasks(today: DateKey): Task[] {
  return [
    makeTask(today, "자기소개서 초안 쓰기", { scheduledDate: addDays(today, -3), goalId: "g-career" }),
    makeTask(today, "운영체제 1장 복습", { scheduledDate: addDays(today, -1), goalId: "g-study" }),
  ];
}

const seedCredit = (amount: number): CreditLedgerEntry[] => [
  { id: "l-seed", type: "EARN_CORE_TASK", amount, taskId: null, createdAt: "2026-10-20T09:00:00" },
];

/** 원룸에서 넓히기 조건을 채운 상태: 가구 수와 잔액 */
function upgradeReady(): Pick<MockDb, "ledger" | "furniture" | "placements"> {
  const rule = HOUSE_UPGRADE_RULES.STUDIO;
  return { ledger: seedCredit((rule.upgradeCost ?? 0) + 20), ...furnishedSlots("STUDIO", rule.requiredFurniture ?? 0) };
}

/** 지난 기록. 쉬었던 날(기록 없음)과 계획이 없던 날을 섞는다 */
function pastRecords(today: DateKey): DayRecord[] {
  const t = (title: string, i: number) => ({ id: `r-${title}-${i}`, title });
  const rec = (offset: number, planned: number, done: string[], plannedDone: number, moved: DayRecord["movedTasks"] = []): DayRecord => ({
    date: addDays(today, -offset),
    plannedCount: planned,
    plannedDoneCount: plannedDone,
    doneTasks: done.map(t),
    movedTasks: moved,
  });
  return [
    rec(1, 4, ["운영체제 정리 노트 읽기", "자기소개서 소제목 정하기", "산책 20분"], 3, [
      { id: "r-m1", title: "자기소개서 초안 쓰기", movedTo: addDays(today, 1) },
    ]),
    rec(2, 0, ["독서 20분", "책상 정리"], 0),
    rec(3, 5, ["기출 1회분 풀기", "Spring Security 강의 1개 듣기", "영어 단어 30개", "산책 30분"], 4, [
      { id: "r-m2", title: "운영체제 1장 복습", movedTo: addDays(today, -1) },
    ]),
    // 4~5일 전은 쉬었다
    rec(6, 3, ["관심 공고 2개 읽기"], 1, [{ id: "r-m3", title: "포트폴리오 README 쓰기", movedTo: null }]),
    rec(7, 3, ["네트워크 기출 오답 정리", "헬스장 등록 알아보기", "독서 20분"], 3),
    rec(9, 2, ["이력서 경력 칸 다듬기"], 1),
    // '이전 기록 더 보기' 확인용: 12일 전부터 80일 전까지. 나흘에 하루는 쉬었다
    ...Array.from({ length: 69 }, (_, i) => i + 12)
      .filter((offset) => offset % 4 !== 0)
      .map((offset) => rec(offset, 3, OLDER_DONE.slice(0, 1 + (offset % 3)), 1 + (offset % 3))),
  ];
}

const OLDER_DONE = ["알고리즘 문제 2개 풀기", "자료구조 요약 노트 읽기", "산책 30분"];

// TODO: 미정 (docs/planning.md 14장). 업적 목록과 보상은 정하지 않았다. 화면 확인용 임시 값이다
function mockAchievements(today: DateKey): AchievementProgress[] {
  const earned = (offset: number) => at(addDays(today, -offset), "21:00");
  return [
    { achievement: { code: "FIRST_DONE", name: "첫 완료", description: "할 일을 처음 완료했어요", target: null, unit: null }, earnedAt: earned(19), progress: null },
    { achievement: { code: "FIRST_FRAME", name: "첫 골조", description: "건물 하나가 골조가 됐어요", target: null, unit: null }, earnedAt: earned(6), progress: null },
    { achievement: { code: "ACTIVE_DAYS_7", name: "실행한 날 7일", description: "할 일을 완료한 날이 7일이 됐어요", target: 7, unit: "일" }, earnedAt: earned(3), progress: 7 },
    { achievement: { code: "ACTIVE_DAYS_30", name: "실행한 날 30일", description: "할 일을 완료한 날 30일", target: 30, unit: "일" }, earnedAt: null, progress: 12 },
    { achievement: { code: "CORE_DONE_50", name: "핵심 할 일 50개", description: "핵심 할 일을 50개 완료", target: 50, unit: "개" }, earnedAt: null, progress: 23 },
    { achievement: { code: "FIRST_GOAL", name: "첫 목표 완료", description: "목표 하나를 완료", target: null, unit: null }, earnedAt: null, progress: null },
    { achievement: { code: "COMEBACK", name: "다시 시작", description: "쉬었다가 다시 할 일을 완료", target: null, unit: null }, earnedAt: null, progress: null },
  ];
}

function baseDb(today: DateKey): MockDb {
  return {
    goals: goals(today),
    buildings: buildings.map((b) => ({ ...b })),
    tasks: [...todayTasks(today), ...undatedTasks(today), ...pastDoneTasks(today)],
    ledger: seedCredit(210),
    house: { level: "STUDIO" },
    ...furnishedSlots("STUDIO", 2),
    catalog: MOCK_CATALOG,
    quickTemplates,
    dailyBonusDates: [],
    aiUsedToday: 3,
    pastRecords: pastRecords(today),
    achievements: mockAchievements(today),
    movedFromToday: [],
    pushSubscriptions: [],
    settings: {
      email: "sample.user@gmail.com",
      // 처음에는 기기 시간대를 쓴다
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      morningReminder: { enabled: false, time: DEFAULT_MORNING_REMINDER_TIME },
      eveningReminder: { enabled: false, time: DEFAULT_EVENING_REMINDER_TIME },
    },
  };
}

export function createMockDb(scenario: MockScenario, now: Date = new Date()): MockDb {
  seq = 0;
  const today = toDateKey(now);
  const db = baseDb(today);

  switch (scenario) {
    case "empty":
      db.tasks = undatedTasks(today);
      break;
    case "first-entry":
    case "empty-no-goal":
    case "records-empty":
      // 처음 시작한 상태: 기록과 업적도 없다
      db.goals = [];
      db.buildings = [];
      db.tasks = [];
      db.pastRecords = [];
      db.achievements = db.achievements.map((a) => ({ ...a, earnedAt: null, progress: a.progress === null ? null : 0 }));
      break;
    case "overdue":
      db.tasks.push(...overdueTasks(today));
      break;
    case "upgrade":
      Object.assign(db, upgradeReady());
      break;
    case "both-notices":
      db.tasks.push(...overdueTasks(today));
      Object.assign(db, upgradeReady());
      break;
    case "all-done": {
      db.tasks = db.tasks.map((t) => (t.scheduledDate === today ? { ...t, ...done(today, "18:10") } : t));
      const normalDone = db.tasks.filter((t) => t.scheduledDate === today && !t.isCore).length;
      if (normalDone >= DAILY_BONUS_THRESHOLD) db.dailyBonusDates.push(today);
      break;
    }
    case "bonus-near":
    case "bonus-done": {
      const count = scenario === "bonus-near" ? DAILY_BONUS_THRESHOLD - 1 : DAILY_BONUS_THRESHOLD;
      const extra = ["설거지", "책상 정리", "메일 확인", "물 마시기 5회", "스트레칭 10분"].map((title) =>
        makeTask(today, title, done(today, "12:00")),
      );
      const normalDone = db.tasks.filter((t) => t.scheduledDate === today && !t.isCore && t.status === "DONE").length;
      db.tasks.push(...extra.slice(0, count - normalDone));
      if (scenario === "bonus-done") db.dailyBonusDates.push(today);
      break;
    }
    case "long-title":
      db.tasks = [
        makeTask(today, "관심 있는 회사 다섯 곳의 채용공고에서 공통으로 요구하는 기술 스택과 우대 사항을 표로 정리하기", { isCore: true, goalId: "g-career" }),
        makeTask(today, "정보처리기사 필기 소프트웨어 설계 과목 기출문제 2회분 풀고 틀린 문제 해설까지 다시 읽어보기", { isCore: true, goalId: "g-study" }),
        makeTask(today, "주말에 가볼 만한 집 근처 등산로 찾아보고 준비물 목록 만들기", { goalId: "g-health" }),
        makeTask(today, "세탁기 돌리기"),
        ...undatedTasks(today),
      ];
      break;
    case "house-ready":
      Object.assign(db, upgradeReady());
      break;
    case "house-two-room":
      db.house = { level: "TWO_ROOM" };
      Object.assign(db, furnishedSlots("TWO_ROOM", 5));
      db.ledger = seedCredit(450);
      break;
    case "house-max":
      db.house = { level: "DETACHED" };
      Object.assign(db, furnishedSlots("DETACHED", 14));
      db.ledger = seedCredit(380);
      break;
    case "house-negative":
      db.ledger = seedCredit(-20);
      break;
    case "house-shop-empty":
      // 첫 빈 자리(조명)에 놓을 판매 가구가 없는 상태. 이미 놓인 가구의 정보는 남긴다
      db.catalog = MOCK_CATALOG.filter((c) => c.slotType !== "LAMP");
      break;
    case "village-first": {
      // 첫 목표를 막 만든 상태: 원룸과 터 하나
      const goal = goals(today)[0];
      db.goals = [goal];
      db.buildings = [{ id: "b-career", goalId: goal.id, type: "OFFICE", stage: "LOT", constructionProgress: 0, lastSeenStage: "LOT" }];
      db.tasks = db.tasks.filter((t) => t.goalId === goal.id);
      db.furniture = [];
      db.placements = [];
      break;
    }
    case "village-stage-up":
      // 학교가 골조가 된 뒤 아직 마을에서 보지 않은 상태
      db.buildings = db.buildings.map((b) =>
        b.id === "b-study" ? { ...b, stage: "FRAME", constructionProgress: 5, lastSeenStage: "LOT" } : b,
      );
      break;
    case "village-full": {
      // 터 자리 8곳이 모두 찬 상태. 아래쪽 자리(네 번째)의 목표는 긴 제목
      const extra: [string, Goal["type"], Building["type"]][] = [
        ["매달 30만 원씩 모아서 연말까지 여행 자금 360만 원 만들기", "FINANCE", "BANK"],
        ["토익 850점", "STUDY", "SCHOOL"],
        ["사이드 프로젝트 출시", "PROJECT", "WORKSHOP"],
        ["하프 마라톤 완주", "HEALTH", "GYM"],
        ["블로그 글 20편", "PROJECT", "WORKSHOP"],
      ];
      extra.forEach(([title, type, buildingType], i) => {
        const id = `g-extra-${i}`;
        db.goals.push({ id, title, type, status: "ACTIVE", dueDate: null, completionCriteria: null, createdAt: at(addDays(today, -10 + i), "09:00") });
        db.buildings.push({ id: `b-extra-${i}`, goalId: id, type: buildingType, stage: i % 2 ? "FRAME" : "LOT", constructionProgress: i % 2 ? 6 : 2, lastSeenStage: i % 2 ? "FRAME" : "LOT" });
      });
      break;
    }
    case "village-archived":
      db.goals = db.goals.map((g) => (g.id === "g-health" ? { ...g, status: "ARCHIVED" } : g));
      break;
    case "goals-mixed": {
      // 목표 상세(S12)의 상태를 한 번에 확인한다
      // g-study: 기한 지남 / g-health: 보관 / g-done: 완료 / g-all: 할 일을 모두 마침 / g-new: 할 일 0개
      db.goals = db.goals.map((g) => {
        if (g.id === "g-study") return { ...g, dueDate: addDays(today, -2), completionCriteria: "필기 60점 이상" };
        if (g.id === "g-health") return { ...g, status: "ARCHIVED" };
        if (g.id === "g-career") return { ...g, dueDate: addDays(today, 60), completionCriteria: "최종 합격 1곳" };
        return g;
      });
      const extra: [string, string, Goal["type"], Building["type"], Goal["status"]][] = [
        ["g-done", "블로그 글 10편 쓰기", "PROJECT", "WORKSHOP", "COMPLETED"],
        ["g-all", "토익 시험 접수하기", "STUDY", "SCHOOL", "ACTIVE"],
        ["g-new", "매달 30만 원 모으기", "FINANCE", "BANK", "ACTIVE"],
      ];
      for (const [id, title, type, buildingType, status] of extra) {
        db.goals.push({ id, title, type, status, dueDate: null, completionCriteria: null, createdAt: at(addDays(today, -5), "09:00") });
        db.buildings.push({
          id: `b-${id}`,
          goalId: id,
          type: buildingType,
          stage: status === "COMPLETED" ? "COMPLETE" : "LOT",
          constructionProgress: status === "COMPLETED" ? 10 : 2,
          lastSeenStage: status === "COMPLETED" ? "COMPLETE" : "LOT",
        });
      }
      db.tasks.push(
        makeTask(today, "토익 공식 사이트 회원가입", { scheduledDate: addDays(today, -1), goalId: "g-all", ...done(addDays(today, -1), "20:00") }),
        makeTask(today, "시험 날짜 고르고 접수비 결제", { goalId: "g-all", ...done(today, "09:00") }),
        makeTask(today, "글감 목록 정리", { scheduledDate: addDays(today, -9), goalId: "g-done", ...done(addDays(today, -9), "21:00") }),
      );
      break;
    }
    case "ai-limit":
      db.aiUsedToday = AI_DAILY_LIMIT;
      break;
    case "ai-last":
      db.aiUsedToday = AI_DAILY_LIMIT - 1;
      break;
    default:
      break;
  }
  return db;
}
