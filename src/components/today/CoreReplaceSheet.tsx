"use client";

import { BottomSheet } from "@/components/BottomSheet";
import { SheetAction } from "@/components/today/TaskActionsSheet";
import { MAX_CORE_TASKS_PER_DAY } from "@/config/game";
import { formatShortDate } from "@/lib/date";
import type { DateKey, Task } from "@/types";

interface CoreReplaceSheetProps {
  open: boolean;
  /** 그날의 핵심 할 일 */
  coreTasks: Task[];
  /** 오늘이 아닌 날이면 그 날짜. 문구에 넣는다 */
  date?: DateKey | null;
  onClose: () => void;
  onReplace: (remove: Task) => void;
  /** 옮기거나 더할 때만: 핵심 대신 일반 할 일로 두는 선택지 */
  keepNormal?: { label: string; onClick: () => void };
}

/** 핵심 할 일이 가득 찼을 때 교체할 항목을 고른다. 서비스가 대신 고르지 않는다 */
export function CoreReplaceSheet({ open, coreTasks, date = null, onClose, onReplace, keepNormal }: CoreReplaceSheetProps) {
  // 완료한 핵심 할 일은 이미 크레딧을 받았으므로 바꿀 수 없다
  const replaceable = coreTasks.filter((t) => t.status !== "DONE");
  const day = date ? `${formatShortDate(date)}에는` : "오늘";
  const description =
    replaceable.length === 0
      ? `${date ? `${formatShortDate(date)} ` : "오늘 "}핵심 할 일을 모두 마쳐서 바꿀 수 없어요`
      : date
        ? `${day} 핵심 할 일이 이미 ${MAX_CORE_TASKS_PER_DAY}개 있어요. 대신 핵심에서 뺄 할 일을 골라 주세요`
        : "대신 핵심에서 뺄 할 일을 골라 주세요";
  return (
    <BottomSheet open={open} onClose={onClose} title={`핵심 할 일은 ${MAX_CORE_TASKS_PER_DAY}개까지예요`} description={description}>
      <ul className="flex flex-col">
        {replaceable.map((task) => (
          <li key={task.id}>
            <SheetAction
              label={task.title}
              onClick={() => {
                onReplace(task);
                onClose();
              }}
            />
          </li>
        ))}
      </ul>
      {keepNormal && (
        <button
          type="button"
          onClick={keepNormal.onClick}
          className="mt-3 h-12 w-full rounded-lg border border-line-strong bg-surface text-[15px] font-semibold text-ink"
        >
          {keepNormal.label}
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        className={`${keepNormal ? "mt-2" : "mt-3"} h-12 w-full rounded-lg bg-surface-2 text-[15px] font-semibold text-ink-2`}
      >
        그대로 두기
      </button>
    </BottomSheet>
  );
}
