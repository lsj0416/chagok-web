"use client";

import { Pencil } from "lucide-react";
import { useId, useState } from "react";
import { PrimaryButton } from "@/components/BottomActions";
import { BottomSheet } from "@/components/BottomSheet";
import { ChoiceChip } from "@/components/ChoiceChip";
import { PickerRow } from "@/components/PickerRow";
import { Spinner } from "@/components/Spinner";
import { Switch } from "@/components/Switch";
import { GoalPickerSheet } from "@/components/today/GoalPickerSheet";
import { TASK_UNIT_LABEL } from "@/config/game";
import { defaultAmountFor, defaultGoalFor, templateTitle } from "@/lib/quickAdd";
import type { CreateTaskRequest, DateKey, Goal, QuickTaskTemplate, TaskUnit } from "@/types";
import { TASK_TITLE_MAX_LENGTH } from "@/config/app";

interface QuickAddSheetProps {
  /** 누른 칩의 템플릿. null이면 닫힘 */
  template: QuickTaskTemplate | null;
  today: DateKey;
  goals: Goal[];
  onClose: () => void;
  onSubmit: (req: CreateTaskRequest) => Promise<unknown>;
}

/**
 * S16 빠른 추가: 키워드와 수량만 골라 오늘 할 일을 만든다. AI를 호출하지 않는다.
 * 템플릿이 바뀌면 부모가 key로 다시 만든다
 */
export function QuickAddSheet({ template, today, goals, onClose, onSubmit }: QuickAddSheetProps) {
  const ids = { unit: useId(), amount: useId(), title: useId() };
  const firstUnit = template?.units[0] ?? "MINUTE";
  const [unit, setUnit] = useState<TaskUnit>(firstUnit);
  const [amount, setAmount] = useState<number | null>(template ? defaultAmountFor(template, firstUnit) : null);
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [goalId, setGoalId] = useState<string | null>(template ? (defaultGoalFor(template, goals)?.id ?? null) : null);
  const [pickingGoal, setPickingGoal] = useState(false);
  const [daily, setDaily] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!template) return <BottomSheet open={false} onClose={onClose} title="빠른 추가">{null}</BottomSheet>;

  const generated = amount !== null ? templateTitle(template.keyword, amount, unit) : template.keyword;
  const title = (customTitle ?? generated).trim();
  const typeGoals = goals.filter((g) => g.status === "ACTIVE" && g.type === template.goalType);
  const goal = goals.find((g) => g.id === goalId) ?? null;

  const submit = async () => {
    if (!title || pending) return;
    setPending(true);
    setFailed(false);
    try {
      await onSubmit({
        title,
        scheduledDate: today,
        goalId,
        isCore: false,
        source: "TEMPLATE",
        recurrence: daily ? "DAILY" : null,
      });
      onClose();
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <BottomSheet open onClose={onClose} title={template.keyword}>
        <div className="flex flex-col gap-4">
          {template.units.length > 1 && (
            <div>
              <p id={ids.unit} className="text-[14px] font-semibold text-ink-2">
                단위
              </p>
              <div role="radiogroup" aria-labelledby={ids.unit} className="mt-2 flex gap-2">
                {template.units.map((u) => (
                  <ChoiceChip
                    key={u}
                    selected={unit === u}
                    onClick={() => {
                      setUnit(u);
                      setAmount(defaultAmountFor(template, u));
                      setCustomTitle(null);
                    }}
                  >
                    {TASK_UNIT_LABEL[u]}
                  </ChoiceChip>
                ))}
              </div>
            </div>
          )}

          <div>
            <p id={ids.amount} className="text-[14px] font-semibold text-ink-2">
              수량
            </p>
            <div role="radiogroup" aria-labelledby={ids.amount} className="mt-2 flex flex-wrap gap-2">
              {(template.amountOptions[unit] ?? []).map((n) => (
                <ChoiceChip
                  key={n}
                  selected={amount === n}
                  onClick={() => {
                    setAmount(n);
                    setCustomTitle(null);
                  }}
                  className="tabular-nums"
                >
                  {n}
                  {TASK_UNIT_LABEL[unit]}
                </ChoiceChip>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-surface-2 px-4 py-3">
            <label htmlFor={ids.title} className="text-[13px] text-ink-3">
              만들어질 할 일
            </label>
            {editing ? (
              <input
                id={ids.title}
                type="text"
                autoFocus
                data-autofocus
                enterKeyHint="done"
                maxLength={TASK_TITLE_MAX_LENGTH}
                value={customTitle ?? generated}
                onChange={(e) => setCustomTitle(e.target.value)}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) setEditing(false);
                }}
                className="mt-1 h-11 w-full rounded-lg border border-sign bg-surface px-3 text-[16px]"
              />
            ) : (
              <button
                id={ids.title}
                type="button"
                onClick={() => setEditing(true)}
                aria-label={`${title}, 제목 고치기`}
                className="mt-0.5 flex min-h-11 w-full items-center gap-2 text-left text-[18px] font-semibold"
              >
                <span className="min-w-0 flex-1">{title || generated}</span>
                <Pencil aria-hidden size={16} className="shrink-0 text-ink-3" />
              </button>
            )}
          </div>

          {template.goalType && (
            <div className="border-y border-line">
              <PickerRow label="연결 목표" value={goal?.title ?? "목표 없음"} empty={!goal} onClick={() => setPickingGoal(true)} />
            </div>
          )}

          <Switch label="매일 반복" checked={daily} onChange={setDaily} />

          <div className="sticky bottom-0 -mx-5 bg-surface px-5 pt-1">
            {failed && (
              <p role="alert" className="pb-2 text-center text-[14px] text-ink-2">
                저장하지 못했어요. 다시 눌러 주세요
              </p>
            )}
            <PrimaryButton disabled={!title || pending} onClick={() => void submit()}>
              {pending && <Spinner />}
              추가
            </PrimaryButton>
          </div>
        </div>
      </BottomSheet>

      {template.goalType && (
        <GoalPickerSheet
          open={pickingGoal}
          goals={typeGoals}
          value={goalId}
          onClose={() => setPickingGoal(false)}
          onSelect={setGoalId}
        />
      )}
    </>
  );
}
