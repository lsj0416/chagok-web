import { AI_DAILY_LIMIT } from "@/config/game";

export type ToggleAllAction = "SELECT_ALL" | "CLEAR_ALL";

/**
 * 초안 선택 전환 버튼 (docs/planning.md 3.2).
 * 0개, 일부 선택이면 '모두 선택', 전부 선택이면 '모두 해제'
 */
export function toggleAllAction(selectedCount: number, total: number): ToggleAllAction {
  return total > 0 && selectedCount >= total ? "CLEAR_ALL" : "SELECT_ALL";
}

export function applyToggleAll(ids: readonly string[], selected: ReadonlySet<string>): Set<string> {
  return toggleAllAction(selected.size, ids.length) === "CLEAR_ALL" ? new Set() : new Set(ids);
}

export function toggleOne(selected: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function remainingAiCalls(usedToday: number, limit: number = AI_DAILY_LIMIT): number {
  return Math.max(0, limit - usedToday);
}
