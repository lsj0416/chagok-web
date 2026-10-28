import { describe, expect, it } from "vitest";
import { CORE_TASK_CREDIT, HOUSE_UPGRADE_RULES } from "@/config/game";
import { canPurchase, canUpgradeHouse, coreTasksToAfford, upgradeProgress } from "@/lib/house";

const studio = HOUSE_UPGRADE_RULES.STUDIO;

describe("upgradeProgress", () => {
  it("가구와 크레딧을 따로 판단한다", () => {
    const p = upgradeProgress("STUDIO", 2, studio.upgradeCost!);
    expect(p).toMatchObject({ next: "TWO_ROOM", furnitureMet: false, creditMet: true, canUpgrade: false });
  });
  it("둘 다 채우면 넓힐 수 있다", () => {
    expect(upgradeProgress("STUDIO", studio.requiredFurniture!, studio.upgradeCost!)?.canUpgrade).toBe(true);
  });
  it("최고 단계는 null", () => {
    expect(upgradeProgress("DETACHED", 100, 100000)).toBeNull();
  });
});

describe("canUpgradeHouse", () => {
  it("보유 가구 수와 잔액을 모두 채워야 한다", () => {
    expect(canUpgradeHouse("STUDIO", studio.requiredFurniture!, studio.upgradeCost!)).toBe(true);
    expect(canUpgradeHouse("STUDIO", studio.requiredFurniture! - 1, studio.upgradeCost!)).toBe(false);
    expect(canUpgradeHouse("STUDIO", studio.requiredFurniture!, studio.upgradeCost! - 1)).toBe(false);
  });
  it("마지막 단계는 업그레이드할 수 없다", () => {
    expect(canUpgradeHouse("DETACHED", 100, 100000)).toBe(false);
  });
});

describe("canPurchase", () => {
  it("잔액이 가격 이상이면 살 수 있다", () => {
    expect(canPurchase(80, 80)).toBe(true);
    expect(canPurchase(80, 79)).toBe(false);
  });
  it("잔액이 마이너스면 살 수 없다", () => {
    expect(canPurchase(0, -20)).toBe(false);
  });
});

describe("coreTasksToAfford", () => {
  it("부족 크레딧을 핵심 할 일 크레딧으로 나눠 올림", () => {
    expect(coreTasksToAfford(80, 50)).toBe(Math.ceil(30 / CORE_TASK_CREDIT));
    expect(coreTasksToAfford(80, 40)).toBe(2);
  });
  it("살 수 있으면 0", () => {
    expect(coreTasksToAfford(80, 200)).toBe(0);
  });
  it("잔액이 마이너스면 그만큼 더 필요하다", () => {
    expect(coreTasksToAfford(80, -20)).toBe(5);
  });
});
