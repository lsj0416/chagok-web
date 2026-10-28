"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { DateMoveForm } from "@/components/today/DateMoveForm";
import { formatShortDate } from "@/lib/date";
import type { DateKey, Goal, Task } from "@/types";

interface OverdueSheetProps {
  open: boolean;
  onClose: () => void;
  today: DateKey;
  tasks: Task[] | undefined;
  goals: Goal[];
  loading: boolean;
  /** 저장 중인 할 일 */
  pendingId: string | null;
  onMoveToday: (task: Task) => void;
  onReschedule: (task: Task, date: DateKey) => void;
  onUnschedule: (task: Task) => void;
}

/** 지난 할 일 (docs/screens.md S02 지난 할 일). 항목마다 오늘로, 날짜 바꾸기, 날짜 없이 보관 */
export function OverdueSheet({
  open,
  onClose,
  today,
  tasks,
  goals,
  loading,
  pendingId,
  onMoveToday,
  onReschedule,
  onUnschedule,
}: OverdueSheetProps) {
  const [movingId, setMovingId] = useState<string | null>(null);
  const count = tasks?.length ?? 0;

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        setMovingId(null);
        onClose();
      }}
      title={loading ? "지난 할 일" : `지난 할 일 ${count}개`}
      description="정리하지 않고 닫아도 괜찮아요"
    >
      {loading && <ListSkeleton />}
      <ul className="flex flex-col">
        {tasks?.map((task) => {
          const goal = goals.find((g) => g.id === task.goalId);
          const busy = pendingId === task.id;
          return (
            <li key={task.id} className="border-b border-line py-3 last:border-b-0" aria-busy={busy || undefined}>
              <p className="text-[16px] leading-snug">{task.title}</p>
              <p className="mt-0.5 text-[13px] text-ink-3">
                {task.scheduledDate && formatShortDate(task.scheduledDate)}
                {goal && ` · ${goal.title}`}
              </p>
              {movingId === task.id ? (
                <DateMoveForm
                  today={today}
                  onCancel={() => setMovingId(null)}
                  onSubmit={(date) => {
                    onReschedule(task, date);
                    setMovingId(null);
                  }}
                />
              ) : (
                <div className={`mt-2 grid grid-cols-3 gap-2 ${busy ? "opacity-50" : ""}`}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onMoveToday(task)}
                    className="h-11 rounded-lg bg-surface-2 text-[14px] font-semibold text-ink-2"
                  >
                    오늘로
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setMovingId(task.id)}
                    className="h-11 rounded-lg bg-surface-2 text-[14px] font-semibold text-ink-2"
                  >
                    날짜 바꾸기
                  </button>
                  <button
                    type="button"
                    // 매일 반복하는 할 일은 날짜 없이 둘 수 없다 (할 일 상세에서 반복을 먼저 끈다)
                    disabled={busy || task.recurrence !== null}
                    title={task.recurrence ? "반복을 끄면 날짜 없이 둘 수 있어요" : undefined}
                    onClick={() => onUnschedule(task)}
                    className="h-11 rounded-lg bg-surface-2 text-[14px] font-semibold text-ink-2 disabled:opacity-40"
                  >
                    날짜 없이 보관
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}

/** 로딩: 목록 자리에 회색 줄 3개 */
export function ListSkeleton() {
  return (
    <div aria-label="불러오는 중" role="status" className="flex flex-col gap-4 py-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 px-2.5">
          <span className="size-[22px] shrink-0 rounded-full bg-surface-3" />
          <span className="h-4 flex-1 rounded bg-surface-3" style={{ maxWidth: `${80 - i * 15}%` }} />
        </div>
      ))}
    </div>
  );
}
