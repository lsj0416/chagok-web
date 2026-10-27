"use client";

import { useSearchParams } from "next/navigation";
import { isMockScenario, type MockScenario } from "@/mocks/scenarios";
import { getMockScenario, setMockScenario } from "@/mocks/server";

/**
 * 개발 서버에서만 ?mock=<시나리오>로 가짜 데이터를 바꾼다. 빌드 결과에서는 항상 default.
 * 주소에 ?mock=이 없으면 지금 시나리오를 유지한다(화면을 옮겨도 가짜 데이터가 초기화되지 않게).
 * 반환값은 쿼리 키에 넣어 시나리오가 바뀌면 다시 불러오게 한다
 */
export function useMockScenario(): MockScenario {
  const params = useSearchParams();
  if (process.env.NODE_ENV !== "development") return "default";
  const requested = params.get("mock");
  if (isMockScenario(requested)) setMockScenario(requested);
  return getMockScenario();
}
