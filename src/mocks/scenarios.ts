// 오늘 화면(S02) 상태 확인용 가짜 데이터 시나리오.
// 개발 서버에서 /today?mock=<이름> 으로 바꿔 본다. 날짜는 오늘을 기준으로 만든다
import { AI_DAILY_LIMIT, CORE_TASK_CREDIT, DAILY_BONUS_THRESHOLD, HOUSE_UPGRADE_RULES } from "@/config/game";
import { addDays, toDateKey } from "@/lib/date";
import type {
  Building,
  CreditLedgerEntry,
  DateKey,
  Goal,
  House,
  Placement,
  QuickTaskTemplate,
  Task,
} from "@/types";

export interface MockDb {
  goals: Goal[];
  buildings: Building[];
  tasks: Task[];
  ledger: CreditLedgerEntry[];
  house: House;
  placements: Placement[];
  quickTemplates: QuickTaskTemplate[];
  /** 일일 보너스를 받은 날짜 */
  dailyBonusDates: DateKey[];
  /** 오늘 사용한 AI 분해 횟수 */
  aiUsedToday: number;
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
  { id: "b-career", goalId: "g-career", type: "OFFICE", stage: "LOT", constructionProgress: 3 },
  { id: "b-study", goalId: "g-study", type: "SCHOOL", stage: "LOT", constructionProgress: 4 },
  { id: "b-health", goalId: "g-health", type: "GYM", stage: "FRAME", constructionProgress: 7 },
];

// TODO: 템플릿 목록은 개발 시점에 정한다 (docs/planning.md 14장). 정렬된 상태로 둔다
const quickTemplates: QuickTaskTemplate[] = [
  { id: "q-read", keyword: "독서", units: ["MINUTE", "PAGE"], goalType: null, sortOrder: 1 },
  { id: "q-algo", keyword: "알고리즘 문제", units: ["COUNT"], goalType: "CAREER", sortOrder: 2 },
  { id: "q-cert", keyword: "기출 풀기", units: ["COUNT", "MINUTE"], goalType: "STUDY", sortOrder: 3 },
  { id: "q-walk", keyword: "산책", units: ["MINUTE"], goalType: "HEALTH", sortOrder: 4 },
  { id: "q-clean", keyword: "청소", units: ["MINUTE"], goalType: null, sortOrder: 5 },
  { id: "q-eng", keyword: "영어 단어", units: ["ITEM"], goalType: null, sortOrder: 6 },
  { id: "q-stretch", keyword: "스트레칭", units: ["MINUTE"], goalType: "HEALTH", sortOrder: 7 },
  { id: "q-journal", keyword: "일기", units: ["MINUTE"], goalType: null, sortOrder: 8 },
  { id: "q-blog", keyword: "기술 블로그", units: ["MINUTE"], goalType: "CAREER", sortOrder: 9 },
  { id: "q-water", keyword: "물 마시기", units: ["COUNT"], goalType: null, sortOrder: 10 },
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
    completedAt: null,
    createdAt: at(addDays(today, -1), `2${seq % 10}:00`),
    ...overrides,
  };
}

const done = (today: DateKey, time = "08:30"): Partial<Task> => ({ status: "DONE", completedAt: at(today, time) });

function todayTasks(today: DateKey): Task[] {
  return [
    makeTask(today, "관심 공고 3개에서 주요 업무 정리하기", { isCore: true, goalId: "g-career", source: "AI", ...done(today) }),
    makeTask(today, "지원동기 첫 문단 쓰기", { isCore: true, goalId: "g-career", source: "AI" }),
    makeTask(today, "기출 1회분 풀기", { isCore: true, goalId: "g-study" }),
    makeTask(today, "Spring Security 강의 1개 듣기", { goalId: "g-career", source: "AI" }),
    makeTask(today, "독서 20분", { source: "TEMPLATE", ...done(today, "07:40") }),
    makeTask(today, "산책 30분", { goalId: "g-health", source: "TEMPLATE" }),
    makeTask(today, "세탁기 돌리기"),
    makeTask(today, "영어 단어 30개", { source: "TEMPLATE" }),
  ];
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

/** 업그레이드 조건을 채운 잔액과 설치 수 */
function upgradeReady(): Pick<MockDb, "ledger" | "placements"> {
  const rule = HOUSE_UPGRADE_RULES.STUDIO;
  return {
    ledger: [{ id: "l-seed", type: "EARN_ACHIEVEMENT", amount: rule.upgradeCost ?? 0, taskId: null, createdAt: "2026-10-01T00:00:00" }],
    placements: Array.from({ length: rule.requiredPlacements ?? 0 }, (_, i) => ({
      id: `p-${i}`,
      furnitureId: `f-${i}`,
      // TODO: 미정 (docs/planning.md 14장)
      slotId: `slot-${i}`,
    })),
  };
}

function baseDb(today: DateKey): MockDb {
  return {
    goals: goals(today),
    buildings: buildings.map((b) => ({ ...b })),
    tasks: [...todayTasks(today), ...undatedTasks(today)],
    ledger: [{ id: "l-seed", type: "EARN_CORE_TASK", amount: CORE_TASK_CREDIT, taskId: null, createdAt: at(today, "08:30") }],
    house: { level: "STUDIO" },
    placements: [],
    quickTemplates,
    dailyBonusDates: [],
    aiUsedToday: 3,
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
      db.goals = [];
      db.buildings = [];
      db.tasks = [];
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
