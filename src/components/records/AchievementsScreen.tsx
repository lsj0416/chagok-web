"use client";

import { useQuery } from "@tanstack/react-query";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { GraphicPlaceholder } from "@/components/GraphicPlaceholder";
import { OfflineBanner, useOnline } from "@/components/OfflineBanner";
import { LoadError, SectionHeading } from "@/components/today/TodayParts";
import { TopBar } from "@/components/TopBar";
import * as api from "@/lib/api/records";
import { formatShortDate, toDateKey } from "@/lib/date";
import type { AchievementProgress } from "@/types";

/** S14 업적. 업적 목록과 보상은 미정이라 가짜 데이터의 임시 값을 보여준다 (docs/planning.md 14장) */
export function AchievementsScreen() {
  const scenario = useMockScenario();
  const online = useOnline();
  const query = useQuery({ queryKey: ["achievements", scenario], queryFn: api.fetchAchievements });
  const earned = (query.data ?? []).filter((a) => a.earnedAt !== null).sort((a, b) => (b.earnedAt ?? "").localeCompare(a.earnedAt ?? ""));
  const locked = (query.data ?? []).filter((a) => a.earnedAt === null);

  return (
    <>
      <OfflineBanner show={!online || scenario === "offline"} />
      <TopBar title="업적" back />
      <main className="flex-1 pb-[calc(24px+var(--safe-bottom))]">
        {query.isPending && (
          <div aria-label="불러오는 중" className="px-4 pt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="size-12 rounded-lg bg-surface-3" />
                <div className="h-4 w-40 rounded bg-surface-3" />
              </div>
            ))}
          </div>
        )}
        {query.isError && <LoadError message="업적을 불러오지 못했어요" onRetry={() => void query.refetch()} />}

        {query.isSuccess && (
          <>
            <section aria-labelledby="achievements-earned">
              <SectionHeading id="achievements-earned">
                얻은 업적 <span className="tabular-nums">{earned.length}</span>
              </SectionHeading>
              {earned.length === 0 ? (
                <p className="px-5 pt-3 text-[15px] text-ink-2">아직 얻은 업적이 없어요. 할 일을 완료하면 하나씩 생겨요</p>
              ) : (
                <ul className="mt-1 px-4">
                  {earned.map((item) => (
                    <AchievementRow key={item.achievement.code} item={item} />
                  ))}
                </ul>
              )}
            </section>
            {locked.length > 0 && (
              <section aria-labelledby="achievements-locked">
                <SectionHeading id="achievements-locked">아직 얻지 못한 업적</SectionHeading>
                <ul className="mt-1 px-4">
                  {locked.map((item) => (
                    <AchievementRow key={item.achievement.code} item={item} />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}

/** 업적 한 줄: 배지 그림 자리, 이름, 얻은 날 또는 설명과 진행(개수) */
function AchievementRow({ item }: { item: AchievementProgress }) {
  const { achievement, earnedAt, progress } = item;
  const earned = earnedAt !== null;
  return (
    <li className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
      {/* 배지 그림이 준비되기 전의 자리. 아직 얻지 못한 배지는 같은 크기의 점선 빈 자리로 흐리게 */}
      {earned ? (
        <GraphicPlaceholder label="배지" decorative className="size-12" />
      ) : (
        <span aria-hidden className="size-12 shrink-0 rounded-lg border-2 border-dashed border-line-strong bg-surface-2" />
      )}
      <span className="min-w-0 flex-1">
        <span className={`block text-[16px] ${earned ? "font-semibold" : "text-ink-2"}`}>{achievement.name}</span>
        <span className="block text-[13px] text-ink-3">
          {earned ? `${formatShortDate(toDateKey(new Date(earnedAt)))}에 얻었어요` : achievement.description}
        </span>
      </span>
      {!earned && progress !== null && achievement.target !== null && (
        <span className="shrink-0 text-[14px] text-ink-2 tabular-nums">
          {progress}/{achievement.target}
          {achievement.unit}
        </span>
      )}
    </li>
  );
}
