import { BUILDING_STAGES, stageStep } from "@/lib/village";
import type { BuildingStage } from "@/types";

/** 공정 막대: 터·골조·완성 세 칸 중 지금 단계까지 노랑으로 채운다. 단계 이름은 옆 글자가 말하므로 읽지 않는다 */
export function StageMeter({ stage, paused = false, className = "" }: { stage: BuildingStage; paused?: boolean; className?: string }) {
  const filled = stageStep(stage);
  return (
    <span aria-hidden className={`flex gap-[3px] ${className}`}>
      {BUILDING_STAGES.map((s, i) => (
        <span
          key={s}
          className={`h-[5px] flex-1 ${
            i < filled ? (paused ? "bg-line-strong" : "bg-caution") : "bg-surface-3"
          }`}
        />
      ))}
    </span>
  );
}
