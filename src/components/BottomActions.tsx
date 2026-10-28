/** 전체 화면의 하단 고정 행동 영역. 키보드가 열려도 키보드 위에 남는다 */
export function BottomActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-line bg-surface px-4 pt-3 pb-[calc(12px+var(--safe-bottom))]">
      {children}
    </div>
  );
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="flex h-13 w-full items-center justify-center gap-2 border-b-4 border-caution bg-ink font-display text-[19px] text-surface disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function TextButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="h-11 px-3 text-[15px] font-semibold text-ink-2 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function OutlineButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="flex h-12 w-full items-center justify-center rounded-xl border border-line-strong bg-surface text-[16px] font-semibold text-ink disabled:opacity-40"
    >
      {children}
    </button>
  );
}
