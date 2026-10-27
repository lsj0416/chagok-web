"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BottomActions, PrimaryButton, TextButton } from "@/components/BottomActions";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { BuildingSheet, buildingName } from "@/components/goals/BuildingSheet";
import { useGoalFlow } from "@/components/goals/GoalFlowProvider";
import { GraphicPlaceholder } from "@/components/GraphicPlaceholder";
import { Spinner } from "@/components/Spinner";
import { TopBar } from "@/components/TopBar";
import { setPendingToast } from "@/components/pendingToast";
import { AI_TIMEOUT_MS, TASK_TITLE_MAX_LENGTH } from "@/config/app";
import * as api from "@/lib/api/goals";
import { applyToggleAll, toggleAllAction, toggleOne } from "@/lib/drafts";
import type { TaskDraft } from "@/types";

/** S10 할 일 초안 선택 (AI 분해 2) */
export function DraftSelectScreen() {
  const scenario = useMockScenario();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { state, update, applyBreakdown } = useGoalFlow();
  // 목표 상세(S12)에서 왔으면 새 목표를 만들지 않고 이 목표에 할 일을 더한다
  const targetGoalId = useSearchParams().get("goal");
  const [buildingOpen, setBuildingOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateFailed, setRegenerateFailed] = useState(false);

  const usageKey = ["aiUsage", scenario] as const;
  const usage = useQuery({ queryKey: usageKey, queryFn: api.fetchAiUsage });
  const limitReached = usage.data?.remaining === 0;

  // 초안 없이 들어오면(새로고침, 직접 주소 입력) 목표 입력으로 돌려보낸다
  const hasDrafts = state.drafts.length > 0 && state.goalType !== null;
  useEffect(() => {
    if (!hasDrafts) router.replace(targetGoalId ? `/goals/new?goal=${encodeURIComponent(targetGoalId)}` : "/goals/new");
  }, [hasDrafts, router, targetGoalId]);

  const ids = state.drafts.map((d) => d.id);
  const selected = state.selectedDraftIds;
  const allAction = toggleAllAction(selected.size, ids.length);

  const regenerate = async () => {
    setRegenerating(true);
    setRegenerateFailed(false);
    try {
      const breakdown = await api.requestGoalBreakdown(
        { title: state.title.trim(), dueDate: state.dueDate, currentSituation: state.currentSituation.trim() || null },
        AbortSignal.timeout(AI_TIMEOUT_MS),
      );
      // 다시 만들면 현재 선택은 사라진다. 사용자가 직접 고른 건물 종류만 그대로 둔다
      applyBreakdown(breakdown);
    } catch {
      setRegenerateFailed(true);
    } finally {
      setRegenerating(false);
      void queryClient.invalidateQueries({ queryKey: usageKey });
    }
  };

  const create = useMutation({
    mutationFn: async () => {
      const taskTitles = state.drafts.filter((d) => selected.has(d.id)).map((d) => d.title);
      if (targetGoalId) {
        await api.addGoalTasks(targetGoalId, taskTitles, "AI");
        return { goalId: targetGoalId, added: taskTitles.length };
      }
      const { goalId } = await api.createGoal({
        title: state.title.trim(),
        type: state.goalType!,
        dueDate: state.dueDate,
        taskTitles,
        source: "AI",
      });
      return { goalId, added: null };
    },
    onSuccess: ({ goalId, added }) => {
      void queryClient.invalidateQueries();
      if (added !== null) {
        // 목표 상세 → S09 → S10으로 왔으므로 두 칸 뒤로 돌아가 원래 목표 상세에 알림을 보여준다
        setPendingToast(`할 일 ${added}개를 추가했어요`);
        window.history.go(-2);
        return;
      }
      // 목표 만들기 경로를 벗어나면 흐름의 입력값은 함께 사라진다
      router.replace(`/goals/detail?id=${encodeURIComponent(goalId)}`);
    },
  });

  if (!hasDrafts) return null;

  const renameDraft = (id: string, title: string) =>
    update({ drafts: state.drafts.map((d) => (d.id === id ? { ...d, title } : d)) });

  return (
    <>
      <TopBar title="추천 할 일" back />
      <main className="flex-1 pb-6">
        <section aria-label="목표" className="flex items-center gap-4 px-5 pt-1">
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] leading-snug font-bold">{state.title}</h2>
            {/* 이미 있는 목표에 더할 때는 건물이 정해져 있어 바꾸지 않는다 */}
            {targetGoalId ? (
              <p className="mt-1 flex h-11 items-center gap-1.5 text-[14px] text-ink-2">
                건물 <strong className="font-semibold text-ink">{buildingName(state.goalType!)}</strong>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setBuildingOpen(true)}
                aria-haspopup="dialog"
                className="mt-1 flex h-11 items-center gap-1.5 text-[14px] text-ink-2"
              >
                추천 건물 <strong className="font-semibold text-ink">{buildingName(state.goalType!)}</strong>
                <span className="ml-1 font-semibold underline underline-offset-4">바꾸기</span>
              </button>
            )}
          </div>
          <GraphicPlaceholder label={buildingName(state.goalType!)} className="size-20" />
        </section>

        <div className="mt-4 flex items-center justify-between border-t border-line px-5 pt-3">
          <h2 className="text-[14px] font-semibold text-ink-2">
            <span className="tabular-nums">{ids.length}</span>개 중 해볼 것만 골라 주세요
          </h2>
          <button
            type="button"
            disabled={regenerating}
            onClick={() => update({ selectedDraftIds: applyToggleAll(ids, selected) })}
            className="h-11 px-1 text-[14px] font-semibold text-ink underline underline-offset-4 disabled:opacity-40"
          >
            {allAction === "CLEAR_ALL" ? "모두 해제" : "모두 선택"}
          </button>
        </div>

        {regenerateFailed && (
          <p role="alert" className="mx-4 mt-2 rounded-xl bg-surface-2 px-4 py-3.5 text-[15px]">
            AI가 응답하지 않아요. 지금 목록은 그대로 두었어요
          </p>
        )}

        {regenerating ? (
          <div role="status" className="flex items-center justify-center gap-3 py-16 text-[15px] text-ink-2">
            <Spinner />
            새로 만들고 있어요
          </div>
        ) : (
          <ul className="px-2 pt-1">
            {state.drafts.map((draft) => (
              <DraftRow
                key={draft.id}
                draft={draft}
                checked={selected.has(draft.id)}
                onToggle={() => update({ selectedDraftIds: toggleOne(selected, draft.id) })}
                onRename={(title) => renameDraft(draft.id, title)}
              />
            ))}
          </ul>
        )}
      </main>

      <BottomActions>
        {create.isError && (
          <p role="alert" className="pb-2 text-center text-[14px] text-ink-2">
            저장하지 못했어요. 다시 눌러 주세요
          </p>
        )}
        <PrimaryButton disabled={selected.size === 0 || regenerating || create.isPending} onClick={() => create.mutate()}>
          {create.isPending && <Spinner />}
          {selected.size}개 추가하기
        </PrimaryButton>
        <div className="mt-1 flex flex-col items-center">
          <TextButton disabled={regenerating || limitReached || create.isPending} onClick={() => void regenerate()}>
            다시 만들기
          </TextButton>
          {limitReached && <p className="pb-1 text-[13px] text-ink-3">오늘 AI 사용을 모두 썼어요</p>}
        </div>
      </BottomActions>

      <BuildingSheet
        open={buildingOpen}
        value={state.goalType}
        onClose={() => setBuildingOpen(false)}
        onSelect={(goalType) => update({ goalType, goalTypeTouched: true })}
      />
    </>
  );
}

/** 초안 한 줄: 왼쪽 체크로 선택, 제목을 누르면 그 자리에서 수정 */
function DraftRow({
  draft,
  checked,
  onToggle,
  onRename,
}: {
  draft: TaskDraft;
  checked: boolean;
  onToggle: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(draft.title);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) input.current?.focus();
  }, [editing]);

  const commit = () => {
    const title = value.trim();
    // 비우면 원래 제목으로 돌린다
    if (title) onRename(title);
    else setValue(draft.title);
    setEditing(false);
  };

  return (
    <li className="flex items-start gap-1 py-1">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={`${draft.title} 선택`}
        onClick={onToggle}
        className="grid size-11 shrink-0 place-items-center"
      >
        <span
          className={`grid size-[22px] place-items-center rounded-md border-2 transition-colors duration-150 ${
            checked ? "border-ink bg-ink text-surface" : "border-line-strong bg-surface"
          }`}
        >
          {checked && <Check aria-hidden size={14} strokeWidth={3} />}
        </span>
      </button>
      {editing ? (
        <input
          ref={input}
          type="text"
          aria-label="할 일 제목 고치기"
          enterKeyHint="done"
          maxLength={TASK_TITLE_MAX_LENGTH}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) commit();
            if (e.key === "Escape") {
              setValue(draft.title);
              setEditing(false);
            }
          }}
          className="mr-3 h-11 min-w-0 flex-1 rounded-lg border border-ink bg-surface px-3 text-[16px]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`${draft.title} 제목 고치기`}
          className="min-w-0 flex-1 py-2.5 pr-3 text-left text-[16px] leading-snug"
        >
          {draft.title}
        </button>
      )}
    </li>
  );
}
