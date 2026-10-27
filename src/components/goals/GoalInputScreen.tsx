"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BottomActions, OutlineButton, PrimaryButton, TextButton } from "@/components/BottomActions";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { useGoalFlow } from "@/components/goals/GoalFlowProvider";
import { Spinner } from "@/components/Spinner";
import { TopBar } from "@/components/TopBar";
import { AI_TIMEOUT_MS } from "@/config/app";
import * as api from "@/lib/api/goals";
import { toDateKey } from "@/lib/date";

type Status = "idle" | "generating" | "failed";

/** S09 목표 입력 (AI 분해 1) */
export function GoalInputScreen() {
  const scenario = useMockScenario();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { state, update, applyBreakdown } = useGoalFlow();
  const [status, setStatus] = useState<Status>("idle");
  const controller = useRef<AbortController | null>(null);
  const ids = { title: useId(), due: useId(), situation: useId() };

  const usageKey = ["aiUsage", scenario] as const;
  const usage = useQuery({ queryKey: usageKey, queryFn: api.fetchAiUsage });
  const goalCount = useQuery({ queryKey: ["activeGoalCount", scenario], queryFn: api.fetchActiveGoalCount });
  const isFirstEntry = goalCount.data === 0;
  const remaining = usage.data?.remaining;
  const limitReached = remaining === 0;
  const generating = status === "generating";
  const aiUnavailable = limitReached || status === "failed";
  const canSubmit = state.title.trim().length > 0 && !limitReached && usage.isSuccess && !generating;

  // 화면을 떠나면 진행 중인 요청을 끊는다
  useEffect(() => () => controller.current?.abort(), []);

  const generate = async () => {
    if (!canSubmit) return;
    const own = new AbortController();
    controller.current = own;
    setStatus("generating");
    try {
      const breakdown = await api.requestGoalBreakdown(
        {
          title: state.title.trim(),
          dueDate: state.dueDate,
          currentSituation: state.currentSituation.trim() || null,
        },
        AbortSignal.any([own.signal, AbortSignal.timeout(AI_TIMEOUT_MS)]),
      );
      applyBreakdown(breakdown);
      setStatus("idle");
      router.push("/goals/new/drafts");
    } catch {
      // 사용자가 취소했으면 조용히 입력 상태로 돌아간다
      setStatus(own.signal.aborted ? "idle" : "failed");
    } finally {
      void queryClient.invalidateQueries({ queryKey: usageKey });
    }
  };

  const goManual = () => router.push("/goals/new/manual");

  return (
    <>
      <TopBar title="" back={!isFirstEntry} />
      <main className="flex-1 px-5 pb-6">
        <h1 className="pt-2 text-[19px] leading-snug font-bold tracking-[-0.01em]">이루고 싶은 목표를 적어주세요</h1>

        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            void generate();
          }}
        >
          <fieldset disabled={generating} className="flex flex-col gap-5 disabled:opacity-60">
            <Field id={ids.title} label="목표">
              <input
                id={ids.title}
                type="text"
                required
                autoFocus
                enterKeyHint="go"
                maxLength={100}
                value={state.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="백엔드 개발자로 취업하기"
                className={inputClass}
              />
            </Field>
            <Field id={ids.due} label="기한" optional>
              <input
                id={ids.due}
                type="date"
                min={toDateKey(new Date())}
                value={state.dueDate ?? ""}
                onChange={(e) => update({ dueDate: e.target.value || null })}
                className={`${inputClass} tabular-nums`}
              />
            </Field>
            <Field id={ids.situation} label="지금 상황" optional>
              <input
                id={ids.situation}
                type="text"
                enterKeyHint="go"
                maxLength={100}
                value={state.currentSituation}
                onChange={(e) => update({ currentSituation: e.target.value })}
                placeholder="자소서 초안만 있어요"
                className={inputClass}
              />
            </Field>
          </fieldset>
          {/* 키보드의 이동 버튼으로도 제출한다 */}
          <button type="submit" hidden />
        </form>

        {status === "failed" && (
          <p role="alert" className="mt-6 rounded-xl bg-surface-2 px-4 py-3.5 text-[15px]">
            AI가 응답하지 않아요
          </p>
        )}

        {limitReached && (
          <p role="status" className="mt-6 rounded-xl bg-surface-2 px-4 py-3.5 text-[15px]">
            오늘 AI 사용을 모두 썼어요
          </p>
        )}
      </main>

      <BottomActions>
        {generating ? (
          <div className="flex h-12 items-center gap-3" role="status">
            <Spinner />
            <p className="flex-1 text-[15px] text-ink-2">할 일을 만들고 있어요</p>
            <button
              type="button"
              onClick={() => controller.current?.abort()}
              className="h-11 rounded-lg bg-surface-2 px-4 text-[14px] font-semibold text-ink-2"
            >
              취소
            </button>
          </div>
        ) : (
          <>
            {remaining !== undefined && !limitReached && (
              <p className="pb-2 text-center text-[13px] text-ink-3 tabular-nums">오늘 {remaining}번 더 쓸 수 있어요</p>
            )}
            <PrimaryButton disabled={!canSubmit} onClick={() => void generate()}>
              {status === "failed" ? "다시 시도" : "할 일 추천받기"}
            </PrimaryButton>
          </>
        )}
        {/* AI를 쓸 수 없으면 직접 입력이 남은 길이다. 눈에 띄는 버튼으로 둔다 */}
        {aiUnavailable && (
          <div className="mt-2">
            <OutlineButton onClick={goManual}>직접 입력하기</OutlineButton>
          </div>
        )}
        <div className="mt-1 flex justify-center gap-2">
          {!aiUnavailable && (
            <TextButton disabled={generating} onClick={goManual}>
              직접 입력하기
            </TextButton>
          )}
          {isFirstEntry && (
            <TextButton disabled={generating} onClick={() => router.replace("/today")}>
              나중에 하기
            </TextButton>
          )}
        </div>
      </BottomActions>
    </>
  );
}

export const inputClass =
  "h-12 w-full rounded-lg border border-line-strong bg-surface px-3 text-[16px] placeholder:text-ink-3 disabled:bg-surface-2";

export function Field({
  id,
  label,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-semibold text-ink-2">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-3">(선택)</span>}
      </label>
      {children}
    </div>
  );
}
