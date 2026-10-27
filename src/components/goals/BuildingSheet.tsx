"use client";

import { Check } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { GraphicPlaceholder } from "@/components/GraphicPlaceholder";
import { BUILDING_LABEL, GOAL_BUILDING } from "@/config/game";
import type { GoalType } from "@/types";

/** 목표 유형별 예시 (docs/glossary.md 4장) */
export const GOAL_TYPE_EXAMPLE: Record<GoalType, string> = {
  CAREER: "취업, 이직",
  STUDY: "공부, 자격증",
  FINANCE: "저축, 재테크",
  HEALTH: "운동, 건강",
  PROJECT: "개인 프로젝트",
};

export const GOAL_TYPES = Object.keys(GOAL_BUILDING) as GoalType[];

export const buildingName = (type: GoalType) => BUILDING_LABEL[GOAL_BUILDING[type]];

interface BuildingSheetProps {
  open: boolean;
  value: GoalType | null;
  onClose: () => void;
  onSelect: (type: GoalType) => void;
}

/** 건물 종류 바꾸기: 5개 중 선택 */
export function BuildingSheet({ open, value, onClose, onSelect }: BuildingSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="건물 종류">
      <ul role="radiogroup" aria-label="건물 종류" className="flex flex-col">
        {GOAL_TYPES.map((type) => {
          const selected = type === value;
          return (
            <li key={type}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  onSelect(type);
                  onClose();
                }}
                className="flex min-h-16 w-full items-center gap-3 py-2 text-left"
              >
                <GraphicPlaceholder label={buildingName(type)} className="size-12" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold">{buildingName(type)}</span>
                  <span className="block text-[13px] text-ink-3">{GOAL_TYPE_EXAMPLE[type]}</span>
                </span>
                {selected && <Check aria-hidden size={20} className="shrink-0" />}
              </button>
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}
