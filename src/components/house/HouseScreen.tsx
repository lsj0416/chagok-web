"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useState } from "react";
import { PrimaryButton } from "@/components/BottomActions";
import { BottomSheet } from "@/components/BottomSheet";
import { useMockScenario } from "@/components/dev/useMockScenario";
import { FurnitureShopSheet } from "@/components/house/FurnitureShopSheet";
import { RoomView, type SlotView } from "@/components/house/RoomView";
import { SheetAction } from "@/components/today/TaskActionsSheet";
import { LoadError } from "@/components/today/TodayParts";
import { Toast } from "@/components/Toast";
import { TopBar } from "@/components/TopBar";
import { useToast } from "@/components/useToast";
import { HOUSE_LEVEL_LABEL, HOUSE_UPGRADE_RULES } from "@/config/game";
import * as api from "@/lib/api/house";
import { formatCredit } from "@/lib/credit";
import { upgradeProgress } from "@/lib/house";
import { withEulReul, withEuro } from "@/lib/korean";
import type { FurnitureCatalogItem, Slot } from "@/types";

type Sheet =
  | { kind: "shop"; slot: Slot }
  | { kind: "placed"; slot: Slot; item: FurnitureCatalogItem }
  | { kind: "upgrade" }
  | null;


/** S06 집 내부 */
export function HouseScreen() {
  const scenario = useMockScenario();
  const queryClient = useQueryClient();
  const houseKey = ["house", scenario] as const;
  const query = useQuery({ queryKey: houseKey, queryFn: api.fetchHouseDetail });
  const detail = query.data;
  const [sheet, setSheet] = useState<Sheet>(null);
  const { toast, show } = useToast();

  const save = useMutation({
    mutationFn: ({ run }: { run: () => Promise<unknown>; done?: string }) => run(),
    onSuccess: (_result, { done }) => {
      setSheet(null);
      if (done) show(done);
    },
    // 열린 시트는 알림을 가린다. 닫고 나서 '저장하지 못했어요'와 재시도를 보여준다
    onError: (_error, variables) => {
      setSheet(null);
      show("저장하지 못했어요", { label: "다시 시도", onClick: () => save.mutate(variables) });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: houseKey });
      void queryClient.invalidateQueries({ queryKey: ["today"] });
    },
  });

  const levelLabel = detail ? HOUSE_LEVEL_LABEL[detail.house.level] : "집";
  const negative = (detail?.balance ?? 0) < 0;
  const progress = detail ? upgradeProgress(detail.house.level, detail.furniture.length, detail.balance) : null;

  const slotViews: SlotView[] = detail
    ? detail.slots.map((slot) => {
        const placement = detail.placements.find((p) => p.slotId === slot.id);
        const furniture = placement && detail.furniture.find((f) => f.id === placement.furnitureId);
        const item = (furniture && detail.catalog.find((c) => c.id === furniture.catalogItemId)) ?? null;
        return { slot, item };
      })
    : [];

  return (
    <>
      <TopBar
        title={levelLabel}
        back
        action={
          detail && (
            <p className="pr-3 text-[15px] text-ink-2 tabular-nums">
              크레딧 <strong className="font-bold text-ink">{formatCredit(detail.balance)}</strong>
            </p>
          )
        }
      />

      <main className="flex-1 px-4 pb-[calc(24px+var(--safe-bottom))]">
        {query.isPending && (
          <div role="status" aria-label="불러오는 중" className="aspect-square w-full rounded-lg bg-surface-3" />
        )}
        {query.isError && (
          <div className="-mx-4">
            <LoadError message="집을 불러오지 못했어요" onRetry={() => void query.refetch()} />
          </div>
        )}

        {detail && (
          <>
            <RoomView
              label={`${levelLabel} 내부`}
              slots={slotViews}
              onEmptySlot={(slot) => setSheet({ kind: "shop", slot })}
              onPlacedSlot={(slot, item) => setSheet({ kind: "placed", slot, item })}
            />

            {negative && (
              <p role="status" className="mt-4 rounded-xl bg-surface-2 px-4 py-3.5 text-[15px] leading-snug">
                크레딧이 <strong className="font-bold">{formatCredit(detail.balance)}</strong>이에요. 완료를 취소해서
                크레딧이 회수됐어요. 다음에 받는 크레딧으로 먼저 채워져요
              </p>
            )}

            {progress ? (
              <section aria-labelledby="upgrade-heading" className="mt-6">
                <h2 id="upgrade-heading" className="px-1 text-[14px] font-semibold text-ink-2">
                  {withEuro(HOUSE_LEVEL_LABEL[progress.next])} 넓히려면
                </h2>
                <dl className="mt-2 flex flex-col border-y border-line">
                  <ProgressRow
                    label="가구"
                    value={`${Math.min(detail.furniture.length, progress.requiredFurniture)}/${progress.requiredFurniture}`}
                    met={progress.furnitureMet}
                  />
                  <ProgressRow
                    label="크레딧"
                    value={`${formatCredit(detail.balance)}/${progress.upgradeCost}`}
                    met={progress.creditMet}
                  />
                </dl>
                <div className="mt-4">
                  <PrimaryButton
                    disabled={!progress.canUpgrade}
                    aria-haspopup="dialog"
                    onClick={() => setSheet({ kind: "upgrade" })}
                  >
                    넓히기
                  </PrimaryButton>
                </div>
              </section>
            ) : (
              <p className="mt-6 px-1 text-[15px] text-ink-2">가장 넓은 집이에요</p>
            )}
          </>
        )}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-(--app-max-width) pb-[calc(16px+var(--safe-bottom))]">
        <Toast toast={toast} />
      </div>

      <FurnitureShopSheet
        slot={sheet?.kind === "shop" ? sheet.slot : null}
        detail={detail}
        pending={save.isPending}
        onClose={() => setSheet(null)}
        onBuy={(item, slot) =>
          save.mutate({ run: () => api.purchaseAndPlace(item.id, slot.id), done: `${withEulReul(item.name)} 놓았어요` })
        }
        onPlaceOwned={(furniture, slot) => save.mutate({ run: () => api.placeOwnedFurniture(furniture.id, slot.id) })}
      />

      <BottomSheet
        open={sheet?.kind === "placed"}
        onClose={() => setSheet(null)}
        title={sheet?.kind === "placed" ? sheet.item.name : ""}
      >
        {sheet?.kind === "placed" && (
          <ul className="flex flex-col">
            <li>
              <SheetAction label="바꾸기" onClick={() => setSheet({ kind: "shop", slot: sheet.slot })} />
            </li>
            <li>
              <SheetAction
                label="빼기"
                onClick={() =>
                  save.mutate({ run: () => api.removePlacement(sheet.slot.id), done: "가구를 뺐어요. 보유 가구로 남아 있어요" })
                }
              />
            </li>
          </ul>
        )}
      </BottomSheet>

      {progress && detail && (
        <BottomSheet
          open={sheet?.kind === "upgrade"}
          onClose={() => setSheet(null)}
          title={`${withEuro(HOUSE_LEVEL_LABEL[progress.next])} 넓힐까요?`}
          description={`${progress.upgradeCost} 크레딧을 써요. 가구는 그대로 가져가고 자리가 ${
            HOUSE_UPGRADE_RULES[progress.next].slotCount
          }개로 늘어나요`}
        >
          <div className="flex flex-col gap-2 pt-2">
            <PrimaryButton
              disabled={save.isPending}
              onClick={() =>
                save.mutate({
                  run: () => api.upgradeHouse(),
                  done: `${withEuro(HOUSE_LEVEL_LABEL[progress.next])} 넓혔어요`,
                })
              }
            >
              넓히기
            </PrimaryButton>
            <button
              type="button"
              onClick={() => setSheet(null)}
              className="h-12 rounded-xl bg-surface-2 text-[15px] font-semibold text-ink-2"
            >
              그대로 두기
            </button>
          </div>
        </BottomSheet>
      )}
    </>
  );
}

function ProgressRow({ label, value, met }: { label: string; value: string; met: boolean }) {
  return (
    <div className="flex min-h-12 items-center gap-2 border-b border-line px-1 last:border-b-0">
      <dt className="flex-1 text-[15px]">{label}</dt>
      <dd className="flex items-center gap-1.5 text-[15px] font-semibold tabular-nums">
        {value}
        {met ? <Check aria-label="채움" size={16} strokeWidth={2.6} /> : <span className="sr-only">아직 모자람</span>}
      </dd>
    </div>
  );
}
