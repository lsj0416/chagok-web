// 집 내부(S06)와 가구 상점(S07)용 가짜 데이터
import { HOUSE_UPGRADE_RULES } from "@/config/game";
import type { Furniture, FurnitureCatalogItem, HouseLevel, Placement, Slot } from "@/types";

// TODO: 미정 (docs/planning.md 14장). 슬롯 종류는 정해지면 docs/glossary.md에 먼저 추가한다
const SLOT_TYPES = ["BED", "DESK", "LAMP", "SHELF", "RUG", "PLANT", "CHAIR", "WALL"];

/**
 * 집 단계별 슬롯. 슬롯 id와 종류는 순서로 정해서, 넓혀도 기존 자리의 가구가 그대로 남는다.
 * 위치는 방 그림이 정해지기 전의 임시 좌표다
 */
export function slotsFor(level: HouseLevel): Slot[] {
  const count = HOUSE_UPGRADE_RULES[level].slotCount;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    // 아이소메트릭 방처럼 줄마다 반 칸씩 엇갈리게 둔다
    const offset = row % 2 === 1 ? 0.5 : 0;
    const x = 6 + ((col + 0.5 + offset) / (cols + 0.5)) * 88;
    const y = 18 + ((row + 0.5) / rows) * 68;
    return { id: `slot-${i}`, slotType: SLOT_TYPES[i % SLOT_TYPES.length], x: Math.round(x), y: Math.round(y) };
  });
}

// TODO: 미정 (docs/planning.md 14장). slotType은 위 임시 값을 쓴다. 가구 가격대는 docs/glossary.md 8장
export const MOCK_CATALOG: FurnitureCatalogItem[] = [
  { id: "c-bed-1", name: "원목 침대", price: 80, slotType: "BED" },
  { id: "c-bed-2", name: "낮은 매트리스", price: 60, slotType: "BED" },
  { id: "c-bed-3", name: "캐노피 침대", price: 200, slotType: "BED" },
  { id: "c-desk-1", name: "작은 책상", price: 80, slotType: "DESK" },
  { id: "c-desk-2", name: "넓은 작업대", price: 130, slotType: "DESK" },
  { id: "c-lamp-1", name: "스탠드 조명", price: 60, slotType: "LAMP" },
  { id: "c-lamp-2", name: "종이 등", price: 90, slotType: "LAMP" },
  { id: "c-shelf-1", name: "책장", price: 90, slotType: "SHELF" },
  { id: "c-shelf-2", name: "벽 선반", price: 130, slotType: "SHELF" },
  { id: "c-rug-1", name: "둥근 러그", price: 70, slotType: "RUG" },
  { id: "c-plant-1", name: "몬스테라 화분", price: 80, slotType: "PLANT" },
  { id: "c-plant-2", name: "작은 선인장", price: 40, slotType: "PLANT" },
  { id: "c-chair-1", name: "나무 의자", price: 70, slotType: "CHAIR" },
  { id: "c-chair-2", name: "1인 소파", price: 200, slotType: "CHAIR" },
  { id: "c-wall-1", name: "액자", price: 50, slotType: "WALL" },
  { id: "c-wall-2", name: "벽시계", price: 60, slotType: "WALL" },
];

/** 슬롯 순서대로 가구를 n개 사서 놓은 상태 */
export function furnishedSlots(level: HouseLevel, count: number): { furniture: Furniture[]; placements: Placement[] } {
  const slots = slotsFor(level).slice(0, count);
  const furniture: Furniture[] = [];
  const placements: Placement[] = [];
  slots.forEach((slot, i) => {
    const item = MOCK_CATALOG.find((c) => c.slotType === slot.slotType)!;
    furniture.push({ id: `f-${i}`, catalogItemId: item.id, purchasedAt: "2026-10-20T09:00:00" });
    placements.push({ id: `p-${i}`, furnitureId: `f-${i}`, slotId: slot.id });
  });
  return { furniture, placements };
}
