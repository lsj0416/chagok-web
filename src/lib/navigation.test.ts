import { describe, expect, it } from "vitest";
import { safeReturnPath } from "@/lib/navigation";

const origin = "https://app.example";

describe("safeReturnPath", () => {
  it("같은 사이트의 경로는 그대로", () => {
    expect(safeReturnPath("/records?mock=default#x", origin)).toBe("/records?mock=default#x");
  });

  it("다른 사이트로 읽히는 주소는 막는다", () => {
    for (const next of ["//evil.com", "/\\evil.com", "/%09/evil.com", "/\t/evil.com", "https://evil.com", "evil.com"]) {
      expect(safeReturnPath(next, origin)).toBeNull();
    }
  });

  it("로그인 화면으로 다시 보내지 않는다", () => {
    expect(safeReturnPath("/login?next=/today", origin)).toBeNull();
    expect(safeReturnPath(null, origin)).toBeNull();
  });
});
