"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { DAILY_BONUS_CREDIT, DAILY_BONUS_THRESHOLD, MAX_CORE_TASKS_PER_DAY } from "@/config/game";
import type { TodayNotice as Notice } from "@/lib/today";

/** 안내 영역. 지난 할 일 안내가 집 업그레이드 안내보다 먼저다 */
export function TodayNotice({
  notice,
  overdueCount,
  onOpenOverdue,
}: {
  notice: Notice;
  overdueCount: number;
  onOpenOverdue: () => void;
}) {
  if (notice === "OVERDUE") {
    return (
      <button
        type="button"
        onClick={onOpenOverdue}
        aria-haspopup="dialog"
        className="mx-4 mt-1 flex min-h-12 w-[calc(100%-2rem)] items-center gap-2 rounded-xl bg-surface-2 px-4 py-3 text-left text-[15px]"
      >
        <span className="flex-1">지난 할 일 {overdueCount}개가 남아 있어요</span>
        <ChevronRight aria-hidden size={18} className="shrink-0 text-ink-3" />
      </button>
    );
  }
  if (notice === "HOUSE_UPGRADE") {
    return (
      <div className="mx-4 mt-1 flex min-h-12 items-center gap-2 rounded-xl bg-surface-2 py-1.5 pr-1.5 pl-4 text-[15px]">
        <p className="flex-1 py-1.5">집을 넓힐 수 있어요</p>
        <VillageLink />
      </div>
    );
  }
  return null;
}

export function VillageLink({ variant = "quiet" }: { variant?: "quiet" | "solid" }) {
  return (
    <Link
      href="/village"
      className={`grid h-11 shrink-0 place-items-center rounded-lg px-4 text-[14px] font-semibold ${
        variant === "solid" ? "bg-ink text-surface" : "border border-line-strong bg-surface text-ink"
      }`}
    >
      마을 보러 가기
    </Link>
  );
}

/** 진행 현황: 핵심 할 일 완료 수/핵심 할 일 수, 오늘 완료 수/오늘 할 일 수. 한 줄 문장으로 조용히 */
export function ProgressSummary({
  coreDone,
  coreTotal,
  done,
  total,
}: {
  coreDone: number;
  coreTotal: number;
  done: number;
  total: number;
}) {
  const sentence =
    coreTotal > 0
      ? `핵심 할 일 ${coreTotal}개 중 ${coreDone}개, 오늘 ${total}개 중 ${done}개를 마쳤어요`
      : `오늘 할 일 ${total}개 중 ${done}개를 마쳤어요`;
  return <p className="px-5 pt-3 text-[14px] text-ink-2 tabular-nums">{sentence}</p>;
}

export function AllDoneMessage({ showVillageLink }: { showVillageLink: boolean }) {
  return (
    <div className="mx-4 mt-3 flex flex-col items-start gap-3 rounded-xl bg-surface-2 px-4 py-4">
      <p className="text-[16px] font-semibold">오늘 할 일을 모두 마쳤어요</p>
      {showVillageLink && <VillageLink variant="solid" />}
    </div>
  );
}

export function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="px-5 pt-7 pb-0 text-[14px] font-semibold text-ink-2">
      {children}
    </h2>
  );
}

export function NoCoreHint() {
  return (
    <p className="px-5 pt-1 pb-2 text-[14px] text-ink-3">
      할 일의 더보기에서 핵심 할 일로 정할 수 있어요 (최대 {MAX_CORE_TASKS_PER_DAY}개)
    </p>
  );
}

/** 일일 보너스 진행: 일반 할 일 완료 수/기준 수, 받음 여부 */
export function BonusProgress({ count, earned }: { count: number; earned: boolean }) {
  const filled = Math.min(count, DAILY_BONUS_THRESHOLD);
  return (
    <div className="mx-5 mt-5 flex items-center gap-3 border-y border-line py-3">
      <p className="flex-1 text-[14px] text-ink-2">
        {earned ? `오늘의 보너스를 받았어요 (+${DAILY_BONUS_CREDIT} 크레딧)` : "오늘의 보너스"}
      </p>
      {!earned && (
        <span className="text-[14px] font-semibold tabular-nums">
          {filled}/{DAILY_BONUS_THRESHOLD}
        </span>
      )}
    </div>
  );
}

/** 완료한 할 일: 접힌 목록 */
export function CompletedSection({ count, children }: { count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  if (count === 0) return null;
  return (
    <section className="mt-4">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className="flex h-12 w-full items-center gap-1 px-5 text-[14px] font-semibold text-ink-2"
        >
          완료한 할 일 <span className="tabular-nums">{count}</span>
          <ChevronDown
            aria-hidden
            size={18}
            className={`ml-auto text-ink-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h2>
      <ul id={listId} hidden={!open} className="px-2">
        {children}
      </ul>
    </section>
  );
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="mx-4 mt-6 flex flex-col items-start gap-3 rounded-xl bg-surface-2 px-4 py-4">
      <p className="text-[15px]">할 일을 불러오지 못했어요</p>
      <button type="button" onClick={onRetry} className="h-11 rounded-lg bg-ink px-4 text-[14px] font-semibold text-surface">
        다시 시도
      </button>
    </div>
  );
}
