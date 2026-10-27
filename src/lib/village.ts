import { BUILDING_FRAME_THRESHOLD } from "@/config/game";
import type { Building, BuildingStage } from "@/types";

const STAGE_ORDER: Record<BuildingStage, number> = { LOT: 0, FRAME: 1, COMPLETE: 2 };

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
