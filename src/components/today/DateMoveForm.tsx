"use client";

import { useId, useState } from "react";
import { addDays } from "@/lib/date";
import type { DateKey } from "@/types";

interface DateMoveFormProps {
  today: DateKey;
  onSubmit: (date: DateKey) => void;
  onCancel: () => void;
}

/** 날짜 바꾸기. 브라우저 기본 날짜 선택기를 쓴다 */
export function DateMoveForm({ today, onSubmit, onCancel }: DateMoveFormProps) {
  const id = useId();
  const [date, setDate] = useState<DateKey>(addDays(today, 1));
  return (
    <form
      className="flex flex-col gap-3 py-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (date) onSubmit(date);
      }}
    >
      <label htmlFor={id} className="text-[14px] font-semibold text-ink-2">
        옮길 날짜
      </label>
      <input
        id={id}
        type="date"
        required
        min={today}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="h-12 rounded-lg border border-line-strong bg-surface px-3 text-[16px] tabular-nums"
      />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="h-12 flex-1 rounded-lg bg-surface-2 text-[15px] font-semibold text-ink-2">
          취소
        </button>
        <button type="submit" disabled={!date} className="h-12 flex-1 rounded-lg bg-ink text-[15px] font-semibold text-surface disabled:opacity-40">
          옮기기
        </button>
      </div>
    </form>
  );
}
