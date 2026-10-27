import { describe, expect, it } from "vitest";
import { AI_DAILY_LIMIT } from "@/config/game";
import { applyToggleAll, remainingAiCalls, toggleAllAction, toggleOne } from "@/lib/drafts";

const ids = ["a", "b", "c"];

describe("toggleAllAction", () => {
  it("0개, 일부 선택이면 모두 선택", () => {
    expect(toggleAllAction(0, 3)).toBe("SELECT_ALL");
    expect(toggleAllAction(2, 3)).toBe("SELECT_ALL");
  });
  it("전부 선택이면 모두 해제", () => {
    expect(toggleAllAction(3, 3)).toBe("CLEAR_ALL");
  });
  it("초안이 없으면 모두 선택", () => {
    expect(toggleAllAction(0, 0)).toBe("SELECT_ALL");
  });
});

describe("applyToggleAll", () => {
  it("일부 선택에서 누르면 나머지까지 전부 선택", () => {
    expect([...applyToggleAll(ids, new Set(["a"]))]).toEqual(ids);
  });
  it("전부 선택에서 누르면 전부 해제", () => {
    expect(applyToggleAll(ids, new Set(ids)).size).toBe(0);
  });
});

describe("toggleOne", () => {
  it("선택과 해제를 오간다", () => {
    const once = toggleOne(new Set(), "a");
    expect(once.has("a")).toBe(true);
    expect(toggleOne(once, "a").has("a")).toBe(false);
  });
});

describe("remainingAiCalls", () => {
  it("하루 상한에서 사용 횟수를 뺀다", () => {
    expect(remainingAiCalls(3)).toBe(AI_DAILY_LIMIT - 3);
  });
  it("0 아래로 내려가지 않는다", () => {
    expect(remainingAiCalls(AI_DAILY_LIMIT + 2)).toBe(0);
  });
});
