"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { OfflineBanner, useOnline } from "@/components/OfflineBanner";
import { TabBar } from "@/components/TabBar";
import { Toast, type ToastState } from "@/components/Toast";
import { TopBar } from "@/components/TopBar";
import { CoreReplaceSheet } from "@/components/today/CoreReplaceSheet";
import { EmptyTodayCard } from "@/components/today/EmptyTodayCard";
import { ListSkeleton, OverdueSheet } from "@/components/today/OverdueSheet";
import { PlaceholderSheet } from "@/components/today/PlaceholderSheet";
import { TaskActionsSheet } from "@/components/today/TaskActionsSheet";
import { TaskRow } from "@/components/today/TaskRow";
import {
  AllDoneMessage,
  BonusProgress,
  CompletedSection,
  LoadError,
  NoCoreHint,
  ProgressSummary,
  SectionHeading,
  TodayNotice,
} from "@/components/today/TodayParts";
import { UndatedSheet } from "@/components/today/UndatedSheet";
import { TOAST_DURATION_MS } from "@/config/app";
import * as api from "@/lib/api/tasks";
import { canUncomplete } from "@/lib/completion";
import { formatDayTitle, formatShortDate, toDateKey } from "@/lib/date";
import { buildTodayView, isCoreFull } from "@/lib/today";
import type { DateKey, QuickTaskTemplate, Task, TodayPlan } from "@/types";

type Sheet =
  | { kind: "actions"; task: Task }
  | { kind: "coreReplace"; task: Task }
  | { kind: "overdue" }
  | { kind: "undated" }
  | { kind: "addTask" }
  | { kind: "quickAdd"; template: QuickTaskTemplate }
  | null;

/** S02 오늘 */
export function TodayScreen() {
  const scenario = useMockScenario();
  const online = useOnline();
  const queryClient = useQueryClient();
  const todayKey = ["today", scenario] as const;
  const overdueKey = ["overdue", scenario] as const;

  const todayQuery = useQuery({ queryKey: todayKey, queryFn: api.fetchTodayPlan });
  const plan = todayQuery.data;

  const [sheet, setSheet] = useState<Sheet>(null);
  const overdueQuery = useQuery({
    queryKey: overdueKey,
    queryFn: api.fetchOverdueTasks,
    enabled: sheet?.kind === "overdue",
  });

  // 알림과, 알림이 떠 있는 동안 제자리에 남길 방금 완료한 할 일
  const [toast, setToast] = useState<ToastState | null>(null);
  const [lingeringId, setLingeringId] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastSeq = useRef(0);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const hideToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
    setLingeringId(null);
  }, []);

  const showToast = useCallback(
    (message: string, action?: ToastState["action"], lingerId: string | null = null) => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastSeq.current += 1;
      setToast({ id: toastSeq.current, message, action });
      setLingeringId(lingerId);
      toastTimer.current = setTimeout(hideToast, TOAST_DURATION_MS);
    },
    [hideToast],
  );

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: todayKey });
    void queryClient.invalidateQueries({ queryKey: overdueKey });
  };

  const patchTask = (id: string, patch: Partial<Task>) => {
    queryClient.setQueryData<TodayPlan>(todayKey, (prev) =>
      prev && { ...prev, tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) },
    );
  };

  /** 저장 실패: 변경을 확정하지 않고 '저장하지 못했어요'와 재시도 */
  const saveFailed = (retry: () => void) => showToast("저장하지 못했어요", { label: "다시 시도", onClick: retry });

  const completion = useMutation({
    mutationFn: (task: Task) => api.completeTask(task.id),
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: todayKey });
      const previous = queryClient.getQueryData<TodayPlan>(todayKey);
      patchTask(task.id, { status: "DONE", completedAt: new Date().toISOString() });
      setPendingId(task.id);
      return { previous };
    },
    onSuccess: (result, task) => {
      if (result.message) {
        showToast(result.message, { label: "실행 취소", onClick: () => uncompletion.mutate(task) }, task.id);
      }
    },
    onError: (_error, task, context) => {
      if (context?.previous) queryClient.setQueryData(todayKey, context.previous);
      saveFailed(() => completion.mutate(task));
    },
    onSettled: () => {
      setPendingId(null);
      refresh();
    },
  });

  const uncompletion = useMutation({
    mutationFn: (task: Task) => api.uncompleteTask(task.id),
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: todayKey });
      const previous = queryClient.getQueryData<TodayPlan>(todayKey);
      patchTask(task.id, { status: "PLANNED", completedAt: null });
      setPendingId(task.id);
      hideToast();
      return { previous };
    },
    onError: (_error, task, context) => {
      if (context?.previous) queryClient.setQueryData(todayKey, context.previous);
      saveFailed(() => uncompletion.mutate(task));
    },
    onSettled: () => {
      setPendingId(null);
      refresh();
    },
  });

  /** 핵심 지정, 날짜 바꾸기처럼 알림 없이 저장하는 변경 */
  const save = useMutation({
    mutationFn: ({ run }: { run: () => Promise<unknown>; done?: string; taskId: string }) => run(),
    onMutate: ({ taskId }) => setPendingId(taskId),
    onSuccess: (_result, { done }) => {
      if (done) showToast(done);
    },
    onError: (_error, variables) => saveFailed(() => save.mutate(variables)),
    onSettled: () => {
      setPendingId(null);
      refresh();
    },
  });

  const today: DateKey = plan?.date ?? toDateKey(new Date());
  const view = useMemo(
    () => (plan ? buildTodayView(plan, lingeringId ? new Set([lingeringId]) : undefined) : null),
    [plan, lingeringId],
  );
  const goalTitle = (task: Task) => plan?.goals.find((g) => g.id === task.goalId)?.title ?? null;

  const toggle = (task: Task) => {
    if (pendingId === task.id) return;
    if (task.status === "DONE") {
      if (canUncomplete(task, today)) uncompletion.mutate(task);
    } else {
      completion.mutate(task);
    }
  };

  const toggleCore = (task: Task) => {
    if (!plan) return;
    if (!task.isCore && isCoreFull(plan.tasks)) {
      setSheet({ kind: "coreReplace", task });
      return;
    }
    save.mutate({ taskId: task.id, run: () => api.setTaskCore(task.id, !task.isCore) });
  };

  const reschedule = (task: Task, date: DateKey) =>
    save.mutate({
      taskId: task.id,
      run: () => api.rescheduleTask(task.id, date),
      done: date === today ? undefined : `${formatShortDate(date)}로 옮겼어요`,
    });

  const unschedule = (task: Task) =>
    save.mutate({ taskId: task.id, run: () => api.unscheduleTask(task.id), done: "날짜 없이 보관했어요" });

  const moveToday = (task: Task) => reschedule(task, today);

  // 지난 할 일을 모두 정리하면 시트를 닫는다
  const overdueCleared = overdueQuery.isSuccess && overdueQuery.data.tasks.length === 0;

  const rowProps = (task: Task) => ({
    task,
    goalTitle: goalTitle(task),
    canToggleOff: canUncomplete(task, today),
    pending: pendingId === task.id,
    onToggle: toggle,
    onMore: (t: Task) => setSheet({ kind: "actions", task: t }),
  });

  const hasActiveGoals = plan?.goals.some((g) => g.status === "ACTIVE") ?? false;

  return (
    <>
      <OfflineBanner show={!online || scenario === "offline"} />
      <TopBar
        title={formatDayTitle(today)}
        action={
          <Link href="/settings" aria-label="설정" className="grid size-11 place-items-center rounded-full text-ink-2">
            <Settings aria-hidden size={22} />
          </Link>
        }
      />

      <main className="flex-1 pb-[calc(var(--tab-bar-height)+var(--safe-bottom)+88px)]">
        {todayQuery.isPending && (
          <div className="px-2 pt-4">
            <ListSkeleton />
          </div>
        )}

        {todayQuery.isError && <LoadError onRetry={() => void todayQuery.refetch()} />}

        {plan && view && (
          <>
            <TodayNotice
              notice={view.notice}
              overdueCount={plan.overdueCount}
              onOpenOverdue={() => setSheet({ kind: "overdue" })}
            />

            {view.isEmpty ? (
              <EmptyTodayCard
                undatedTasks={plan.undatedTasks}
                goals={plan.goals}
                quickTemplates={plan.quickTemplates}
                hasActiveGoals={hasActiveGoals}
                pendingId={pendingId}
                onPickUndated={moveToday}
                onShowAllUndated={() => setSheet({ kind: "undated" })}
                onQuickAdd={(template) => setSheet({ kind: "quickAdd", template })}
                onManualAdd={() => setSheet({ kind: "addTask" })}
              />
            ) : (
              <>
                <ProgressSummary
                  coreDone={view.coreDoneCount}
                  coreTotal={view.coreTasks.length}
                  done={view.doneCount}
                  total={view.totalCount}
                />

                {view.allDone && <AllDoneMessage showVillageLink={view.notice !== "HOUSE_UPGRADE"} />}

                <section aria-labelledby="core-heading">
                  <SectionHeading id="core-heading">핵심 할 일</SectionHeading>
                  {view.coreTasks.length > 0 ? (
                    <ul className="px-2">
                      {view.coreTasks.map((task) => (
                        <TaskRow key={task.id} {...rowProps(task)} />
                      ))}
                    </ul>
                  ) : (
                    <NoCoreHint />
                  )}
                </section>

                <BonusProgress count={view.normalDoneCount} earned={view.dailyBonusEarned} />

                {view.normalTasks.length > 0 && (
                  <section aria-labelledby="normal-heading">
                    <SectionHeading id="normal-heading">할 일</SectionHeading>
                    <ul className="px-2">
                      {view.normalTasks.map((task) => (
                        <TaskRow key={task.id} {...rowProps(task)} />
                      ))}
                    </ul>
                  </section>
                )}

                <CompletedSection count={view.doneNormalTasks.length}>
                  {view.doneNormalTasks.map((task) => (
                    <TaskRow key={task.id} {...rowProps(task)} />
                  ))}
                </CompletedSection>
              </>
            )}
          </>
        )}
      </main>

      {/* 엄지가 닿는 아래쪽: 알림, 할 일 추가, 하단 탭 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-(--app-max-width)">
        <div className="pb-2">
          <Toast toast={toast} />
        </div>
        <div className="pointer-events-auto bg-linear-to-t from-surface from-60% to-transparent px-4 pt-2 pb-2">
          <button
            type="button"
            onClick={() => setSheet({ kind: "addTask" })}
            aria-haspopup="dialog"
            className="flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-ink text-[16px] font-semibold text-surface"
          >
            <Plus aria-hidden size={20} strokeWidth={2.4} />
            할 일 추가
          </button>
        </div>
        <div className="pointer-events-auto">
          <TabBar />
        </div>
      </div>

      <TaskActionsSheet
        task={sheet?.kind === "actions" ? sheet.task : null}
        today={today}
        onClose={() => setSheet(null)}
        onToggleCore={toggleCore}
        onReschedule={reschedule}
        onUnschedule={unschedule}
      />
      <CoreReplaceSheet
        incoming={sheet?.kind === "coreReplace" ? sheet.task : null}
        coreTasks={view?.coreTasks ?? []}
        onClose={() => setSheet(null)}
        onReplace={(remove, add) =>
          save.mutate({ taskId: add.id, run: () => api.replaceCoreTask(remove.id, add.id) })
        }
      />
      <OverdueSheet
        open={sheet?.kind === "overdue" && !overdueCleared}
        onClose={() => setSheet(null)}
        today={today}
        tasks={overdueQuery.data?.tasks}
        goals={overdueQuery.data?.goals ?? []}
        loading={overdueQuery.isPending}
        pendingId={pendingId}
        onMoveToday={moveToday}
        onReschedule={reschedule}
        onUnschedule={unschedule}
      />
      <UndatedSheet
        open={sheet?.kind === "undated"}
        onClose={() => setSheet(null)}
        tasks={plan?.undatedTasks ?? []}
        goals={plan?.goals ?? []}
        pendingId={pendingId}
        onPick={(task) => {
          moveToday(task);
          setSheet(null);
        }}
      />
      <PlaceholderSheet open={sheet?.kind === "addTask"} onClose={() => setSheet(null)} title="할 일 추가" screenId="S03" />
      <PlaceholderSheet
        open={sheet?.kind === "quickAdd"}
        onClose={() => setSheet(null)}
        title={sheet?.kind === "quickAdd" ? sheet.template.keyword : "빠른 추가"}
        screenId="S16"
      />
    </>
  );
}
