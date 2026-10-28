"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState } from "react";
import { BottomActions, OutlineButton } from "@/components/BottomActions";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { OfflineBanner, useOnline } from "@/components/OfflineBanner";
import { setPendingToast } from "@/components/pendingToast";
import { PickerRow } from "@/components/PickerRow";
import { Switch } from "@/components/Switch";
import { DeleteTaskSheet } from "@/components/tasks/DeleteTaskSheet";
import { SplitSheet } from "@/components/tasks/SplitSheet";
import { TaskDateSheet } from "@/components/tasks/TaskDateSheet";
import { CoreReplaceSheet } from "@/components/today/CoreReplaceSheet";
import { GoalPickerSheet } from "@/components/today/GoalPickerSheet";
import { LoadError } from "@/components/today/TodayParts";
import { Toast } from "@/components/Toast";
import { TopBar } from "@/components/TopBar";
import { useToast } from "@/components/useToast";
import { TASK_MEMO_MAX_LENGTH, TASK_TITLE_MAX_LENGTH } from "@/config/app";
import * as api from "@/lib/api/tasks";
import { canUncomplete } from "@/lib/completion";
import { formatDayTitle, formatShortDate, isSameDay, toDateKey } from "@/lib/date";
import { coreDemotedMessage, isCoreFull } from "@/lib/today";
import type { DateKey, Task, TaskDetail } from "@/types";

type Sheet = "date" | "goal" | "coreReplace" | "split" | "delete" | null;

interface SaveVariables {
  run: () => Promise<unknown>;
  optimistic?: Partial<Task>;
  /** 저장한 뒤 알림. 결과를 보고 정할 수도 있다 */
  done?: string | ((result: unknown) => string | undefined);
}

/** S04 할 일 상세 */
export function TaskDetailScreen() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const scenario = useMockScenario();
  const online = useOnline();
  const router = useRouter();
  const queryClient = useQueryClient();
  const detailKey = ["task", id, scenario] as const;
  const query = useQuery({ queryKey: detailKey, queryFn: () => api.fetchTaskDetail(id), enabled: id !== "" });
  const detail = query.data;
  const [sheet, setSheet] = useState<Sheet>(null);
  const { toast, show } = useToast();
  const today: DateKey = toDateKey(new Date());

  const patchTask = (patch: Partial<Task>) =>
    queryClient.setQueryData<TaskDetail | null>(detailKey, (prev) => prev && { ...prev, task: { ...prev.task, ...patch } });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: detailKey });
    void queryClient.invalidateQueries({ queryKey: ["today"] });
  };

  /** 바꾸는 즉시 저장한다. 실패하면 이 저장이 바꾼 값만 되돌리고 '저장하지 못했어요'와 재시도 */
  const save = useMutation({
    mutationFn: ({ run }: SaveVariables) => run(),
    onMutate: async ({ optimistic }) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const before = queryClient.getQueryData<TaskDetail | null>(detailKey)?.task;
      if (!optimistic || !before) return { revert: undefined };
      const revert = Object.fromEntries(Object.keys(optimistic).map((k) => [k, before[k as keyof Task]])) as Partial<Task>;
      patchTask(optimistic);
      return { revert };
    },
    onSuccess: (result, { done }) => {
      const message = typeof done === "function" ? done(result) : done;
      if (message) show(message);
    },
    // 열린 시트는 그대로 둔다. 날짜, 목표, 핵심 교체 시트는 고르면 스스로 닫힌다
    onError: (_error, variables, context) => {
      if (context?.revert) patchTask(context.revert);
      show("저장하지 못했어요", { label: "다시 시도", onClick: () => save.mutate(variables) });
    },
    onSettled: refresh,
  });

  /** 화면을 떠나는 중에 남은 제목, 메모를 저장한다. 화면이 없으므로 알림과 되돌리기 없이 보낸다 */
  const saveOnLeave = (patch: Pick<Partial<Task>, "title" | "memo">) => {
    void api
      .updateTask(id, patch)
      .then(() => queryClient.invalidateQueries({ queryKey: ["today"] }))
      .catch(() => undefined);
  };

  /**
   * 나누기, 삭제 뒤: 지금 할 일이 없어지므로 이전 화면으로 돌아가 알림을 보여준다.
   * 앱 안에서 들어온 경우(from)만 뒤로 가고, 바로 열었으면 오늘 화면으로 간다
   */
  const leave = (message: string) => {
    setPendingToast(message);
    void queryClient.invalidateQueries({ queryKey: ["today"] });
    if (params.get("from")) router.back();
    else router.replace("/today");
  };

  const back = (
    <>
      <OfflineBanner show={!online || scenario === "offline"} />
      <TopBar title="할 일" back />
    </>
  );

  if (id === "" || query.data === null) {
    return (
      <>
        {back}
        <main className="flex-1 px-5 pt-2 pb-6">
          <h2 className="text-[20px]">할 일을 찾을 수 없어요</h2>
          <p className="mt-2 text-[15px] text-ink-2">지웠거나 나눈 할 일이에요</p>
          <Link
            href="/today"
            className="mt-6 flex h-12 items-center justify-center rounded-xl border border-line-strong text-[16px] font-semibold"
          >
            오늘로 가기
          </Link>
        </main>
      </>
    );
  }

  if (query.isError) {
    return (
      <>
        {back}
        <main className="flex-1 pb-6">
          <LoadError onRetry={() => void query.refetch()} />
        </main>
      </>
    );
  }

  if (!detail) {
    return (
      <>
        {back}
        <main className="flex-1 px-5 pt-2 pb-6" aria-busy="true">
          <DetailSkeleton />
        </main>
      </>
    );
  }

  const { task, goals, dayCoreTasks } = detail;
  const done = task.status === "DONE";
  const goal = goals.find((g) => g.id === task.goalId) ?? null;
  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const uncompletable = canUncomplete(task, today);

  const toggleCore = (next: boolean) => {
    if (next && isCoreFull(dayCoreTasks)) {
      setSheet("coreReplace");
      return;
    }
    save.mutate({ run: () => api.setTaskCore(task.id, next), optimistic: { isCore: next } });
  };

  const changeDate = (date: DateKey | null) =>
    date === null
      ? save.mutate({ run: () => api.unscheduleTask(task.id), optimistic: { scheduledDate: null, isCore: false } })
      : save.mutate({
          run: () => api.rescheduleTask(task.id, date),
          optimistic: { scheduledDate: date },
          // 옮긴 날의 핵심 할 일이 가득 차서 일반 할 일이 됐으면 말없이 바꾸지 않고 알린다
          done: (result) => ((result as { demotedFromCore: boolean }).demotedFromCore ? coreDemotedMessage(date) : undefined),
        });

  return (
    <>
      {back}
      <main className="flex-1 px-5 pb-6">
        <TitleField
          key={task.title}
          value={task.title}
          onSave={(title) => save.mutate({ run: () => api.updateTask(task.id, { title }), optimistic: { title } })}
          onLeave={(title) => saveOnLeave({ title })}
        />

        {done && task.completedAt && (
          <div className="mt-3 rounded-xl bg-surface-2 px-4 py-3.5">
            <p className="text-[15px] font-semibold">
              {isSameDay(task.completedAt, today) ? "오늘" : `${formatShortDate(toDateKey(new Date(task.completedAt)))}에`} 완료했어요
            </p>
            <p className="mt-0.5 text-[13px] text-ink-2">날짜, 핵심, 연결 목표는 바꿀 수 없어요</p>
          </div>
        )}

        <div className="mt-4 divide-y divide-line border-y border-line">
          <PickerRow
            label="날짜"
            value={task.scheduledDate ? formatDayTitle(task.scheduledDate) : "날짜 없음"}
            empty={!task.scheduledDate}
            onClick={done ? undefined : () => setSheet("date")}
          />
          <Switch
            label="핵심 할 일"
            checked={task.isCore}
            disabled={done || task.scheduledDate === null}
            onChange={toggleCore}
            hint={!done && task.scheduledDate === null ? "날짜가 있을 때만 정할 수 있어요" : undefined}
          />
          <PickerRow
            label="연결 목표"
            value={goal?.title ?? "목표 없음"}
            empty={!goal}
            onClick={done ? undefined : () => setSheet("goal")}
          />
          <Switch
            label="매일 반복"
            checked={task.recurrence === "DAILY"}
            onChange={(on) => {
              const recurrence = on ? "DAILY" : null;
              save.mutate({ run: () => api.updateTask(task.id, { recurrence }), optimistic: { recurrence } });
            }}
          />
        </div>

        <MemoField
          key={task.memo ?? ""}
          value={task.memo}
          onSave={(memo) => save.mutate({ run: () => api.updateTask(task.id, { memo }), optimistic: { memo } })}
          onLeave={(memo) => saveOnLeave({ memo })}
        />
      </main>

      <BottomActions>
        <div className="pointer-events-none absolute inset-x-0 bottom-full pb-2">
          <Toast toast={toast} />
        </div>
        <div className="flex gap-2">
          <OutlineButton onClick={() => setSheet("delete")}>삭제</OutlineButton>
          {done && uncompletable ? (
            <OutlineButton
              disabled={save.isPending}
              onClick={() =>
                save.mutate({
                  run: () => api.uncompleteTask(task.id),
                  optimistic: { status: "PLANNED", completedAt: null },
                  done: "완료를 취소했어요",
                })
              }
            >
              완료 취소
            </OutlineButton>
          ) : (
            <OutlineButton disabled={done} onClick={() => setSheet("split")}>
              나누기
            </OutlineButton>
          )}
        </div>
      </BottomActions>

      <TaskDateSheet
        key={task.scheduledDate ?? "none"}
        open={sheet === "date"}
        today={today}
        value={task.scheduledDate}
        onClose={() => setSheet(null)}
        onPick={changeDate}
      />
      <GoalPickerSheet
        open={sheet === "goal"}
        goals={activeGoals}
        value={task.goalId}
        onClose={() => setSheet(null)}
        onSelect={(goalId) => save.mutate({ run: () => api.updateTask(task.id, { goalId }), optimistic: { goalId } })}
      />
      <CoreReplaceSheet
        incoming={sheet === "coreReplace" ? task : null}
        coreTasks={dayCoreTasks}
        onClose={() => setSheet(null)}
        onReplace={(remove) =>
          save.mutate({ run: () => api.replaceCoreTask(remove.id, task.id), optimistic: { isCore: true } })
        }
      />
      <SplitSheet
        open={sheet === "split"}
        onClose={() => setSheet(null)}
        onSubmit={async (titles) => {
          const { count } = await api.splitTask(task.id, titles);
          setSheet(null);
          leave(`할 일 ${count}개로 나눴어요`);
        }}
      />
      <DeleteTaskSheet
        open={sheet === "delete"}
        done={done}
        onClose={() => setSheet(null)}
        onConfirm={async () => {
          await api.deleteTask(task.id);
          setSheet(null);
          leave("할 일을 지웠어요");
        }}
      />
    </>
  );
}

/** 자동 높이 입력칸. 내용이 늘면 칸도 늘어난다 */
function useAutoHeight(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return ref;
}

/**
 * 입력칸을 벗어나지 않고 화면을 떠나도(뒤로 가기 몸짓, 앱 전환, 탭 닫기) 적던 내용을 저장한다.
 * blur가 오지 않는 경우를 위해 화면 숨김, pagehide, 화면에서 빠질 때 남은 내용을 보낸다.
 * gone: 화면이 사라지는 중이라 알림과 되돌리기를 보여줄 수 없다. 앱 전환(숨김)은 화면이 남아 있으므로 false
 */
function useSaveOnLeave(flush: (gone: boolean) => void) {
  const onLeave = useEffectEvent(flush);
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") onLeave(false);
    };
    const onPageHide = () => onLeave(true);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onHide);
      onLeave(true);
    };
  }, []);
}

interface FieldProps<T> {
  value: T;
  onSave: (value: T) => void;
  /** 화면이 사라지는 중의 저장 (알림, 되돌리기 없음) */
  onLeave: (value: T) => void;
}

/** 제목. 입력칸을 벗어나면 저장한다. 비우고 벗어나면 원래 제목으로 돌아간다 */
function TitleField({ value, onSave, onLeave }: FieldProps<string>) {
  const [draft, setDraft] = useState(value);
  const ref = useAutoHeight(draft);
  // 마지막으로 보낸 제목. 같은 내용을 두 번 보내지 않는다
  const sent = useRef(value);

  const pendingTitle = () => {
    const title = draft.trim();
    return title && title !== sent.current ? title : null;
  };

  const commit = () => {
    const title = pendingTitle();
    if (!title) {
      setDraft(sent.current);
      return;
    }
    sent.current = title;
    onSave(title);
  };

  useSaveOnLeave((gone) => {
    const title = pendingTitle();
    if (!title) return;
    sent.current = title;
    (gone ? onLeave : onSave)(title);
  });

  return (
    <div className="mt-1 -ml-2 -mr-3 flex items-start">
      <textarea
        ref={ref}
        rows={1}
        aria-label="할 일 제목"
        enterKeyHint="done"
        maxLength={TASK_TITLE_MAX_LENGTH}
        value={draft}
        // 제목은 한 줄이다. 붙여 넣은 줄바꿈은 띄어쓰기로 바꾼다
        onChange={(e) => setDraft(e.target.value.replace(/\n+/g, " "))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        onBlur={commit}
        className="peer block min-w-0 flex-1 resize-none overflow-hidden rounded-lg px-2 py-1.5 text-[19px] leading-snug font-bold tracking-[-0.01em] focus:bg-surface-2"
      />
      {/* 고칠 수 있는 제목이라는 표시 (빠른 추가의 미리보기와 같은 연필). 누르면 제목을 고친다.
          입력칸에 이미 이름이 있으므로 화면 읽기와 탭 이동에서는 뺀다. 고치는 동안은 숨긴다 */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => {
          const el = ref.current;
          if (!el) return;
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }}
        className="grid size-11 shrink-0 place-items-center text-ink-3 peer-focus:invisible"
      >
        <Pencil size={16} />
      </button>
    </div>
  );
}

/** 메모. 선택 입력. 입력칸을 벗어나면 저장하고, 비우면 메모를 지운다 */
function MemoField({ value, onSave, onLeave }: FieldProps<string | null>) {
  const id = useId();
  const [draft, setDraft] = useState(value ?? "");
  const ref = useAutoHeight(draft);
  const sent = useRef(value);

  const pendingMemo = (): { memo: string | null } | null => {
    const memo = draft.trim() || null;
    return memo !== sent.current ? { memo } : null;
  };

  useSaveOnLeave((gone) => {
    const change = pendingMemo();
    if (!change) return;
    sent.current = change.memo;
    (gone ? onLeave : onSave)(change.memo);
  });

  return (
    <div className="mt-6 flex flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-semibold text-ink-2">
        메모
      </label>
      <textarea
        ref={ref}
        id={id}
        rows={3}
        maxLength={TASK_MEMO_MAX_LENGTH}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const change = pendingMemo();
          if (!change) return;
          sent.current = change.memo;
          onSave(change.memo);
        }}
        placeholder="메모를 적어요"
        className="min-h-24 w-full resize-none overflow-hidden rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-[16px] leading-relaxed placeholder:text-ink-3"
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div aria-label="불러오는 중" className="flex flex-col">
      <div className="mt-2.5 h-7 w-3/4 rounded-md bg-surface-3" />
      <div className="mt-6 flex flex-col divide-y divide-line border-y border-line">
        {["w-24", "w-28", "w-32", "w-24"].map((w, i) => (
          <div key={i} className="flex h-12 items-center">
            <div className={`h-4 ${w} rounded bg-surface-3`} />
          </div>
        ))}
      </div>
      <div className="mt-6 h-24 rounded-lg bg-surface-2" />
    </div>
  );
}
