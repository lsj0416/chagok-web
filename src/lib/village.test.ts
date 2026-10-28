import { describe, expect, it } from "vitest";
import { BUILDING_FRAME_THRESHOLD } from "@/config/game";
import { formatCredit } from "@/lib/credit";
import { BUILDING_STAGES, constructionLabel, needsStageReveal, stageStep } from "@/lib/village";
import type { Building } from "@/types";

const building = (overrides: Partial<Building> = {}): Building => ({
  id: "b1",
  goalId: "g1",
  type: "OFFICE",
  stage: "LOT",
  constructionProgress: 3,
  lastSeenStage: "LOT",
  ...overrides,
});

describe("needsStageReveal", () => {
  it("본 단계보다 올랐을 때만", () => {
    expect(needsStageReveal(building({ stage: "FRAME", lastSeenStage: "LOT" }))).toBe(true);
    expect(needsStageReveal(building({ stage: "FRAME", lastSeenStage: "FRAME" }))).toBe(false);
  });
  it("완료 취소로 단계가 내려간 경우에는 연출하지 않는다", () => {
    expect(needsStageReveal(building({ stage: "LOT", lastSeenStage: "FRAME" }))).toBe(false);
  });
});

describe("constructionLabel", () => {
  it("골조 전에는 골조까지의 진행", () => {
    expect(constructionLabel(building())).toBe(`공사 진행 3/${BUILDING_FRAME_THRESHOLD}`);
  });
  it("골조 뒤에는 완료한 할 일 수", () => {
    expect(constructionLabel(building({ stage: "FRAME", constructionProgress: 7 }))).toBe("골조 · 할 일 7개 완료");
  });
  it("완성", () => {
    expect(constructionLabel(building({ stage: "COMPLETE" }))).toBe("완성");
  });
});

describe("formatCredit", () => {
  it("마이너스에는 − 부호", () => {
    expect(formatCredit(-20)).toBe("−20");
    expect(formatCredit(210)).toBe("210");
  });
});

describe("stageStep", () => {
  it("터는 1칸, 골조는 2칸, 완성은 3칸을 채운다", () => {
    expect(BUILDING_STAGES.map(stageStep)).toEqual([1, 2, 3]);
  });
});
