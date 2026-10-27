"use client";

export interface ToastState {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
}

/** 알림(토스트). 화면 아래쪽, 하단 버튼 위에 뜬다. 표시 시간은 부모가 관리한다 */
export function Toast({ toast }: { toast: ToastState | null }) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none px-4">
      {toast && (
        <div
          key={toast.id}
          className="pointer-events-auto flex min-h-12 items-center gap-3 rounded-xl bg-ink py-1.5 pr-1.5 pl-4 text-[15px] text-surface shadow-[0_4px_16px_rgb(0_0_0/0.18)] motion-safe:animate-[toast-in_240ms_var(--ease-out-expo)]"
        >
          <p className="min-w-0 flex-1 py-1.5">{toast.message}</p>
          {toast.action && (
            <button
              type="button"
              onClick={toast.action.onClick}
              className="h-11 shrink-0 rounded-lg px-3 font-semibold underline underline-offset-4"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
