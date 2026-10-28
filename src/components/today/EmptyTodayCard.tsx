"use client";

import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { QUICK_TEMPLATE_DISPLAY_LIMIT, UNDATED_TASK_DISPLAY_LIMIT } from "@/config/game";
import type { Goal, QuickTaskTemplate, Task } from "@/types";

interface EmptyTodayCardProps {
  undatedTasks: Task[];
  goals: Goal[];
  quickTemplates: QuickTaskTemplate[];
  hasActiveGoals: boolean;
  pendingId: string | null;
  onPickUndated: (task: Task) => void;
  onShowAllUndated: () => void;
  onQuickAdd: (template: QuickTaskTemplate) => void;
  onManualAdd: () => void;
}

/** 오늘 할 일이 0개일 때 목록 자리에 보여주는 카드. 모달 대신 누르고 싶을 때만 누른다 */
export function EmptyTodayCard({
  undatedTasks,
  goals,
  quickTemplates,
  hasActiveGoals,
  pendingId,
  onPickUndated,
  onShowAllUndated,
  onQuickAdd,
  onManualAdd,
}: EmptyTodayCardProps) {
  const shownUndated = undatedTasks.slice(0, UNDATED_TASK_DISPLAY_LIMIT);
  const chips = quickTemplates.slice(0, QUICK_TEMPLATE_DISPLAY_LIMIT);

  return (
    <section aria-labelledby="empty-title" className="mx-4 mt-2 rounded-2xl bg-surface-2 px-4 pt-5 pb-4">
      <h2 id="empty-title" className="text-[18px] font-bold">
        오늘 할 일이 아직 없어요
      </h2>

      {shownUndated.length > 0 && (
        <div className="mt-5">
          <h3 className="text-[14px] font-semibold text-ink-2">목표에서 가져오기</h3>
          <ul className="mt-1">
            {shownUndated.map((task) => {
              const goal = goals.find((g) => g.id === task.goalId);
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => onPickUndated(task)}
                    disabled={pendingId === task.id}
                    aria-label={`${task.title} 오늘 하기`}
                    className="flex min-h-13 w-full items-center gap-3 border-b border-line py-2 text-left disabled:opacity-40"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-[15px] leading-snug">{task.title}</span>
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
          {undatedTasks.length > shownUndated.length && (
            <button
              type="button"
              onClick={onShowAllUndated}
              className="mt-1 flex h-11 items-center gap-0.5 text-[14px] font-semibold text-ink-2"
            >
              더 보기
              <ChevronRight aria-hidden size={16} />
            </button>
          )}
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-[14px] font-semibold text-ink-2">빠른 추가</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {chips.map((template) => (
            <li key={template.id}>
              <button
                type="button"
                onClick={() => onQuickAdd(template)}
                className="h-11 rounded-md border border-line-strong bg-surface px-4 text-[15px]"
              >
                {template.keyword}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={onManualAdd}
          className="h-12 rounded-lg border border-line-strong bg-surface text-[15px] font-semibold"
        >
          직접 입력
        </button>
        {!hasActiveGoals && (
          <Link
            href="/goals/new"
            className="grid h-12 place-items-center border-b-[3px] border-caution bg-ink text-[15px] font-semibold text-surface"
          >
            AI로 목표 만들기
          </Link>
        )}
      </div>
    </section>
  );
}
