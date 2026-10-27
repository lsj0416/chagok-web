"use client";

import { Check } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import type { Goal } from "@/types";

interface GoalPickerSheetProps {
  open: boolean;
  goals: Goal[];
  value: string | null;
  onClose: () => void;
  onSelect: (goalId: string | null) => void;
}

/** 할 일에 연결할 목표 고르기. '목표 없음'과 진행 중 목표 */
export function GoalPickerSheet({ open, goals, value, onClose, onSelect }: GoalPickerSheetProps) {
  const options: { id: string | null; title: string }[] = [{ id: null, title: "목표 없음" }, ...goals];
  return (
    <BottomSheet open={open} onClose={onClose} title="연결 목표">
      <ul role="radiogroup" aria-label="연결 목표" className="flex flex-col">
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <li key={option.id ?? "none"}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  onSelect(option.id);
                  onClose();
                }}
                className="flex min-h-13 w-full items-center gap-3 border-b border-line py-2 text-left"
              >
                <span className={`min-w-0 flex-1 text-[16px] leading-snug ${option.id === null ? "text-ink-2" : ""}`}>
                  {option.title}
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
