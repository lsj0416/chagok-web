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
  /** 반복. 매일 반복이면 DAILY */
  recurrence: TaskRecurrence | null;
  /** 선택 입력. 할 일 상세(S04)에서만 쓴다 */
  memo: string | null;
  completedAt: IsoDateTime | null;
  createdAt: IsoDateTime;
}

export type TaskRecurrence = "DAILY";

/** 할 일 만들기 요청 (S03 할 일 추가, S16 빠른 추가) */
export interface CreateTaskRequest {
  title: string;
  scheduledDate: DateKey | null;
  goalId: string | null;
  isCore: boolean;
  source: TaskSource;
  recurrence: TaskRecurrence | null;
}

export type TaskUnit = "MINUTE" | "COUNT" | "PAGE" | "ITEM";

export interface QuickTaskTemplate {
  id: string;
  keyword: string;
  /** 쓸 수 있는 단위. 첫 번째가 기본 단위 */
  units: TaskUnit[];
  /** 단위별 수량 선택지 */
  amountOptions: Partial<Record<TaskUnit, number[]>>;
  /** 단위별 기본 수량 */
  defaultAmount: Partial<Record<TaskUnit, number>>;
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
  /** 사용자가 마을에서 마지막으로 본 단계. stage보다 낮으면 다음 진입 때 짧은 연출 */
  lastSeenStage: BuildingStage;
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

/** 집 안에서 가구를 놓을 수 있는 정해진 자리 */
export interface Slot {
  id: string;
  /** 슬롯 종류. 값은 미정 (docs/planning.md 14장) */
  slotType: string;
  /** 방 그림 안의 위치. 왼쪽 위 기준 % */
  x: number;
  y: number;
}

/** 판매 중인 가구 정보 */
export interface FurnitureCatalogItem {
  id: string;
  name: string;
  price: number;
  /** 놓을 수 있는 슬롯 종류. 값은 미정 (docs/planning.md 14장) */
  slotType: string;
}

/** 사용자가 보유한 가구 */
export interface Furniture {
  id: string;
  catalogItemId: string;
  purchasedAt: IsoDateTime;
}

export interface Placement {
  id: string;
  furnitureId: string;
  slotId: string;
}

/** 마을 화면(S05)에 필요한 조회 결과. 별도 저장 데이터가 아니다 */
export interface VillageDetail {
  house: House;
  buildings: Building[];
  /** 건물에 연결된 목표 (보관한 목표 포함) */
  goals: Goal[];
  balance: number;
}

/** 집 내부 화면(S06)에 필요한 조회 결과. 별도 저장 데이터가 아니다 */
export interface HouseDetail {
  house: House;
  /** 현재 집 단계의 슬롯 */
  slots: Slot[];
  placements: Placement[];
  furniture: Furniture[];
  catalog: FurnitureCatalogItem[];
  balance: number;
}

// 조회 결과

/** 하루 시작·마무리 알림 하나 */
export interface ReminderSetting {
  enabled: boolean;
  /** 'HH:MM' (사용자 시간대 기준) */
  time: string;
}

/** 설정 화면(S15)의 값 */
export interface UserSettings {
  /** 연결된 구글 계정 */
  email: string;
  /** IANA 시간대 이름. 예: Asia/Seoul. 처음에는 기기 시간대 */
  timezone: string;
  morningReminder: ReminderSetting;
  eveningReminder: ReminderSetting;
}

/** 기록(S13)의 하루. 별도 저장 데이터가 아니라 계획 이력과 실행 이력에서 계산한 결과다 */
export interface DayRecord {
  date: DateKey;
  /** 그날이 수행 날짜였던 할 일 수 (나중에 다른 날로 옮긴 할 일 포함) */
  plannedCount: number;
  /** 그중 그날 완료한 수. 실행률의 분자 */
  plannedDoneCount: number;
  /** 그날 완료한 할 일 (날짜 없는 할 일을 완료한 것도 포함) */
  doneTasks: Pick<Task, "id" | "title">[];
  /** 그날에서 다른 날로 옮긴 할 일. movedTo가 null이면 날짜 없이 보관 */
  movedTasks: (Pick<Task, "id" | "title"> & { movedTo: DateKey | null })[];
}

/** 이번 주(월요일부터) 요약 */
export interface WeekSummary {
  doneCount: number;
  activeDayCount: number;
  /** 계획 대비 실행률(0~1). 계획이 하나도 없던 주면 null */
  completionRate: number | null;
}

/** 기록 화면(S13)에 필요한 조회 결과 */
export interface RecordsOverview {
  week: WeekSummary;
  /** 최근 날짜가 위. 계획도 완료도 없던 날은 빠진다 */
  days: DayRecord[];
  earnedAchievementCount: number;
}

/** 업적 정의. 목록과 보상은 미정 (docs/planning.md 14장) */
export interface Achievement {
  /** TODO: 미정 (docs/planning.md 14장). 값이 정해지기 전까지 string */
  code: string;
  name: string;
  description: string;
  /** 진행을 셀 수 있는 업적의 목표 수와 단위. 예: 30, '일' */
  target: number | null;
  unit: string | null;
}

/** 업적 화면(S14)의 한 줄 */
export interface AchievementProgress {
  achievement: Achievement;
  /** 얻은 시각. 아직 얻지 못했으면 null */
  earnedAt: IsoDateTime | null;
  /** 지금까지 센 수. 셀 수 없는 업적이면 null */
  progress: number | null;
}

/** 목표 목록(S08)의 한 줄. 별도 저장 데이터가 아니다 */
export interface GoalSummary {
  goal: Goal;
  building: Building | null;
  /** 연결된 할 일 중 완료한 수와 전체 수 (나눠진 할 일 제외) */
  doneTaskCount: number;
  taskCount: number;
}

/** 목표 상세 화면(S12)에 필요한 조회 결과. 별도 저장 데이터가 아니다 */
export interface GoalDetail {
  goal: Goal;
  building: Building | null;
  /** 이 목표에 연결된 할 일 (나눠진 할 일 제외) */
  tasks: Task[];
  /** 할 일 추가(S03)에서 고를 수 있는 진행 중 목표 */
  activeGoals: Goal[];
  /** 오늘 할 일. 할 일 추가의 핵심 3개 확인과 완료 알림 계산에 쓴다 */
  todayTasks: Task[];
}

/** 목표를 고칠 때 바꾸는 값 */
export interface UpdateGoalRequest {
  title: string;
  dueDate: DateKey | null;
  completionCriteria: string | null;
}

/** 목표 완료 때 남은 할 일 처리: 그대로 두기 / 날짜 없이 보관 / 삭제 */
export type RemainingTaskAction = "KEEP" | "UNSCHEDULE" | "DELETE";

/** 할 일 상세 화면(S04)에 필요한 조회 결과. 별도 저장 데이터가 아니다 */
export interface TaskDetail {
  task: Task;
  /** 연결할 수 있는 진행 중 목표. 지금 연결된 목표가 보관·완료 상태여도 함께 준다 */
  goals: Goal[];
  /** 같은 날짜의 다른 핵심 할 일 (핵심 교체 시트에 쓴다). 날짜 없는 할 일이면 빈 배열 */
  dayCoreTasks: Task[];
}

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
