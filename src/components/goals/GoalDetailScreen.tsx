"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ellipsis, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomActions, OutlineButton, PrimaryButton } from "@/components/BottomActions";
import { BottomSheet } from "@/components/BottomSheet";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { GoalArchiveSheet, GoalCompleteSheet, GoalEditSheet } from "@/components/goals/GoalSheets";
import { GraphicPlaceholder } from "@/components/GraphicPlaceholder";
import { OfflineBanner, useOnline } from "@/components/OfflineBanner";
import { clearAddTaskRequest, hasAddTaskRequest, takePendingToast } from "@/components/pendingToast";
import { Toast } from "@/components/Toast";
import { AddTaskSheet } from "@/components/today/AddTaskSheet";
import { SheetAction } from "@/components/today/TaskActionsSheet";
import { TaskRow } from "@/components/today/TaskRow";
import { CompletedSection, LoadError, SectionHeading } from "@/components/today/TodayParts";
import { TopBar } from "@/components/TopBar";
import { useToast } from "@/components/useToast";
import { BUILDING_LABEL } from "@/config/game";
import * as goalApi from "@/lib/api/goals";
import * as taskApi from "@/lib/api/tasks";
import { canUncomplete } from "@/lib/completion";
import { formatShortDate, toDateKey } from "@/lib/date";
import { goalNotice, groupGoalTasks, remainingTaskCount } from "@/lib/goals";
import { withIGa } from "@/lib/korean";
import { coreDemotedMessage } from "@/lib/today";
import { constructionLabel, STAGE_LABEL } from "@/lib/village";
import type { CreateTaskRequest, DateKey, GoalDetail, Task } from "@/types";

type Sheet = "more" | "addTask" | "edit" | "complete" | "archive" | null;

/** S12 목표 상세 */
export function GoalDetailScreen() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const scenario = useMockScenario();
  const online = useOnline();
  const router = useRouter();
  const queryClient = useQueryClient();
  const detailKey = ["goal", id, scenario] as const;
  const query = useQuery({ queryKey: detailKey, queryFn: () => goalApi.fetchGoalDetail(id), enabled: id !== "" });
  const detail = query.data;
  const [sheet, setSheet] = useState<Sheet>(() => (hasAddTaskRequest() ? "addTask" : null));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { toast, show } = useToast();
  const today: DateKey = toDateKey(new Date());

  // 다른 화면에서 떠나면서 남긴 알림 (AI로 할 일 추가, 할 일 상세의 나누기·삭제)
  useEffect(() => {
    const message = takePendingToast();
    if (message) show(message);
  }, [show]);

  // S09(이 목표에 더하기)의 '직접 추가하기'로 돌아왔으면 할 일 추가를 연 채로 시작한다
  useEffect(() => clearAddTaskRequest(), []);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: detailKey });
    void queryClient.invalidateQueries({ queryKey: ["goals"] });
    void queryClient.invalidateQueries({ queryKey: ["today"] });
    void queryClient.invalidateQueries({ queryKey: ["village"] });
  };

  const patchTask = (taskId: string, patch: Partial<Task>) =>
    queryClient.setQueryData<GoalDetail | null>(
      detailKey,
      (prev) => prev && { ...prev, tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) },
    );

  /** 할 일 체크와 오늘로. 실패하면 되돌리고 '저장하지 못했어요'와 재시도 */
  const taskSave = useMutation({
    mutationFn: ({ run }: { task: Task; run: () => Promise<unknown>; optimistic: Partial<Task>; done: (result: unknown) => string | null; undo?: () => void }) =>
      run(),
    onMutate: ({ task, optimistic }) => {
      setPendingId(task.id);
      const revert = Object.fromEntries(Object.keys(optimistic).map((k) => [k, task[k as keyof Task]])) as Partial<Task>;
      patchTask(task.id, optimistic);
      return { revert };
    },
    onSuccess: (result, { done, undo }) => {
      const message = done(result);
      if (message) show(message, undo && { label: "실행 취소", onClick: undo });
    },
    onError: (_error, variables, context) => {
      if (context) patchTask(variables.task.id, context.revert);
      show("저장하지 못했어요", { label: "다시 시도", onClick: () => taskSave.mutate(variables) });
    },
    onSettled: () => {
      setPendingId(null);
      refresh();
    },
  });

  if (id === "" || query.data === null) {
    return (
      <>
        <TopBar title="" back />
        <main className="flex-1 px-5 pt-2 pb-6">
          <h1 className="text-[19px] font-bold">목표를 찾을 수 없어요</h1>
          <Link
            href="/goals"
            className="mt-6 flex h-12 items-center justify-center rounded-xl border border-line-strong text-[16px] font-semibold"
          >
            목표 목록으로
          </Link>
        </main>
      </>
    );
  }

  // 불러온 뒤의 다시 불러오기 실패는 화면을 지우지 않는다
  if (query.isError && !detail) {
    return (
      <>
        <TopBar title="" back />
        <main className="flex-1 pb-6">
          <h1 className="sr-only">목표 상세</h1>
          <LoadError message="목표를 불러오지 못했어요" onRetry={() => void query.refetch()} />
        </main>
      </>
    );
  }

  if (!detail) {
    return (
      <>
        <TopBar title="" back />
        <main className="flex-1 px-5 pt-2 pb-6" aria-busy="true">
          <h1 className="sr-only">목표 상세</h1>
          <div aria-label="불러오는 중">
            <div className="aspect-[16/10] w-full rounded-lg bg-surface-3" />
            <div className="mt-4 h-6 w-2/3 rounded-md bg-surface-3" />
            <div className="mt-3 h-4 w-1/2 rounded bg-surface-2" />
          </div>
        </main>
      </>
    );
  }

  const { goal, building, tasks } = detail;
  const active = goal.status === "ACTIVE";
  const groups = groupGoalTasks(tasks);
  const doneCount = groups.done.length;
  const notice = goalNotice(goal, tasks, today);
  const buildingName = building ? BUILDING_LABEL[building.type] : null;

  const complete = (task: Task) =>
    taskSave.mutate({
      task,
      run: () => taskApi.completeTask(task.id),
      optimistic: { status: "DONE", completedAt: new Date().toISOString() },
      done: (result) => (result as { message: string | null }).message,
      undo: () => uncomplete(task),
    });

  const uncomplete = (task: Task) =>
    taskSave.mutate({
      task: { ...task, status: "DONE" },
      run: () => taskApi.uncompleteTask(task.id),
      optimistic: { status: "PLANNED", completedAt: null },
      done: () => null,
    });

  const toggle = (task: Task) => {
    if (pendingId === task.id) return;
    if (task.status === "DONE") {
      if (canUncomplete(task, today)) uncomplete(task);
    } else {
      complete(task);
    }
  };

  const moveToday = (task: Task) =>
    taskSave.mutate({
      task,
      run: () => taskApi.rescheduleTask(task.id, today),
      optimistic: { scheduledDate: today },
      done: (result) => ((result as { demotedFromCore: boolean }).demotedFromCore ? coreDemotedMessage(today) : "오늘로 옮겼어요"),
    });

  const createTask = async (req: CreateTaskRequest) => {
    await taskApi.createTask(req);
    refresh();
  };

  const goalAction = async (run: () => Promise<unknown>, message: string) => {
    await run();
    setSheet(null);
    refresh();
    show(message);
  };

  const rowProps = (task: Task) => ({
    task,
    from: "goal" as const,
    pending: pendingId === task.id,
    canToggleOff: canUncomplete(task, today),
    onToggle: toggle,
  });

  const dateCaption = (task: Task) =>
    task.scheduledDate === null ? null : task.scheduledDate === today ? "오늘" : formatShortDate(task.scheduledDate);

  const todayButton = (task: Task) =>
    task.scheduledDate === today ? undefined : (
      <button
        type="button"
        disabled={pendingId === task.id}
        onClick={() => moveToday(task)}
        aria-label={`${task.title} 오늘로`}
        className="h-11 shrink-0 rounded-lg px-2.5 text-[14px] font-semibold text-ink-2 disabled:opacity-40"
      >
        오늘로
      </button>
    );

  return (
    <>
      <OfflineBanner show={!online || scenario === "offline"} />
      <TopBar title="" back />
      <main className={`flex-1 ${active ? "pb-6" : "pb-[calc(24px+var(--safe-bottom))]"}`}>
        <div className="px-5">
          {building && buildingName && (
            <GraphicPlaceholder label={`${buildingName} · ${STAGE_LABEL[building.stage]}`} className="aspect-[16/10] w-full" />
          )}
          <h1 className="mt-4 text-[19px] leading-snug font-bold tracking-[-0.01em]">{goal.title}</h1>
          <dl className="mt-2 flex flex-col gap-1 text-[14px]">
            {goal.dueDate && <MetaRow label="기한">{formatShortDate(goal.dueDate)}</MetaRow>}
            {goal.completionCriteria && <MetaRow label="완료 조건">{goal.completionCriteria}</MetaRow>}
            <MetaRow label="할 일">
              <span className="tabular-nums">
                {doneCount}/{tasks.length}
              </span>
              {building && <span className="text-ink-3"> · {goal.status === "ARCHIVED" ? "공사 중지" : constructionLabel(building)}</span>}
            </MetaRow>
          </dl>

          {notice && (
            <GoalNoticePanel
              notice={notice}
              dueDate={goal.dueDate}
              buildingName={buildingName}
              onResume={() => void goalAction(() => goalApi.resumeGoal(goal.id), "다시 진행해요").catch(() => show("저장하지 못했어요"))}
              onComplete={() => setSheet("complete")}
              onEditDue={() => setSheet("edit")}
              onArchive={() => setSheet("archive")}
            />
          )}
        </div>

        {active && tasks.length === 0 && (
          <section className="mx-5 mt-6 flex flex-col gap-2 rounded-xl bg-surface-2 px-4 py-5">
            <h2 className="text-[16px] font-semibold">연결된 할 일이 없어요</h2>
            <p className="pb-1 text-[14px] text-ink-2">AI가 할 일을 추천하거나, 직접 적을 수 있어요</p>
            <Link
              href={`/goals/new?goal=${encodeURIComponent(goal.id)}`}
              className="flex h-12 items-center justify-center rounded-xl bg-ink text-[16px] font-semibold text-surface"
            >
              AI로 할 일 추가
            </Link>
            <OutlineButton onClick={() => setSheet("addTask")}>직접 추가</OutlineButton>
          </section>
        )}

        {groups.dated.length > 0 && (
          <section aria-labelledby="goal-dated">
            <SectionHeading id="goal-dated">날짜 있는 할 일</SectionHeading>
            <ul className="px-2">
              {groups.dated.map((task) => (
                <TaskRow key={task.id} {...rowProps(task)} caption={dateCaption(task)} trailing={active ? todayButton(task) : undefined} />
              ))}
            </ul>
          </section>
        )}

        {groups.undated.length > 0 && (
          <section aria-labelledby="goal-undated">
            <SectionHeading id="goal-undated">날짜 없는 할 일</SectionHeading>
            <ul className="px-2">
              {groups.undated.map((task) => (
                <TaskRow key={task.id} {...rowProps(task)} caption={null} trailing={active ? todayButton(task) : undefined} />
              ))}
            </ul>
          </section>
        )}

        {groups.done.length > 0 && (
          <CompletedSection count={groups.done.length}>
              {groups.done.map((task) => (
                <TaskRow
                  key={task.id}
                  {...rowProps(task)}
                  caption={task.completedAt ? `${formatShortDate(toDateKey(new Date(task.completedAt)))} 완료` : null}
                />
              ))}
          </CompletedSection>
        )}
      </main>

      {active ? (
        <BottomActions>
          <div className="pointer-events-none absolute inset-x-0 bottom-full pb-2">
            <Toast toast={toast} />
          </div>
          <div className="flex gap-2">
            <PrimaryButton aria-haspopup="dialog" onClick={() => setSheet("addTask")}>
              <Plus aria-hidden size={20} strokeWidth={2.4} />할 일 추가
            </PrimaryButton>
            <button
              type="button"
              aria-label="목표 더보기"
              aria-haspopup="dialog"
              onClick={() => setSheet("more")}
              className="grid size-12 shrink-0 place-items-center rounded-xl border border-line-strong text-ink"
            >
              <Ellipsis aria-hidden size={22} />
            </button>
          </div>
        </BottomActions>
      ) : (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-(--app-max-width) pb-[calc(16px+var(--safe-bottom))]">
          <Toast toast={toast} />
        </div>
      )}

      <BottomSheet open={sheet === "more"} onClose={() => setSheet(null)} title={goal.title}>
        <ul className="flex flex-col">
          <li>
            <SheetAction label="AI로 할 일 추가" onClick={() => router.push(`/goals/new?goal=${encodeURIComponent(goal.id)}`)} />
          </li>
          <li>
            <SheetAction label="목표 수정" onClick={() => setSheet("edit")} />
          </li>
          <li>
            <SheetAction label="목표 완료" onClick={() => setSheet("complete")} />
          </li>
          <li>
            <SheetAction label="보관" onClick={() => setSheet("archive")} />
          </li>
        </ul>
      </BottomSheet>

      <AddTaskSheet
        open={sheet === "addTask"}
        onClose={() => setSheet(null)}
        today={today}
        goals={detail.activeGoals}
        knownTasks={detail.todayTasks}
        defaultDate="NONE"
        defaultGoalId={goal.id}
        onSubmit={createTask}
      />
      <GoalEditSheet
        key={`${goal.title}|${goal.dueDate}|${goal.completionCriteria}|${sheet === "edit"}`}
        open={sheet === "edit"}
        goal={goal}
        today={today}
        onClose={() => setSheet(null)}
        onSubmit={(req) => goalAction(() => goalApi.updateGoal(goal.id, req), "목표를 고쳤어요")}
      />
      <GoalCompleteSheet
        // 열 때마다 '그대로 두기'에서 시작한다
        key={`complete-${sheet === "complete"}`}
        open={sheet === "complete"}
        buildingName={buildingName}
        remainingCount={remainingTaskCount(tasks)}
        onClose={() => setSheet(null)}
        onConfirm={(remaining) =>
          goalAction(() => goalApi.completeGoal(goal.id, remaining), buildingName ? `${withIGa(buildingName)} 완성됐어요` : "목표를 완료했어요")
        }
      />
      <GoalArchiveSheet
        key={`archive-${sheet === "archive"}`}
        open={sheet === "archive"}
        onClose={() => setSheet(null)}
        onConfirm={() => goalAction(() => goalApi.archiveGoal(goal.id), "목표를 보관했어요")}
      />
    </>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-16 shrink-0 text-ink-3">{label}</dt>
      <dd className="min-w-0 flex-1 text-ink-2">{children}</dd>
    </div>
  );
}

interface GoalNoticePanelProps {
  notice: NonNullable<ReturnType<typeof goalNotice>>;
  dueDate: DateKey | null;
  buildingName: string | null;
  onResume: () => void;
  onComplete: () => void;
  onEditDue: () => void;
  onArchive: () => void;
}

/** 목표 상세 위쪽 안내 칸. 기한이 지나도 실패로 표시하지 않고, 할 일을 모두 마쳐도 묻기만 한다 */
function GoalNoticePanel({ notice, dueDate, buildingName, onResume, onComplete, onEditDue, onArchive }: GoalNoticePanelProps) {
  const content = {
    ARCHIVED: { title: "보관한 목표예요", body: "건물 공사가 멈춰 있어요", actions: [{ label: "다시 진행하기", onClick: onResume }] },
    COMPLETED: { title: "완료한 목표예요", body: buildingName ? `${withIGa(buildingName)} 완성됐어요` : null, actions: [] },
    ALL_TASKS_DONE: { title: "연결된 할 일을 모두 마쳤어요", body: "목표를 완료할까요?", actions: [{ label: "목표 완료", onClick: onComplete }] },
    DUE_PASSED: {
      title: "기한을 다시 정할까요?",
      body: dueDate ? `${formatShortDate(dueDate)}이 기한이었어요` : null,
      actions: [
        { label: "기한 바꾸기", onClick: onEditDue },
        { label: "보관", onClick: onArchive },
      ],
    },
  }[notice];

  return (
    <div role="status" className="mt-4 rounded-xl bg-surface-2 px-4 py-3.5">
      <p className="text-[15px] font-semibold">{content.title}</p>
      {content.body && <p className="mt-0.5 text-[14px] text-ink-2">{content.body}</p>}
      {content.actions.length > 0 && (
        <div className="mt-3 flex gap-2">
          {content.actions.map((action, i) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`h-11 rounded-lg px-4 text-[14px] font-semibold ${
                i === 0 ? "bg-ink text-surface" : "border border-line-strong bg-surface text-ink"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
