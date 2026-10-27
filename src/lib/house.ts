import { CORE_TASK_CREDIT, HOUSE_UPGRADE_RULES } from "@/config/game";
import type { HouseLevel } from "@/types";

export interface UpgradeProgress {
  next: HouseLevel;
  requiredFurniture: number;
  upgradeCost: number;
  furnitureMet: boolean;
  creditMet: boolean;
  canUpgrade: boolean;
}

/** 다음 단계까지의 진행. 최고 단계면 null */
export function upgradeProgress(level: HouseLevel, furnitureCount: number, balance: number): UpgradeProgress | null {
  const rule = HOUSE_UPGRADE_RULES[level];
  if (rule.next === null || rule.requiredFurniture === null || rule.upgradeCost === null) return null;
  const furnitureMet = furnitureCount >= rule.requiredFurniture;
  const creditMet = balance >= rule.upgradeCost;
  return {
    next: rule.next,
    requiredFurniture: rule.requiredFurniture,
    upgradeCost: rule.upgradeCost,
    furnitureMet,
    creditMet,
    canUpgrade: furnitureMet && creditMet,
  };
}

/** 집 업그레이드 조건: 보유 가구 수와 잔액이 모두 다음 단계 조건을 채웠는지 */
export function canUpgradeHouse(level: HouseLevel, furnitureCount: number, balance: number): boolean {
  return upgradeProgress(level, furnitureCount, balance)?.canUpgrade ?? false;
}

/** 잔액이 마이너스면 구매할 수 없다 */
export function canPurchase(price: number, balance: number): boolean {
  return balance >= 0 && balance >= price;
}

/** 살 수 있을 때까지 더 해야 하는 핵심 할 일 수: 부족 크레딧 ÷ CORE_TASK_CREDIT 올림 */
export function coreTasksToAfford(price: number, balance: number): number {
  const shortfall = price - balance;
  return shortfall <= 0 ? 0 : Math.ceil(shortfall / CORE_TASK_CREDIT);
}
