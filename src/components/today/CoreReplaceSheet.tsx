"use client";

import { BottomSheet } from "@/components/BottomSheet";
import { SheetAction } from "@/components/today/TaskActionsSheet";
import { MAX_CORE_TASKS_PER_DAY } from "@/config/game";
import type { Task } from "@/types";

interface CoreReplaceSheetProps {
  /** 핵심으로 지정하려는 할 일 */
  incoming: Task | null;
  coreTasks: Task[];
  onClose: () => void;
  onReplace: (remove: Task, add: Task) => void;
}

/** 핵심 할 일이 가득 찼을 때 교체할 항목을 고른다 */
export function CoreReplaceSheet({ incoming, coreTasks, onClose, onReplace }: CoreReplaceSheetProps) {
  // 완료한 핵심 할 일은 이미 크레딧을 받았으므로 바꿀 수 없다
  const replaceable = coreTasks.filter((t) => t.status !== "DONE");
  return (
    <BottomSheet
      open={incoming !== null}
      onClose={onClose}
      title={`핵심 할 일은 ${MAX_CORE_TASKS_PER_DAY}개까지예요`}
      description={
        replaceable.length > 0
          ? "대신 핵심에서 뺄 할 일을 골라 주세요"
          : "오늘 핵심 할 일을 모두 마쳐서 바꿀 수 없어요"
      }
    >
      <ul className="flex flex-col">
        {incoming &&
          replaceable.map((task) => (
            <li key={task.id}>
              <SheetAction
                label={task.title}
                onClick={() => {
                  onReplace(task, incoming);
                  onClose();
                }}
              />
            </li>
          ))}
      </ul>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 h-12 w-full rounded-lg bg-surface-2 text-[15px] font-semibold text-ink-2"
      >
        그대로 두기
      </button>
    </BottomSheet>
  );
}
