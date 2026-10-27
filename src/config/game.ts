// 게임 상수 (docs/glossary.md 8장, 러프안). 다른 곳에 숫자를 직접 쓰지 않는다
import type { BuildingType, GoalType, HouseLevel } from "@/types";

export const MAX_CORE_TASKS_PER_DAY = 3;
export const CORE_TASK_CREDIT = 20;
export const DAILY_BONUS_THRESHOLD = 5;
export const DAILY_BONUS_CREDIT = 20;
export const BUILDING_FRAME_THRESHOLD = 5;
export const AI_DAILY_LIMIT = 10;
export const AI_DRAFT_COUNT_MIN = 5;
export const AI_DRAFT_COUNT_MAX = 10;
export const QUICK_TEMPLATE_DISPLAY_LIMIT = 8;

/** 빈 화면 카드의 '목표에서 가져오기'에 보여줄 날짜 없는 할 일 수 (docs/screens.md S02 빈 화면 카드) */
export const UNDATED_TASK_DISPLAY_LIMIT = 3;

// 집 단계별 조건 (docs/glossary.md 8장)
export interface HouseUpgradeRule {
  next: HouseLevel | null;
  /** 다음 단계로 가는 데 필요한 누적 설치 가구 수 */
  requiredPlacements: number | null;
  upgradeCost: number | null;
  slotCount: number;
}

export const HOUSE_UPGRADE_RULES: Record<HouseLevel, HouseUpgradeRule> = {
  STUDIO: { next: "TWO_ROOM", requiredPlacements: 3, upgradeCost: 300, slotCount: 4 },
  TWO_ROOM: { next: "APARTMENT", requiredPlacements: 7, upgradeCost: 700, slotCount: 8 },
  APARTMENT: { next: "DETACHED", requiredPlacements: 12, upgradeCost: 1500, slotCount: 13 },
  DETACHED: { next: null, requiredPlacements: null, upgradeCost: null, slotCount: 18 },
};

// 목표 유형과 건물 (docs/glossary.md 4장)
export const GOAL_BUILDING: Record<GoalType, BuildingType> = {
  CAREER: "OFFICE",
  STUDY: "SCHOOL",
  FINANCE: "BANK",
  HEALTH: "GYM",
  PROJECT: "WORKSHOP",
};

export const BUILDING_LABEL: Record<BuildingType, string> = {
  OFFICE: "오피스",
  SCHOOL: "학교",
  BANK: "은행",
  GYM: "체육관",
  WORKSHOP: "작업실",
};
