import { SPLIT_MIN_TASKS } from "@/config/game";

/** 나누기 입력칸에서 실제로 만들 제목만 고른다. 앞뒤 공백을 지우고 빈 칸은 뺀다 */
export function splitTitles(inputs: string[]): string[] {
  return inputs.map((value) => value.trim()).filter((value) => value.length > 0);
}

/** 새 제목이 SPLIT_MIN_TASKS개 이상이어야 나눌 수 있다 (docs/screens.md S04) */
export function canSplit(inputs: string[]): boolean {
  return splitTitles(inputs).length >= SPLIT_MIN_TASKS;
}
