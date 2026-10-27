import { describe, expect, it } from "vitest";
import { withEulReul, withEuro, withIGa } from "@/lib/korean";

describe("withEuro", () => {
  it("받침이 있으면 '으로', 없거나 ㄹ이면 '로'", () => {
    expect(withEuro("투룸")).toBe("투룸으로");
    expect(withEuro("주택")).toBe("주택으로");
    expect(withEuro("아파트")).toBe("아파트로");
    expect(withEuro("서울")).toBe("서울로");
  });
});

describe("withEulReul", () => {
  it("받침이 있으면 '을', 없으면 '를'", () => {
    expect(withEulReul("원목 침대")).toBe("원목 침대를");
    expect(withEulReul("책장")).toBe("책장을");
  });
});

describe("withIGa", () => {
  it("받침이 없으면 '가', 있으면 '이'", () => {
    expect(withIGa("오피스")).toBe("오피스가");
    expect(withIGa("체육관")).toBe("체육관이");
  });
});
