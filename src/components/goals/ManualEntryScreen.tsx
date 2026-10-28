"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { BottomActions, PrimaryButton } from "@/components/BottomActions";
import { GOAL_TYPES, GOAL_TYPE_EXAMPLE, buildingName } from "@/components/goals/BuildingSheet";
import { useGoalFlow } from "@/components/goals/GoalFlowProvider";
import { Field, inputClass } from "@/components/goals/GoalInputScreen";
import { Spinner } from "@/components/Spinner";
import { TopBar } from "@/components/TopBar";
import * as api from "@/lib/api/goals";
import { TASK_TITLE_MAX_LENGTH } from "@/config/app";

/** S11 직접 입력: AI 없이 목표와 할 일을 만든다 */
export function ManualEntryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { state, update } = useGoalFlow();
  const tasks = state.manualTaskTitles;
  const setTasks = (next: (prev: string[]) => string[]) => update({ manualTaskTitles: next(tasks) });
  const [line, setLine] = useState("");
  const ids = { title: useId(), building: useId(), task: useId() };

  const canCreate = state.title.trim().length > 0 && state.goalType !== null;

  const addLine = () => {
    const title = line.trim();
    if (!title) return;
    setTasks((prev) => [...prev, title]);
    setLine("");
  };

  const create = useMutation({
    mutationFn: () =>
      api.createGoal({
        title: state.title.trim(),
        type: state.goalType!,
        dueDate: state.dueDate,
        // 입력칸에 적고 추가를 누르지 않은 줄도 함께 만든다
        taskTitles: [...tasks, line.trim()].filter(Boolean),
        source: "MANUAL",
        breakdownId: null,
      }),
    onSuccess: ({ goalId }) => {
      void queryClient.invalidateQueries();
      router.replace(`/goals/detail?id=${encodeURIComponent(goalId)}`);
    },
  });

  return (
    <>
      <TopBar title="직접 입력" back />
      <main className="flex flex-1 flex-col gap-6 px-5 pt-2 pb-6">
        <Field id={ids.title} label="목표">
          <input
            id={ids.title}
            type="text"
            required
            maxLength={100}
            value={state.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="백엔드 개발자로 취업하기"
            className={inputClass}
          />
        </Field>

        <fieldset>
          <legend id={ids.building} className="text-[14px] font-semibold text-ink-2">
            건물 종류
          </legend>
          <div role="radiogroup" aria-labelledby={ids.building} className="mt-2 flex flex-wrap gap-2">
            {GOAL_TYPES.map((type) => {
              const selected = state.goalType === type;
              return (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${buildingName(type)} (${GOAL_TYPE_EXAMPLE[type]})`}
                  onClick={() => update({ goalType: type, goalTypeTouched: true })}
                  className={`h-11 rounded-md border px-4 text-[15px] ${
                    selected ? "border-sign bg-sign font-semibold text-sign-ink" : "border-line-strong bg-surface text-ink"
                  }`}
                >
                  {buildingName(type)}
                </button>
              );
            })}
          </div>
          {state.goalType && <p className="mt-2 text-[13px] text-ink-3">{GOAL_TYPE_EXAMPLE[state.goalType]} 목표에 어울려요</p>}
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor={ids.task} className="text-[14px] font-semibold text-ink-2">
            할 일 <span className="font-normal text-ink-3">(없어도 돼요)</span>
          </label>
          {tasks.length > 0 && (
            <ul className="flex flex-col">
              {tasks.map((title, i) => (
                <li key={`${i}-${title}`} className="flex min-h-12 items-center gap-2 border-b border-line">
                  <span className="min-w-0 flex-1 py-2 text-[16px] leading-snug">{title}</span>
                  <button
                    type="button"
                    aria-label={`${title} 지우기`}
                    onClick={() => setTasks((prev) => prev.filter((_, j) => j !== i))}
                    className="grid size-11 shrink-0 place-items-center text-ink-3"
                  >
                    <X aria-hidden size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              id={ids.task}
              type="text"
              enterKeyHint="enter"
              maxLength={TASK_TITLE_MAX_LENGTH}
              value={line}
              onChange={(e) => setLine(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  addLine();
                }
              }}
              placeholder="한 번에 할 수 있는 크기로 적어요"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addLine}
              disabled={!line.trim()}
              className="h-12 shrink-0 rounded-lg bg-surface-2 px-4 text-[15px] font-semibold text-ink-2 disabled:opacity-40"
            >
              추가
            </button>
          </div>
        </div>
      </main>

      <BottomActions>
        {create.isError && (
          <p role="alert" className="pb-2 text-center text-[14px] text-ink-2">
            저장하지 못했어요. 다시 눌러 주세요
          </p>
        )}
        <PrimaryButton disabled={!canCreate || create.isPending} onClick={() => create.mutate()}>
          {create.isPending && <Spinner />}
          목표 만들기
        </PrimaryButton>
      </BottomActions>
    </>
  );
}
