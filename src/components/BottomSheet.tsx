"use client";

import { useEffect, useId, useRef } from "react";

/** 손잡이를 이만큼 끌어내리면 닫는다 */
const DRAG_CLOSE_PX = 80;

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/** 바텀시트. 네이티브 dialog를 써서 포커스 가두기와 Esc 닫기를 브라우저에 맡긴다 */
export function BottomSheet({ open, onClose, title, description, children }: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const dragStart = useRef<number | null>(null);
  const titleId = useId();
  const descId = useId();

  // 닫힘을 부모가 정한 경우(open=false)에 생기는 close 이벤트는 다시 알리지 않는다.
  // 그렇지 않으면 다른 시트로 바꿔 여는 동작이 덮인다
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const resetDrag = () => {
    dragStart.current = null;
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={() => {
        if (openRef.current) onClose();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // 바깥(backdrop)을 누르면 닫는다
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div
          className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center"
          aria-hidden
          onPointerDown={(e) => {
            dragStart.current = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (dragStart.current === null || !ref.current) return;
            const dy = Math.max(0, e.clientY - dragStart.current);
            ref.current.style.transform = `translateY(${dy}px)`;
          }}
          onPointerUp={(e) => {
            const dy = dragStart.current === null ? 0 : e.clientY - dragStart.current;
            resetDrag();
            if (dy > DRAG_CLOSE_PX) onClose();
          }}
          onPointerCancel={resetDrag}
        >
          <span className="h-1 w-9 rounded-full bg-line-strong" />
        </div>
        <div className="shrink-0 px-5 pt-1 pb-3">
          <h2 id={titleId} className="text-[18px] font-bold">
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-1 text-[14px] text-ink-3">
              {description}
            </p>
          )}
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-[calc(20px+var(--safe-bottom))]">
          {children}
        </div>
      </div>
    </dialog>
  );
}
