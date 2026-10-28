"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  title: string;
  /** 전체 화면은 왼쪽에 뒤로 가기 */
  back?: boolean;
  /** 오른쪽 행동 (S02의 설정 아이콘). 파란 띠 위라 sign-ink 글자색을 쓴다 */
  action?: React.ReactNode;
  /** 제목 아래 한 줄 (S02의 진행 현황) */
  subtitle?: React.ReactNode;
  /** 띠 바로 아래에 가림막(건물 띠)을 붙이는 화면(S02)만 true. 나머지는 노랑 줄 아래 16px을 띄운다 */
  flush?: boolean;
}

/** 화면 머리. 공사 안내판처럼 파란 띠에 흰 제목, 아래에 노랑 줄. 상태 표시줄 영역까지 띠가 이어진다 */
export function TopBar({ title, back = false, action, subtitle, flush = false }: TopBarProps) {
  const router = useRouter();
  return (
    <header className={`shrink-0 border-b-[3px] border-caution bg-sign [&_:focus-visible]:outline-sign-ink pt-[env(safe-area-inset-top,0px)] text-sign-ink ${flush ? "" : "mb-4"}`}>
      <div className="flex min-h-14 items-center gap-1 px-2">
        {back ? (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로 가기"
            className="grid size-11 shrink-0 place-items-center rounded-full"
          >
            <ChevronLeft aria-hidden size={24} />
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        {title ? (
          <h1 className="min-w-0 flex-1 py-2 text-[22px] leading-snug text-balance">{title}</h1>
        ) : (
          <span className="flex-1" />
        )}
        {action}
      </div>
      {subtitle && <div className="-mt-1 px-5 pb-3 text-[14px] text-sign-2 tabular-nums">{subtitle}</div>}
    </header>
  );
}
