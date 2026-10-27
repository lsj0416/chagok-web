// 도메인 타입. 이름은 docs/glossary.md의 코드 이름을 그대로 쓴다

/** 날짜 문자열 'YYYY-MM-DD' (사용자 시간대 기준) */
export type DateKey = string;
/** ISO 8601 시각 문자열 */
export type IsoDateTime = string;

// 1 목표와 할 일

export type GoalType = "CAREER" | "STUDY" | "FINANCE" | "HEALTH" | "PROJECT";
export type GoalStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  status: GoalStatus;
  dueDate: DateKey | null;
  completionCriteria: string | null;
  createdAt: IsoDateTime;
}

export type TaskStatus = "PLANNED" | "DONE" | "SPLIT";
export type TaskSource = "MANUAL" | "AI" | "TEMPLATE";

export interface Task {
  id: string;
  title: string;
  goalId: string | null;
  status: TaskStatus;
  /** 없으면 날짜 없는 할 일 */
  scheduledDate: DateKey | null;
  isCore: boolean;
  source: TaskSource;
  completedAt: IsoDateTime | null;
  createdAt: IsoDateTime;
}

export type TaskUnit = "MINUTE" | "COUNT" | "PAGE" | "ITEM";

export interface QuickTaskTemplate {
  id: string;
  keyword: string;
  units: TaskUnit[];
  /** 목표 유형 템플릿이면 그 유형, 공통 템플릿이면 null */
  goalType: GoalType | null;
  sortOrder: number;
}

// 4 마을과 건물

export type BuildingType = "OFFICE" | "SCHOOL" | "BANK" | "GYM" | "WORKSHOP";
export type BuildingStage = "LOT" | "FRAME" | "COMPLETE";

export interface Building {
  id: string;
  goalId: string;
  type: BuildingType;
  stage: BuildingStage;
  constructionProgress: number;
}

// 5 크레딧, 집, 가구

export type LedgerType =
  | "EARN_CORE_TASK"
  | "EARN_DAILY_BONUS"
  | "EARN_ACHIEVEMENT"
  | "SPEND_FURNITURE"
  | "SPEND_HOUSE_UPGRADE"
  | "REVOKE_UNCOMPLETE";

export interface CreditLedgerEntry {
  id: string;
  type: LedgerType;
  /** 지급은 양수, 사용과 회수는 음수 */
  amount: number;
  taskId: string | null;
  createdAt: IsoDateTime;
}

export type HouseLevel = "STUDIO" | "TWO_ROOM" | "APARTMENT" | "DETACHED";

export interface House {
  level: HouseLevel;
}

export interface Placement {
  id: string;
  furnitureId: string;
  slotId: string;
}

// 조회 결과

/** 오늘 화면(S02)에 필요한 조회 결과. 별도 저장 데이터가 아니다 */
export interface TodayPlan {
  date: DateKey;
  /** 수행 날짜가 오늘인 할 일 (SPLIT 제외) */
  tasks: Task[];
  /** 할 일에 연결된 목표와 진행 중 목표 */
  goals: Goal[];
  buildings: Building[];
  overdueCount: number;
  canUpgradeHouse: boolean;
  /** 진행 중 목표의 날짜 없는 할 일 (빈 화면 카드용) */
  undatedTasks: Task[];
  /** 정렬된 빠른 추가 템플릿 */
  quickTemplates: QuickTaskTemplate[];
  dailyBonusEarned: boolean;
}

// 3 AI 목표 분해

/** AI가 제안한 할 일. 사용자가 고르기 전에는 저장하지 않는다 */
export interface TaskDraft {
  id: string;
  title: string;
}

export interface GoalBreakdownRequest {
  title: string;
  dueDate: DateKey | null;
  currentSituation: string | null;
}

/** AI 분해 결과: 추천 목표 유형(건물 종류)과 할 일 초안 */
export interface GoalBreakdown {
  goalType: GoalType;
  drafts: TaskDraft[];
}

export interface AiUsage {
  usedToday: number;
  remaining: number;
}

/** 목표 만들기 요청 (S10의 N개 추가하기, S11의 목표 만들기) */
export interface CreateGoalRequest {
  title: string;
  type: GoalType;
  dueDate: DateKey | null;
  /** 만들 할 일 제목. 모두 날짜 없는 할 일이 된다 */
  taskTitles: string[];
  source: TaskSource;
}
