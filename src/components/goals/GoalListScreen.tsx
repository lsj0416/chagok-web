"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { ChoiceChip } from "@/components/ChoiceChip";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { GraphicPlaceholder } from "@/components/GraphicPlaceholder";
import { OfflineBanner, useOnline } from "@/components/OfflineBanner";
import { TabBar } from "@/components/TabBar";
import { LoadError } from "@/components/today/TodayParts";
import { TopBar } from "@/components/TopBar";
import { BUILDING_LABEL } from "@/config/game";
import * as api from "@/lib/api/goals";
import { formatShortDate } from "@/lib/date";
import { EMPTY_FILTER_MESSAGE, filterGoals, GOAL_STATUS_LABEL } from "@/lib/goals";
import { STAGE_LABEL } from "@/lib/village";
import type { GoalStatus, GoalSummary } from "@/types";

const FILTERS: GoalStatus[] = ["ACTIVE", "COMPLETED", "ARCHIVED"];

/** S08 목표 목록 */
export function GoalListScreen() {
  const scenario = useMockScenario();
  const online = useOnline();
  const query = useQuery({ queryKey: ["goals", scenario], queryFn: api.fetchGoals });
  const [filter, setFilter] = useState<GoalStatus>("ACTIVE");
  const filterLabel = useId();

  const summaries = query.data ?? [];
  const visible = filterGoals(summaries, filter);
  const noGoals = query.isSuccess && summaries.length === 0;

  return (
    <>
      <OfflineBanner show={!online || scenario === "offline"} />
      <TopBar title="목표" />

      <main className="flex-1 pb-[calc(var(--tab-bar-height)+var(--safe-bottom)+88px)]">
        {query.isPending && <GoalListSkeleton />}
        {query.isError && <LoadError message="목표를 불러오지 못했어요" onRetry={() => void query.refetch()} />}

        {noGoals && (
          <section className="mx-4 mt-4 flex flex-col items-start gap-3 rounded-xl bg-surface-2 px-4 py-5">
            <h2 className="text-[18px] font-bold">목표가 아직 없어요</h2>
            <p className="text-[15px] text-ink-2">목표 하나가 마을의 건물 하나가 돼요</p>
            <Link
              href="/goals/new"
              className="mt-1 flex h-12 items-center justify-center rounded-xl bg-ink px-5 text-[16px] font-semibold text-surface"
            >
              AI로 첫 목표 만들기
            </Link>
          </section>
        )}

        {query.isSuccess && !noGoals && (
          <>
            <p id={filterLabel} className="sr-only">
              목표 상태
            </p>
            <div role="radiogroup" aria-labelledby={filterLabel} className="flex gap-2 overflow-x-auto px-4 pt-1">
              {FILTERS.map((status) => (
                <ChoiceChip key={status} selected={filter === status} onClick={() => setFilter(status)}>
                  {GOAL_STATUS_LABEL[status]}
                </ChoiceChip>
              ))}
            </div>

            {visible.length === 0 ? (
              <p className="px-5 pt-10 text-center text-[15px] text-ink-2">{EMPTY_FILTER_MESSAGE[filter]}</p>
            ) : (
              <ul className="mt-3 border-t border-line">
                {visible.map((summary) => (
                  <GoalRow key={summary.goal.id} summary={summary} />
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {/* 엄지가 닿는 아래쪽: 새 목표, 하단 탭 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-(--app-max-width)">
        {!noGoals && (
          <div className="pointer-events-auto bg-linear-to-t from-surface from-60% to-transparent px-4 pt-2 pb-2">
            <Link
              href="/goals/new"
              className="flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-ink text-[16px] font-semibold text-surface"
            >
              <Plus aria-hidden size={20} strokeWidth={2.4} />새 목표
            </Link>
          </div>
        )}
        <div className="pointer-events-auto">
          <TabBar />
        </div>
      </div>
    </>
  );
}

/** 목표 한 줄: 건물 그림 자리, 제목, 건물과 단계, 기한, 할 일 진행(개수) */
function GoalRow({ summary }: { summary: GoalSummary }) {
  const { goal, building, doneTaskCount, taskCount } = summary;
  const buildingName = building ? BUILDING_LABEL[building.type] : null;
  const meta = [
    building && `${BUILDING_LABEL[building.type]} · ${goal.status === "ARCHIVED" ? "공사 중지" : STAGE_LABEL[building.stage]}`,
    goal.dueDate && `${formatShortDate(goal.dueDate)}까지`,
  ].filter(Boolean);

  return (
    <li className="border-b border-line">
      <Link
        href={`/goals/detail?id=${encodeURIComponent(goal.id)}`}
        className="flex min-h-[76px] items-center gap-3 px-4 py-3"
      >
        {buildingName && <GraphicPlaceholder label={buildingName} decorative className="size-14" />}
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-[16px] leading-snug font-semibold">{goal.title}</span>
          {meta.length > 0 && <span className="mt-0.5 block truncate text-[13px] text-ink-3">{meta.join(" · ")}</span>}
        </span>
        {/* 진행은 달성률이 아니라 개수로 보여준다 (docs/screens.md S08) */}
        <span className="shrink-0 text-[14px] text-ink-2 tabular-nums">
          할 일 {doneTaskCount}/{taskCount}
        </span>
      </Link>
    </li>
  );
}

function GoalListSkeleton() {
  return (
    <div aria-label="불러오는 중" className="px-4 pt-1">
      <div className="flex gap-2">
        {["w-20", "w-14", "w-14"].map((w, i) => (
          <div key={i} className={`h-11 ${w} rounded-full bg-surface-3`} />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 border-b border-line py-3">
          <div className="size-14 rounded-lg bg-surface-3" />
          <div className="flex-1">
            <div className="h-4 w-3/4 rounded bg-surface-3" />
            <div className="mt-2 h-3 w-1/2 rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
