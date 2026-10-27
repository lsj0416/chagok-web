"use client";

import { useId, useState } from "react";
import { PrimaryButton } from "@/components/BottomActions";
import { BottomSheet } from "@/components/BottomSheet";
import { ChoiceChip } from "@/components/ChoiceChip";
import { addDays, formatShortDate } from "@/lib/date";
import type { DateKey } from "@/types";

type DateMode = "TODAY" | "TOMORROW" | "CUSTOM" | "NONE";

interface TaskDateSheetProps {
  open: boolean;
  today: DateKey;
  /** 지금 날짜. null이면 날짜 없는 할 일 */
  value: DateKey | null;
  onClose: () => void;
  /** null이면 날짜 없이 보관 */
  onPick: (date: DateKey | null) => void;
}

function modeOf(value: DateKey | null, today: DateKey): DateMode | null {
  if (value === null) return "NONE";
  if (value === today) return "TODAY";
  if (value === addDays(today, 1)) return "TOMORROW";
  // 지난 날짜는 어느 칩도 고르지 않은 채로 연다
  return value > today ? "CUSTOM" : null;
}

/**
 * S04 날짜 바꾸기. S03과 같은 날짜 칩을 쓴다.
 * 오늘, 내일, 날짜 없음은 누르면 바로 바꾸고, 날짜 선택은 날짜를 고른 뒤 '바꾸기'
 */
export function TaskDateSheet({ open, today, value, onClose, onPick }: TaskDateSheetProps) {
  const ids = { label: useId(), custom: useId() };
  const initial = modeOf(value, today);
  const [mode, setMode] = useState<DateMode | null>(initial);
  const [customDate, setCustomDate] = useState<DateKey>(initial === "CUSTOM" && value ? value : "");

  const close = () => {
    setMode(initial);
    setCustomDate(initial === "CUSTOM" && value ? value : "");
    onClose();
  };

  const pick = (date: DateKey | null) => {
    if (date !== value) onPick(date);
    close();
  };

  const chips: { mode: DateMode; label: string; date?: DateKey | null }[] = [
    { mode: "TODAY", label: "오늘", date: today },
    { mode: "TOMORROW", label: "내일", date: addDays(today, 1) },
    { mode: "CUSTOM", label: mode === "CUSTOM" && customDate ? formatShortDate(customDate) : "날짜 선택" },
    { mode: "NONE", label: "날짜 없음", date: null },
  ];

  return (
    <BottomSheet open={open} onClose={close} title="날짜 바꾸기">
      <p id={ids.label} className="sr-only">
        날짜
      </p>
      <div role="radiogroup" aria-labelledby={ids.label} className="-mx-5 flex gap-2 overflow-x-auto px-5 pt-1">
        {chips.map((chip) => (
          <ChoiceChip
            key={chip.mode}
            selected={mode === chip.mode}
            onClick={() => {
              if (chip.mode === "CUSTOM") setMode("CUSTOM");
              else pick(chip.date ?? null);
            }}
          >
            {chip.label}
          </ChoiceChip>
        ))}
      </div>
      {mode === "CUSTOM" && (
        <form
          className="mt-3 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (customDate) pick(customDate);
          }}
        >
          <label htmlFor={ids.custom} className="sr-only">
            날짜 선택
          </label>
          <input
            id={ids.custom}
            type="date"
            required
            min={today}
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="h-12 w-full rounded-lg border border-line-strong bg-surface px-3 text-[16px] tabular-nums"
          />
          <PrimaryButton type="submit" disabled={!customDate}>
            바꾸기
          </PrimaryButton>
        </form>
      )}
    </BottomSheet>
  );
}
