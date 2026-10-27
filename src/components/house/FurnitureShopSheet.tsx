"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { PrimaryButton } from "@/components/BottomActions";
import { BottomSheet } from "@/components/BottomSheet";
import { GraphicPlaceholder } from "@/components/GraphicPlaceholder";
import { Spinner } from "@/components/Spinner";
import { canPurchase, coreTasksToAfford } from "@/lib/house";
import type { Furniture, FurnitureCatalogItem, HouseDetail, Slot } from "@/types";

/** 판매 가구 한 줄. 놓지 않은 보유 가구가 있으면 그 가구를 설치한다 */
type Choice = { item: FurnitureCatalogItem; owned: Furniture | null };

interface FurnitureShopSheetProps {
  slot: Slot | null;
  detail: HouseDetail | undefined;
  pending: boolean;
  onClose: () => void;
  onBuy: (item: FurnitureCatalogItem, slot: Slot) => void;
  onPlaceOwned: (furniture: Furniture, slot: Slot) => void;
}

/** S07 가구 상점: 선택한 슬롯에 놓을 수 있는 가구만. 보유한 가구를 먼저 보여준다 */
export function FurnitureShopSheet({ slot, detail, pending, onClose, onBuy, onPlaceOwned }: FurnitureShopSheetProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const close = () => {
    setSelectedKey(null);
    onClose();
  };

  const balance = detail?.balance ?? 0;
  const choices: Choice[] = [];
  if (slot && detail) {
    const placedIds = new Set(detail.placements.map((p) => p.furnitureId));
    detail.catalog
      .filter((c) => c.slotType === slot.slotType)
      .forEach((item) => {
        const owned = detail.furniture.find((f) => f.catalogItemId === item.id && !placedIds.has(f.id)) ?? null;
        choices.push({ item, owned });
      });
    // 보유한 가구를 먼저, 그다음 가격 순
    choices.sort((a, b) => Number(b.owned !== null) - Number(a.owned !== null) || a.item.price - b.item.price);
  }
  const selected = choices.find((c) => c.item.id === selectedKey) ?? null;
  const affordable = selected && !selected.owned ? canPurchase(selected.item.price, balance) : true;

  return (
    <BottomSheet
      open={slot !== null}
      onClose={close}
      title="가구 고르기"
      description={`지금 크레딧 ${balance < 0 ? `−${Math.abs(balance)}` : balance}`}
    >
      {choices.length === 0 ? (
        <p className="py-10 text-center text-[15px] text-ink-2">곧 새 가구가 들어와요</p>
      ) : (
        <>
          <ul role="radiogroup" aria-label="가구" className="flex flex-col">
            {choices.map((choice) => {
              const key = choice.item.id;
              const checked = key === selectedKey;
              return (
                <li key={key}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setSelectedKey(key)}
                    className="flex min-h-18 w-full items-center gap-3 border-b border-line py-2 text-left"
                  >
                    <GraphicPlaceholder label={choice.item.name} decorative className="size-14 px-1 text-center leading-tight" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px]">{choice.item.name}</span>
                      <span className="block text-[14px] text-ink-2 tabular-nums">
                        {choice.owned ? "보유 중" : `${choice.item.price} 크레딧`}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`grid size-[22px] shrink-0 place-items-center rounded-full border-2 ${
                        checked ? "border-ink bg-ink text-surface" : "border-line-strong"
                      }`}
                    >
                      {checked && <Check size={14} strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="sticky bottom-0 -mx-5 mt-2 bg-surface px-5 pt-3">
            {selected && !selected.owned && !affordable && (
              <p role="status" className="pb-2 text-center text-[14px] text-ink-2">
                {balance < 0 && "크레딧이 마이너스라 지금은 살 수 없어요. "}
                핵심 할 일 {coreTasksToAfford(selected.item.price, balance)}개를 더 하면 살 수 있어요
              </p>
            )}
            <PrimaryButton
              disabled={!selected || !affordable || pending}
              onClick={() => {
                if (!selected || !slot) return;
                if (selected.owned) onPlaceOwned(selected.owned, slot);
                else onBuy(selected.item, slot);
                setSelectedKey(null);
              }}
            >
              {pending && <Spinner />}
              {!selected ? "가구를 골라 주세요" : selected.owned ? "설치" : `구매하고 설치 · ${selected.item.price} 크레딧`}
            </PrimaryButton>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
