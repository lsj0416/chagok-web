"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { BUILDING_LABEL, HOUSE_LEVEL_LABEL } from "@/config/game";
import { constructionLabel, STAGE_LABEL } from "@/lib/village";
import type { Building, Goal, House } from "@/types";

// TODO: 마을 그림이 정해지기 전의 임시 좌표 (%). 터 자리는 8곳까지 (docs/screens.md 확인 필요)
const HOUSE_POSITION = { x: 50, y: 47 };
// 건물이 적을 때도 집 둘레에 고르게 놓이도록 왼쪽, 오른쪽, 위, 아래, 모서리 순으로 채운다.
// 아래쪽 자리는 이름표 띠와 겹치지 않는 높이까지만 둔다
const LOT_POSITIONS = [
  { x: 18, y: 47 },
  { x: 82, y: 47 },
  { x: 50, y: 15 },
  { x: 50, y: 74 },
  { x: 22, y: 20 },
  { x: 80, y: 72 },
  { x: 78, y: 20 },
  { x: 20, y: 72 },
];

interface VillageViewProps {
  house: House;
  /** 터 자리 순서대로 놓을 건물 (목표를 만든 순서) */
  buildings: Building[];
  goals: Goal[];
  /** 이번 진입에서 단계 연출을 보여줄 건물 */
  revealIds: ReadonlySet<string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/** 마을 그림. 3D 렌더 이미지가 준비되기 전에는 3:4 회색 자리 표시자 위에 집과 건물을 임시 좌표로 놓는다 */
export function VillageView({ house, buildings, goals, revealIds, selectedId, onSelect }: VillageViewProps) {
  const selected = buildings.find((b) => b.id === selectedId) ?? null;
  const selectedGoal = selected && goals.find((g) => g.id === selected.goalId);

  return (
    <div
      role="group"
      aria-label="마을 그림 자리"
      className="relative aspect-[3/4] w-full rounded-lg bg-placeholder"
      onClick={(e) => {
        // 빈 곳을 누르면 이름표를 닫는다
        if (e.target === e.currentTarget) onSelect(null);
      }}
    >
      <span className="pointer-events-none absolute top-2.5 left-3 text-[13px] text-ink-2">마을 그림</span>

      <Link
        href="/village/house"
        aria-label={`${HOUSE_LEVEL_LABEL[house.level]} 집, 들어가기`}
        className="absolute grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md border border-line-strong bg-surface-3 text-center text-[14px] leading-snug text-ink"
        style={{ left: `${HOUSE_POSITION.x}%`, top: `${HOUSE_POSITION.y}%` }}
      >
        <span>
          <span className="block font-semibold">{HOUSE_LEVEL_LABEL[house.level]}</span>
          <span className="block text-[13px] text-ink-2">집</span>
        </span>
      </Link>

      {buildings.slice(0, LOT_POSITIONS.length).map((building, i) => {
        const goal = goals.find((g) => g.id === building.goalId);
        const paused = goal?.status === "ARCHIVED";
        const isSelected = building.id === selectedId;
        const pos = LOT_POSITIONS[i];
        return (
          <button
            key={building.id}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${BUILDING_LABEL[building.type]} ${STAGE_LABEL[building.stage]}${paused ? ", 공사 중지" : ""}${
              goal ? `, ${goal.title}` : ""
            }`}
            onClick={() => onSelect(isSelected ? null : building.id)}
            className={`absolute grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md bg-surface-3 text-center text-[13px] leading-tight text-ink-2 ${
              isSelected ? "border-2 border-ink" : "border border-line-strong"
            } ${revealIds.has(building.id) ? "motion-safe:animate-[stage-reveal_600ms_var(--ease-out-expo)_300ms]" : ""}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {/* 단계가 오른 뒤 첫 진입: 건물 상자가 한 번만 살짝 커졌다 돌아온다. 움직임 줄이기 설정이면 생략 */}
            <span className="block">
              <span className="block font-semibold text-ink">{BUILDING_LABEL[building.type]}</span>
              <span className="block">{STAGE_LABEL[building.stage]}</span>
              {paused && <span className="block">공사 중지</span>}
            </span>
          </button>
        );
      })}

      {selected && selectedGoal && (
        <Link
          href={`/goals/detail?id=${encodeURIComponent(selectedGoal.id)}`}
          className="absolute inset-x-3 bottom-3 flex min-h-14 items-center gap-2 rounded-lg border border-line-strong bg-surface px-4 py-2.5"
        >
          <span className="min-w-0 flex-1">
            <span className="line-clamp-1 text-[15px] leading-snug font-semibold">{selectedGoal.title}</span>
            <span className="block text-[13px] text-ink-2 tabular-nums">
              {constructionLabel(selected)}
              {selectedGoal.status === "ARCHIVED" && " · 공사 중지"}
            </span>
          </span>
          <ChevronRight aria-hidden size={18} className="shrink-0 text-ink-3" />
        </Link>
      )}
    </div>
  );
}
