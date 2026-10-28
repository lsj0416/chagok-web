"use client";

import { Plus } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import type { Goal, Task } from "@/types";

interface UndatedSheetProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  goals: Goal[];
  pendingId: string | null;
  onPick: (task: Task) => void;
}

/** 빈 화면 카드의 '더 보기': 진행 중 목표의 날짜 없는 할 일 전체 */
export function UndatedSheet({ open, onClose, tasks, goals, pendingId, onPick }: UndatedSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="날짜 없는 할 일" description="누르면 오늘 할 일이 돼요">
      <ul>
        {tasks.map((task) => {
          const goal = goals.find((g) => g.id === task.goalId);
          return (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => onPick(task)}
                disabled={pendingId === task.id}
                aria-label={`${task.title} 오늘 하기`}
                className="flex min-h-14 w-full items-center gap-3 border-b border-line py-2 text-left disabled:opacity-40"
              >
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-[16px] leading-snug">{task.title}</span>
                  {goal && <span className="block truncate text-[13px] text-ink-3">{goal.title}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-0.5 text-[13px] font-semibold text-ink-2">
                  <Plus aria-hidden size={14} strokeWidth={2.5} />
                  오늘
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}
