"use client";

import { useId, useState } from "react";
import { PrimaryButton } from "@/components/BottomActions";
import { BottomSheet } from "@/components/BottomSheet";
import { Spinner } from "@/components/Spinner";
import type { DateKey, Goal, RemainingTaskAction, UpdateGoalRequest } from "@/types";

const inputClass =
  "h-12 w-full rounded-lg border border-line-strong bg-surface px-3 text-[16px] placeholder:text-ink-3";

/** 시트 안에서 저장하고, 실패하면 시트 안에서 알린다 (S03과 같은 방식) */
function useSheetSubmit(run: () => Promise<unknown>) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const submit = async () => {
    if (pending) return;
    setPending(true);
    setFailed(false);
    try {
      await run();
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  };
  return { pending, failed, submit, reset: () => setFailed(false) };
}

function SaveError({ show, children = "저장하지 못했어요. 다시 눌러 주세요" }: { show: boolean; children?: string }) {
  if (!show) return null;
  return (
    <p role="alert" className="text-center text-[14px] text-ink-2">
      {children}
    </p>
  );
}

function CancelButton({ onClick, children = "그대로 두기" }: { onClick: () => void; children?: string }) {
  return (
    <button type="button" onClick={onClick} className="h-12 rounded-xl bg-surface-2 text-[15px] font-semibold text-ink-2">
      {children}
    </button>
  );
}

interface GoalEditSheetProps {
  open: boolean;
  goal: Goal;
  today: DateKey;
  onClose: () => void;
  onSubmit: (req: UpdateGoalRequest) => Promise<unknown>;
}

/** 목표 수정: 제목, 기한, 완료 조건. 부모가 key로 열 때마다 새로 만든다 */
export function GoalEditSheet({ open, goal, today, onClose, onSubmit }: GoalEditSheetProps) {
  const ids = { title: useId(), due: useId(), criteria: useId() };
  const [title, setTitle] = useState(goal.title);
  const [dueDate, setDueDate] = useState<DateKey>(goal.dueDate ?? "");
  const [criteria, setCriteria] = useState(goal.completionCriteria ?? "");
  const { pending, failed, submit, reset } = useSheetSubmit(() =>
    onSubmit({ title: title.trim(), dueDate: dueDate || null, completionCriteria: criteria.trim() || null }),
  );
  // 지난 기한은 그대로 둘 수 있다. 새로 고르는 기한만 오늘부터
  const dueValid = !dueDate || dueDate === goal.dueDate || dueDate >= today;
  const canSave = title.trim().length > 0 && dueValid && !pending;

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="목표 수정"
    >
      <form
        noValidate
        className="flex flex-col gap-4 pt-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) void submit();
        }}
      >
        <label className="flex flex-col gap-2" htmlFor={ids.title}>
          <span className="text-[14px] font-semibold text-ink-2">목표</span>
          <input id={ids.title} type="text" required maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </label>
        <div className="flex flex-col gap-2">
          <label htmlFor={ids.due} className="text-[14px] font-semibold text-ink-2">
            기한 <span className="font-normal text-ink-3">(선택)</span>
          </label>
          <div className="flex gap-2">
            {/* 지난 기한도 그대로 보여주지만, 새로 고를 때는 오늘부터. 지난 기한이 막지 않게 폼 검사는 직접 한다 */}
            <input
              id={ids.due}
              type="date"
              min={today}
              aria-invalid={!dueValid}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`${inputClass} min-w-0 flex-1 tabular-nums`}
            />
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate("")}
                className="h-12 shrink-0 rounded-lg bg-surface-2 px-3 text-[14px] font-semibold text-ink-2"
              >
                기한 없음
              </button>
            )}
          </div>
        </div>
        <label className="flex flex-col gap-2" htmlFor={ids.criteria}>
          <span className="text-[14px] font-semibold text-ink-2">
            완료 조건 <span className="font-normal text-ink-3">(선택)</span>
          </span>
          <input
            id={ids.criteria}
            type="text"
            maxLength={100}
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            placeholder="최종 합격 1곳"
            className={inputClass}
          />
        </label>
        <div className="sticky bottom-0 -mx-5 flex flex-col gap-2 bg-surface px-5 pt-1">
          <SaveError show={failed} />
          {!dueValid && <p className="text-center text-[14px] text-ink-2">기한은 오늘부터 고를 수 있어요</p>}
          <PrimaryButton type="submit" disabled={!canSave}>
            {pending && <Spinner />}
            저장
          </PrimaryButton>
        </div>
      </form>
    </BottomSheet>
  );
}

const REMAINING_OPTIONS: { value: RemainingTaskAction; label: string; hint: string }[] = [
  { value: "KEEP", label: "그대로 두기", hint: "할 일이 지금 날짜 그대로 남아요" },
  { value: "UNSCHEDULE", label: "날짜 없이 보관", hint: "오늘 화면에서 빠지고 목표 안에 남아요" },
  { value: "DELETE", label: "삭제", hint: "남은 할 일을 지워요" },
];

interface GoalCompleteSheetProps {
  open: boolean;
  /** 건물 이름. 예: '오피스' */
  buildingName: string | null;
  remainingCount: number;
  onClose: () => void;
  onConfirm: (remaining: RemainingTaskAction) => Promise<unknown>;
}

/** 목표 완료 확인. 남은 할 일이 있으면 처리 방법을 고른다. 서비스가 대신 정하지 않는다 */
export function GoalCompleteSheet({ open, buildingName, remainingCount, onClose, onConfirm }: GoalCompleteSheetProps) {
  const groupLabel = useId();
  const [remaining, setRemaining] = useState<RemainingTaskAction>("KEEP");
  const { pending, failed, submit, reset } = useSheetSubmit(() => onConfirm(remaining));
  const close = () => {
    reset();
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title="목표를 완료할까요?"
      description={buildingName ? `${buildingName} 공사가 끝나고 건물이 완성돼요` : undefined}
    >
      {remainingCount > 0 && (
        <div className="pt-1">
          <p id={groupLabel} className="text-[14px] font-semibold text-ink-2">
            남은 할 일 <span className="tabular-nums">{remainingCount}</span>개
          </p>
          <ul role="radiogroup" aria-labelledby={groupLabel} className="mt-1 flex flex-col">
            {REMAINING_OPTIONS.map((option) => {
              const selected = remaining === option.value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setRemaining(option.value)}
                    className="flex min-h-13 w-full items-center gap-3 border-b border-line py-2 text-left"
                  >
                    <span
                      aria-hidden
                      className={`grid size-[22px] shrink-0 place-items-center rounded-full border-2 ${
                        selected ? "border-ink" : "border-line-strong"
                      }`}
                    >
                      {selected && <span className="size-2.5 rounded-full bg-ink" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px]">{option.label}</span>
                      <span className="block text-[13px] text-ink-3">{option.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="flex flex-col gap-2 pt-4">
        <SaveError show={failed} />
        <PrimaryButton disabled={pending} onClick={() => void submit()}>
          {pending && <Spinner />}
          완료하기
        </PrimaryButton>
        <CancelButton onClick={close}>나중에 하기</CancelButton>
      </div>
    </BottomSheet>
  );
}

interface GoalArchiveSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<unknown>;
}

/** 보관 확인 */
export function GoalArchiveSheet({ open, onClose, onConfirm }: GoalArchiveSheetProps) {
  const { pending, failed, submit, reset } = useSheetSubmit(onConfirm);
  const close = () => {
    reset();
    onClose();
  };
  return (
    <BottomSheet
      open={open}
      onClose={close}
      title="목표를 보관할까요?"
      description="건물 공사가 멈춰요. 건물과 할 일은 그대로 남고, 언제든 다시 진행할 수 있어요"
    >
      <div className="flex flex-col gap-2 pt-2">
        <SaveError show={failed} />
        <PrimaryButton disabled={pending} onClick={() => void submit()}>
          {pending && <Spinner />}
          보관하기
        </PrimaryButton>
        <CancelButton onClick={close} />
      </div>
    </BottomSheet>
  );
}
