"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  title: string;
  /** 전체 화면은 왼쪽에 뒤로 가기 */
  back?: boolean;
  /** 오른쪽 행동 (S02의 설정 아이콘) */
  action?: React.ReactNode;
}

export function TopBar({ title, back = false, action }: TopBarProps) {
  const router = useRouter();
  return (
    <header className="flex h-14 shrink-0 items-center gap-1 px-2">
      {back ? (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="grid size-11 place-items-center rounded-full text-ink"
        >
          <ChevronLeft aria-hidden size={24} />
        </button>
      ) : (
        <span className="w-2" />
      )}
      {title ? (
        <h1 className="min-w-0 flex-1 truncate text-[19px] font-bold tracking-[-0.01em]">{title}</h1>
      ) : (
        <span className="flex-1" />
      )}
      {action}
    </header>
  );
}
