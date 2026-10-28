"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { GraphicPlaceholder } from "@/components/GraphicPlaceholder";
import { StageMeter } from "@/components/StageMeter";
import { BUILDING_LABEL } from "@/config/game";
import * as api from "@/lib/api/village";
import { STAGE_LABEL } from "@/lib/village";

/** 건물 띠: 진행 중인 목표의 건물을 가림막 패널처럼 나란히 둔다. 누르면 마을로 간다.
 *  오늘 화면의 보조 정보라 오류일 때는 띠를 숨기고 할 일 목록을 가리지 않는다 */
export function BuildingStrip() {
  const scenario = useMockScenario();
  // 마을 화면과 같은 캐시를 쓴다
  const query = useQuery({ queryKey: ["village", scenario], queryFn: api.fetchVillageDetail });

  if (query.isPending) {
    return (
      <div aria-label="건물 불러오는 중" className="flex border-b border-line bg-surface-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="hoarding-panel flex-1 px-2.5 pt-3 pb-3">
            <div className="aspect-square w-full bg-surface-3" />
            <div className="mt-2 h-4 w-14 rounded-sm bg-surface-3" />
          </div>
        ))}
      </div>
    );
  }
  if (!query.data) return null;

  const activeGoalIds = new Set(query.data.goals.filter((g) => g.status === "ACTIVE").map((g) => g.id));
  const buildings = query.data.buildings.filter((b) => activeGoalIds.has(b.goalId));
  if (buildings.length === 0) return null;
  const goalTitle = (goalId: string) => query.data.goals.find((g) => g.id === goalId)?.title ?? "";

  return (
    <section aria-labelledby="strip-heading" className="border-b border-line bg-surface-2">
      <h2 id="strip-heading" className="sr-only">
        짓고 있는 건물
      </h2>
      {/* 세 개까지는 폭을 나눠 갖고, 넘치면 가로로 넘긴다 */}
      <ul className="flex snap-x overflow-x-auto [scrollbar-width:none]">
        {buildings.map((building) => {
          const name = BUILDING_LABEL[building.type];
          const stage = STAGE_LABEL[building.stage];
          return (
            <li key={building.id} className="hoarding-panel min-w-[31%] flex-1 snap-start">
              <Link
                href="/village"
                aria-label={`${name} ${stage}, ${goalTitle(building.goalId)}. 마을에서 보기`}
                className="block px-2.5 pt-3 pb-2.5"
              >
                <GraphicPlaceholder label={name} decorative className="aspect-square w-full" />
                <span className="mt-2 block font-display text-[16px] leading-tight">{name}</span>
                <StageMeter stage={building.stage} className="mt-1.5" />
                <span className="mt-1 block text-[13px] text-ink-3">{stage}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
