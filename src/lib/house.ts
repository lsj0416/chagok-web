import { HOUSE_UPGRADE_RULES } from "@/config/game";
import type { HouseLevel } from "@/types";

/** 집 업그레이드 조건: 누적 설치 가구 수와 잔액이 모두 다음 단계 조건을 채웠는지 */
export function canUpgradeHouse(level: HouseLevel, placementCount: number, balance: number): boolean {
  const rule = HOUSE_UPGRADE_RULES[level];
  if (rule.next === null || rule.requiredPlacements === null || rule.upgradeCost === null) {
    return false;
  }
  return placementCount >= rule.requiredPlacements && balance >= rule.upgradeCost;
}
