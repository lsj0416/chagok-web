import { readFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "js-yaml";
import { beforeAll, describe, expect, it } from "vitest";
import { addDays, toDateKey } from "@/lib/date";
import * as server from "@/mocks/server";

// 가짜 서버의 조회 결과가 docs/openapi.yaml의 응답 스키마와 맞는지 본다.
// 가짜 서버는 src/types를 따르므로, 명세와 타입이 어긋나면 여기서 드러난다

type Schema = {
  $ref?: string;
  type?: string | string[];
  enum?: unknown[];
  const?: unknown;
  properties?: Record<string, Schema>;
  required?: string[];
  additionalProperties?: boolean | Schema;
  propertyNames?: Schema;
  items?: Schema;
  oneOf?: Schema[];
  allOf?: Schema[];
};

const spec = load(readFileSync(join(process.cwd(), "docs/openapi.yaml"), "utf8")) as {
  components: { schemas: Record<string, Schema> };
};

function resolve(schema: Schema): Schema {
  if (!schema.$ref) return schema;
  const name = schema.$ref.replace("#/components/schemas/", "");
  const target = spec.components.schemas[name];
  if (!target) throw new Error(`없는 스키마: ${name}`);
  return resolve(target);
}

function typeOf(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "number";
  return typeof value;
}

/** 값이 스키마와 맞지 않는 곳을 경로와 함께 모은다 (이 명세가 쓰는 키워드만 다룬다) */
function check(value: unknown, raw: Schema, path: string): string[] {
  const schema = resolve(raw);
  if (schema.allOf) return schema.allOf.flatMap((part) => check(value, part, path));
  if (schema.oneOf) {
    const matches = schema.oneOf.filter((option) => check(value, option, path).length === 0);
    return matches.length === 1 ? [] : [`${path}: oneOf 중 ${matches.length}개와 맞음`];
  }
  if (schema.const !== undefined && value !== schema.const) return [`${path}: ${String(value)} ≠ ${String(schema.const)}`];
  if (schema.enum && !schema.enum.includes(value)) return [`${path}: ${String(value)}은 enum에 없음`];
  if (schema.type) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = typeOf(value);
    const ok = allowed.includes(actual) || (actual === "integer" && allowed.includes("number"));
    if (!ok) return [`${path}: ${actual}, 명세는 ${allowed.join("|")}`];
  }
  const errors: string[] = [];
  if (Array.isArray(value) && schema.items) {
    value.forEach((item, i) => errors.push(...check(item, schema.items!, `${path}[${i}]`)));
  }
  if (typeOf(value) === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of schema.required ?? []) {
      if (!(key in obj)) errors.push(`${path}.${key}: 없음 (필수)`);
    }
    for (const [key, child] of Object.entries(obj)) {
      if (schema.propertyNames) errors.push(...check(key, schema.propertyNames, `${path}{${key}}`));
      const prop = schema.properties?.[key];
      if (prop) errors.push(...check(child, prop, `${path}.${key}`));
      else if (schema.additionalProperties === false) errors.push(`${path}.${key}: 명세에 없는 필드`);
      else if (typeof schema.additionalProperties === "object") errors.push(...check(child, schema.additionalProperties, `${path}.${key}`));
    }
  }
  return errors;
}

const schema = (name: string): Schema => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (name: string): Schema => ({ type: "array", items: schema(name) });

describe("가짜 서버 응답 ↔ docs/openapi.yaml", () => {
  beforeAll(() => {
    server.setMockScenario("default");
  });

  const cases: [string, () => Promise<unknown>, Schema][] = [
    ["GET /today", () => server.fetchTodayPlan(), schema("TodayPlan")],
    ["GET /tasks/overdue", () => server.fetchOverdueTasks(), schema("TaskListResult")],
    ["GET /days/{date}/core-tasks", () => server.fetchDayCoreTasks(toDateKey(new Date())), arrayOf("Task")],
    ["GET /tasks/{taskId}", () => server.fetchTaskDetail("t-2"), schema("TaskDetail")],
    ["GET /goals", () => server.fetchGoals(), arrayOf("GoalSummary")],
    ["GET /goals/{goalId}", () => server.fetchGoalDetail("g-career"), schema("GoalDetail")],
    ["GET /ai/usage", () => server.fetchAiUsage(), schema("AiUsage")],
    ["POST /ai/goal-breakdowns", () => server.requestGoalBreakdown({ title: "백엔드 개발자로 취업하기", dueDate: null, currentSituation: null }), schema("GoalBreakdown")],
    ["GET /records", () => server.fetchRecords(), schema("RecordsOverview")],
    ["GET /records/days", () => server.fetchDayRecords(addDays(toDateKey(new Date()), -29)), schema("DayRecordPage")],
    ["GET /achievements", () => server.fetchAchievements(), arrayOf("AchievementProgress")],
    ["GET /village", () => server.fetchVillageDetail(), schema("VillageDetail")],
    ["GET /house", () => server.fetchHouseDetail(), schema("HouseDetail")],
    ["GET /me/settings", () => server.fetchSettings(), schema("UserSettings")],
  ];

  it.each(cases)("%s", async (_name, call, responseSchema) => {
    const value = await call();
    expect(check(value, responseSchema, "$")).toEqual([]);
  });

  it("검사기가 어긋남을 잡는다", () => {
    expect(check({ id: "g1" }, schema("Goal"), "$").length).toBeGreaterThan(0);
    expect(check({ level: "CASTLE" }, schema("House"), "$")).toEqual(["$.level: CASTLE은 enum에 없음"]);
  });
});
