"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { TabBar } from "@/components/TabBar";
import { LoadError } from "@/components/today/TodayParts";
import { TopBar } from "@/components/TopBar";
import { VillageView } from "@/components/village/VillageView";
import * as api from "@/lib/api/village";
import { CreditAmount } from "@/components/CreditAmount";
import { formatCredit } from "@/lib/credit";
import { needsStageReveal } from "@/lib/village";
import type { VillageDetail } from "@/types";

/** S05 마을 */
export function VillageScreen() {
  const scenario = useMockScenario();
  const queryClient = useQueryClient();
  const villageKey = ["village", scenario] as const;
  const query = useQuery({ queryKey: villageKey, queryFn: api.fetchVillageDetail });
  const detail = query.data;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 연출할 건물은 이번 진입에서 새로 불러온 데이터가 처음 도착했을 때 한 번만 정한다.
  // 캐시에 남은 예전 데이터(오늘에서 완료하기 전)로 정하면 막 오른 단계를 놓친다.
  // 한 번 정하면 다시 불러와도 연출이 중간에 끊기지 않는다
  const [revealIds, setRevealIds] = useState<ReadonlySet<string> | null>(null);
  if (detail && query.isFetchedAfterMount && revealIds === null) {
    setRevealIds(new Set(detail.buildings.filter(needsStageReveal).map((b) => b.id)));
  }

  // 본 것으로 기록하고 캐시에도 반영한다. 탭을 오가도 같은 연출이 다시 나오지 않는다
  useEffect(() => {
    revealIds?.forEach((id) => {
      api
        .markBuildingStageSeen(id)
        .then(() =>
          queryClient.setQueryData<VillageDetail>(villageKey, (prev) =>
            prev && {
              ...prev,
              buildings: prev.buildings.map((b) => (b.id === id ? { ...b, lastSeenStage: b.stage } : b)),
            },
          ),
        )
        .catch(() => {});
    });
    // villageKey는 시나리오로만 바뀌고, 연출 대상은 진입마다 한 번 정해진다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealIds]);

  const buildings = detail
    ? [...detail.buildings].sort((a, b) => {
        const goalA = detail.goals.find((g) => g.id === a.goalId)?.createdAt ?? "";
        const goalB = detail.goals.find((g) => g.id === b.goalId)?.createdAt ?? "";
        return goalA.localeCompare(goalB);
      })
    : [];

  return (
    <>
      <TopBar
        title="마을"
        action={
          detail && (
            <p className="pr-3 text-[15px] text-sign-2 tabular-nums">
              크레딧 <CreditAmount balance={detail.balance} />
            </p>
          )
        }
      />

      <main className="flex-1 px-4 pb-[calc(var(--tab-bar-height)+var(--safe-bottom)+16px)]">
        {query.isPending && (
          <div role="status" aria-label="불러오는 중" className="aspect-[3/4] w-full rounded-lg bg-surface-3" />
        )}
        {query.isError && (
          <div className="-mx-4">
            <LoadError message="마을을 불러오지 못했어요" onRetry={() => void query.refetch()} />
          </div>
        )}

        {detail && (
          <>
            <VillageView
              house={detail.house}
              buildings={buildings}
              goals={detail.goals}
              revealIds={revealIds ?? new Set()}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            {detail.buildings.length === 0 && (
              <Link
                href="/goals/new"
                className="mt-4 grid h-12 place-items-center border-b-[3px] border-caution bg-ink text-[16px] font-semibold text-surface"
              >
                AI로 목표 만들기
              </Link>
            )}
          </>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-(--app-max-width)">
        <TabBar />
      </div>
    </>
  );
}
