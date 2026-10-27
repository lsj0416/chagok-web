"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { DateMoveForm } from "@/components/today/DateMoveForm";
import type { DateKey, Task } from "@/types";

interface TaskActionsSheetProps {
  task: Task | null;
  today: DateKey;
  onClose: () => void;
  onToggleCore: (task: Task) => void;
  onReschedule: (task: Task, date: DateKey) => void;
  onUnschedule: (task: Task) => void;
}

/** 할 일 더보기 (길게 누르기와 같은 메뉴): 핵심으로 지정/해제, 날짜 바꾸기, 날짜 없이 보관 */
export function TaskActionsSheet({ task, today, onClose, onToggleCore, onReschedule, onUnschedule }: TaskActionsSheetProps) {
  const [moving, setMoving] = useState(false);
  const close = () => {
    setMoving(false);
    onClose();
  };

  return (
    <BottomSheet open={task !== null} onClose={close} title={task?.title ?? ""}>
      {task && moving && (
        <DateMoveForm
          today={today}
          onCancel={() => setMoving(false)}
          onSubmit={(date) => {
            onReschedule(task, date);
            close();
          }}
        />
      )}
      {task && !moving && (
        <ul className="flex flex-col">
          <li>
            <SheetAction
              label={task.isCore ? "핵심에서 빼기" : "핵심으로 지정"}
              onClick={() => {
                // 닫기를 먼저 해야 핵심 교체 시트 열기가 덮이지 않는다
                close();
                onToggleCore(task);
              }}
            />
          </li>
          <li>
            <SheetAction label="날짜 바꾸기" onClick={() => setMoving(true)} />
          </li>
          <li>
            <SheetAction
              label="날짜 없이 보관"
              onClick={() => {
                onUnschedule(task);
                close();
              }}
            />
          </li>
        </ul>
      )}
    </BottomSheet>
  );
}

export function SheetAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-13 w-full items-center py-2 text-left text-[16px] text-ink"
    >
      {label}
    </button>
  );
}
