import { BUILDING_FRAME_THRESHOLD } from "@/config/game";
import type { Building, BuildingStage } from "@/types";

/** 공사 단계 순서: 터 → 골조 → 완성 */
export const BUILDING_STAGES: readonly BuildingStage[] = ["LOT", "FRAME", "COMPLETE"];

const STAGE_ORDER = Object.fromEntries(BUILDING_STAGES.map((stage, i) => [stage, i])) as Record<BuildingStage, number>;

/** 몇 번째 단계인지 (터 1, 골조 2, 완성 3). 공정 막대가 채울 칸 수 */
export function stageStep(stage: BuildingStage): number {
  return STAGE_ORDER[stage] + 1;
}

/** 마지막으로 본 뒤 단계가 올랐으면 다음 마을 진입 때 짧은 연출을 보여준다 */
export function needsStageReveal(building: Building): boolean {
  return STAGE_ORDER[building.stage] > STAGE_ORDER[building.lastSeenStage];
}

export const STAGE_LABEL: Record<BuildingStage, string> = { LOT: "터", FRAME: "골조", COMPLETE: "완성" };

/** 건물 이름표의 공사 진행 문구 */
export function constructionLabel(building: Building): string {
  if (building.stage === "COMPLETE") return "완성";
  if (building.stage === "FRAME") return `골조 · 할 일 ${building.constructionProgress}개 완료`;
  return `공사 진행 ${Math.min(building.constructionProgress, BUILDING_FRAME_THRESHOLD)}/${BUILDING_FRAME_THRESHOLD}`;
}
