"use client";

import { Check, Ellipsis } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { LONG_PRESS_MS } from "@/config/app";
import type { Task } from "@/types";

interface TaskRowProps {
  task: Task;
  /** 제목 아래 보조 줄 (오늘 화면은 목표 이름, 목표 상세는 날짜) */
  caption: string | null;
  /** 완료 취소 가능 여부. 어제 이전에 완료한 할 일은 체크를 풀 수 없다 */
  canToggleOff?: boolean;
  pending?: boolean;
  onToggle: (task: Task) => void;
  /** 더보기 메뉴(길게 누르기와 같음). 없으면 오른쪽에 trailing을 둔다 */
  onMore?: (task: Task) => void;
  /** 더보기 대신 오른쪽에 둘 행동 (목표 상세의 '오늘로') */
  trailing?: React.ReactNode;
  /** 할 일 상세(S04)에서 나누기, 삭제 뒤 돌아갈 화면 */
  from?: "today" | "goal";
}

/** 할 일 한 줄. 왼쪽 체크는 완료, 제목은 할 일 상세(S04), 오른쪽은 더보기 */
export function TaskRow({
  task,
  caption,
  canToggleOff = true,
  pending = false,
  onToggle,
  onMore,
  trailing,
  from = "today",
}: TaskRowProps) {
  const done = task.status === "DONE";
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  const cancelPress = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <li
      className="flex items-start gap-1 py-1 select-none [-webkit-touch-callout:none]"
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        longPressed.current = false;
        if (done || !onMore) return;
        timer.current = setTimeout(() => {
          longPressed.current = true;
          onMore?.(task);
        }, LONG_PRESS_MS);
      }}
      onPointerMove={(e) => {
        // 스크롤하려고 움직이면 길게 누르기가 아니다
        if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) cancelPress();
      }}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onContextMenu={(e) => e.preventDefault()}
      onClickCapture={(e) => {
        // 길게 누른 뒤 손을 뗄 때 생기는 클릭은 버린다
        if (longPressed.current) {
          e.preventDefault();
          e.stopPropagation();
          longPressed.current = false;
        }
      }}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`${task.title} 완료`}
        aria-busy={pending || undefined}
        disabled={done && !canToggleOff}
        onClick={() => onToggle(task)}
        className="grid size-11 shrink-0 place-items-center rounded-full disabled:cursor-default"
      >
        <span
          className={`grid size-[22px] place-items-center rounded-full border-2 transition-colors duration-150 ${
            done ? "border-ink bg-ink text-surface" : "border-line-strong bg-surface"
          } ${pending ? "opacity-60" : ""}`}
        >
          {done && <Check aria-hidden size={14} strokeWidth={3} />}
        </span>
      </button>

      <Link
        href={`/tasks/detail?id=${encodeURIComponent(task.id)}&from=${from}`}
        className="min-w-0 flex-1 py-2.5 [-webkit-touch-callout:none]"
        draggable={false}
      >
        <span
          className={`line-clamp-2 text-[16px] leading-snug ${
            done ? "text-ink-3 line-through decoration-ink-3/60" : "text-ink"
          }`}
        >
          {task.title}
        </span>
        {caption && <span className="mt-0.5 block truncate text-[13px] text-ink-3">{caption}</span>}
      </Link>

      {/* 완료한 할 일은 핵심 지정이나 날짜를 바꾸지 않는다 */}
      {!onMore ? (
        (trailing ?? <span className="size-11 shrink-0" />)
      ) : done ? (
        <span className="size-11 shrink-0" />
      ) : (
      <button
        type="button"
        aria-label={`${task.title} 더보기`}
        aria-haspopup="dialog"
        onClick={() => onMore(task)}
        className="grid size-11 shrink-0 place-items-center rounded-full text-ink-3"
      >
        <Ellipsis aria-hidden size={20} />
      </button>
      )}
    </li>
  );
}
