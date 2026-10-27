import { describe, expect, it } from "vitest";
import { SPLIT_MIN_TASKS } from "@/config/game";
import { canSplit, splitTitles } from "@/lib/split";

describe("splitTitles", () => {
  it("앞뒤 공백을 지우고 빈 칸은 뺀다", () => {
    expect(splitTitles(["  자료 찾기 ", "", "   ", "초안 쓰기"])).toEqual(["자료 찾기", "초안 쓰기"]);
  });
});

describe("canSplit", () => {
  it(`새 제목이 ${SPLIT_MIN_TASKS}개 이상이면 나눌 수 있다`, () => {
    const enough = Array.from({ length: SPLIT_MIN_TASKS }, (_, i) => `할 일 ${i + 1}`);
    expect(canSplit(enough)).toBe(true);
  });

  it("빈 칸은 세지 않는다", () => {
    const short = [...Array.from({ length: SPLIT_MIN_TASKS - 1 }, (_, i) => `할 일 ${i + 1}`), "  "];
    expect(canSplit(short)).toBe(false);
  });
});
