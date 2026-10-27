"use client";

import { ChevronRight } from "lucide-react";
import { useId, useRef, useState } from "react";
import { PrimaryButton } from "@/components/BottomActions";
import { BottomSheet } from "@/components/BottomSheet";
import { ChoiceChip } from "@/components/ChoiceChip";
import { Spinner } from "@/components/Spinner";
import { Switch } from "@/components/Switch";
import { GoalPickerSheet } from "@/components/today/GoalPickerSheet";
import { MAX_CORE_TASKS_PER_DAY } from "@/config/game";
import { addDays, formatShortDate } from "@/lib/date";
import { canMarkCore } from "@/lib/quickAdd";
import type { CreateTaskRequest, DateKey, Goal, Task } from "@/types";

type DateMode = "TODAY" | "TOMORROW" | "CUSTOM" | "NONE";

interface AddTaskSheetProps {
  open: boolean;
  onClose: () => void;
  today: DateKey;
  /** 연결할 수 있는 진행 중 목표 */
  goals: Goal[];
  /** 핵심 할 일 수를 아는 범위의 할 일 (오늘 화면이면 오늘 할 일) */
  knownTasks: Task[];
  /** S02에서 열면 오늘·목표 없음, S12에서 열면 날짜 없음·그 목표 */
  defaultDate?: "TODAY" | "NONE";
  defaultGoalId?: string | null;
  onSubmit: (req: CreateTaskRequest) => Promise<unknown>;
}

/** S03 할 일 추가: 제목 하나로 빠르게. 추가하면 시트는 열어 둔 채 제목만 비운다 (연속 추가) */
export function AddTaskSheet({
  open,
  onClose,
  today,
  goals,
  knownTasks,
  defaultDate = "TODAY",
  defaultGoalId = null,
  onSubmit,
}: AddTaskSheetProps) {
  const ids = { title: useId(), date: useId(), custom: useId() };
  const input = useRef<HTMLInputElement>(null);
  // 한글 입력 중(조합 중)에 엔터를 누르면 조합이 끝난 뒤에 추가한다. 끝 글자가 빈 입력칸에 다시 남지 않게 한다
  const composing = useRef(false);
  // 같은 입력으로 두 번 추가되지 않게 한다 (조합이 끝난 뒤 엔터가 한 번 더 오는 브라우저 대비)
  const submitting = useRef(false);
  const submitAfterCompose = useRef(false);
  const [title, setTitle] = useState("");
  const [dateMode, setDateMode] = useState<DateMode>(defaultDate);
  const [customDate, setCustomDate] = useState<DateKey>("");
  const [goalId, setGoalId] = useState<string | null>(defaultGoalId);
  const [isCore, setIsCore] = useState(false);
  const [pickingGoal, setPickingGoal] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const date: DateKey | null =
    dateMode === "TODAY" ? today : dateMode === "TOMORROW" ? addDays(today, 1) : dateMode === "CUSTOM" ? customDate || null : null;
  const coreAllowed = canMarkCore(date, knownTasks);
  const coreFull = date !== null && !coreAllowed;
  const goal = goals.find((g) => g.id === goalId) ?? null;
  const canSubmit = title.trim().length > 0 && !pending && !(dateMode === "CUSTOM" && !customDate);

  // 시트를 내리면 입력 중인 내용은 확인 없이 버린다
  const close = () => {
    setTitle("");
    setDateMode(defaultDate);
    setCustomDate("");
    setGoalId(defaultGoalId);
    setIsCore(false);
    setFailed(false);
    onClose();
  };

  const submit = async () => {
    if (!canSubmit || submitting.current) return;
    submitting.current = true;
    setPending(true);
    setFailed(false);
    try {
      await onSubmit({
        title: title.trim(),
        scheduledDate: date,
        goalId,
        isCore: isCore && coreAllowed,
        source: "MANUAL",
        recurrence: null,
      });
      // 연속 추가: 제목만 비우고 날짜, 목표, 핵심 선택은 그대로 둔다
      setTitle("");
      input.current?.focus();
    } catch {
      setFailed(true);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };

  const dateChips: { mode: DateMode; label: string }[] = [
    { mode: "TODAY", label: "오늘" },
    { mode: "TOMORROW", label: "내일" },
    { mode: "CUSTOM", label: dateMode === "CUSTOM" && customDate ? formatShortDate(customDate) : "날짜 선택" },
    { mode: "NONE", label: "날짜 없음" },
  ];

  return (
    <>
      <BottomSheet open={open} onClose={close} title="할 일 추가">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (composing.current) {
              submitAfterCompose.current = true;
              return;
            }
            void submit();
          }}
        >
          <label htmlFor={ids.title} className="sr-only">
            할 일 제목
          </label>
          <input
            ref={input}
            id={ids.title}
            type="text"
            autoFocus
            enterKeyHint="done"
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={() => {
              composing.current = false;
              if (submitAfterCompose.current) {
                submitAfterCompose.current = false;
                // 조합이 끝난 값이 상태에 반영된 다음에 추가한다
                setTimeout(() => input.current?.form?.requestSubmit(), 0);
              }
            }}
            placeholder="할 일을 적어요"
            className="h-12 w-full rounded-lg border border-line-strong bg-surface px-3 text-[16px] placeholder:text-ink-3"
          />

          <div>
            <p id={ids.date} className="text-[14px] font-semibold text-ink-2">
              날짜
            </p>
            <div role="radiogroup" aria-labelledby={ids.date} className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5">
              {dateChips.map((chip) => (
                <ChoiceChip key={chip.mode} selected={dateMode === chip.mode} onClick={() => setDateMode(chip.mode)}>
                  {chip.label}
                </ChoiceChip>
              ))}
            </div>
            {dateMode === "CUSTOM" && (
              <>
                <label htmlFor={ids.custom} className="sr-only">
                  날짜 선택
                </label>
                <input
                  id={ids.custom}
                  type="date"
                  min={today}
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="mt-2 h-12 w-full rounded-lg border border-line-strong bg-surface px-3 text-[16px] tabular-nums"
                />
              </>
            )}
          </div>

          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setPickingGoal(true)}
            className="flex min-h-12 items-center gap-2 border-y border-line py-2 text-left"
          >
            <span className="text-[14px] font-semibold text-ink-2">연결 목표</span>
            <span className={`min-w-0 flex-1 truncate text-right text-[15px] ${goal ? "text-ink" : "text-ink-3"}`}>
              {goal?.title ?? "목표 없음"}
            </span>
            <ChevronRight aria-hidden size={18} className="shrink-0 text-ink-3" />
          </button>

          <Switch
            label="핵심 할 일"
            checked={isCore && coreAllowed}
            disabled={!coreAllowed}
            onChange={setIsCore}
            hint={
              coreFull
                ? `핵심 할 일은 ${MAX_CORE_TASKS_PER_DAY}개까지예요`
                : date === null
                  ? "날짜가 있을 때만 정할 수 있어요"
                  : undefined
            }
          />

          {/* 추가 버튼은 시트 아래에 붙어 키보드 바로 위에 남는다 */}
          <div className="sticky bottom-0 -mx-5 bg-surface px-5 pt-1">
            {failed && (
              <p role="alert" className="pb-2 text-center text-[14px] text-ink-2">
                저장하지 못했어요. 다시 눌러 주세요
              </p>
            )}
            <PrimaryButton type="submit" disabled={!canSubmit}>
              {pending && <Spinner />}
              추가
            </PrimaryButton>
          </div>
        </form>
      </BottomSheet>

      <GoalPickerSheet
        open={open && pickingGoal}
        goals={goals}
        value={goalId}
        onClose={() => setPickingGoal(false)}
        onSelect={setGoalId}
      />
    </>
  );
}
