"use client";

import { BottomSheet } from "@/components/BottomSheet";

interface PlaceholderSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** 와이어프레임 단계에서 아직 만들지 않은 화면 ID (예: S03) */
  screenId: string;
}

// 와이어프레임 단계 전용: 다음 작업에서 만들 바텀시트의 자리. 해당 화면을 만들면 지운다
export function PlaceholderSheet({ open, onClose, title, screenId }: PlaceholderSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="grid h-48 place-items-center rounded-lg bg-placeholder text-[14px] text-ink-2">
        {screenId} 자리 표시자
      </div>
    </BottomSheet>
  );
}
