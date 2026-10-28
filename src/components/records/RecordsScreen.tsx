"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { OfflineBanner, useOnline } from "@/components/OfflineBanner";
import { TabBar } from "@/components/TabBar";
import { LoadError, SectionHeading } from "@/components/today/TodayParts";
import { Spinner } from "@/components/Spinner";
import { TopBar } from "@/components/TopBar";
import { RECORDS_PAGE_DAYS } from "@/config/app";
import * as api from "@/lib/api/records";
import { formatDayTitle, formatShortDate, toDateKey } from "@/lib/date";
import { formatRate } from "@/lib/records";
import type { DateKey, DayRecord, DayRecordPage, WeekSummary } from "@/types";

/** S13 기록. 연속 일수는 보여주지 않는다 */
export function RecordsScreen() {
  const scenario = useMockScenario();
  const online = useOnline();
  const query = useQuery({ queryKey: ["records", scenario], queryFn: api.fetchRecords });
  const today: DateKey = toDateKey(new Date());
  const data = query.data;

  return (
    <>
      <OfflineBanner show={!online || scenario === "offline"} />
      <TopBar title="기록" />

      <main className="flex-1 pb-[calc(var(--tab-bar-height)+var(--safe-bottom)+24px)]">
        {query.isPending && <RecordsSkeleton />}
        {query.isError && <LoadError message="기록을 불러오지 못했어요" onRetry={() => void query.refetch()} />}

        {data && data.days.length === 0 && data.olderBefore === null && (
          <section className="mx-4 mt-2 flex flex-col items-start gap-3 rounded-xl bg-surface-2 px-4 py-5">
            <h2 className="text-[18px] font-bold">아직 기록이 없어요</h2>
            <p className="text-[15px] text-ink-2">할 일을 완료하면 날짜별로 여기에 쌓여요</p>
            <Link
              href="/today"
              className="mt-1 flex h-12 items-center justify-center border-b-[3px] border-caution bg-ink px-5 text-[16px] font-semibold text-surface"
            >
              오늘로 가기
            </Link>
          </section>
        )}

        {data && (data.days.length > 0 || data.olderBefore !== null) && (
          <>
            <WeekPanel week={data.week} />

            <Link href="/records/achievements" className="mx-4 mt-4 flex min-h-12 items-center gap-3 border-y border-line py-2">
              <span className="flex-1 text-[16px]">업적</span>
              <span className="text-[15px] text-ink-2 tabular-nums">배지 {data.earnedAchievementCount}개</span>
              <ChevronRight aria-hidden size={18} className="-ml-1 shrink-0 text-ink-3" />
            </Link>

            <section aria-labelledby="records-days">
              <SectionHeading id="records-days">날짜별 기록</SectionHeading>
              {data.days.length === 0 && (
                <p className="px-5 pt-2 text-[15px] text-ink-2">최근 {RECORDS_PAGE_DAYS}일에는 기록이 없어요</p>
              )}
              {/* 시나리오가 바뀌면 불러온 이전 기록도 처음부터 */}
              <DayList key={scenario} first={data} today={today} />
            </section>
          </>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-(--app-max-width)">
        <TabBar />
      </div>
    </>
  );
}

/** 이번 주 요약. 큰 숫자 대시보드 대신 문장으로 쓴다 */
function WeekPanel({ week }: { week: WeekSummary }) {
  const detail = [
    `실행한 날 ${week.activeDayCount}일`,
    week.completionRate !== null && `실행률 ${formatRate(week.completionRate)}`,
  ].filter(Boolean);
  return (
    <section className="mx-4 mt-2 rounded-xl bg-surface-2 px-4 py-4">
      <h2 className="text-[18px] font-bold tabular-nums">
        {week.doneCount > 0 ? `이번 주 할 일 ${week.doneCount}개를 마쳤어요` : "이번 주에 마친 할 일은 아직 없어요"}
      </h2>
      {/* 마친 할 일이 없을 때 '0일 · 0%'로 탓하는 듯한 줄을 보여주지 않는다 */}
      {week.doneCount > 0 && <p className="mt-0.5 text-[14px] text-ink-2 tabular-nums">{detail.join(" · ")}</p>}
    </section>
  );
}

/** 날짜별 기록 목록과 '이전 기록 더 보기'. 처음엔 최근 RECORDS_PAGE_DAYS일, 누를 때마다 그만큼 더 */
function DayList({ first, today }: { first: DayRecordPage; today: DateKey }) {
  const [older, setOlder] = useState<DayRecordPage[]>([]);
  const days = [first, ...older].flatMap((page) => page.days);
  const nextBefore = (older.at(-1) ?? first).olderBefore;
  const loadMore = useMutation({
    mutationFn: (before: DateKey) => api.fetchDayRecords(before),
    onSuccess: (page) => setOlder((prev) => [...prev, page]),
  });

  return (
    <>
      <ul className="mt-1 px-4">
        {days.map((day) => (
          <DayRow key={day.date} day={day} today={today} />
        ))}
      </ul>
      {nextBefore && (
        <div className="px-4 pt-4">
          {loadMore.isError && (
            <p role="alert" className="pb-2 text-center text-[14px] text-ink-2">
              기록을 불러오지 못했어요. 다시 눌러 주세요
            </p>
          )}
          <button
            type="button"
            disabled={loadMore.isPending}
            onClick={() => loadMore.mutate(nextBefore)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface text-[15px] font-semibold text-ink disabled:opacity-40"
          >
            {loadMore.isPending && <Spinner />}
            이전 기록 더 보기
          </button>
        </div>
      )}
    </>
  );
}

/** 하루 한 줄. 누르면 그날 완료한 할 일과 옮긴 할 일을 펼친다 */
function DayRow({ day, today }: { day: DayRecord; today: DateKey }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const summary = [
    day.plannedCount > 0 ? `완료 ${day.plannedDoneCount}/${day.plannedCount}` : "계획이 없던 날",
    day.plannedCount === 0 && day.doneTasks.length > 0 && `완료 ${day.doneTasks.length}`,
    day.movedTasks.length > 0 && `옮긴 일 ${day.movedTasks.length}`,
  ].filter(Boolean);

  return (
    <li className="border-b border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-13 w-full items-center gap-2 py-2 text-left"
      >
        <span className="min-w-0 flex-1 text-[16px]">{day.date === today ? "오늘" : formatDayTitle(day.date)}</span>
        <span className="shrink-0 text-[14px] text-ink-2 tabular-nums">{summary.join(" · ")}</span>
        <ChevronDown
          aria-hidden
          size={18}
          className={`shrink-0 text-ink-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <ul id={listId} hidden={!open} className="flex flex-col gap-1 pb-3">
        {day.doneTasks.map((task) => (
          <li key={task.id} className="flex items-start gap-2.5 py-1 text-[15px]">
            <Check aria-label="완료" size={16} strokeWidth={2.6} className="mt-0.5 shrink-0" />
            <span className="min-w-0 flex-1">{task.title}</span>
          </li>
        ))}
        {day.movedTasks.map((task) => (
          <li key={task.id} className="flex items-start gap-2.5 py-1 text-[15px]">
            <ArrowRight aria-label="옮김" size={16} className="mt-0.5 shrink-0 text-ink-3" />
            <span className="min-w-0 flex-1">
              <span className="text-ink-2">{task.title}</span>
              <span className="block text-[13px] text-ink-3">
                {task.movedTo ? `${formatShortDate(task.movedTo)}로 옮겼어요` : "날짜 없이 보관했어요"}
              </span>
            </span>
          </li>
        ))}
        {day.doneTasks.length === 0 && day.movedTasks.length === 0 && (
          <li className="py-1 text-[14px] text-ink-3">이날 마친 할 일은 없어요</li>
        )}
      </ul>
    </li>
  );
}

function RecordsSkeleton() {
  return (
    <div aria-label="불러오는 중" className="px-4 pt-2">
      <div className="h-24 rounded-xl bg-surface-2" />
      <div className="mt-4 h-12 border-y border-line" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex h-13 items-center justify-between border-b border-line">
          <div className="h-4 w-32 rounded bg-surface-3" />
          <div className="h-4 w-16 rounded bg-surface-3" />
        </div>
      ))}
    </div>
  );
}
