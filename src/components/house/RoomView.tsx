"use client";

import { Plus } from "lucide-react";
import type { FurnitureCatalogItem, Slot } from "@/types";

export interface SlotView {
  slot: Slot;
  /** 놓인 가구의 판매 정보. 빈 자리면 null */
  item: FurnitureCatalogItem | null;
}

interface RoomViewProps {
  /** 방 그림 이름. 예: '원룸 내부' */
  label: string;
  slots: SlotView[];
  onEmptySlot: (slot: Slot) => void;
  onPlacedSlot: (slot: Slot, item: FurnitureCatalogItem) => void;
}

/**
 * 방 그림. 3D 렌더 이미지가 준비되기 전에는 1:1 회색 자리 표시자 위에
 * 슬롯을 임시 좌표로 놓는다 (CLAUDE.md 규칙 7)
 */
export function RoomView({ label, slots, onEmptySlot, onPlacedSlot }: RoomViewProps) {
  return (
    <div role="group" aria-label={`${label} 그림 자리`} className="relative aspect-square w-full rounded-lg bg-placeholder">
      <span className="absolute top-2.5 left-3 text-[13px] text-ink-2">{label}</span>
      {slots.map(({ slot, item }, i) => (
        <div
          key={slot.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
        >
          {item ? (
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={`${item.name}, 바꾸거나 빼기`}
              onClick={() => onPlacedSlot(slot, item)}
              className="grid size-12 place-items-center rounded-md border border-line-strong bg-surface-3 px-0.5 text-center text-[11px] leading-tight text-ink-2"
            >
              {item.name}
            </button>
          ) : (
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={`빈 자리 ${i + 1}, 가구 놓기`}
              onClick={() => onEmptySlot(slot)}
              className="grid size-11 place-items-center rounded-full border-2 border-dashed border-ink-3 bg-surface text-ink-2"
            >
              <Plus aria-hidden size={18} strokeWidth={2.4} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
